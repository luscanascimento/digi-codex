import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, startWith } from 'rxjs';
import { DigimonApi } from '../../core/services/digimon-api';
import { Digimon, DigimonSummary } from '../../core/models/digimon.model';
import { CompareService } from '../../core/services/compare';
import { LatestOnly } from '../../core/latest-only';

interface SlotState {
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly data: Digimon | null;
}

@Component({
  selector: 'app-compare-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './compare-page.html',
  styleUrl: './compare-page.scss',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ComparePage {
  private readonly api = inject(DigimonApi);
  protected readonly compare = inject(CompareService);

  private readonly slotA = signal<SlotState>({ status: 'idle', data: null });
  private readonly slotB = signal<SlotState>({ status: 'idle', data: null });
  readonly a = this.slotA.asReadonly();
  readonly b = this.slotB.asReadonly();

  private readonly latestA = new LatestOnly();
  private readonly latestB = new LatestOnly();
  private readonly latestSearch = new LatestOnly();

  /** Search box that lets the user pick a Digimon for an empty slot. */
  readonly searchCtrl = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(
    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), startWith('')),
    { initialValue: '' },
  );
  readonly searchResults = signal<readonly DigimonSummary[]>([]);
  readonly searching = signal(false);
  readonly pickTarget = signal<0 | 1 | null>(null);

  readonly bothReady = computed(
    () => this.a().status === 'success' && this.b().status === 'success',
  );

  /** Rows rendered in the comparison table. */
  readonly rows = computed(() => {
    const da = this.a().data;
    const db = this.b().data;
    return [
      {
        label: 'Level',
        a: this.join(da?.levels.map((x) => x.level)),
        b: this.join(db?.levels.map((x) => x.level)),
      },
      {
        label: 'Attribute',
        a: this.join(da?.attributes.map((x) => x.attribute)),
        b: this.join(db?.attributes.map((x) => x.attribute)),
      },
      {
        label: 'Type',
        a: this.join(da?.types.map((x) => x.type)),
        b: this.join(db?.types.map((x) => x.type)),
      },
      {
        label: 'Fields',
        a: this.join(da?.fields.map((x) => x.field)),
        b: this.join(db?.fields.map((x) => x.field)),
      },
      { label: 'First seen', a: da?.releaseDate || '—', b: db?.releaseDate || '—' },
      {
        label: 'X-Antibody',
        a: da ? (da.xAntibody ? 'Yes' : 'No') : '—',
        b: db ? (db.xAntibody ? 'Yes' : 'No') : '—',
      },
      {
        label: 'Skills',
        a: da ? String(da.skills.length) : '—',
        b: db ? String(db.skills.length) : '—',
      },
      {
        label: 'Evolves from',
        a: da ? String(da.priorEvolutions.length) : '—',
        b: db ? String(db.priorEvolutions.length) : '—',
      },
      {
        label: 'Evolves to',
        a: da ? String(da.nextEvolutions.length) : '—',
        b: db ? String(db.nextEvolutions.length) : '—',
      },
    ];
  });

  constructor() {
    // Load slot data whenever the shared compare ids change.
    effect(() => {
      const [idA, idB] = this.compare.slots();
      this.loadSlot(0, idA);
      this.loadSlot(1, idB);
    });

    // Live search for the slot picker.
    effect(() => {
      const term = this.searchTerm().trim();
      if (this.pickTarget() === null || term.length < 2) {
        this.latestSearch.next(); // invalidate anything still in flight
        this.searchResults.set([]);
        this.searching.set(false);
        return;
      }
      this.searching.set(true);
      const isCurrent = this.latestSearch.next();
      this.api
        .browse({ name: term, level: '', attribute: '', xAntibody: false, page: 0 }, 8)
        .pipe(catchError(() => of(null)))
        .subscribe((res) => {
          if (!isCurrent()) return; // drop stale responses
          this.searching.set(false);
          this.searchResults.set(res ? res.content : []);
        });
    });
  }

  private loadSlot(index: 0 | 1, id: number | null): void {
    const target = index === 0 ? this.slotA : this.slotB;
    if (id === null) {
      target.set({ status: 'idle', data: null });
      return;
    }
    if (target().data?.id === id && target().status === 'success') return;
    const isCurrent = (index === 0 ? this.latestA : this.latestB).next();
    target.set({ status: 'loading', data: null });
    this.api
      .getById(id)
      .pipe(catchError(() => of<'ERR'>('ERR')))
      .subscribe((res) => {
        if (!isCurrent()) return;
        target.set(
          res === 'ERR' ? { status: 'error', data: null } : { status: 'success', data: res },
        );
      });
  }

  openPicker(slot: 0 | 1): void {
    this.pickTarget.set(slot);
    this.searchCtrl.setValue('');
    this.searchResults.set([]);
  }

  closePicker(): void {
    this.pickTarget.set(null);
    this.searchResults.set([]);
  }

  /** Dismiss the picker overlay when the user presses Escape. */
  onEscape(): void {
    if (this.pickTarget() !== null) this.closePicker();
  }

  choose(d: DigimonSummary): void {
    const slot = this.pickTarget();
    if (slot === null) return;
    this.compare.setSlot(slot, d.id);
    this.closePicker();
  }

  clearSlot(slot: 0 | 1): void {
    this.compare.setSlot(slot, null);
  }

  imageOf(state: SlotState): string {
    return state.data?.images.find((i) => i.href)?.href ?? '';
  }

  private join(values: readonly string[] | undefined): string {
    return values && values.length ? values.join(', ') : '—';
  }
}
