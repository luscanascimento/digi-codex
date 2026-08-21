/** Gap marker rendered between two non-adjacent page numbers. */
export const ELLIPSIS = '…';

export type PageWindowItem = number | typeof ELLIPSIS;

/**
 * Compact pagination window: first page, current-1..current+1, last page,
 * with an ellipsis wherever a gap is skipped. Page numbers are zero-based.
 */
export function pageWindow(total: number, current: number): PageWindowItem[] {
  if (total <= 1) return total === 1 ? [0] : [];

  const pages = new Set<number>([0, total - 1, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);

  const out: PageWindowItem[] = [];
  let prev = -1;
  for (const p of sorted) {
    if (prev !== -1 && p - prev > 1) out.push(ELLIPSIS);
    out.push(p);
    prev = p;
  }
  return out;
}
