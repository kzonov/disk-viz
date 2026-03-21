const EXT_MAP = {
  // Code
  js: 'code', ts: 'code', jsx: 'code', tsx: 'code', py: 'code', rb: 'code',
  go: 'code', rs: 'code', java: 'code', c: 'code', cpp: 'code', h: 'code',
  cs: 'code', swift: 'code', kt: 'code', php: 'code', sh: 'code', bash: 'code',
  html: 'code', css: 'code', scss: 'code', less: 'code', vue: 'code', svelte: 'code',
  // Media
  jpg: 'media', jpeg: 'media', png: 'media', gif: 'media', svg: 'media',
  webp: 'media', ico: 'media', bmp: 'media', tiff: 'media',
  mp3: 'media', wav: 'media', flac: 'media', aac: 'media', ogg: 'media',
  mp4: 'media', mkv: 'media', avi: 'media', mov: 'media', webm: 'media',
  // Docs
  md: 'docs', txt: 'docs', pdf: 'docs', doc: 'docs', docx: 'docs',
  xls: 'docs', xlsx: 'docs', ppt: 'docs', pptx: 'docs', rtf: 'docs',
  // Data
  json: 'data', yaml: 'data', yml: 'data', xml: 'data', csv: 'data',
  sql: 'data', db: 'data', sqlite: 'data', parquet: 'data',
  // Archive
  zip: 'archive', tar: 'archive', gz: 'archive', bz2: 'archive',
  xz: 'archive', '7z': 'archive', rar: 'archive', dmg: 'archive',
  // System
  lock: 'system', log: 'system', pid: 'system', sock: 'system',
  DS_Store: 'system', gitignore: 'system',
};

function getCategory(name) {
  if (!name) return 'other';
  const dot = name.lastIndexOf('.');
  if (dot === -1) return 'other';
  const ext = name.slice(dot + 1).toLowerCase();
  return EXT_MAP[ext] || 'other';
}

export function categoryLabel(name) {
  return getCategory(name);
}

export function nodeColor(d) {
  if (d.depth === 0) return 'hsl(0, 0%, 20%)';

  // Walk up to the depth-1 ancestor to get the sector's base hue
  let topLevel = d;
  while (topLevel.depth > 1) topLevel = topLevel.parent;

  const topSiblings = topLevel.parent.children;
  const topIndex = topSiblings.indexOf(topLevel);
  const topTotal = topSiblings.length;

  // Evenly distribute hues around the wheel for top-level sectors.
  // Each sector owns a band of (360 / topTotal) degrees.
  const baseHue = (topIndex / topTotal) * 360;
  const bandwidth = 360 / topTotal;

  // For deeper nodes, drift the hue within the sector's bandwidth
  // based on each node's position among its siblings.
  let hueShift = 0;
  let node = d;
  while (node.depth > 1) {
    const siblings = node.parent.children;
    const idx = siblings.indexOf(node);
    const count = siblings.length;
    // Spread across 40% of the bandwidth per level so siblings are
    // distinguishable but stay clearly within the parent's color family.
    const spread = bandwidth * 0.4;
    hueShift += count > 1 ? (idx / (count - 1) - 0.5) * spread : 0;
    node = node.parent;
  }

  const hue = ((baseHue + hueShift) % 360 + 360) % 360;
  const saturation = 72;
  // Lighten slightly with each level so hierarchy is visible
  const lightness = Math.max(32, 52 - (d.depth - 1) * 6);

  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}
