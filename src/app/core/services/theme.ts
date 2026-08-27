import { Injectable, effect, signal } from '@angular/core';

type ThemeMode = 'dark' | 'light';
const KEY = 'digi-codex.theme';

/** Browser chrome / status-bar color per theme (matches --bg-0 tokens). */
const THEME_COLOR: Record<ThemeMode, string> = {
  dark: '#05070f',
  light: '#eef2fb',
};

/** Persists the light/dark preference and reflects it on the document root. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.initial());
  readonly mode = this._mode.asReadonly();

  constructor() {
    effect(() => {
      const mode = this._mode();
      document.documentElement.setAttribute('data-theme', mode);
      this.syncThemeColor(mode);
      try {
        localStorage.setItem(KEY, mode);
      } catch {
        /* storage unavailable — ignore */
      }
    });
  }

  /**
   * Keeps the browser chrome / mobile status-bar tint in sync with the active
   * theme. Removes the media-scoped variants the index.html ships with so a
   * single, unconditional theme-color wins once the app has booted.
   */
  private syncThemeColor(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const head = document.head;
    if (!head) return;

    head.querySelectorAll('meta[name="theme-color"][media]').forEach((el) => el.remove());

    let meta = head.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      head.appendChild(meta);
    }
    meta.setAttribute('content', THEME_COLOR[mode]);
  }

  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  private initial(): ThemeMode {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      /* ignore */
    }
    const prefersLight =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }
}
