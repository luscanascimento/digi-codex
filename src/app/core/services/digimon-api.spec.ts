import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DigimonApi } from './digimon-api';
import { Digimon } from '../models/digimon.model';

const AGUMON = { id: 1, name: 'Agumon' } as Digimon;

describe('DigimonApi detail cache', () => {
  let api: DigimonApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(DigimonApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches an id once and replays it to later subscribers', () => {
    const first: Digimon[] = [];
    const second: Digimon[] = [];

    api.getById(1).subscribe((d) => first.push(d));
    http.expectOne((r) => r.url.endsWith('/digimon/1')).flush(AGUMON);

    api.getById(1).subscribe((d) => second.push(d));
    http.expectNone((r) => r.url.endsWith('/digimon/1'));

    expect(first).toEqual([AGUMON]);
    expect(second).toEqual([AGUMON]);
  });

  it('keeps a separate entry per id', () => {
    api.getById(1).subscribe();
    api.getById(2).subscribe();

    http.expectOne((r) => r.url.endsWith('/digimon/1')).flush(AGUMON);
    http.expectOne((r) => r.url.endsWith('/digimon/2')).flush({ id: 2, name: 'Gabumon' });
  });

  it('does not cache a failure, so a retry refetches', () => {
    let failed = false;
    api.getById(1).subscribe({ error: () => (failed = true) });
    http.expectOne((r) => r.url.endsWith('/digimon/1')).error(new ProgressEvent('network'));
    expect(failed).toBe(true);

    let value: Digimon | undefined;
    api.getById(1).subscribe((d) => (value = d));
    http.expectOne((r) => r.url.endsWith('/digimon/1')).flush(AGUMON);
    expect(value).toEqual(AGUMON);
  });
});
