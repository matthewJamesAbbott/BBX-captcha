import React from "react";

export type CodeMode = "text" | "blocks";

export function CodeModeToggle({
    mode,
    onChange
}: { mode: CodeMode; onChange: (m: CodeMode) => void }) {
    return (
        <div className="flex gap-2 items-center">
            <button
                className={`px-3 py-1 rounded ${mode === "text" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                onClick={() => onChange("text")}
            >
                Text Code
            </button>
            <button
                className={`px-3 py-1 rounded ${mode === "blocks" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                onClick={() => onChange("blocks")}
            >
                Block Code
            </button>
        </div>
    );
}
