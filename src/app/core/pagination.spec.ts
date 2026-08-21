import { ELLIPSIS, pageWindow } from './pagination';

describe('pageWindow', () => {
  it('returns nothing when there are no pages', () => {
    expect(pageWindow(0, 0)).toEqual([]);
  });

  it('returns the single page when there is exactly one', () => {
    expect(pageWindow(1, 0)).toEqual([0]);
  });

  it('lists both pages without an ellipsis when there are two', () => {
    expect(pageWindow(2, 0)).toEqual([0, 1]);
    expect(pageWindow(2, 1)).toEqual([0, 1]);
  });

  it('lists every page while they stay adjacent', () => {
    expect(pageWindow(3, 1)).toEqual([0, 1, 2]);
    expect(pageWindow(4, 1)).toEqual([0, 1, 2, 3]);
  });

  it('only adds a trailing ellipsis near the start', () => {
    expect(pageWindow(10, 0)).toEqual([0, 1, ELLIPSIS, 9]);
    expect(pageWindow(10, 2)).toEqual([0, 1, 2, 3, ELLIPSIS, 9]);
  });

  it('only adds a leading ellipsis near the end', () => {
    expect(pageWindow(10, 9)).toEqual([0, ELLIPSIS, 8, 9]);
    expect(pageWindow(10, 7)).toEqual([0, ELLIPSIS, 6, 7, 8, 9]);
  });

  it('adds an ellipsis on both sides in the middle', () => {
    expect(pageWindow(10, 5)).toEqual([0, ELLIPSIS, 4, 5, 6, ELLIPSIS, 9]);
    expect(pageWindow(100, 50)).toEqual([0, ELLIPSIS, 49, 50, 51, ELLIPSIS, 99]);
  });

  it('never emits an out-of-range or duplicated page', () => {
    for (let total = 1; total <= 12; total++) {
      for (let current = 0; current < total; current++) {
        const numbers = pageWindow(total, current).filter(
          (p): p is number => typeof p === 'number',
        );
        expect(numbers.every((p) => p >= 0 && p < total)).toBe(true);
        expect(new Set(numbers).size).toBe(numbers.length);
        expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
      }
    }
  });
});
