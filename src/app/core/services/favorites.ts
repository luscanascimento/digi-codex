import { Injectable, computed, effect, signal } from '@angular/core';
import { DigimonSummary } from '../models/digimon.model';

const KEY = 'digi-codex.favorites';

/** Favorite Digimon persisted to localStorage, exposed as reactive signals. */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _items = signal<readonly DigimonSummary[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  private readonly ids = computed(() => new Set(this._items().map((d) => d.id)));

  constructor() {
    effect(() => {
      const items = this._items();
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {
        /* storage unavailable — ignore */
      }
    });
  }

  isFavorite(id: number): boolean {
    return this.ids().has(id);
  }

  toggle(d: DigimonSummary): void {
    this._items.update((list) =>
      list.some((x) => x.id === d.id)
        ? list.filter((x) => x.id !== d.id)
        : [{ id: d.id, name: d.name, href: d.href, image: d.image }, ...list],
    );
  }

  remove(id: number): void {
    this._items.update((list) => list.filter((x) => x.id !== id));
  }

  clear(): void {
    this._items.set([]);
  }

  private load(): readonly DigimonSummary[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (x): x is DigimonSummary =>
          typeof x === 'object' &&
          x !== null &&
          typeof (x as DigimonSummary).id === 'number' &&
          typeof (x as DigimonSummary).name === 'string',
      );
    } catch {
      return [];
    }
  }
}
