import { formatSize, formatPercent, formatCount } from './format.js';

export function createDetails(container) {
  const el = document.createElement('div');
  el.className = 'details-panel';
  el.innerHTML = '<div class="details-placeholder">Hover over a segment to see details</div>';
  container.appendChild(el);

  function countFiles(node) {
    if (!node.children) return 1;
    let count = 0;
    node.children.forEach((c) => (count += countFiles(c)));
    return count;
  }

  function update(d) {
    if (!d) {
      el.innerHTML = '<div class="details-placeholder">Hover over a segment to see details</div>';
      return;
    }

    const isDir = !!d.children;
    const parentValue = d.parent ? d.parent.value : d.value;
    const fraction = parentValue > 0 ? d.value / parentValue : 0;
    const fileCount = isDir ? countFiles(d) : null;

    el.innerHTML = `
      <div class="details-name">${d.data.name}</div>
      <div class="details-path">${d.data.path}</div>
      <div class="details-row">
        <span class="details-label">Size</span>
        <span class="details-value">${formatSize(d.value)}</span>
      </div>
      <div class="details-row">
        <span class="details-label">% of parent</span>
        <span class="details-value">${formatPercent(fraction)}</span>
      </div>
      ${isDir ? `
      <div class="details-row">
        <span class="details-label">Files</span>
        <span class="details-value">${formatCount(fileCount)}</span>
      </div>` : ''}
      <div class="details-row">
        <span class="details-label">Type</span>
        <span class="details-value">${isDir ? 'Directory' : 'File'}</span>
      </div>
    `;
  }

  return { update };
}
