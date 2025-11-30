import React, { useState, useEffect } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// Shuffle function (Fisher–Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * ShadowCapture - CAPTCHA UI
 * Renders shadows (row 1) and components (row 2), both shuffled
 * Now with mobile/desktop DndKit sensors
 * Wrapped in scrollable and full-height container for mobile support
 */
export default function ShadowCapture({ onVerified }) {
  const [ticket, setTicket] = useState(null);
  const [token, setToken] = useState(null);
  const [components, setComponents] = useState([]);
  const [shadows, setShadows] = useState([]);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up DndKit Sensors for touch and mouse
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    fetchNewCaptcha();
    // eslint-disable-next-line
  }, []);

  const fetchNewCaptcha = () => {
    setLoading(true);
    setError(null);

    fetch("/api/captcha/new")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load CAPTCHA");
        return res.json();
      })
      .then((data) => {
        setTicket(data.ticket);
        setToken(data.token);
        setComponents(shuffle(data.components));
        setShadows(shuffle(data.shadows));
        setMatches({});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const newMatches = { ...matches, [over.id]: active.id };
    setMatches(newMatches);

    // Verify if all shadows matched
    if (Object.keys(newMatches).length === shadows.length) {
      try {
        const res = await fetch("/api/captcha/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, matches: newMatches }),
        });

        const data = await res.json();
        if (data.success) {
          onVerified();
        } else {
          alert("CAPTCHA incorrect, please try again.");
          fetchNewCaptcha();
        }
      } catch (err) {
        setError("Verification failed. Please try again.");
        fetchNewCaptcha();
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", background: "#000", color: "#fff" }}>
      <div style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 15, color: "#fff" }}>Drag components to their matching shadows</h3>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {/* Shadows row */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 15,
            marginBottom: 30,
            padding: 15,
            backgroundColor: "#222",
            borderRadius: 8,
            justifyContent: "center",
          }}>
            {shadows.map((shadow) => {
              const matchedComponentId = matches[shadow.id];
              const matchedComponent = components.find((c) => c.id === matchedComponentId);
              return (
                <ShadowDropZone
                  key={shadow.id}
                  shadow={shadow}
                  isMatched={!!matchedComponentId}
                  matchedComponent={matchedComponent}
                />
              );
            })}
          </div>
          {/* Components row */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 15,
            padding: 15,
            backgroundColor: "#333",
            borderRadius: 8,
            justifyContent: "center",
          }}>
            {components.map((comp) => (
              <DraggableComponent
                key={comp.id}
                component={comp}
                isMatched={Object.values(matches).includes(comp.id)}
              />
            ))}
          </div>
        </DndContext>
        {loading &&
          <div style={{ padding: 20, textAlign: "center", color: "#fff" }}>
            <p>Loading CAPTCHA...</p>
          </div>
        }
        {error &&
          <div style={{ padding: 20, textAlign: "center", color: "red" }}>
            <p>Error: {error}</p>
            <button onClick={fetchNewCaptcha}>Try Again</button>
          </div>
        }
        {/* Example placement for button */}
        <div style={{ padding: 32, textAlign: "center" }}>
          <button style={{
            marginTop: 24,
            background: "#8d5c14",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            padding: "14px 42px",
            fontSize: "18px",
            fontWeight: 600,
            cursor: "pointer"
          }}>
            Complete CAPTCHA First
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Draggable Component ---
function DraggableComponent({ component, isMatched }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    disabled: isMatched
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: isMatched ? "default" : "grab",
    opacity: isDragging ? 0.5 : isMatched ? 0.3 : 1,
    userSelect: "none",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "2px solid #e5e7eb",
    transition: "opacity 0.2s",
    width: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    touchAction: "none"
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <img
        src={component.image}
        alt={component.name}
        style={{ width: 64, height: 64, display: "block" }}
      />
      <div style={{ fontSize: 12, marginTop: 5, textAlign: "center", color: "#000" }}>
        {component.name}
      </div>
    </div>
  );
}

// --- Droppable Shadow Zone ---
function ShadowDropZone({ shadow, isMatched, matchedComponent }) {
  const { setNodeRef, isOver } = useDroppable({ id: shadow.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 100,
        height: 100,
        border: "3px dashed #9ca3af",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isMatched ? "#d1fae5" : isOver ? "#dbeafe" : "#222",
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      {isMatched && matchedComponent ? (
        <img
          src={matchedComponent.image}
          alt=""
          style={{ width: 64, height: 64 }}
        />
      ) : (
        <img
          src={shadow.shadow}
          alt=""
          style={{ width: 64, height: 64, opacity: 0.3 }}
        />
      )}
    </div>
  );
}
