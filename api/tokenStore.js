// /api/tokenStore.js
// Shared token store for login and verify endpoints
// NOTE: This is in-memory only. Use Redis/DB for production.

const tokenStore = {};

export { tokenStore };
