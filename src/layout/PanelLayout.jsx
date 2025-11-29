import React, { useEffect, useRef, useState } from "react";
import { Resizable } from "re-resizable";

/**
 * Usage:
 * <BBXPanelLayout
 *   librarySlot={<LeftPanel />}
 *   blockSlot={<BlockPanel />}
 *   textSlot={<TextPanel />}
 *   bexSlot={<BEXPanel />}
 *   visible={{ library: true, block: true, text: false, bex: true }}
 * />
 */

const DEFAULTS = {
  libraryW: 320,   // left panel (Library)
  bexW: 360,       // right panel (BEX)
  textH: 260,      // bottom panel (Text)
};

export default function BBXPanelLayout({
  librarySlot,
  blockSlot,
  textSlot,
  bexSlot,
  visible = { library: true, block: true, text: false, bex: false },
}) {
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);

  // individual sizes
  const [libraryW, setLibraryW] = useState(DEFAULTS.libraryW);
  const [bexW, setBexW] = useState(DEFAULTS.bexW);
  const [textH, setTextH] = useState(DEFAULTS.textH);

  // measure + clamp on container resize
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      setContainerW(clientWidth);
      setContainerH(clientHeight);
      // clamp widths/heights so panels never overlap centre
      const minCentreW = 200;
      const minCentreH = 200;
      const maxLib = Math.max(200, clientWidth - (visible.bex ? bexW : 0) - minCentreW);
      const maxBex = Math.max(0, clientWidth - (visible.library ? libraryW : 0) - minCentreW);
      const maxText = Math.max(0, clientHeight - minCentreH);

      setLibraryW((w) => clamp(w, 200, maxLib));
      setBexW((w) => clamp(w, 0, maxBex));
      setTextH((h) => clamp(h, 0, maxText));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // re-run when visibility or side sizes change
  }, [visible.library, visible.bex, libraryW, bexW]);

  const resetLayout = () => {
    setLibraryW(DEFAULTS.libraryW);
    setBexW(DEFAULTS.bexW);
    setTextH(DEFAULTS.textH);
  };

  // computed bounds for resizers
  const minCentreW = 200;
  const minCentreH = 200;

  const maxLibrary = Math.max(200, containerW - (visible.bex ? bexW : 0) - minCentreW);
  const maxBEX = Math.max(0, containerW - (visible.library ? libraryW : 0) - minCentreW);
  const maxText = Math.max(0, containerH - minCentreH);

  // centre rect is what remains after visible panels reserve space
  const centreLeft = visible.library ? libraryW : 0;
  const centreRight = visible.bex ? bexW : 0;
  const centreBottom = visible.text ? textH : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-neutral-950 text-neutral-100"
    >
      <div className="absolute top-2 right-2 z-50 flex gap-2">
        <button
          onClick={resetLayout}
          className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20"
        >
          Reset panels
        </button>
      </div>

      {/* Library (Left) */}
      {visible.library && librarySlot && (
        <Resizable
          bounds="parent"
          enable={{ right: true }}
          minWidth={200}
          maxWidth={maxLibrary}
          size={{ width: libraryW, height: "100%" }}
          onResizeStop={(e, dir, ref, d) =>
            setLibraryW(clamp(libraryW + d.width, 200, maxLibrary))
          }
          className="absolute left-0 top-0 h-full bg-neutral-900 border-r border-white/10"
        >
          <PanelShell title="Library">{librarySlot}</PanelShell>
        </Resizable>
      )}

      {/* BEX (Right) */}
      {visible.bex && bexSlot && (
        <Resizable
          bounds="parent"
          enable={{ left: true }}
          minWidth={0}
          maxWidth={maxBEX}
          size={{ width: bexW, height: "100%" }}
          onResizeStop={(e, dir, ref, d) => setBexW(clamp(bexW + d.width, 0, maxBEX))}
          className="absolute right-0 top-0 h-full bg-neutral-900 border-l border-white/10"
        >
          <PanelShell title="BEX AI Guide">{bexSlot}</PanelShell>
        </Resizable>
      )}

      {/* Text (Bottom) */}
      {visible.text && textSlot && (
        <Resizable
          bounds="parent"
          enable={{ top: true }}
          minHeight={0}
          maxHeight={maxText}
          size={{ width: "100%", height: textH }}
          onResizeStop={(e, dir, ref, d) =>
            setTextH(clamp(textH + d.height, 0, maxText))
          }
          className="absolute left-0 bottom-0 w-full bg-neutral-900 border-t border-white/10"
        >
          <PanelShell title="Text Code Panel">{textSlot}</PanelShell>
        </Resizable>
      )}

      {/* Block (Centre) */}
      <div
        className="absolute"
        style={{
          left: centreLeft,
          right: centreRight,
          top: 0,
          bottom: centreBottom,
          overflow: "hidden",
        }}
      >
        {visible.block && blockSlot ? (
          <PanelShell noFrame title="">{blockSlot}</PanelShell>
        ) : (
          <div className="w-full h-full grid place-items-center text-white/40 text-sm">
            {/* empty centre when BlockPanel hidden */}
            <span>Centre area</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PanelShell({ title, children, noFrame = false }) {
  if (noFrame) {
    return <div className="w-full h-full">{children}</div>;
  }
  return (
    <div className="flex flex-col w-full h-full">
      {title ? (
        <div className="shrink-0 px-3 py-2 border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide">
          {title}
        </div>
      ) : null}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
