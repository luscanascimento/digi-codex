import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DigimonSummary } from '../../core/models/digimon.model';
import { FavoritesService } from '../../core/services/favorites';
import { CompareService } from '../../core/services/compare';

/** A single Digimon tile: artwork, name, id, favorite + compare quick actions. */
@Component({
  selector: 'app-digimon-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article class="card" [style.--i]="index()">
      <a
        class="card__link"
        [routerLink]="['/digimon', digimon().id]"
        [attr.aria-label]="'View ' + digimon().name"
      >
        <div class="card__frame">
          @if (!loaded()) {
            <div class="card__shimmer" aria-hidden="true"></div>
          }
          <img
            class="card__img"
            [class.is-loaded]="loaded()"
            [src]="digimon().image"
            [alt]="digimon().name"
            loading="lazy"
            decoding="async"
            (load)="loaded.set(true)"
            (error)="onError($event)"
          />
          <span class="card__id mono">#{{ idLabel() }}</span>
        </div>
        <h3 class="card__name">{{ digimon().name }}</h3>
      </a>

      <div class="card__actions">
        <button
          type="button"
          class="chip"
          [class.is-active]="isFav()"
          [attr.aria-pressed]="isFav()"
          [attr.aria-label]="(isFav() ? 'Remove ' : 'Add ') + digimon().name + ' to favorites'"
          (click)="favorites.toggle(digimon())"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            [attr.fill]="isFav() ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.6"
          >
            <path
              d="M12 20s-7-4.35-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.65 12 20 12 20Z"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="chip chip--compare"
          [class.is-active]="inCompare()"
          [attr.aria-pressed]="inCompare()"
          [attr.aria-label]="
            (inCompare() ? 'Remove from' : 'Add to') + ' compare: ' + digimon().name
          "
          (click)="compare.toggle(digimon().id)"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          >
            <path d="M8 4v16M16 4v16" stroke-linecap="round" />
            <path d="M4 8h4M16 8h4M4 16h4M16 16h4" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </article>
  `,
  styleUrl: './digimon-card.scss',
})
export class DigimonCard {
  readonly digimon = input.required<DigimonSummary>();
  readonly index = input(0);

  protected readonly favorites = inject(FavoritesService);
  protected readonly compare = inject(CompareService);

  protected readonly loaded = signal(false);

  protected readonly isFav = computed(() => this.favorites.isFavorite(this.digimon().id));
  protected readonly inCompare = computed(() => this.compare.has(this.digimon().id));
  protected readonly idLabel = computed(() => String(this.digimon().id).padStart(3, '0'));

  protected onError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%230c1226"/><text x="50%" y="50%" fill="%236f7ba0" font-family="monospace" font-size="14" text-anchor="middle">NO SIGNAL</text></svg>',
      );
    this.loaded.set(true);
  }
}
