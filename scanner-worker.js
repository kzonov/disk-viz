const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const { dirPath, excludePaths } = workerData;
const excludeSet = new Set(excludePaths || []);

let filesScanned = 0;
let currentPath = '';
let lastProgressTime = 0;

function sendProgress() {
  const now = Date.now();
  if (now - lastProgressTime < 200) return;
  lastProgressTime = now;
  parentPort.postMessage({
    type: 'progress',
    filesScanned,
    currentPath,
  });
}

async function scanDir(dirPath) {
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

    // Skip excluded paths
    if (excludeSet.has(fullPath)) continue;

    // Skip symlinks
    let lstats;
    try {
      lstats = await fsp.lstat(fullPath);
      if (lstats.isSymbolicLink()) continue;
    } catch {
      continue;
    }

    if (entry.isDirectory()) {
      currentPath = fullPath;
      sendProgress();
      const child = await scanDir(fullPath);
      if (child && child.size > 0) {
        children.push(child);
        dirSize += child.size;
      }
    } else if (entry.isFile()) {
      filesScanned++;
      const size = lstats.size;
      if (size > 0) {
        children.push({ name: entry.name, path: fullPath, size });
        dirSize += size;
      }
      sendProgress();
    }
  }

  return {
    name: path.basename(dirPath),
    path: dirPath,
    size: dirSize,
    children: children.sort((a, b) => b.size - a.size),
  };
}

(async () => {
  try {
    const tree = await scanDir(dirPath);
    parentPort.postMessage({ type: 'complete', tree });
  } catch (err) {
    parentPort.postMessage({ type: 'error', error: err.message });
  }
})();
