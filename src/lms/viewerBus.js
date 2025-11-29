// Tiny event bus to open items in the central viewer

/** @type {(item: any) => void | null} */
let subscriber = null;

export function openInViewer(item) {
  if (subscriber) subscriber(item);
}

export function onViewerEvent(cb) {
  subscriber = cb;
  return () => { subscriber = null; };
}
