import React, { useMemo, useState } from "react";
import { useLibrary } from "./LibraryProvider.jsx";
import { openInViewer } from "./viewerBus";
import { normaliseLevels } from "./url";
import bugboxLogo from "../Assets/Images/LargeLogo.png";

export default function LeftPanel() {
  const { collections, loading, error, levels } = useLibrary();
  const [expanded, setExpanded] = useState({});
  // NEW: track which modules are expanded per collection
  // shape: { [collectionId]: { [moduleId]: boolean } }
  const [expandedModules, setExpandedModules] = useState({});
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections
      .filter((c) => {
        const matchesQuery =
          !q ||
          c.title.toLowerCase().includes(q) ||
          String(c.subtitle || "")
            .toLowerCase()
            .includes(q);
        const matchesLevel =
          !levelFilter || normaliseLevels(c.level).includes(levelFilter);
        return matchesQuery && matchesLevel;
      })
      .sort((a, b) => a.order - b.order);
  }, [collections, query, levelFilter]);

  if (loading)
    return (
      <PanelShell>
        <div>Loading library…</div>
      </PanelShell>
    );
  if (error)
    return (
      <PanelShell>
        <div style={{ color: "#c00" }}>{error}</div>
      </PanelShell>
    );

  // Toggle module open/closed
  const toggleModule = (collectionId, moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [collectionId]: {
        ...prev[collectionId],
        [moduleId]: !prev[collectionId]?.[moduleId],
      },
    }));
  };

  // Helper: is module open? default to true if not set
  const isModuleOpen = (collectionId, moduleId) =>
    expandedModules[collectionId]?.[moduleId] ?? false;

  return (
    <PanelShell>
      {/* Search and filter controls (maybe later...)
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '6px 8px', borderRadius: 8, border: '1px solid #ddd' }}
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #ddd' }}
        >
          <option value="">All levels</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      */}

      <nav style={{ marginTop: 8 }}>
        {filtered.map((c) => (
          <div key={c.id} style={{ marginBottom: 8 }}>
            {/* COLLECTION HEADER */}
            <button
              onClick={() => setExpanded((x) => ({ ...x, [c.id]: !x[c.id] }))}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                borderRadius: 8,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <span style={{ marginRight: 6 }}>
                {expanded[c.id] ? "▾" : "▸"}
              </span>
              <strong>{c.title}</strong>
              <span style={{ float: "right", display: "flex", gap: 6 }}>
                {normaliseLevels(c.level).map((l) => (
                  <span
                    key={l}
                    style={{
                      fontSize: 11,
                      color: "#555",
                      border: "1px solid #eee",
                      padding: "2px 6px",
                      borderRadius: 999,
                    }}
                  >
                    {l}
                  </span>
                ))}
              </span>
              {c.subtitle && (
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  {c.subtitle}
                </div>
              )}
            </button>

            {/* COLLECTION BODY */}
            {expanded[c.id] &&
              c.modules
                ?.slice()
                .sort((a, b) => a.order - b.order)
                .map((m) => {
                  const moduleOpen = isModuleOpen(c.id, m.id);
                  return (
                    <div
                      key={m.id}
                      style={{ marginLeft: 12, marginTop: 6 }}
                    >
                      {/* MODULE HEADER (click to collapse/expand) */}
                      <button
                        onClick={() => toggleModule(c.id, m.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 8px",
                          borderRadius: 8,
                          border: "1px solid #eee",
                          background: "#f7f7f7",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        <span style={{ marginRight: 6 }}>
                          {moduleOpen ? "▾" : "▸"}
                        </span>
                        {m.title}
                      </button>

                      {/* MODULE ITEMS */}
                      {moduleOpen && (
                        <ul
                          style={{
                            listStyle: "none",
                            paddingLeft: 0,
                            margin: "4px 0 0 0",
                          }}
                        >
                          {m.items
                            ?.slice()
                            .sort((a, b) => a.order - b.order)
                            .map((it) => (
                              <li key={it.id} style={{ marginBottom: 4 }}>
                                <ItemButton item={it} />
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
          </div>
        ))}
      </nav>
    </PanelShell>
  );
}

function PanelShell({ children }) {
  return (
    <aside
      style={{
        padding: 12,
        borderRight: "1px solid #eee",
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <h2 className="bbx-heading-2">Library</h2>
      {children}
    </aside>
  );
}

function ItemButton({ item }) {
  const icon = iconFor(item.kind);
  return (
    <button
      onClick={() => openInViewer(item)}
      title={item.title}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "6px 8px",
        borderRadius: 8,
        border: "1px solid #eee",
        background: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span aria-hidden>{icon}</span>
      <span>{item.title}</span>
    </button>
  );
}

function iconFor(kind) {
  return (
    <img
      src={bugboxLogo}
      alt="Bugbox"
      style={{ width: 30, height: 30, objectFit: "contain" }}
    />
  );
}
