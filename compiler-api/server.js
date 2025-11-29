import express from "express";
import { execFile } from "child_process";
import {
  mkdtempSync, writeFileSync, readFileSync, readdirSync, statSync, mkdirSync, rmSync
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import crypto from "crypto";

const PORT = Number(process.env.PORT || 3000);
const FQBN = process.env.FQBN || "arduino:avr:uno"; // Uno/Nano AVR
const BODY_LIMIT = process.env.BODY_LIMIT || "2mb";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";
const COMPILE_TIMEOUT_MS = Number(process.env.COMPILE_TIMEOUT_MS || 90000);

const app = express();
app.use(express.json({ limit: BODY_LIMIT }));

// CORS (open for local dev; lock down in prod)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/healthz", (_req, res) => res.send("ok"));

app.post("/compile", (req, res) => {
  const code = (req.body?.code ?? "");
  if (!code.trim()) return res.status(400).json({ error: "Missing 'code' field" });

  const work = mkdtempSync(join(tmpdir(), "bbx-"));
  const name = "sketch_" + crypto.randomBytes(6).toString("hex");
  const sketchDir = join(work, name);
  mkdirSync(sketchDir);
  const ino = join(sketchDir, name + ".ino");
  writeFileSync(ino, code, "utf8");

  execFile(
    "arduino-cli",
    ["compile", "--fqbn", FQBN, "--export-binaries", sketchDir],
    { timeout: COMPILE_TIMEOUT_MS },
    (err, _stdout, stderr) => {
      try {
        if (err) return res.status(400).json({ error: String(stderr || err) });

        const buildDir = join(sketchDir, "build");
        const findHex = (dir) => {
          for (const f of readdirSync(dir)) {
            const p = join(dir, f);
            const s = statSync(p);
            if (s.isDirectory()) { const h = findHex(p); if (h) return h; }
            else if (f.endsWith(".hex")) return p;
          }
          return null;
        };
        const hexPath = findHex(buildDir);
        if (!hexPath) return res.status(500).json({ error: "HEX not found" });

        const hex = readFileSync(hexPath, "utf8");
        return res.json({ hex });
      } finally {
        try { rmSync(work, { recursive: true, force: true }); } catch {}
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Compiler API listening on :${PORT} (FQBN=${FQBN})`);
});
