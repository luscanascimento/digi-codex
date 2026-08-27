import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, startWith } from 'rxjs';
import { DigimonApi } from '../../core/services/digimon-api';
import { PageWindowItem, pageWindow as buildPageWindow } from '../../core/pagination';
import { LatestOnly } from '../../core/latest-only';
import { BrowseQuery, DigimonListResponse } from '../../core/models/digimon.model';
import { DigimonCard } from '../../shared/ui/digimon-card';
import { CardSkeleton } from '../../shared/ui/card-skeleton';
import { StatusPanel } from '../../shared/ui/status-panel';

interface LoadState {
  readonly status: 'loading' | 'success' | 'error';
  readonly data: DigimonListResponse | null;
}

const PAGE_SIZE = 24;

@Component({
  selector: 'app-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DecimalPipe, DigimonCard, CardSkeleton, StatusPanel],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
  host: {
    '(document:keydown.escape)': 'closeSheet()',
    '(document:keydown.tab)': 'trapTab($any($event))',
    '(document:keydown.shift.tab)': 'trapTab($any($event))',
  },
})
export class Browse {
  private readonly api = inject(DigimonApi);

  /** Typed reactive form controls for the filter bar. */
  readonly search = new FormControl('', { nonNullable: true });
  readonly level = new FormControl('', { nonNullable: true });
  readonly attribute = new FormControl('', { nonNullable: true });
  readonly xAntibody = new FormControl(false, { nonNullable: true });

  private readonly page = signal(0);
  private readonly reloadTick = signal(0);
  readonly skeletons = Array.from({ length: PAGE_SIZE }, (_, i) => i);

  /** Mobile filter bottom-sheet open state. */
  private readonly _sheetOpen = signal(false);
  readonly sheetOpen = this._sheetOpen.asReadonly();

  private readonly sheetTrigger = viewChild.required<ElementRef<HTMLElement>>('sheetTrigger');
  private readonly sheetPanel = viewChild.required<ElementRef<HTMLElement>>('sheetPanel');

  readonly levels = toSignal(this.api.getLevels().pipe(catchError(() => of([]))), {
    initialValue: [],
  });
  readonly attributes = toSignal(this.api.getAttributes().pipe(catchError(() => of([]))), {
    initialValue: [],
  });

  private readonly searchValue = toSignal(
    this.search.valueChanges.pipe(debounceTime(350), distinctUntilChanged(), startWith('')),
    { initialValue: '' },
  );
  private readonly levelValue = toSignal(this.level.valueChanges.pipe(startWith('')), {
    initialValue: '',
  });
  private readonly attributeValue = toSignal(this.attribute.valueChanges.pipe(startWith('')), {
    initialValue: '',
  });
  private readonly xValue = toSignal(this.xAntibody.valueChanges.pipe(startWith(false)), {
    initialValue: false,
  });

  private readonly query = computed<BrowseQuery>(() => ({
    name: this.searchValue(),
    level: this.levelValue(),
    attribute: this.attributeValue(),
    xAntibody: this.xValue(),
    page: this.page(),
  }));

  private readonly _load = signal<LoadState>({ status: 'loading', data: null });
  readonly load = this._load.asReadonly();

  readonly totalPages = computed(() => this._load().data?.pageable.totalPages ?? 0);
  readonly totalElements = computed(() => this._load().data?.pageable.totalElements ?? 0);
  readonly items = computed(() => this._load().data?.content ?? []);
  readonly isEmpty = computed(() => this._load().status === 'success' && this.items().length === 0);
  readonly hasActiveFilters = computed(
    () => !!(this.searchValue() || this.levelValue() || this.attributeValue() || this.xValue()),
  );

  /** Count of the non-search filters — surfaced as a badge on the mobile trigger. */
  readonly activeFilterCount = computed(
    () => (this.levelValue() ? 1 : 0) + (this.attributeValue() ? 1 : 0) + (this.xValue() ? 1 : 0),
  );

  private readonly latest = new LatestOnly();

  constructor() {
    // Reset to first page whenever a filter (but not the page itself) changes.
    effect(() => {
      this.searchValue();
      this.levelValue();
      this.attributeValue();
      this.xValue();
      untracked(() => this.page.set(0));
    });

    // Drive the HTTP request off the reactive query + reload signals.
    effect(() => {
      const q = this.query();
      this.reloadTick();
      const isCurrent = this.latest.next();
      untracked(() => this._load.set({ status: 'loading', data: this._load().data }));
      this.api
        .browse(q, PAGE_SIZE)
        .pipe(catchError(() => of<'ERR'>('ERR')))
        .subscribe((res) => {
          if (!isCurrent()) return; // drop stale responses
          this._load.set(
            res === 'ERR' ? { status: 'error', data: null } : { status: 'success', data: res },
          );
        });
    });
  }

  retry(): void {
    this.reloadTick.update((t) => t + 1);
  }

  clearFilters(): void {
    this.search.setValue('');
    this.level.setValue('');
    this.attribute.setValue('');
    this.xAntibody.setValue(false);
  }

  openSheet(): void {
    this._sheetOpen.set(true);
    this.sheetFocusable()[0]?.focus();
  }

  closeSheet(): void {
    if (!this._sheetOpen()) return;
    this._sheetOpen.set(false);
    this.sheetTrigger().nativeElement.focus();
  }

  /** Keeps Tab cycling inside the open bottom sheet. */
  trapTab(event: KeyboardEvent): void {
    if (!this._sheetOpen()) return;
    const items = this.sheetFocusable();
    if (items.length === 0) return;
    const edge = event.shiftKey ? items[0] : items[items.length - 1];
    const active = document.activeElement;
    if (active !== edge && this.sheetPanel().nativeElement.contains(active)) return;
    event.preventDefault();
    (event.shiftKey ? items[items.length - 1] : items[0]).focus();
  }

  private sheetFocusable(): HTMLElement[] {
    const nodes = this.sheetPanel().nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    return Array.from(nodes).filter((el) => !el.hasAttribute('disabled'));
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    document.getElementById('grid-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  currentPage(): number {
    return this.page();
  }

  /** Compact pagination window: first, current-1..current+1, last with ellipses. */
  readonly pageWindow = computed<PageWindowItem[]>(() =>
    buildPageWindow(this.totalPages(), this.page()),
  );
}
