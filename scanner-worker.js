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

(async () => {
  try {
    const tree = await scanDir(dirPath, {
      excludeSet,
      onProgress: (currentPath) => {
        filesScanned++;
        sendProgress(currentPath);
      },
    });
    parentPort.postMessage({ type: 'complete', tree: JSON.stringify(tree) });
  } catch (err) {
    parentPort.postMessage({ type: 'error', error: err.message });
  }
})();
