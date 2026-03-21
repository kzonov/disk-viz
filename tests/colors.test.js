import { describe, it, expect } from 'vitest';
import { nodeColor, categoryLabel } from '../renderer/colors.js';

function makeNode(name, depth = 1, hasChildren = false) {
  return { data: { name, children: hasChildren ? [] : undefined }, depth };
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
    const color = nodeColor(makeNode('index.js'));
    expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it('returns a color for directories', () => {
    const color = nodeColor(makeNode('src', 1, true));
    expect(color).toMatch(/^hsl\(/);
  });

  it('produces darker colors at greater depth', () => {
    const shallow = nodeColor(makeNode('file.js', 1));
    const deep = nodeColor(makeNode('file.js', 5));
    const shallowL = parseInt(shallow.match(/(\d+)%\)$/)[1]);
    const deepL = parseInt(deep.match(/(\d+)%\)$/)[1]);
    expect(deepL).toBeLessThan(shallowL);
  });
});
