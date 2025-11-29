// src/BBXUI.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Resizable } from "re-resizable";
import LargeLogo from "./Assets/Images/LargeLogo.png";  

// Treat non-TS modules as any to keep TS happy
import RawCodeEditor from "./components/CodeEditor.jsx";
const CodeEditor: any = RawCodeEditor;

import { registerBugboxTheme } from "./utils/monacoTheme.js";
import { LibraryProvider } from "./lms/LibraryProvider.jsx";
import LeftPanel from "./lms/leftPanel.jsx"; // NOTE: adjust case/path if needed
import Viewer from "./lms/viewer.jsx"; // NOTE: adjust case/path if needed
import { compileAndFlash } from "./utils/compileAndFlash.js";
import { compileSketch } from "./utils/compilerClient.js";

// Import TSX component (avoid .js extension so Vite resolves .tsx)
import BlockEditor from "./components/BlockEditor";

// Visual controls from the JSX build
import * as RawControls from "./components/Controls.jsx";
const { ModeDialCluster, IndustrialToggle }: any = RawControls;

// 🔹 clear icon for "Clear blocks" button
import clearIcon from "./Assets/Icons/clear.svg";

// 🔧 Blockly resize fix
import * as Blockly from "blockly/core";

const STARTER_CODE = `// Start coding here
#include <Arduino.h>

void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println("Hello, BBX!");
  delay(1000);
}
`;

type Panels = {
  LibraryPanel: boolean;
  BlockPanel: boolean;
  TextPanel: boolean;
  BEXPanel: boolean;
};

