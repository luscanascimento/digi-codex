# Digi Codex

> A sleek, holographic Digimon encyclopedia — browse the digital world, trace evolution lines, and compare partners side by side.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Signals](https://img.shields.io/badge/State-Signals-22e1ff?style=for-the-badge)
![SCSS](https://img.shields.io/badge/SCSS-Design%20System-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-7c5cff?style=for-the-badge)

Digi Codex is a frontend-only single-page application built with the latest Angular. It consumes the public
[digi-api.com](https://digi-api.com) REST API (no key required) and presents 1,400+ Digimon through a
distinctive "digital / holographic" interface — glassmorphism panels, a neon cyan/violet palette, an animated
grid mesh backdrop, and tasteful micro-interactions that stay readable in both light and dark themes.

---

## ✨ Features

- **Browse & search** — debounced name search plus **live filters** for level, attribute, and X-Antibody variants, over a responsive, skeleton-loaded artwork grid with compact pagination.
- **Detail view** — official artwork, English description, levels / attributes / types / fields, and every signature skill with its translation.
- **Digivolution Tree** — an interactive `prior → current → next` evolution graph rendered entirely in CSS (no canvas, no SVG). **Every node is a link** that navigates straight to that Digimon, letting you walk an entire evolution line. Long branches collapse and expand on demand.
- **Compare mode** — pick any two Digimon (via an in-app search picker) and see them **side by side** in a stat table that highlights the differences. Selections persist across reloads.
- **Favorites** — heart any Digimon to pin it; the collection is saved to **localStorage** and surfaced on a dedicated page with a live count badge.
- **Light + dark themes** — auto-detected from your OS preference, toggleable, and remembered.
- **Robust async UX** — every content fetch (browse grid, detail, compare) has explicit **loading skeletons, empty states, and an error state with a retry button**. Secondary lookups (the level/attribute filter lists and the compare search picker) degrade quietly to an empty list instead of blocking the page.
- **Accessible & responsive** — semantic HTML, ARIA where needed, keyboard navigation, visible focus rings, a skip link, and `prefers-reduced-motion` support.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 22.20 (the project targets the Angular 21 toolchain)
- **npm** ≥ 10

### Install

```bash
npm install
```

### Develop

```bash
npm start
```

Then open <http://localhost:4200>. The app talks directly to `https://digi-api.com` — no environment
configuration or API key is required.

### Unit tests

```bash
npm test
```

Vitest + jsdom, run through the Angular CLI. The suite covers the pagination window helper, the
stale-response guards on the browse grid and the compare search picker, the filter sheet's ARIA and
focus behaviour, the digivolution tree's node mapping, and the detail cache in `DigimonApi`
(including the fact that a failed request is not cached).

### Formatting

```bash
npm run format        # write
npm run format:check  # verify (also runs in CI)
```

### Production build

```bash
npm run build
```

The optimized, hashed bundle is emitted to `dist/digi-codex/browser`. Serve that folder with any static
host to preview the production output (use SPA/`index.html` fallback so client-side routes resolve on reload).

---

## 🗂️ Project Structure

```
src/
├─ app/
│  ├─ core/                     # app-wide singletons — no UI
│  │  ├─ models/                # typed API/domain interfaces
│  │  ├─ services/              # DigimonApi, Theme, Favorites, Compare
│  │  ├─ pagination.ts          # pure pagination-window helper
│  │  └─ latest-only.ts         # in-flight ticket guard against out-of-order responses
│  ├─ shared/ui/                # presentational blocks — DigimonCard, CardSkeleton, StatusPanel
│  ├─ features/                 # lazy-loaded route features
│  │  ├─ browse/                # search + filters + paginated grid
│  │  ├─ detail/                # detail view + DigivolutionTree
│  │  ├─ compare/               # side-by-side comparison
│  │  └─ favorites/             # saved favorites
│  ├─ app.ts / app.html / app.scss   # shell: nav, theme toggle, footer
│  ├─ app.config.ts             # providers (router, HttpClient, scrolling)
│  └─ app.routes.ts             # lazy route table
├─ styles.scss                  # global design-system tokens + base
└─ index.html
```

---

## 🧠 What This Demonstrates

- **Modern Angular, end to end** — 100% standalone components (no NgModules), **Signals** for all state,
  the new control flow (`@if` / `@for` / `@switch`), `inject()` DI, **typed reactive forms**,
  `input()` / `output()`, lazy-loaded feature routes, and `withComponentInputBinding()` for route params.
- **Zoneless change detection** with **OnPush** everywhere for predictable, efficient rendering.
- **TypeScript strict mode with zero `any`** — fully typed API contracts and clean `core / shared / features` layering.
- **A real design system** — CSS custom-property tokens for color, spacing, typography, and radii, driving a
  cohesive light/dark theme rather than ad-hoc styling.
- **Production-grade async UX** — deliberate loading, empty, and error-with-retry states on every content
  fetch, plus stale-response guarding so fast filter changes never render out-of-order data, and a
  per-id detail cache so walking an evolution line doesn't refetch.
- **Thoughtful details** — localStorage persistence, accessibility, responsive layouts, and interaction polish.

---

## 📱 Mobile / PWA

Digi Codex is a **fully installable Progressive Web App** and is optimized for phones as a
first-class experience — not just a shrunk-down desktop site.

- **Installable — “Add to Home Screen.”** A web app manifest (`public/manifest.webmanifest`) plus
  an Angular service worker (`@angular/service-worker`, configured via `ngsw-config.json`) make the
  app installable on iOS and Android. Once installed it launches **standalone** (no browser chrome),
  with a themed splash screen and app icon set (72–512 px, incl. maskable).
- **Offline app shell.** The service worker prefetches the app shell (HTML/CSS/JS) and lazily caches
  same-origin assets, so the app still boots without a connection. Digimon data and artwork come from
  third-party origins (`digi-api.com`, Google Fonts) and are deliberately **not** cached by
  `ngsw-config.json` — content itself still needs the network.
- **Mobile navigation.** On small screens the desktop top-nav collapses into a **bottom tab bar**
  (Browse · Compare · Favorites · Theme) with active indicators and live count badges; the original
  header is preserved on desktop.
- **Bottom-sheet filters.** On phones the level / attribute / X-Antibody filters open in an accessible
  **bottom sheet** with a badge showing the active-filter count. While open it is a real
  modal dialog: `role="dialog"` / `aria-modal` (applied only on mobile, where the same element is a
  sheet rather than the desktop inline filter bar), a focus trap, focus returned to the trigger on
  close, Escape-to-close, and a dimmed backdrop.
- **Touch-ready & safe.** Usable from **320 px** up with no horizontal overflow, **≥ 44 × 44 px** tap
  targets, momentum scrolling, tap-feedback active states, no accidental double-tap zoom on controls,
  and `env(safe-area-inset-*)` padding so nothing hides behind notches or the home indicator.
- **Adaptive chrome.** The browser/status-bar `theme-color` is kept in sync with the active light/dark
  theme at runtime.

> Build and serve the production output (`npm run build` → `dist/digi-codex/browser`) over **HTTPS**
> (or `localhost`) to exercise install + offline behavior; the service worker is disabled in dev mode.

---

## 📡 Data & Credits

Digimon data and artwork are served by the community [digi-api.com](https://digi-api.com) project.
Digimon is a trademark of its respective owners; this is a non-commercial portfolio project.

## 📄 License

MIT
