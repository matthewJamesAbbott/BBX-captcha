// api/server.mjs
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import libraryHandler from "./library.js";

dotenv.config({ path: ".env.local" });

console.log("[library-api] env", {
  hasKey: !!process.env.AIRTABLE_API_KEY,
  base: process.env.AIRTABLE_BASE_ID
});

const app = express();
const PORT = process.env.PORT || 3200;

// In-memory stores for development
const tokenStore = {};
const captchaStore = {};

// CORS setup
const allowed = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (allowed.includes("*") || !origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  }
}));

// Parse JSON bodies
app.use(express.json());

// ===== EXISTING ROUTES =====

// Library route (existing)
app.get("/api/library", (req, res) => libraryHandler(req, res));

// Healthcheck (existing)
app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

// ===== CAPTCHA ROUTES =====

// Generate new CAPTCHA challenge
app.get("/api/captcha/new", (req, res) => {
  const ticket = crypto.randomUUID();
  const COMPONENTS = [
    { id: "arduino", name: "Arduino Board" },
    { id: "led", name: "LED" },
    { id: "resistor", name: "Resistor" },
    { id: "servo", name: "Servo Motor" },
  ];
  
  // Shuffle components for display
  const shuffledComponents = [...COMPONENTS].sort(() => Math.random() - 0.5);
  
  // Shuffle shadows SEPARATELY
  const shuffledShadows = [...COMPONENTS].sort(() => Math.random() - 0.5);
  
  // Build solution map (shadow_id -> correct_component_id)
  const solution = {};
  shuffledShadows.forEach((shadow, index) => {
    solution[shadow.id] = shadow.id; // The shadow needs its matching component
  });
  
  captchaStore[ticket] = {
    solution,
    expires: Date.now() + 5 * 60 * 1000,
  };
  
  res.json({
    ticket,
    components: shuffledComponents.map((c) => ({
      id: c.id,
      name: c.name,
      image: `/Assets/Images/${c.id}.png`,
    })),
    shadows: shuffledShadows.map((c) => ({
      id: c.id,
      shadow: `/Assets/Images/${c.id}-shadow.png`,
    })),
  });
});

// Verify CAPTCHA solution
app.post("/api/captcha/verify", (req, res) => {
  const { ticket, matches } = req.body;
  const record = captchaStore[ticket];
  
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ 
      success: false, 
      message: "CAPTCHA expired or invalid" 
    });
  }
  
  const correct = Object.entries(record.solution).every(
    ([shadowId, componentId]) => matches[shadowId] === componentId
  );
  
  delete captchaStore[ticket];
  res.json({ success: correct });
});

// ===== AUTH ROUTES =====

// Login (after CAPTCHA verification)
app.post("/api/auth/login", (req, res) => {
  const { verified, rememberMe } = req.body;
  
  if (!verified) {
    return res.status(403).json({ 
      success: false, 
      message: "CAPTCHA verification required" 
    });
  }
  
  const token = crypto.randomBytes(32).toString("hex");
  const expires = rememberMe
    ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    : Date.now() + 60 * 60 * 1000;          // 1 hour
  
  tokenStore[token] = { expires };
  
  res.json({ success: true, token });
});

// Verify auth token
app.post("/api/auth/verify", (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ 
      valid: false, 
      message: "No token provided" 
    });
  }
  
  const record = tokenStore[token];
  
  if (!record || record.expires < Date.now()) {
    if (record) delete tokenStore[token];
    return res.json({ valid: false });
  }
  
  res.json({ valid: true });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`[library-api] listening on http://localhost:${PORT}`);
  console.log(`[auth] routes available at /api/auth/*`);
  console.log(`[captcha] routes available at /api/captcha/*`);
});
