// URL helpers (e.g., Canva embed) + level normaliser

export function toCanvaEmbed(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const i = parts.findIndex(p => p === 'design');
    if (i !== -1 && parts[i + 1]) {
      const id = parts[i + 1];
      return `https://www.canva.com/design/${id}/view?embed`;
    }
    if (u.pathname.endsWith('/view')) return `${u.origin}${u.pathname}?embed`;
    return url;
  } catch {
    return url;
  }
}

export function normaliseLevels(level) {
  if (!level) return [];
  return Array.isArray(level) ? level : [level];
}
