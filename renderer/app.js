import { createSunburst } from './sunburst.js';
import { createBreadcrumbs } from './breadcrumbs.js';
import { createDetails } from './details.js';
import { createExcludes } from './excludes.js';
import { formatCount } from './format.js';
import { removeNodeFromData, applyExclusions } from './tree.js';

const chooseBtn = document.getElementById('choose-btn');
const cancelBtn = document.getElementById('cancel-btn');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const chartContainer = document.getElementById('chart');
const sidebarEl = document.getElementById('sidebar');
const excludesEl = document.getElementById('excludes');
const breadcrumbsEl = document.getElementById('breadcrumbs');
const welcomeEl = document.getElementById('welcome');

let currentSunburst = null;
let removeScanListener = null;
let lastScannedDir = null;
let currentData = null;
let originalData = null;

const excludes = createExcludes(excludesEl, {
  onChanged: () => {
    if (originalData && excludes.shouldUseInMemoryRecalc()) {
      // Use in-memory recalculation from original data
      const newData = applyExclusions(originalData, excludes.getPaths());
      renderChart(newData);
    } else if (lastScannedDir) {
      startScan(lastScannedDir);
    }
  },
});

const details = createDetails(sidebarEl);
const breadcrumbs = createBreadcrumbs(breadcrumbsEl, {
  onNavigate: (node) => {
    if (currentSunburst) currentSunburst.zoomTo(node);
  },
});

chooseBtn.addEventListener('click', async () => {
  const dirPath = await window.diskViz.openDirectory();
  if (!dirPath) return;
  startScan(dirPath);
});

cancelBtn.addEventListener('click', () => {
  window.diskViz.cancelScan();
  hideProgress();
});

function startScan(dirPath) {
  lastScannedDir = dirPath;
  excludes.setInMemoryRecalc(false); // Disable during scan

  if (currentSunburst) {
    currentSunburst.destroy();
    currentSunburst = null;
  }
  chartContainer.innerHTML = '';
  welcomeEl.style.display = 'none';

  if (removeScanListener) removeScanListener();

  showProgress();

  removeScanListener = window.diskViz.onScanMessage((msg) => {
    if (msg.type === 'progress') {
      updateProgress(msg.filesScanned, msg.currentPath);
    } else if (msg.type === 'complete') {
      hideProgress();
      if (msg.tree) {
        const tree = JSON.parse(msg.tree);
        originalData = tree;
        excludes.setInMemoryRecalc(true);
        renderChart(tree);
      }
    } else if (msg.type === 'error') {
      hideProgress();
      chartContainer.innerHTML = `<div class="error-msg">Scan error: ${msg.error.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    }
  });

  window.diskViz.startScan(dirPath, excludes.getPaths());
}

function showProgress() {
  progressBar.style.display = 'flex';
  cancelBtn.style.display = 'inline-block';
  progressFill.style.width = '0%';
}

function hideProgress() {
  progressBar.style.display = 'none';
  cancelBtn.style.display = 'none';
}

let progressAnim = 0;
function updateProgress(filesScanned, currentPath) {
  progressAnim = (progressAnim + 1) % 100;
  progressFill.style.width = `${50 + 30 * Math.sin(progressAnim * 0.1)}%`;

  const shortPath = currentPath.length > 60
    ? '...' + currentPath.slice(-57)
    : currentPath;
  progressText.textContent = `${formatCount(filesScanned)} files scanned — ${shortPath}`;
}

function renderChart(data) {
  if (currentSunburst) {
    currentSunburst.destroy();
    currentSunburst = null;
  }
  chartContainer.innerHTML = '';
  currentData = data;
  currentSunburst = createSunburst(chartContainer, data, {
    onHover: (d) => details.update(d),
    onZoom: (node) => breadcrumbs.update(node),
    onExclude: (d) => {
      if (d && d.data && d.data.path) {
        excludes.add(d.data.path);
      }
    },
    onRemove: async (d) => {
      if (!d || !d.data || !currentData) return;
      try {
        await window.diskViz.trashItem(d.data.path);
        const newData = removeNodeFromData(currentData, d.data.path);
        if (newData) renderChart(newData);
      } catch (err) {
        alert(`Could not move to Trash: ${err.message}`);
      }
    },
  });
}

