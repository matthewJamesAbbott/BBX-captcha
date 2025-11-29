import React from "react";
import { createRoot } from "react-dom/client";
import BBXUI from "./BBXUI.tsx";
import LoginGate from "./LoginGate.jsx";
import "./tailwind.css";
import "./style.scss";

const container = document.getElementById("root");
if (!container) {
  throw new Error('Missing <div id="root"></div> in index.html');
}

createRoot(container).render(
  <React.StrictMode>
    <LoginGate>
      <BBXUI />
    </LoginGate>
  </React.StrictMode>
);
