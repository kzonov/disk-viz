const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const idx = Math.min(i, UNITS.length - 1);
  const val = bytes / Math.pow(1024, idx);
  return `${val < 10 ? val.toFixed(2) : val < 100 ? val.toFixed(1) : Math.round(val)} ${UNITS[idx]}`;
}

export function formatPercent(fraction) {
  if (fraction >= 0.1) return `${(fraction * 100).toFixed(1)}%`;
  if (fraction >= 0.001) return `${(fraction * 100).toFixed(2)}%`;
  return '< 0.01%';
}

export function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
