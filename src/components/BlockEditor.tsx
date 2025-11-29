// src/components/BlockEditor.tsx
import React, { useEffect, useRef } from "react";

// Core Blockly (types + base)
import * as Blockly from "blockly/core";
import "blockly/blocks";          // built-in blocks
import "blockly/javascript";      // built-in JS generator
import * as BlocklyMsgEn from "blockly/msg/en";

// 🔸 Bugbox / Playground-specific Blockly setup
import toolbox from "../Blockly/toolbox";           // default export from toolbox.ts
import bugboxTheme from "../Blockly/theme";         // default export from theme.ts
import { BLOCK_DEFINITIONS, BLOCK_STUBS } from "../Blockly/blocks-registry";
import { inoGenerator } from "../Blockly/inogen";

import "../styles/blockly.css";

// ------------ Types ------------

type Props = {
  xml: string;
  onXmlChange: (xml: string) => void;
  onCodeChange?: (code: string) => void;
  className?: string;
  // let parent get the workspace (for Clear button, etc.)
  onWorkspaceReady?: (ws: Blockly.WorkspaceSvg) => void;
};

// ---- SHIMS to avoid TS errors with certain Blockly versions ----
const Xml: any = (Blockly as any).Xml ?? {};
const JavaScriptGen: any = (Blockly as any).JavaScript ?? {};

// ----------------------------------------------------------------

declare global {
  interface Window {
    Blockly?: any;
    BBX_WS?: Blockly.WorkspaceSvg;
  }
}

// Make sure messages are English
(Blockly as any).setLocale?.(BlocklyMsgEn);

// Register all Bugbox custom blocks and generator stubs
function registerBugboxBlocks() {
  // 1) Block definitions: wire up block shapes
  try {
    if (Array.isArray(BLOCK_DEFINITIONS)) {
      for (const def of BLOCK_DEFINITIONS) {
        if (typeof def === "function") {
          // In files like comment/definition.ts, the exported function
          // looks like (blocks) => { blocks.Blocks[BlockType.COMMENT] = {...} }
          def(Blockly as any);
        }
      }
    }
  } catch (e) {
    console.warn("Failed to register Bugbox block definitions:", e);
  }

  // 2) Generator stubs: wire up code-generation
  try {
    // Prefer our Arduino/.ino generator so blocks produce C++ suitable for Arduino
    (window as any).Blockly = (window as any).Blockly || (Blockly as any);
    (window as any).Blockly.Arduino = inoGenerator;

    console.log("[BBX] inoGenerator loaded?", {
      hasInoGenerator: !!inoGenerator,
      type: typeof inoGenerator,
      hasWorkspaceToCode: !!(inoGenerator as any)?.workspaceToCode,
    });

    const gen = (inoGenerator as any) || (Blockly as any).JavaScript || JavaScriptGen;

    console.log("[BBX] generator chosen:", {
      usesArduino: gen === inoGenerator,
      usesJavaScript: gen === JavaScriptGen,
      hasWorkspaceToCode: !!gen?.workspaceToCode,
    });

    if (!gen || !Array.isArray(BLOCK_STUBS)) return;

    for (const stub of BLOCK_STUBS) {
      if (typeof stub === "function") {
        // Each stub registers a function on the passed generator keyed by BlockType
        stub(gen);
      }
    }
  } catch (e) {
    console.warn("Failed to register Bugbox generator stubs:", e);
  }
}