export default function BBXUI() {
  // Text mode
  const [code, setCode] = useState<string>(STARTER_CODE);

  // Blocks mode
  const [blocksXml, setBlocksXml] = useState<string>(""); // workspace save
  const [blocksCode, setBlocksCode] = useState<string>(""); // generated code
  const lastGoodBlocksXmlRef = React.useRef<string>("");

  // Keep a handle to the Blockly workspace for "Clear" + resize fix
  const [blockWorkspace, setBlockWorkspace] = useState<any>(null);

  // Panels state (logic preserved from TSX)
  const [panels, setPanels] = useState<Panels>({
    LibraryPanel: true,
    BlockPanel: false,
    TextPanel: false,
    BEXPanel: false,
  });

  // Derived UI switches for JSX visuals
  const libraryOn = panels.LibraryPanel;
  const bexOn = panels.BEXPanel;
  // "editorOn" means either blocks or text editor is visible
  const editorOn = panels.BlockPanel || panels.TextPanel;

  // Mode dial is the authoritative chooser for which editor to show
  const activeMode: "blocks" | "text" = useMemo(() => {
    if (panels.BlockPanel && !panels.TextPanel) return "blocks";
    if (!panels.BlockPanel && panels.TextPanel) return "text";
    // If both on, prefer blocks
    return panels.BlockPanel ? "blocks" : "text";
  }, [panels.BlockPanel, panels.TextPanel]);

  // ───── Persistence (localStorage) ─────
  const STORAGE_KEYS = {
    xml: "bbx.blocksXml.v1",
    code: "bbx.code.v1",
    mode: "bbx.mode.v1",
  } as const;

  // Load once on mount
  useEffect(() => {
    try {
      const ls = window.localStorage;
      if (!ls) return;

      const savedXml = ls.getItem(STORAGE_KEYS.xml);
      const lastGood = ls.getItem("bbx.blocksXml.lastGood") || "";

      if (savedXml && savedXml.trim() && savedXml.includes("<block")) {
        setBlocksXml(savedXml);
        lastGoodBlocksXmlRef.current = savedXml;
        console.log(
          "[BBX] Loaded blocks XML from storage (length)",
          savedXml.length
        );
      } else if (lastGood && lastGood.trim()) {
        setBlocksXml(lastGood);
        lastGoodBlocksXmlRef.current = lastGood;
        console.log(
          "[BBX] Loaded lastGood blocks XML (length)",
          lastGood.length
        );
      } else {
        console.log("[BBX] No stored blocks XML found");
      }

      const savedCode = ls.getItem(STORAGE_KEYS.code);
      if (savedCode && savedCode.trim()) {
        setCode(savedCode);
        console.log(
          "[BBX] Loaded code from storage (length)",
          savedCode.length
        );
      }

      const savedMode = ls.getItem(STORAGE_KEYS.mode) as
        | "blocks"
        | "text"
        | null;
      if (savedMode === "blocks" || savedMode === "text") {
        setPanels((p) => ({
          ...p,
          BlockPanel: savedMode === "blocks",
          TextPanel: savedMode !== "blocks",
        }));
        console.log("[BBX] Restored mode:", savedMode);
      }
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, []);

  // Save blocks XML on change
  useEffect(() => {
    try {
      const xml = blocksXml || "";
      window.localStorage?.setItem(STORAGE_KEYS.xml, xml);
      const hasBlock = xml.includes("<block");
      if (hasBlock) {
        lastGoodBlocksXmlRef.current = xml;
        window.localStorage?.setItem("bbx.blocksXml.lastGood", xml);
      }
      console.log(
        "[BBX] Saved blocks XML (length)",
        xml.length,
        hasBlock ? "(has <block>)" : "(no blocks)"
      );
    } catch {
      // ignore
    }
  }, [blocksXml]);

  // Save code on change
  useEffect(() => {
    try {
      window.localStorage?.setItem(STORAGE_KEYS.code, code || "");
      console.log("[BBX] Saved code (length)", (code || "").length);
    } catch {
      // ignore
    }
  }, [code]);

  // Save mode on change
  useEffect(() => {
    try {
      window.localStorage?.setItem(STORAGE_KEYS.mode, activeMode);
      console.log("[BBX] Saved mode:", activeMode);
    } catch {
      // ignore
    }
  }, [activeMode]);

  const setModeFromDial = (newMode: "block" | "text") => {
    // dial uses "block" / "text"; internal uses "blocks" / "text"
    const wantBlocks = newMode === "block";

    // When switching from Blocks -> Text, sync the generated code into the editor
    if (!wantBlocks && activeMode === "blocks") {
      setCode((prev) => (blocksCode && blocksCode.trim() ? blocksCode : prev));
      console.log(
        "[BBX] Switching to Text; code length:",
        (blocksCode || "").length
      );
    }

    // When switching back to Blocks, restore last known good XML if current XML is empty
    if (wantBlocks && activeMode === "text") {
      const current = blocksXml?.trim() ?? "";
      if (!current) {
        const fallback =
          lastGoodBlocksXmlRef.current ||
          window.localStorage?.getItem("bbx.blocksXml.lastGood") ||
          "";
        if (fallback) {
          console.log(
            "[BBX] Restoring lastGood blocks XML (length)",
            fallback.length
          );
          setBlocksXml(fallback);
        } else {
          console.warn("[BBX] No blocks XML to restore");
        }
      }
    }

    setPanels((p) => ({
      ...p,
      BlockPanel: wantBlocks,
      TextPanel: !wantBlocks,
    }));
  };

  // Very small heuristic converter…
  function codeToBlocksXml(src: string): string | null {
    try {
      const forRe =
        /for\s*\(\s*(?:int\s+)?([A-Za-z_]\w*)\s*=\s*0\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\s*\+\+\s*\)\s*\{([\s\S]*?)\}/m;
      const m = src.match(forRe);
      if (!m) return null;
      const times = m[2];
      const body = m[3] || "";

      const dwRe = /digitalWrite\s*\(\s*(\d+)\s*,\s*(HIGH|LOW)\s*\)\s*;/i;
      const dm = body.match(dwRe);
      if (!dm) return null;
      const pin = dm[1];
      const state = dm[2].toLowerCase(); // expects 'high' | 'low'

      const xml = `<?xml version="1.0"?>\n<xml xmlns="https://developers.google.com/blockly/xml">\n  <block type="controls_repeat_times" x="20" y="20">\n    <field name="TIMES">${times}</field>\n    <statement name="CODE_VALUE">\n      <block type="digital_write">\n        <field name="PIN_VALUE">${pin}</field>\n        <field name="PIN_STATE">${state}</field>\n      </block>\n    </statement>\n  </block>\n</xml>`;
      return xml;
    } catch {
      return null;
    }
  }

  // Richer converter…
  function codeToBlocksXmlRich(src: string): string | null {
    try {
      const dbgFlag = (window as any).BBX_DEBUG_CONVERTER ?? true;
      const dbg = (...args: any[]) => {
        if (dbgFlag) console.debug("[BBX converter]", ...args);
      };

      let cleaned = src
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");

      // Focus on code inside void loop() { ... } if present
      const loopMatch = cleaned.match(
        /void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/m
      );
      if (loopMatch) {
        dbg("Found loop() body; using only its contents for conversion.");
        cleaned = loopMatch[1];
      } else {
        dbg("No loop() found; converting from full source text.");
      }

      const block = (
        type: string,
        fields: Record<string, string>,
        inner?: string
      ) => {
        const fieldsXml = Object.entries(fields)
          .map(([k, v]) => `<field name="${k}">${v}</field>`)
          .join("\n        ");
        return `  <block type="${type}">\n    ${fieldsXml}${
          inner ? `\n    ${inner}` : ""
        }\n  </block>`;
      };
      const withNext = (top: string, next: string) =>
        top.replace(
          /\n\s*<\/block>\s*$/,
          `\n    <next>\n${next}\n    </next>\n  </block>`
        );
      const statement = (name: string, content: string) =>
        `<statement name="${name}">\n${content}\n    </statement>`;

      const parseDelay = (line: string) => {
        const m = line.match(/\bdelay\s*\(\s*(\d+)\s*\)\s*;/);
        if (!m) return null;
        const ms = parseInt(m[1], 10);
        if (Number.isNaN(ms)) return null;
        if (ms % 1000 === 0) {
          dbg("Parsed delay(): seconds=", ms / 1000);
          return block("wait", { VALUE: String(ms / 1000), METRIC: "second" });
        }
        dbg("Parsed delay(): milliseconds=", ms);
        return block("wait", { VALUE: String(ms), METRIC: "millisecond" });
      };

      const parseDigitalWrite = (line: string) => {
        const m = line.match(
          /\bdigitalWrite\s*\(\s*(\d+)\s*,\s*(HIGH|LOW)\s*\)\s*;/i
        );
        if (!m) return null;
        const pin = m[1];
        const state = m[2].toLowerCase();
        dbg("Parsed digitalWrite(): pin=", pin, "state=", state);
        return block("digital_write", { PIN_VALUE: pin, PIN_STATE: state });
      };

      const parseAnalogWrite = (line: string) => {
        const m = line.match(
          /\banalogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*;/i
        );
        if (!m) return null;
        const pin = m[1];
        const val = m[2];
        dbg("Parsed analogWrite(): pin=", pin, "value=", val);
        return block("analog_write", { PIN_VALUE: pin, PIN_STATE: val });
      };

      const parseIdle = (text: string) => {
        if (
          /\bwhile\s*\(\s*1\s*\)\s*\{\s*\}/.test(text) ||
          /for\s*\(\s*;\s*;\s*\)\s*\{\s*\}/.test(text)
        ) {
          dbg("Parsed idle-forever loop.");
          return block("idle_forever", {});
        }
        return null;
      };

      const parseForLoop = (text: string) => {
        const m = text.match(
          /for\s*\(\s*(?:int\s+)?([A-Za-z_]\w*)\s*=\s*0\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\s*\+\+\s*\)\s*\{([\s\S]*?)\}/m
        );
        if (!m) return null;
        const times = m[2];
        const body = m[3] || "";
        const bodyLines = body
          .split(/;\s*\n?|\n/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => (s.endsWith(";") ? s : s + ";"));

        const items: string[] = [];
        for (const ln of bodyLines) {
          const b =
            parseDigitalWrite(ln) || parseAnalogWrite(ln) || parseDelay(ln);
          if (b) {
            items.push(b);
          } else {
            dbg("Unsupported statement inside for-loop skipped:", ln);
          }
        }

        if (!items.length) return null;

        dbg(
          `Parsed for-loop with ${times} iterations and ${items.length} supported statements.`
        );

        let inner = items[0];
        for (let i = 1; i < items.length; i++)
          inner = withNext(inner, items[i]);
        const stmt = statement("CODE_VALUE", inner);
        return {
          xml: block("controls_repeat_times", { TIMES: times }, stmt),
          consumed: m[0],
        };
      };

      const blocks: string[] = [];
      let remaining = cleaned;
      let loopCount = 0;

      while (true) {
        const loop = parseForLoop(remaining);
        if (!loop) break;
        blocks.push(loop.xml);
        remaining = remaining.replace(loop.consumed, "");
        loopCount++;
      }

      if (loopCount) dbg(`Extracted ${loopCount} top-level for-loop(s).`);

      const idle = parseIdle(remaining);
      if (idle) blocks.push(idle);
      remaining = remaining.replace(
        /\bwhile\s*\(\s*1\s*\)\s*\{\s*\}|for\s*\(\s*;\s*;\s*\)\s*\{\s*\}/g,
        ""
      );

      const lines = remaining
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const ln of lines) {
        const b =
          parseDigitalWrite(ln) || parseAnalogWrite(ln) || parseDelay(ln);
        if (b) {
          blocks.push(b);
        } else {
          dbg("Unsupported top-level statement skipped:", ln);
        }
      }

      if (!blocks.length) return null;

      let root = blocks[0];
      for (let i = 1; i < blocks.length; i++) root = withNext(root, blocks[i]);

      // Ensure the first block has a visible starting position
      if (!/\sx="\d+"/.test(root)) {
        root = root.replace(
          /<block\s+type="([^"]+)"/,
          '<block type="$1" x="20" y="20"'
        );
      }

      return `<?xml version="1.0"?>\n<xml xmlns="https://developers.google.com/blockly/xml">\n${root}\n</xml>`;
    } catch {
      return null;
    }
  }

  // Expose a manual tester in dev tools: window._convertCodeToBlocks(text)
  try {
    (window as any)._convertCodeToBlocks = (txt: string) => {
      const xml = codeToBlocksXmlRich(txt) || codeToBlocksXml(txt);
      console.log(
        "[BBX] _convertCodeToBlocks →",
        xml ? "XML generated" : "null"
      );
      return xml;
    };

    (window as any)._bbxDump = () => {
      const ws = (window as any).Blockly?.getMainWorkspace?.();
      const tops = ws?.getTopBlocks?.(true) || [];
      return {
        mode: activeMode,
        blocksXmlLength: (blocksXml || "").length,
        blocksCodeLength: (blocksCode || "").length,
        topBlocksCount: tops.length,
        topTypes: tops.map((b: any) => b.type),
      };
    };
  } catch {
    // ignore in non-browser envs
  }

  // 🔧 Fix cramped block text on first load:
  useEffect(() => {
    if (activeMode === "blocks" && blockWorkspace) {
      const id = window.setTimeout(() => {
        try {
          Blockly.svgResize(blockWorkspace);
        } catch (e) {
          console.warn("Failed to svgResize Blockly workspace", e);
        }
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [activeMode, blockWorkspace]);

  const toggleLibrary = () =>
    setPanels((p) => ({ ...p, LibraryPanel: !p.LibraryPanel }));
  const toggleBex = () => setPanels((p) => ({ ...p, BEXPanel: !p.BEXPanel }));
  const toggleEditor = () =>
    setPanels((p) => {
      if (p.BlockPanel || p.TextPanel) {
        return { ...p, BlockPanel: false, TextPanel: false };
      }
      return { ...p, TextPanel: true, BlockPanel: false };
    });

  const activeSource = activeMode === "blocks" ? blocksCode : code;

  // Board selection (Nano for CH340 clones)
  const boxInfo = { board: "nano" };

  // ───── Upload state (preview + verify removed) ─────
  const [uploading, setUploading] = useState(false);

  // Direct upload flow (no preview)
  const handleUpload = async () => {
    try {
      const source = activeSource || "";
      if (!source.trim()) {
        alert("No code to upload.");
        return;
      }

      console.group("[BBX] Upload");
      console.log("Code length:", source.length);
      console.log("Code:\n", source);
      console.groupEnd();

      setUploading(true);
      await compileAndFlash(() => source, {
        board: boxInfo.board, // Browser will prompt for a port when needed
      });
      alert("Upload complete!");
    } catch (e: any) {
      console.error(e);
      const msg = String(e?.message || e || "");
      if (/Failed to open serial port/i.test(msg)) {
        alert(
          "Upload failed: The serial port could not be opened. Please close Arduino IDE/Serial Monitor or any app using the port, unplug/replug the board, and try again."
        );
      } else if (/receiveData timeout|timeout after/i.test(msg)) {
        alert(
          "Upload failed: Timed out talking to the bootloader. Try pressing reset on the Nano just before clicking Upload, and ensure the correct bootloader (old vs new) is selected."
        );
      } else {
        alert("Upload failed: " + msg);
      }
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Clear all blocks from the Blockly workspace
  const handleClearBlocks = () => {
    try {
      if (blockWorkspace) {
        blockWorkspace.clear();
      }
    } catch (e) {
      console.warn("Failed to clear Blockly workspace", e);
    }
  };

  // ───── Layout (visuals from JSX) ─────
  const hasLeft = libraryOn;
  const hasRight = editorOn || bexOn;
  const gridTemplateColumns = hasLeft && hasRight ? "1fr 1fr" : "1fr";
  const visibleCols = (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);

  return (
    <LibraryProvider>
      <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
        {/* ──────────── Top Navigation Bar ──────────── */}
        <header className="relative flex items-center bg-gray-900 text-white px-6 py-5">
          {/* Left-justified logo + heading */}
          <div className="flex items-center gap-1">
            <img
              src={LargeLogo}
              alt="Bugbox Logo"
              className="h-12 w-auto object-contain"
            />
            <div className="bbx-heading-1 font-bold text-lg tracking-wide">
              BBX
            </div>
          </div>

          {/* Centred controls */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-3">
              <IndustrialToggle
                label="Read"
                isOn={libraryOn}
                onToggle={toggleLibrary}
                className="w-[160px] shrink-0"
              />
              <IndustrialToggle
                label="Ask"
                isOn={bexOn}
                onToggle={toggleBex}
                className="w-[160px] shrink-0"
              />
              <IndustrialToggle
                label="Code"
                isOn={editorOn}
                onToggle={toggleEditor}
                className="w-[160px] shrink-0"
              />
              <ModeDialCluster
                // dial expects "block" | "text"
                mode={activeMode === "blocks" ? "block" : "text"}
                setMode={setModeFromDial}
                className="w-[220px] shrink-0"
              />
            </div>
          </div>
        </header>

        {/* ──────────── Main Content: Two Columns via CSS Grid ──────────── */}
        <main className="flex-1 min-h-0">
          <div
            className="grid h-full w-full gap-3 p-3 min-h-0 [grid-auto-rows:1fr]"
            style={{ gridTemplateColumns }}
          >
            {/* LEFT COLUMN: LMS Lite (Lesson Library + Viewer) */}
            {hasLeft && (
              <section className="min-w-0 h-full rounded-xl border border-gray-100 bg-white flex flex-col overflow-hidden">
                <div
                  className="flex-1 grid h-full"
                  style={{
                    gridTemplateColumns: "clamp(240px, 22vw, 360px) 1fr",
                    height: "100%",
                  }}
                >
                  <LeftPanel />
                  <Viewer />
                </div>
              </section>
            )}

            {/* RIGHT COLUMN: Code + BEX (with vertical resizer) */}
            {hasRight && (
              <section className="min-w-0 h-full rounded-xl border border-gray-100 bg-white flex flex-col min-h-0 overflow-hidden">
                {/* Coding Panel (Top) — only when editorOn */}
                {editorOn && (
                  <Resizable
                    key={bexOn ? "bex-on" : "bex-off"}
                    defaultSize={{
                      width: "100%",
                      height: bexOn ? "50%" : "100%",
                    }}
                    minHeight="30%"
                    maxHeight="100%"
                    enable={{ bottom: bexOn }}
                    handleStyles={{
                      bottom: {
                        borderTop: "1px solid rgba(0,0,0,0.08)",
                        height: "6px",
                        cursor: "row-resize",
                      },
                    }}
                    className="min-w-0 h-full rounded-xl border border-gray-100 bg-white flex flex-col min-h-0 overflow-hidden"
                  >
                    <header className="flex items-center justify-between p-3 border-b border-gray-100">
                      <h1 className="bbx-heading-2">
                        {activeMode === "blocks" ? "Block Code" : "Text Code"}
                      </h1>
                      <div className="flex gap-2">
                        {activeMode === "blocks" && (
                          <button
                            onClick={handleClearBlocks}
                            className="px-3 py-1 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 flex items-center gap-1"
                            title="Clear all blocks"
                          >
                            <img
                              src={clearIcon}
                              alt="Clear blocks"
                              className="w-4 h-4"
                            />
                            <span>Clear</span>
                          </button>
                        )}
                        {/* Verify button removed */}
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            uploading
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                          title="Compile via local compiler then flash over Web Serial"
                        >
                          {uploading ? "Uploading..." : "Upload ⬆"}
                        </button>
                      </div>
                    </header>

                    <section className="flex-1 overflow-hidden flex flex-col">
                      <div className="h-full relative min-w-0">
                        {/* Always mount both editors; toggle visibility to preserve Blockly state */}
                        <div
                          style={{
                            display: activeMode === "blocks" ? "block" : "none",
                            height: "100%",
                          }}
                        >
                          <BlockEditor
                            xml={blocksXml}
                            onXmlChange={setBlocksXml}
                            onCodeChange={setBlocksCode}
                            className="h-full"
                            onWorkspaceReady={setBlockWorkspace}
                          />
                        </div>
                        <div
                          style={{
                            display: activeMode === "text" ? "block" : "none",
                            height: "100%",
                          }}
                        >
                          <CodeEditor
                            value={code}
                            onChange={setCode}
                            defaultLanguage="cpp"
                            theme="vs-dark"
                            height="100%"
                            onMount={(editor: any, monaco: any) => {
                              try {
                                registerBugboxTheme(monaco);
                                monaco.editor.setTheme("bugbox-dark");
                              } catch {
                                // ignore
                              }
                              editor.focus();
                            }}
                          />
                        </div>
                      </div>
                    </section>
                  </Resizable>
                )}

                {/* BEX nested section (Bottom) — always mounted, visibility toggled */}
                <section
                  className={`min-w-0 h-full rounded-xl border border-gray-100 bg-white flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${
                    bexOn
                      ? editorOn
                        ? "flex-1 opacity-100 pointer-events-auto"
                        : "flex-[1_1_100%] opacity-100 pointer-events-auto"
                      : "flex-[0_0_0%] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <iframe
                      src="https://bex.bugbox.au/"
                      title="BEX Assistant"
                      className="w-full h-full border-0"
                      allow="clipboard-write; microphone; camera"
                    />
                  </div>
                </section>
              </section>
            )}

            {/* Empty state if both columns are off */}
            {visibleCols === 0 && (
              <div className="place-self-center rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                No panels selected. Use the toggles above to show a panel.
              </div>
            )}
          </div>
        </main>
      </div>
    </LibraryProvider>
  );
}
