import React from "react";
import Editor from "@monaco-editor/react";

/**
 * Minimal, robust wrapper around @monaco-editor/react.
 * Works with both controlled (value/onChange) and uncontrolled (defaultValue).
 */
export default function CodeEditor({
  value,
  defaultValue,
  language = "cpp",
  theme = "vs-dark",
  options,
  onChange,
  onMount,
  height = "100%",
  className,
  style,
}) {
  return (
    <div className={className} style={{ position: "relative", height: "100%", ...style }}>
      <Editor
        height={height}
        // pass BOTH to avoid edge-cases with first paint
        language={language}
        defaultLanguage={language}
        theme={theme}
        // controlled vs uncontrolled
        value={value}
        defaultValue={value == null ? defaultValue : undefined}
        // safe defaults
        options={{ automaticLayout: true, minimap: { enabled: false }, ...options }}
        onChange={(v) => onChange?.(v ?? "")}
        onMount={onMount}
      />
    </div>
  );
}