export default function BlockEditor({
  xml,
  onXmlChange,
  onCodeChange,
  className,
  onWorkspaceReady,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const importingRef = useRef(false);
  const lastLoadedXmlRef = useRef<string | null>(null);

  // Helper to safely import XML into a workspace
  const safeImportXml = (
    workspace: Blockly.WorkspaceSvg,
    xmlText: string
  ): number => {
    if (!xmlText || !Xml?.textToDom) return 0;
    try {
      importingRef.current = true;
      (Blockly as any).Events?.disable?.();
      workspace.clear();
      const dom = Xml.textToDom(xmlText);
      Xml.domToWorkspace(dom, workspace);
      (Blockly as any).Events?.enable?.();
      lastLoadedXmlRef.current = xmlText;

      const tops = workspace.getTopBlocks(true);
      window.setTimeout(() => {
        try {
          Blockly.svgResize(workspace);
          const t = workspace.getTopBlocks(true);
          if (t && t.length) {
            (workspace as any).scrollCenter?.();
          }
        } catch {
          /* ignore */
        }
      }, 0);

      return tops?.length ?? 0;
    } catch (e) {
      console.warn("Failed importing Blockly XML:", e);
      try {
        (Blockly as any).Events?.enable?.();
      } catch {
        /* ignore */
      }
      return 0;
    } finally {
      importingRef.current = false;
    }
  };

  // Mount Blockly once
  useEffect(() => {
    if (!hostRef.current || wsRef.current) {
      return;
    }

    // Register Bugbox blocks + generators
    registerBugboxBlocks();

    // Inject Blockly workspace into the inner div using the Bugbox toolbox + theme
    const workspace = Blockly.inject(hostRef.current, {
      toolbox: toolbox as any,               // ToolboxDefinition from toolbox.ts
      renderer: "zelos",                    // Scratch-style renderer
      trashcan: true,
      grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
      zoom: { controls: true, wheel: true },
      theme: (bugboxTheme as any) || Blockly.Themes.Classic,
    });

    wsRef.current = workspace;
    (window as any).BBX_WS = workspace;      // expose for console debugging
    onWorkspaceReady?.(workspace);

    // Load incoming XML (if any)
    try {
      if (xml && Xml?.textToDom) {
        const count = safeImportXml(workspace, xml);
        console.log("[BBX] Imported initial blocks XML, top blocks:", count);
      }
    } catch (e) {
      console.warn("Error importing initial Blockly XML:", e);
    }

    // Listen for workspace changes (both structure + codegen)
    const onChange = () => {
      if (!workspace) return;

      try {
        // 1) Export XML and push up to parent
        const dom =
          Xml?.workspaceToDom?.(workspace) ??
          (Blockly as any).Xml?.workspaceToDom?.(workspace);

        const nextXml =
          Xml?.domToText?.(dom) ??
          (Blockly as any).Xml?.domToText?.(dom);

        if (!importingRef.current) {
          onXmlChange(nextXml);
          lastLoadedXmlRef.current = nextXml;
        }

        // 2) Generate Arduino (or JS) code from workspace
        // Call workspaceToCode with the correct generator context
        let generated = "";
        const arduinoGen = (window as any).Blockly?.Arduino;

        console.log("[BBX] codegen check:", {
          hasArduinoGen: !!arduinoGen,
          arduinoHasW2C: !!arduinoGen?.workspaceToCode,
          jsHasW2C: !!JavaScriptGen?.workspaceToCode,
        });

        if (
          arduinoGen &&
          typeof arduinoGen.workspaceToCode === "function"
        ) {
          generated = arduinoGen.workspaceToCode(
            workspace as unknown as Blockly.Workspace
          );
        } else if (
          JavaScriptGen &&
          typeof JavaScriptGen.workspaceToCode === "function"
        ) {
          generated = JavaScriptGen.workspaceToCode.call(
            JavaScriptGen,
            workspace as unknown as Blockly.Workspace
          );
        }

        console.log(
          "[BBX] generated code length from workspace:",
          generated?.length ?? 0
        );

        if (generated != null) {
          onCodeChange?.(generated);
        }
      } catch (e) {
        console.warn("Blockly generation error:", e);
      }
    };

    workspace.addChangeListener(onChange);

    return () => {
      workspace.removeChangeListener(onChange);
      workspace.dispose();
      wsRef.current = null;
    };
  }, []); // mount once

  // If parent updates xml prop while workspace exists, import it
  useEffect(() => {
    const workspace = wsRef.current;
    if (!workspace) return;

    // If the XML hasn't changed, no-op
    if (!xml || xml === lastLoadedXmlRef.current) return;

    const topCount = safeImportXml(workspace, xml);
    console.log("[BBX] External XML update imported, top blocks:", topCount);
  }, [xml]);

  return (
    <div className={`bbx-blockly-shell ${className ?? ""}`}>
      <div
        ref={hostRef}
        className="bbx-blockly-root blocklyDiv"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
