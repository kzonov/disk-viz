const STORAGE_KEY = 'disk-viz-excludes';

export function createExcludes(container, { onChanged }) {
  const el = container;
  let paths = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  let useInMemoryRecalc = true;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  }

  function render() {
    el.innerHTML = `
      <div class="excludes-header">
        <span class="excludes-title">Excluded Paths</span>
        <button class="excludes-add-btn" id="excludes-add" title="Pick folder…">+</button>
      </div>
      <div class="excludes-input-row">
        <input class="excludes-input" id="excludes-input" type="text" placeholder="Paste or type a path…" spellcheck="false" />
      </div>
      <div class="excludes-list" id="excludes-list"></div>
    `;

    const list = el.querySelector('#excludes-list');
    if (paths.length === 0) {
      list.innerHTML = '<div class="excludes-empty">No exclusions. Right-click a segment to exclude.</div>';
    } else {
      paths.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'excludes-item';
        const name = document.createElement('span');
        name.className = 'excludes-item-path';
        name.textContent = p;
        name.title = p;
        const btn = document.createElement('button');
        btn.className = 'excludes-remove-btn';
        btn.textContent = '\u00d7';
        btn.addEventListener('click', () => remove(i));
        item.appendChild(name);
        item.appendChild(btn);
        list.appendChild(item);
      });
    }

    el.querySelector('#excludes-add').addEventListener('click', async () => {
      const dirPath = await window.diskViz.openDirectory();
      if (dirPath) add(dirPath);
    });

    const input = el.querySelector('#excludes-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        if (val) {
          add(val);
          input.value = '';
        }
      }
    });
  }

  function add(p) {
    if (paths.includes(p)) return;
    paths.push(p);
    save();
    render();
    onChanged(paths);
  }

  function remove(i) {
    paths.splice(i, 1);
    save();
    render();
    onChanged(paths);
  }

  function getPaths() {
    return [...paths];
  }

  function shouldUseInMemoryRecalc() {
    return useInMemoryRecalc;
  }

  function setInMemoryRecalc(enabled) {
    useInMemoryRecalc = enabled;
  }

  render();

  return { add, getPaths, render, shouldUseInMemoryRecalc, setInMemoryRecalc };
}
