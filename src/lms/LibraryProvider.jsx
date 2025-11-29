import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// tiny helper to normalise a "level" field if you use it elsewhere
const normaliseLevels = (lev) => {
  if (!lev) return [];
  if (Array.isArray(lev)) return lev.map(String).map(s => s.trim()).filter(Boolean);
  return String(lev).split(',').map(s => s.trim()).filter(Boolean);
};

/** @type {React.Context<{collections: any[], loading: boolean, error: string|null, levels: string[]}>} */
const LibraryCtx = createContext({
  collections: [],
  loading: true,
  error: null,
  levels: [],
});

export function LibraryProvider({ children }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ use the env var in dev/prod; fall back to relative path if unset
        const base = import.meta.env.VITE_LIBRARY_API_BASE || '';
        const endpoint = `${base}/api/library`;

        // helpful debug line – remove later
        console.log('[LibraryProvider] fetching', endpoint, {
          VITE_LIBRARY_API_BASE: import.meta.env.VITE_LIBRARY_API_BASE,
        });

        const res = await fetch(endpoint, { signal: ctl.signal });

        if (!res.ok) {
          // try to read error body for easier debugging
          let detail = '';
          try { detail = await res.text(); } catch {}
          throw new Error(`Failed to load library from ${endpoint} (${res.status}) ${detail}`);
        }

        const data = await res.json();
        setCollections(Array.isArray(data.collections) ? data.collections : []);
      } catch (e) {
        if (e && e.name === 'AbortError') return;
        console.error('LibraryProvider load error:', e);
        setError(e?.message || 'Failed to load library');
      } finally {
        setLoading(false);
      }
    })();

    return () => ctl.abort();
  }, []);

  const levels = useMemo(() => {
    const set = new Set();
    for (const c of collections) normaliseLevels(c.level).forEach(l => set.add(l));
    return Array.from(set).sort();
  }, [collections]);

  const value = { collections, loading, error, levels };
  return <LibraryCtx.Provider value={value}>{children}</LibraryCtx.Provider>;
}

export const useLibrary = () => useContext(LibraryCtx);
