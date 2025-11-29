import React, { useEffect, useState } from 'react';
import { onViewerEvent } from './viewerBus';
import { toCanvaEmbed } from './url';

export default function Viewer() {
  const [item, setItem] = useState(null);

  useEffect(() => onViewerEvent(setItem), []);

  if (!item) {
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#666' }}>
        Select a resource from the left panel
      </div>
    );
  }

  // Displays "Coming Soon" for items with no URL
  if (!item.url || item.url.trim() === "") {
    return (
      <div
        style={{
          height: '100%', display: 'grid', placeItems: 'center', color: '#666' 
        }}
      >
        Coming Soon...
      </div>
    );
  }

  switch (item.kind) {
    case 'markdown':
      return (
        <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {item.body || ''}
          </pre>
        </div>
      );

    case 'canva': {
      const src = item.canEmbed && item.url ? toCanvaEmbed(item.url) : item.url;
      return <Frame src={src} title={item.title} />;
    }

    // ───────── YouTube: use the embed URL from Airtable ─────────
    case 'youtube': {
      const src = item.url || '';
      return <Frame src={src} title={item.title} />;
    }

    case 'pdf':
    case 'video':
    case 'link':
      return <Frame src={item.url} title={item.title} />;

    case 'starter-code':
      return (
        <div style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>{item.title}</h3>
          <p>Create your project from this template.</p>
          <button
            onClick={() => item.url && scaffoldFromTemplate(item.url)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              cursor: 'pointer',
            }}
          >
            Create from template
          </button>
        </div>
      );

    default:
      return (
        <div style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>{item.title}</h3>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          ) : (
            <p>No URL provided.</p>
          )}
        </div>
      );
  }
}

function Frame({ src, title }) {
  if (!src) {
    return (
      <div style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p>Nothing to display.</p>
      </div>
    );
  }

  return (
    <iframe
      src={src}
      title={title}
      style={{ width: '100%', height: '100%', border: 'none' }}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}

function scaffoldFromTemplate(url) {
  // Hook into your BBX template/project-creation flow here
  console.log('Scaffold from template:', url);
}
