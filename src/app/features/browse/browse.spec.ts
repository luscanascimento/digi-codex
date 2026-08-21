import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { Browse } from './browse';
import { DigimonApi } from '../../core/services/digimon-api';
import { BrowseQuery, DigimonListResponse } from '../../core/models/digimon.model';

function listResponse(name: string): DigimonListResponse {
  return {
    content: [{ id: 1, name, href: '', image: '' }],
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

  getLevels() {
    return of([]);
  }

  getAttributes() {
    return of([]);
  }
}

describe('Browse stale-response guard', () => {
  let api: FakeApi;

  beforeEach(async () => {
    api = new FakeApi();
    await TestBed.configureTestingModule({
      imports: [Browse],
      providers: [provideRouter([]), { provide: DigimonApi, useValue: api }],
    }).compileComponents();
  });

  it('keeps the newest result when an older request answers last', async () => {
    const fixture = TestBed.createComponent(Browse);
    const browse = fixture.componentInstance;
    await fixture.whenStable();

    expect(api.calls.length).toBe(1);

    // Second search supersedes the first one, which is still in flight.
    browse.level.setValue('Rookie');
    await fixture.whenStable();
    expect(api.calls.length).toBe(2);
    expect(api.calls[1].query.level).toBe('Rookie');

    // Newest request answers first.
    api.calls[1].subject.next(listResponse('fresh'));
    await fixture.whenStable();
    expect(browse.load().status).toBe('success');
    expect(browse.items().map((d) => d.name)).toEqual(['fresh']);

    // The old, slow request answers afterwards and must be ignored.
    api.calls[0].subject.next(listResponse('stale'));
    await fixture.whenStable();
    expect(browse.load().status).toBe('success');
    expect(browse.items().map((d) => d.name)).toEqual(['fresh']);
  });

  it('ignores an error raised by a superseded request', async () => {
    const fixture = TestBed.createComponent(Browse);
    const browse = fixture.componentInstance;
    await fixture.whenStable();

    browse.level.setValue('Mega');
    await fixture.whenStable();
    expect(api.calls.length).toBe(2);

    api.calls[1].subject.next(listResponse('fresh'));
    await fixture.whenStable();

    api.calls[0].subject.error(new Error('too late'));
    await fixture.whenStable();

    expect(browse.load().status).toBe('success');
    expect(browse.items().map((d) => d.name)).toEqual(['fresh']);
  });

  it('does show the error state when the current request fails', async () => {
    const fixture = TestBed.createComponent(Browse);
    const browse = fixture.componentInstance;
    await fixture.whenStable();

    api.calls[0].subject.error(new Error('boom'));
    await fixture.whenStable();

    expect(browse.load().status).toBe('error');
    expect(browse.items()).toEqual([]);
  });
});
