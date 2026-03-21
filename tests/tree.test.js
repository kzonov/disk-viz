import { describe, it, expect } from 'vitest';
import { removeNodeFromData, applyExclusions } from '../renderer/tree.js';

function makeTree() {
  return {
    name: 'root',
    path: '/root',
    size: 900,
    children: [
      {
        name: 'a',
        path: '/root/a',
        size: 600,
        children: [
          { name: 'a1.js', path: '/root/a/a1.js', size: 400 },
          { name: 'a2.js', path: '/root/a/a2.js', size: 200 },
        ],
      },
      { name: 'b.txt', path: '/root/b.txt', size: 300 },
    ],
  };
}

describe('removeNodeFromData', () => {
  it('removes a direct child file and updates size', () => {
    const result = removeNodeFromData(makeTree(), '/root/b.txt');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('a');
    expect(result.size).toBe(600);
  });

  it('removes a nested file and updates ancestor sizes', () => {
    const result = removeNodeFromData(makeTree(), '/root/a/a1.js');
    const dirA = result.children.find((c) => c.name === 'a');
    expect(dirA.children).toHaveLength(1);
    expect(dirA.size).toBe(200);
    expect(result.size).toBe(500);
  });

  it('removes a directory and all its descendants', () => {
    const result = removeNodeFromData(makeTree(), '/root/a');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('b.txt');
    expect(result.size).toBe(300);
  });

  it('does not mutate the original data', () => {
    const tree = makeTree();
    removeNodeFromData(tree, '/root/b.txt');
    expect(tree.children).toHaveLength(2);
    expect(tree.size).toBe(900);
  });

  it('returns the tree unchanged when path is not found', () => {
    const result = removeNodeFromData(makeTree(), '/root/nonexistent');
    expect(result.size).toBe(900);
    expect(result.children).toHaveLength(2);
  });

  it('size never goes below zero', () => {
    const tree = { name: 'root', path: '/root', size: 100, children: [
      { name: 'f', path: '/root/f', size: 200 },
    ]};
    const result = removeNodeFromData(tree, '/root/f');
    expect(result.size).toBe(0);
  });
});

describe('applyExclusions', () => {
  it('returns original data when no exclusions', () => {
    const tree = makeTree();
    expect(applyExclusions(tree, [])).toEqual(tree);
  });

  it('excludes a single path', () => {
    const result = applyExclusions(makeTree(), ['/root/b.txt']);
    expect(result.children).toHaveLength(1);
    expect(result.size).toBe(600);
  });

  it('excludes multiple paths in one pass', () => {
    const result = applyExclusions(makeTree(), ['/root/a/a1.js', '/root/b.txt']);
    const dirA = result.children.find((c) => c.name === 'a');
    expect(dirA.children).toHaveLength(1);
    expect(result.size).toBe(200);
  });

  it('excludes a directory', () => {
    const result = applyExclusions(makeTree(), ['/root/a']);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('b.txt');
    expect(result.size).toBe(300);
  });

  it('does not mutate the original data', () => {
    const tree = makeTree();
    applyExclusions(tree, ['/root/b.txt']);
    expect(tree.children).toHaveLength(2);
    expect(tree.size).toBe(900);
  });

  it('ignores paths not present in the tree', () => {
    const result = applyExclusions(makeTree(), ['/root/nonexistent']);
    expect(result.size).toBe(900);
  });
});
