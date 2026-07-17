import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import {
  BrowseQuery,
  Digimon,
  DigimonListResponse,
  RefField,
  RefListResponse,
} from '../models/digimon.model';

const BASE = 'https://digi-api.com/api/v1';

/** Thin, typed client around the public digi-api.com endpoints. */
@Injectable({ providedIn: 'root' })
export class DigimonApi {
  private readonly http = inject(HttpClient);

  /** Cached reference lists so filters don't refetch on every navigation. */
  private levels$?: Observable<readonly RefField[]>;
  private attributes$?: Observable<readonly RefField[]>;

  /** Paginated + filterable browse endpoint. */
  browse(query: BrowseQuery, pageSize = 24): Observable<DigimonListResponse> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(pageSize));

    if (query.name.trim()) params = params.set('name', query.name.trim());
    if (query.attribute) params = params.set('attribute', query.attribute);
    if (query.level) params = params.set('level', query.level);
    if (query.xAntibody) params = params.set('xAntibody', 'true');

    return this.http.get<DigimonListResponse>(`${BASE}/digimon`, { params });
  }

  /** Full detail for a single Digimon by numeric id. */
  getById(id: number): Observable<Digimon> {
    return this.http.get<Digimon>(`${BASE}/digimon/${id}`);
  }

  getLevels(): Observable<readonly RefField[]> {
    this.levels$ ??= this.http
      .get<RefListResponse>(`${BASE}/level`, { params: new HttpParams().set('pageSize', '50') })
      .pipe(
        map((r) => [...r.content.fields].sort((a, b) => a.name.localeCompare(b.name))),
        shareReplay(1),
      );
    return this.levels$;
  }

  getAttributes(): Observable<readonly RefField[]> {
    this.attributes$ ??= this.http
      .get<RefListResponse>(`${BASE}/attribute`, { params: new HttpParams().set('pageSize', '50') })
      .pipe(
        map((r) => [...r.content.fields].sort((a, b) => a.name.localeCompare(b.name))),
        shareReplay(1),
      );
    return this.attributes$;
  }
}
