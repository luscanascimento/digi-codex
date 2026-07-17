import { Injectable, computed, effect, signal } from '@angular/core';

const KEY = 'digi-codex.compare';

/** Holds up to two Digimon ids selected for side-by-side comparison. */
@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly _slots = signal<readonly [number | null, number | null]>(this.load());

  readonly slots = this._slots.asReadonly();
  readonly count = computed(() => this._slots().filter((x) => x !== null).length);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(this._slots()));
      } catch {
        /* ignore */
      }
    });
  }

  has(id: number): boolean {
    return this._slots().includes(id);
  }

  /** Toggle a Digimon in/out of the first free slot. */
  toggle(id: number): void {
    this._slots.update(([a, b]) => {
      if (a === id) return [b, null];
      if (b === id) return [a, null];
      if (a === null) return [id, b];
      if (b === null) return [a, id];
      return [b, id]; // both full: shift the oldest out
    });
  }

  setSlot(index: 0 | 1, id: number | null): void {
    this._slots.update((s) => {
      const next: [number | null, number | null] = [s[0], s[1]];
      next[index] = id;
      return next;
    });
  }

  private load(): [number | null, number | null] {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 2) {
          const a = typeof parsed[0] === 'number' ? parsed[0] : null;
          const b = typeof parsed[1] === 'number' ? parsed[1] : null;
          return [a, b];
        }
      }
    } catch {
      /* ignore */
    }
    return [null, null];
  }
}
