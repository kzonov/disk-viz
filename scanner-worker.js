const { parentPort, workerData } = require('worker_threads');
const { scanDir } = require('./lib/scanner.js');

const { dirPath, excludePaths } = workerData;
const excludeSet = new Set(excludePaths || []);

let filesScanned = 0;
let lastProgressTime = 0;

function sendProgress(currentPath) {
  const now = Date.now();
  if (now - lastProgressTime < 200) return;
  lastProgressTime = now;
  parentPort.postMessage({ type: 'progress', filesScanned, currentPath });
}

// Remove nodes below minSize to keep the serialized tree within V8 string limits.
// Mirrors the pruning sunburst.js does after receiving the tree.
function pruneSmallNodes(node, minSize) {
  if (!node.children) return node;
  node.children = node.children
    .filter((c) => c.size >= minSize)
    .map((c) => pruneSmallNodes(c, minSize));
  return node;
}

(async () => {
  try {
    const tree = await scanDir(dirPath, {
      excludeSet,
      onProgress: (currentPath) => {
        filesScanned++;
        sendProgress(currentPath);
      },
    });
    if (tree && tree.size > 0) {
      // At least 1 MB, or 0.01% of total — whichever is larger.
      const minSize = Math.max(1024 * 1024, tree.size * 0.0001);
      pruneSmallNodes(tree, minSize);
    }
    parentPort.postMessage({ type: 'complete', tree: JSON.stringify(tree) });
  } catch (err) {
    parentPort.postMessage({ type: 'error', error: err.message });
  }
})();
