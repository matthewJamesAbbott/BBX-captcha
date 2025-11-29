// src/utils/compilerClient.js

// Determine the base API URL
const API =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_COMPILER_BASE || import.meta.env.NEXT_PUBLIC_COMPILER_API))
    ? (import.meta.env.VITE_COMPILER_BASE || import.meta.env.NEXT_PUBLIC_COMPILER_API)
    : '/__compiler';

// Main function to send code to compiler API
export async function compileSketch(source) {
  // Decide correct compile endpoint
  const url = API === '/__compiler' ? '/__compiler/compile' : `${API}/compile`;

  // 🔍 Log for debugging (you’ll see this in DevTools console)
  console.log('[BBX] compiler API:', url);

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: source }),
    });

    // Read text first to safely handle non-JSON responses
    const text = await resp.text();

    try {
      const data = JSON.parse(text);
      if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
      return data; // ✅ { hex: "..." }
    } catch {
      throw new Error(`Non-JSON from compiler: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.error('[BBX] Verify failed:', err);
    throw err;
  }
}
