import crypto from "crypto";
import { tokenStore } from "../tokenStore.js";  // ← ADD THIS LINE

export default function handler(req, res) {
  const { verified, rememberMe } = req.body;  // ← ADD rememberMe

  if (!verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'CAPTCHA verification required' 
    });
  }

  // Generate secure random token
  const token = crypto.randomBytes(32).toString("hex");
  
  // Set expiration based on "Remember Me"
  const expires = rememberMe
    ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    : Date.now() + 60 * 60 * 1000;          // 1 hour

  // Store token with expiration  ← ADD THIS
  tokenStore[token] = { expires };

  return res.json({ 
    success: true, 
    token 
  });
}
