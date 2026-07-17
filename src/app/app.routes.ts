import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/browse/browse').then((m) => m.Browse),
    title: 'Digi Codex — Browse',
  },
  {
    path: 'digimon/:id',
    loadComponent: () => import('./features/detail/detail').then((m) => m.Detail),
    title: 'Digi Codex — Detail',
  },
  {
    path: 'compare',
    loadComponent: () => import('./features/compare/compare-page').then((m) => m.ComparePage),
    title: 'Digi Codex — Compare',
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites-page').then((m) => m.FavoritesPage),
    title: 'Digi Codex — Favorites',
  },
  { path: '**', redirectTo: '' },
];
