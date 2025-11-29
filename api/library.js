// api/library.js
// Vercel serverless function (and local Express) → Airtable → BBX library JSON

// 1) Force IPv4 + set a global Undici Agent with IPv4 lookup and a connect timeout.
//    This avoids flaky IPv6 routes and "fetch failed" / ETIMEDOUT on some hosts/VMs.
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";

dns.setDefaultResultOrder("ipv4first");
const ipv4Lookup = (hostname, _opts, cb) =>
  dns.lookup(hostname, { family: 4, all: false }, cb);
setGlobalDispatcher(
  new Agent({
    connect: {
      family: 4,
      lookup: ipv4Lookup,
      timeout: 15_000, // 15s connect timeout to surface errors quickly
    },
  })
);

// 2) Load env vars from .env.local when running locally (Express dev server).
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
}


// Airtable API handler
export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return res.status(500).json({
      error: "Missing Airtable env vars (AIRTABLE_API_KEY / AIRTABLE_BASE_ID)",
    });
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  // 3) Minimal retry wrapper for transient network hiccups (e.g., ETIMEDOUT).
  async function fetchWithRetry(url, init, tries = 3) {
    let lastErr;
    for (let attempt = 1; attempt <= tries; attempt++) {
      try {
        const r = await fetch(url, init);
        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${txt || r.statusText}`);
        }
        return r;
      } catch (err) {
        lastErr = err;
        // Backoff: 250ms, 750ms
        if (attempt < tries) {
          const wait = 250 * attempt + Math.floor(Math.random() * 100);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
      }
    }
    throw lastErr;
  }

  async function fetchTable(tableName) {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName
    )}?pageSize=100`;

    const resp = await fetchWithRetry(url, { headers });
    const data = await resp.json();
    return data.records || [];
  }

  try {
    const [collectionsRaw, modulesRaw, itemsRaw] = await Promise.all([
      fetchTable("Collections"),
      fetchTable("Modules"),
      fetchTable("Items"),
    ]);

    // ───────── Collections ─────────
    const collectionsById = {};
    const collectionsByName = {};

    for (const rec of collectionsRaw) {
      const f = rec.fields || {};
      const col = {
        id: rec.id,
        title: f.Name,
        order: f.Order ?? 0,
        updatedAt: f.UpdatedAt || null,
        level: f.Level || "",
        modules: [],
      };
      collectionsById[rec.id] = col;
      if (f.Name) collectionsByName[String(f.Name).trim()] = col;
    }

    // ───────── Modules ─────────
    const modulesById = {};
    const modulesByName = {};

    for (const rec of modulesRaw) {
      const f = rec.fields || {};
      const rawCollections = f.Collection || f.Collections;

      let collectionIds = [];
      let collectionNames = [];

      if (Array.isArray(rawCollections)) {
        collectionIds = rawCollections;
      } else if (typeof rawCollections === "string") {
        collectionNames = rawCollections
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const mod = {
        id: rec.id,
        title: f.Name,
        order: f.Order ?? 0,
        collectionIds,
        collectionNames,
        items: [],
      };

      modulesById[rec.id] = mod;
      if (f.Name) modulesByName[String(f.Name).trim()] = mod;
    }

    // ───────── Items ─────────
    const itemsById = {};

    function detectYouTubeKind(url, explicitKind) {
      if (explicitKind && explicitKind.toLowerCase() !== "auto") {
        return explicitKind.toLowerCase();
      }
      if (!url) return explicitKind || "link";
      const u = url.toLowerCase();
      if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
      return explicitKind || "link";
    }

    for (const rec of itemsRaw) {
      const f = rec.fields || {};
      const rawModules = f.Module || f.Modules;

      let moduleIds = [];
      let moduleNames = [];

      if (Array.isArray(rawModules)) {
        moduleIds = rawModules;
      } else if (typeof rawModules === "string") {
        moduleNames = rawModules
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const url = f.URL || "";
      const explicitKind = f.Kind || "";
      const kind = detectYouTubeKind(url, explicitKind);

      itemsById[rec.id] = {
        id: rec.id,
        title: f.Name,
        kind,
        url,
        order: f.Order ?? 0,
        tags: f.Tags || [],
        canEmbed: f.CanEmbed ?? true,
        aspect: f.Aspect || (kind === "youtube" ? "16:9" : "16:9"),
        moduleIds,
        moduleNames,
      };
    }

    // ───────── Attach items → modules (by ID or by Name) ─────────
    Object.values(itemsById).forEach((item) => {
      let attached = false;

      if (item.moduleIds && item.moduleIds.length > 0) {
        item.moduleIds.forEach((mid) => {
          const mod = modulesById[mid];
          if (mod) {
            mod.items.push(item);
            attached = true;
          }
        });
      }

      if (!attached && item.moduleNames && item.moduleNames.length > 0) {
        item.moduleNames.forEach((mname) => {
          const mod = modulesByName[mname];
          if (mod) mod.items.push(item);
        });
      }
    });

    // ───────── Attach modules → collections (by ID or by Name) ─────────
    Object.values(modulesById).forEach((mod) => {
      let attached = false;

      if (mod.collectionIds && mod.collectionIds.length > 0) {
        mod.collectionIds.forEach((cid) => {
          const col = collectionsById[cid];
          if (col) {
            col.modules.push(mod);
            attached = true;
          }
        });
      }

      if (!attached && mod.collectionNames && mod.collectionNames.length > 0) {
        mod.collectionNames.forEach((cname) => {
          const col = collectionsByName[cname];
          if (col) col.modules.push(mod);
        });
      }
    });

    // ───────── Build final sorted tree ─────────
    const collections = Object.values(collectionsById)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((col) => ({
        ...col,
        modules: (col.modules || [])
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((mod) => ({
            ...mod,
            items: (mod.items || []).sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            ),
          })),
      }));

    return res.status(200).json({ collections });
  } catch (err) {
    console.error("Error building Airtable library:", err);
    return res.status(500).json({
      error: "Failed to load library",
      details:
        (err && (err.cause?.code || err.cause?.message)) ||
        err.message ||
        String(err),
    });
  }
}
