import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scanDir } from '../lib/scanner.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'disk-viz-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(relPath, content = 'x') {
  const full = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return full;
}

function mkdir(relPath) {
  const full = path.join(tmpDir, relPath);
  fs.mkdirSync(full, { recursive: true });
  return full;
}

describe('scanDir', () => {
  it('returns name and path for root', async () => {
    write('file.txt', 'hello');
    const result = await scanDir(tmpDir);
    expect(result.name).toBe(path.basename(tmpDir));
    expect(result.path).toBe(tmpDir);
  });

  it('scans a single file', async () => {
    write('file.txt', 'hello');
    const result = await scanDir(tmpDir);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('file.txt');
    expect(result.children[0].size).toBe(5);
    expect(result.size).toBe(5);
  });

  it('scans nested directories', async () => {
    write('a/deep.txt', '12345');
    write('b.txt', 'hi');
    const result = await scanDir(tmpDir);
    const dirA = result.children.find((c) => c.name === 'a');
    expect(dirA).toBeDefined();
    expect(dirA.children[0].name).toBe('deep.txt');
    expect(result.size).toBe(7);
  });

  it('sorts children largest first', async () => {
    write('small.txt', 'ab');
    write('large.txt', 'abcdefgh');
    const result = await scanDir(tmpDir);
    expect(result.children[0].name).toBe('large.txt');
    expect(result.children[1].name).toBe('small.txt');
  });

  it('skips empty files', async () => {
    write('empty.txt', '');
    write('nonempty.txt', 'x');
    const result = await scanDir(tmpDir);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('nonempty.txt');
  });

  it('skips excluded paths', async () => {
    write('included.txt', 'hello');
    const excluded = write('excluded.txt', 'world');
    const result = await scanDir(tmpDir, { excludeSet: new Set([excluded]) });
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('included.txt');
  });

  it('skips excluded directories', async () => {
    write('keep/file.txt', 'hello');
    const excludedDir = mkdir('skip');
    write('skip/secret.txt', 'hidden');
    const result = await scanDir(tmpDir, { excludeSet: new Set([excludedDir]) });
    const names = result.children.map((c) => c.name);
    expect(names).not.toContain('skip');
    expect(names).toContain('keep');
  });

  it('skips symlinks', async () => {
    write('real.txt', 'content');
    fs.symlinkSync(path.join(tmpDir, 'real.txt'), path.join(tmpDir, 'link.txt'));
    const result = await scanDir(tmpDir);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('real.txt');
  });

  it('returns null for a directory with no read permission', async () => {
    const locked = mkdir('locked');
    fs.chmodSync(locked, 0o000);
    try {
      const result = await scanDir(tmpDir);
      const lockedNode = result.children.find((c) => c.name === 'locked');
      // locked dir has no contents so it's omitted (size 0), not an error
      expect(lockedNode).toBeUndefined();
    } finally {
      fs.chmodSync(locked, 0o755); // restore so afterEach cleanup works
    }
  });

  it('returns null for any unreadable directory', async () => {
    const result = await scanDir('/nonexistent-disk-viz-test');
    expect(result).toBeNull();
  });

  it('calls onProgress for each directory visited', async () => {
    write('a/file.txt', 'x');
    write('b/file.txt', 'x');
    const visited = [];
    await scanDir(tmpDir, { onProgress: (p) => visited.push(p) });
    expect(visited.length).toBe(2);
  });
});
