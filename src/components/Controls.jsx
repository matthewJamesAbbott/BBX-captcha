import React from "react";

// CSS variables with fallbacks
const ORANGE = "var(--bugbox-orange, #FF5412)";
const GREYDARK = "var(--bugbox-grey-dark, #333333)";

/** ✈️ Rotary Mode Dial Cluster — fixed width, legends tight to dial */
export function ModeDialCluster({ mode = "block", setMode, className = "" }) {
  const isBlock = mode === "block";
  return (
    <div className={`flex items-center justify-center gap-3 w-[220px] shrink-0 ${className}`}>
      {/* Left legend (right-aligned) */}
      <span
        className={`text-[10px] tracking-widest select-none transition-colors duration-300 ${
          isBlock ? "text-[var(--bugbox-orange,#FF5412)]" : "text-gray-400"
        }`}
        style={{ width: "60px", textAlign: "right" }}
      >
        BLOCK CODE
      </span>

      {/* Dial */}
      <button
        onClick={() => setMode(isBlock ? "text" : "block")}
        className="relative w-14 h-14 rounded-full border-4 border-gray-700 bg-gray-800 shadow-lg cursor-pointer active:scale-95 transition"
        aria-label={`Switch to ${isBlock ? "Text" : "Block"} mode`}
      >
        <div
          className="absolute left-1/2 top-1/2 w-2 h-6 rounded-sm origin-bottom transition-transform duration-500"
          style={{
            backgroundColor: ORANGE,
            transform: `translate(-50%, -100%) rotate(${isBlock ? -90 : 90}deg)`,
          }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-300 shadow" />
      </button>

      {/* Right legend (left-aligned) */}
      <span
        className={`text-[10px] tracking-widest select-none transition-colors duration-300 ${
          !isBlock ? "text-[var(--bugbox-orange,#FF5412)]" : "text-gray-400"
        }`}
        style={{ width: "60px", textAlign: "left" }}
      >
        TEXT CODE
      </span>
    </div>
  );
}

/** ⚙️ Simplified Industrial On/Off Toggle — clean rocker style (fixed width via className) */
export function IndustrialToggle({ label, isOn, onToggle, className = "" }) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center justify-between gap-4 px-4 py-2 bg-gray-800 shadow-inner active:translate-y-[1px] transition ${className}`}
      aria-pressed={isOn}
      aria-label={`${label} ${isOn ? "on" : "off"}`}
      title={`${label}: ${isOn ? "ON" : "OFF"}`}
    >
      <span className="text-xs font-semibold tracking-wide text-gray-200 truncate">{label}</span>
      <span
        className="inline-block w-10 h-5 rounded-full border border-gray-600"
        style={{ backgroundColor: isOn ? ORANGE : GREYDARK }}
      >
        <span
          className={`block w-4 h-4 bg-white rounded-full shadow m-0.5 transition-transform ${
            isOn ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}
