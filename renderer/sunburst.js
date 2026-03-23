import { nodeColor } from './colors.js';
import { createContextMenu } from './context-menu.js';

const VISIBLE_DEPTH = 3;
const TRANSITION_MS = 750;

export function createSunburst(container, data, { onHover, onZoom, onExclude, onRemove }) {
  const contextMenu = createContextMenu();
  const svg = d3.select(container).append('svg');
  const g = svg.append('g');

  const root = d3.hierarchy(data)
    .sum((d) => (d.children ? 0 : d.size))
    .sort((a, b) => b.value - a.value);

  // Prune tiny nodes (< 0.01% of root)
  const minSize = root.value * 0.0001;
  root.each((d) => {
    if (d.children) {
      d.children = d.children.filter((c) => c.value >= minSize);
      if (d.children.length === 0) delete d.children;
    }
  });

  const partition = d3.partition().size([2 * Math.PI, root.height + 1]);
  partition(root);

  root.each((d) => {
    d._current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
  });

  let currentRoot = root;
  let width, height, radius;

  const arc = d3.arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(() => radius * 1.5)
    .innerRadius((d) => Math.max(0, d.y0 * radius))
    .outerRadius((d) => Math.max(0, d.y1 * radius - 1));

  function arcVisible(d) {
    return d.y1 <= VISIBLE_DEPTH + 1 && d.y0 >= 0 && d.x1 > d.x0;
  }

  const paths = g.selectAll('path')
    .data(root.descendants().slice(1))
    .join('path')
    .attr('fill', (d) => nodeColor(d))
    .attr('fill-opacity', (d) => (arcVisible(d._current) ? 0.85 : 0))
    .attr('pointer-events', (d) => (arcVisible(d._current) ? 'auto' : 'none'))
    .attr('d', (d) => arc(d._current))
    .attr('cursor', 'pointer')
    .on('click', (_event, d) => clicked(d))
    .on('contextmenu', (_event, d) => {
      _event.preventDefault();
      
      const options = [];
      const path = d.data.path;

      // Only show "Go Inside" for directories with children
      if (d.children && d.children.length > 0) {
        options.push({
          icon: '→',
          label: 'Go Inside',
          action: () => clicked(d),
        });
      }

      // Open in Finder — directories only
      if (d.children) {
        options.push({
          icon: '◉',
          label: 'Open in Finder',
          action: () => window.diskViz.openInFinder(path),
        });
      }

      // Copy path — all nodes
      options.push({
        icon: '⎘',
        label: 'Copy Path',
        action: () => navigator.clipboard.writeText(path),
      });

      // Show exclude option for all nodes (files and directories)
      if (onExclude) {
        options.push({
          icon: '⊘',
          label: 'Exclude from scan',
          action: () => onExclude(d),
        });
      }

      // Show remove option (for both files and directories)
      if (onRemove) {
        options.push({
          icon: '×',
          label: 'Move to Trash',
          dangerous: true,
          action: () => onRemove(d),
        });
      }

      contextMenu.show(_event.clientX, _event.clientY, options);
    })
    .on('mouseenter', (_event, d) => {
      d3.select(_event.currentTarget).attr('fill-opacity', 1);
      onHover(d);
    })
    .on('mouseleave', (_event, d) => {
      d3.select(_event.currentTarget).attr('fill-opacity', arcVisible(d._current) ? 0.85 : 0);
      onHover(null);
    });

  // Center circle for zooming out
  const centerCircle = g.append('circle')
    .attr('r', () => radius * 0.15)
    .attr('fill', '#16213e')
    .attr('cursor', 'pointer')
    .attr('stroke', '#2a2a4a')
    .attr('stroke-width', 1.5)
    .on('click', () => {
      if (currentRoot.parent) clicked(currentRoot.parent);
    });

  const centerText = g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', '#e0e0e0')
    .attr('font-size', '11px')
    .attr('pointer-events', 'none');

  function updateCenterText() {
    centerText.text(currentRoot.parent ? '↑ Back' : currentRoot.data.name);
  }

  function clicked(p) {
    if (!p) return;
    currentRoot = p;

    root.each((d) => {
      d._target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth),
      };
    });

    const t = g.transition().duration(TRANSITION_MS);

    paths.transition(t)
      .tween('data', (d) => {
        const i = d3.interpolate(d._current, d._target);
        return (t) => (d._current = i(t));
      })
      .attrTween('d', (d) => () => arc(d._current))
      .attr('fill-opacity', (d) => (arcVisible(d._target) ? 0.85 : 0))
      .attr('pointer-events', (d) => (arcVisible(d._target) ? 'auto' : 'none'));

    updateCenterText();
    onZoom(p);
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    radius = Math.min(width, height) / (2 * (VISIBLE_DEPTH + 1));

    svg.attr('width', width).attr('height', height);
    g.attr('transform', `translate(${width / 2},${height / 2})`);

    centerCircle.attr('r', radius * 0.15);

    paths.attr('d', (d) => arc(d._current));
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  updateCenterText();

  return {
    zoomTo: clicked,
    destroy: () => {
      ro.disconnect();
      contextMenu.hide();
    },
  };
}
