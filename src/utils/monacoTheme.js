// src/utils/monacoTheme.js
export function registerBugboxTheme(monaco) {
  monaco.editor.defineTheme("bugbox-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "E6E6E6", background: "0B0F19" },
      { token: "keyword", foreground: "FF5412", fontStyle: "bold" },
      { token: "number", foreground: "47C7FC" },
      { token: "string", foreground: "A5D6FF" },
      { token: "comment", foreground: "6B7280" },
    ],
    colors: {
      "editor.background": "#0B0F19",
      "editorLineNumber.foreground": "#6B7280",
      "editorLineNumber.activeForeground": "#FF5412",
      "editorCursor.foreground": "#FF5412",
      "editor.selectionBackground": "#2D3B53",
      "editor.inactiveSelectionBackground": "#1F2937",
      "editor.lineHighlightBackground": "#1F2937",
      "editorBracketMatch.background": "#203040",
      "editorBracketMatch.border": "#47C7FC",
      "editorIndentGuide.background": "#2A3341",
      "editorIndentGuide.activeBackground": "#47C7FC",
      "scrollbarSlider.activeBackground": "#FF541277",
      "scrollbarSlider.hoverBackground": "#47C7FC66",
    },
  });
}
