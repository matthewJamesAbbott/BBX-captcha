// /api/auth/verify.js
// Verifies if a token is valid and not expired

import { tokenStore } from "../tokenStore.js";  // ← IMPORT SHARED STORE

export default function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  // Check if token exists
  if (!token) {
    return res.status(400).json({ valid: false, message: 'No token provided' });
  }

  // Look up token in store
  const record = tokenStore[token];

  // Token doesn't exist or is expired
  if (!record || record.expires < Date.now()) {
    // Clean up expired token
    if (record) delete tokenStore[token];
    return res.json({ valid: false });
  }

  // Token is valid
  res.json({ valid: true });
}
