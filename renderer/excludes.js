const STORAGE_KEY = 'disk-viz-excludes';

export function createExcludes(container, { onChanged }) {
  const el = container;
  let paths = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  }

  function render() {
    el.innerHTML = `
      <div class="excludes-header">
        <span class="excludes-title">Excluded Paths</span>
        <button class="excludes-add-btn" id="excludes-add">+</button>
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

  render();

  return { add, getPaths, render };
}
