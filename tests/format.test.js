import { describe, it, expect } from 'vitest';
import { formatSize, formatPercent, formatCount } from '../renderer/format.js';

describe('formatSize', () => {
  it('handles zero', () => {
    expect(formatSize(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatSize(1024)).toBe('1.00 KB');
    expect(formatSize(10 * 1024)).toBe('10.0 KB');
    expect(formatSize(100 * 1024)).toBe('100 KB');
  });

  it('formats megabytes', () => {
    expect(formatSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatSize(10 * 1024 * 1024)).toBe('10.0 MB');
    expect(formatSize(100 * 1024 * 1024)).toBe('100 MB');
  });

  it('formats gigabytes', () => {
    expect(formatSize(1024 ** 3)).toBe('1.00 GB');
  });

  it('formats terabytes', () => {
    expect(formatSize(1024 ** 4)).toBe('1.00 TB');
  });
});

describe('formatPercent', () => {
  it('formats large fractions with one decimal', () => {
    expect(formatPercent(1)).toBe('100.0%');
    expect(formatPercent(0.5)).toBe('50.0%');
    expect(formatPercent(0.1)).toBe('10.0%');
  });

  it('formats small fractions with two decimals', () => {
    expect(formatPercent(0.05)).toBe('5.00%');
    expect(formatPercent(0.001)).toBe('0.10%');
  });

  it('formats tiny fractions as < 0.01%', () => {
    expect(formatPercent(0)).toBe('< 0.01%');
    expect(formatPercent(0.00001)).toBe('< 0.01%');
  });
});

describe('formatCount', () => {
  it('formats small numbers as-is', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCount(1000)).toBe('1.0K');
    expect(formatCount(12500)).toBe('12.5K');
    expect(formatCount(999999)).toBe('1000.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatCount(1_000_000)).toBe('1.0M');
    expect(formatCount(2_500_000)).toBe('2.5M');
  });
});
