import React, { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

/**
 * ShadowCapture - Server-driven CAPTCHA component
 * Props:
 *  onVerified: callback when captcha successfully solved
 */
export default function ShadowCapture({ onVerified }) {
  const [ticket, setTicket] = useState(null);
  const [components, setComponents] = useState([]);
  const [shadows, setShadows] = useState([]);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch new CAPTCHA from backend
  useEffect(() => {
    fetchNewCaptcha();
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
        setComponents(data.components);
        setShadows(data.shadows);
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
          body: JSON.stringify({ ticket, matches: newMatches }),
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

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Loading CAPTCHA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "red" }}>
        <p>Error: {error}</p>
        <button onClick={fetchNewCaptcha}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 15 }}>Drag components to their matching shadows</h3>
      
      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: 15, 
          marginBottom: 30,
          padding: 15,
          backgroundColor: "#f9fafb",
          borderRadius: 8
        }}>
          {components.map((comp) => (
            <DraggableComponent 
              key={comp.id} 
              component={comp} 
              isMatched={Object.values(matches).includes(comp.id)} 
            />
          ))}
        </div>

        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: 15,
          padding: 15,
          backgroundColor: "#f3f4f6",
          borderRadius: 8
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
      </DndContext>
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
    backgroundColor: "white",
    borderRadius: 8,
    border: "2px solid #e5e7eb",
    transition: "opacity 0.2s",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <img 
        src={component.image} 
        alt={component.name} 
        style={{ width: 64, height: 64, display: "block" }} 
      />
      <div style={{ fontSize: 12, marginTop: 5, textAlign: "center" }}>
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
        backgroundColor: isMatched ? "#d1fae5" : isOver ? "#dbeafe" : "white",
        transition: "all 0.2s",
        position: "relative"
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
