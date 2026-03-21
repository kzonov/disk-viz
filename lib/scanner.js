const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function scanDir(dirPath, { excludeSet = new Set(), onProgress } = {}) {
  let entries;
  try {
    entries = await fsp.readdir(dirPath, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') return null;
    throw err;
  }

  const children = [];
  let dirSize = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (excludeSet.has(fullPath)) continue;

    let lstats;
    try {
      lstats = await fsp.lstat(fullPath);
      if (lstats.isSymbolicLink()) continue;
    } catch {
      continue;
    }

    if (entry.isDirectory()) {
      if (onProgress) onProgress(fullPath);
      const child = await scanDir(fullPath, { excludeSet, onProgress });
      if (child && child.size > 0) {
        children.push(child);
        dirSize += child.size;
      }
    } else if (entry.isFile()) {
      const size = lstats.size;
      if (size > 0) {
        children.push({ name: entry.name, path: fullPath, size });
        dirSize += size;
      }
    }
  }

  return {
    name: path.basename(dirPath),
    path: dirPath,
    size: dirSize,
    children: children.sort((a, b) => b.size - a.size),
  };
}

module.exports = { scanDir };
