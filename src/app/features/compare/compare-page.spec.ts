import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { ComparePage } from './compare-page';
import { DigimonApi } from '../../core/services/digimon-api';
import { BrowseQuery, Digimon, DigimonListResponse } from '../../core/models/digimon.model';

function listResponse(name: string): DigimonListResponse {
  return {
    content: [{ id: name.length, name, href: '', image: '' }],
    pageable: {
      currentPage: 0,
      elementsOnPage: 1,
      totalElements: 1,
      totalPages: 1,
      previousPage: '',
      nextPage: '',
    },
  };
}

/** Stands in for DigimonApi, handing back a subject per call so responses can be resolved out of order. */
class FakeApi {
  readonly calls: { query: BrowseQuery; subject: Subject<DigimonListResponse> }[] = [];

  browse(query: BrowseQuery): Observable<DigimonListResponse> {
    const subject = new Subject<DigimonListResponse>();
    this.calls.push({ query, subject });
    return subject.asObservable();
  }

  getById(): Observable<Digimon> {
    return EMPTY;
  }
}

describe('ComparePage picker stale-response guard', () => {
  let api: FakeApi;

  beforeEach(async () => {
    localStorage.clear();
    api = new FakeApi();
    await TestBed.configureTestingModule({
      imports: [ComparePage],
      providers: [provideRouter([]), { provide: DigimonApi, useValue: api }],
    }).compileComponents();
  });

  /** The picker search is debounced by 300ms, so let real time pass before asserting. */
  async function afterDebounce(fixture: { whenStable(): Promise<unknown> }): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 360));
    await fixture.whenStable();
  }

  it('keeps the newest search result when an older request answers last', async () => {
    const fixture = TestBed.createComponent(ComparePage);
    const page = fixture.componentInstance;
    await fixture.whenStable();

    page.openPicker(0);
    await fixture.whenStable();
    expect(api.calls.length).toBe(0);

    page.searchCtrl.setValue('aa');
    await afterDebounce(fixture);
    expect(api.calls.length).toBe(1);

    // Second keystroke supersedes the first request, which is still in flight.
    page.searchCtrl.setValue('aaa');
    await afterDebounce(fixture);
    expect(api.calls.length).toBe(2);
    expect(api.calls[1].query.name).toBe('aaa');

    // Newest request answers first.
    api.calls[1].subject.next(listResponse('fresh'));
    await fixture.whenStable();
    expect(page.searchResults().map((d) => d.name)).toEqual(['fresh']);
    expect(page.searching()).toBe(false);

    // The old, slow request answers afterwards and must be ignored.
    api.calls[0].subject.next(listResponse('stale'));
    await fixture.whenStable();
    expect(page.searchResults().map((d) => d.name)).toEqual(['fresh']);
  });

  it('ignores a search answering after the picker was closed', async () => {
    const fixture = TestBed.createComponent(ComparePage);
    const page = fixture.componentInstance;
    await fixture.whenStable();

    page.openPicker(1);
    page.searchCtrl.setValue('aa');
    await afterDebounce(fixture);
    expect(api.calls.length).toBe(1);

    page.closePicker();
    await fixture.whenStable();

    api.calls[0].subject.next(listResponse('late'));
    await fixture.whenStable();
    expect(page.searchResults()).toEqual([]);
  });
});
