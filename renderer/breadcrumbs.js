export function createBreadcrumbs(container, { onNavigate }) {
  const el = document.createElement('div');
  el.className = 'breadcrumbs';
  container.appendChild(el);

  function update(node) {
    const chain = [];
    let cur = node;
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent;
    }

    el.innerHTML = '';
    chain.forEach((n, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'breadcrumb-sep';
        sep.textContent = ' / ';
        el.appendChild(sep);
      }
      const link = document.createElement('span');
      link.className = 'breadcrumb-item';
      link.textContent = n.data.name;
      if (i < chain.length - 1) {
        link.classList.add('clickable');
        link.addEventListener('click', () => onNavigate(n));
      } else {
        link.classList.add('current');
      }
      el.appendChild(link);
    });
  }

  return { update };
}
