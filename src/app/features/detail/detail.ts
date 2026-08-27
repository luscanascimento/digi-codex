import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DigimonApi } from '../../core/services/digimon-api';
import { LatestOnly } from '../../core/latest-only';
import { Digimon } from '../../core/models/digimon.model';
import { FavoritesService } from '../../core/services/favorites';
import { CompareService } from '../../core/services/compare';
import { StatusPanel } from '../../shared/ui/status-panel';
import { DigivolutionTree } from './digivolution-tree';

interface DetailState {
  readonly status: 'loading' | 'success' | 'error';
  readonly data: Digimon | null;
}

@Component({
  selector: 'app-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusPanel, DigivolutionTree],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class Detail {
  private readonly api = inject(DigimonApi);
  protected readonly favorites = inject(FavoritesService);
  protected readonly compare = inject(CompareService);

  /** Bound from the route param via withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly _state = signal<DetailState>({ status: 'loading', data: null });
  readonly state = this._state.asReadonly();
  private readonly reloadTick = signal(0);
  private readonly latest = new LatestOnly();

  readonly digimon = computed(() => this._state().data);

  readonly numericId = computed(() => Number(this.id()));

  readonly primaryImage = computed(() => {
    const d = this.digimon();
    if (!d) return '';
    return d.images.find((i) => i.href)?.href ?? '';
  });

  readonly englishDescription = computed(() => {
    const d = this.digimon();
    if (!d) return '';
    const en = d.descriptions.find((x) => x.language.startsWith('en'));
    return en?.description ?? d.descriptions[0]?.description ?? '';
  });

  readonly isFav = computed(() => {
    const d = this.digimon();
    return d ? this.favorites.isFavorite(d.id) : false;
  });
  readonly inCompare = computed(() => {
    const d = this.digimon();
    return d ? this.compare.has(d.id) : false;
  });

  readonly imgLoaded = signal(false);

  constructor() {
    effect(() => {
      const numeric = Number(this.id());
      this.reloadTick();
      if (!Number.isFinite(numeric) || numeric <= 0) {
        this._state.set({ status: 'error', data: null });
        return;
      }
      const isCurrent = this.latest.next();
      this.imgLoaded.set(false);
      this._state.set({ status: 'loading', data: null });
      this.api
        .getById(numeric)
        .pipe(catchError(() => of<'ERR'>('ERR')))
        .subscribe((res) => {
          if (!isCurrent()) return;
          this._state.set(
            res === 'ERR' ? { status: 'error', data: null } : { status: 'success', data: res },
          );
        });
    });
  }

  retry(): void {
    this.reloadTick.update((t) => t + 1);
  }

  toggleFavorite(): void {
    const d = this.digimon();
    if (!d) return;
    this.favorites.toggle({
      id: d.id,
      name: d.name,
      href: `https://digi-api.com/api/v1/digimon/${d.id}`,
      image: this.primaryImage(),
    });
  }

  toggleCompare(): void {
    const d = this.digimon();
    if (d) this.compare.toggle(d.id);
  }
}
