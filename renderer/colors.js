const CATEGORY_COLORS = {
  code:    { h: 174, s: 60, l: 50 },  // teal
  media:   { h: 0,   s: 65, l: 55 },  // red
  docs:    { h: 220, s: 60, l: 55 },  // blue
  data:    { h: 140, s: 50, l: 45 },  // green
  archive: { h: 280, s: 50, l: 55 },  // purple
  system:  { h: 0,   s: 0,  l: 45 },  // gray
  other:   { h: 40,  s: 40, l: 50 },  // muted gold
};

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

export function nodeColor(d) {
  // Directories: blend based on children or use 'other'
  const node = d.data || d;
  const cat = node.children ? 'other' : getCategory(node.name);
  const base = CATEGORY_COLORS[cat];

  // Vary lightness by depth for visual distinction
  const depth = d.depth || 0;
  const l = Math.max(25, base.l - depth * 5);
  const s = Math.max(15, base.s - depth * 3);

  return `hsl(${base.h}, ${s}%, ${l}%)`;
}

export function categoryLabel(name) {
  return getCategory(name);
}
