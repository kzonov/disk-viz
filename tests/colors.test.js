import { describe, it, expect } from 'vitest';
import { nodeColor, categoryLabel } from '../renderer/colors.js';

// Build a minimal D3-like hierarchy with proper parent links.
// children is an array of { name, children? } plain objects.
function makeHierarchy(children) {
  const root = { data: { name: 'root' }, depth: 0 };
  root.children = children.map((spec, i) => {
    const child = { data: { name: spec.name }, depth: 1, parent: root };
    if (spec.children) {
      child.children = spec.children.map((grandSpec, j) => {
        const grand = { data: { name: grandSpec.name }, depth: 2, parent: child };
        grand.children = [];
        return grand;
      });
    } else {
      child.children = [];
    }
    return child;
  });
  return root;
}

describe('categoryLabel', () => {
  it('identifies code files', () => {
    expect(categoryLabel('index.js')).toBe('code');
    expect(categoryLabel('app.ts')).toBe('code');
    expect(categoryLabel('main.py')).toBe('code');
    expect(categoryLabel('styles.css')).toBe('code');
  });

  it('identifies media files', () => {
    expect(categoryLabel('photo.jpg')).toBe('media');
    expect(categoryLabel('video.mp4')).toBe('media');
    expect(categoryLabel('song.mp3')).toBe('media');
  });

  it('identifies documents', () => {
    expect(categoryLabel('readme.md')).toBe('docs');
    expect(categoryLabel('report.pdf')).toBe('docs');
  });

  it('identifies data files', () => {
    expect(categoryLabel('config.json')).toBe('data');
    expect(categoryLabel('data.csv')).toBe('data');
  });

  it('identifies archives', () => {
    expect(categoryLabel('bundle.zip')).toBe('archive');
    expect(categoryLabel('backup.tar')).toBe('archive');
    expect(categoryLabel('app.dmg')).toBe('archive');
  });

  it('identifies system files', () => {
    expect(categoryLabel('app.log')).toBe('system');
    expect(categoryLabel('package.lock')).toBe('system');
  });

  it('falls back to other for unknown extensions', () => {
    expect(categoryLabel('file.xyz')).toBe('other');
  });

  it('falls back to other for no extension', () => {
    expect(categoryLabel('Makefile')).toBe('other');
    expect(categoryLabel('')).toBe('other');
  });
});

describe('nodeColor', () => {
  it('returns an hsl string', () => {
    const root = makeHierarchy([{ name: 'a' }]);
    expect(nodeColor(root.children[0])).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it('top-level siblings get distinct hues', () => {
    const root = makeHierarchy([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    const hues = root.children.map((c) => {
      const m = nodeColor(c).match(/hsl\((\d+)/);
      return parseInt(m[1]);
    });
    // All three hues should be different
    expect(new Set(hues).size).toBe(3);
  });

  it('children share their parent sector hue family', () => {
    const root = makeHierarchy([
      { name: 'a', children: [{ name: 'a1' }, { name: 'a2' }] },
      { name: 'b', children: [{ name: 'b1' }] },
    ]);
    const hueOf = (node) => parseInt(nodeColor(node).match(/hsl\((\d+)/)[1]);

    const hueA = hueOf(root.children[0]);
    const hueB = hueOf(root.children[1]);
    const hueA1 = hueOf(root.children[0].children[0]);
    const hueA2 = hueOf(root.children[0].children[1]);

    // a1 and a2 should be closer to hueA than to hueB
    const distToA = (h) => Math.min(Math.abs(h - hueA), 360 - Math.abs(h - hueA));
    const distToB = (h) => Math.min(Math.abs(h - hueB), 360 - Math.abs(h - hueB));
    expect(distToA(hueA1)).toBeLessThan(distToB(hueA1));
    expect(distToA(hueA2)).toBeLessThan(distToB(hueA2));
  });

  it('produces darker colors at greater depth', () => {
    const root = makeHierarchy([
      { name: 'a', children: [{ name: 'a1' }] },
    ]);
    const lightnessOf = (node) => parseInt(nodeColor(node).match(/(\d+)%\)$/)[1]);
    const l1 = lightnessOf(root.children[0]);
    const l2 = lightnessOf(root.children[0].children[0]);
    expect(l2).toBeLessThan(l1);
  });
});
