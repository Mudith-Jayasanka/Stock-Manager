import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContainerType, Fragrance, WaxType } from '../models';

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private base = 'http://localhost:3000/api/master-data';

  constructor(private http: HttpClient) {}

  // ── Container Types ─────────────────────────────────────────────────────────
  getContainerTypes(): Observable<ContainerType[]> {
    return this.http.get<ContainerType[]>(`${this.base}/container-types`);
  }

  addContainerType(name: string): Observable<ContainerType> {
    return this.http.post<ContainerType>(`${this.base}/container-types`, { name });
  }

  deleteContainerType(id: string): Observable<{ message: string; archived: boolean }> {
    return this.http.delete<{ message: string; archived: boolean }>(`${this.base}/container-types/${id}`);
  }

  // ── Fragrances ──────────────────────────────────────────────────────────────
  getFragrances(): Observable<Fragrance[]> {
    return this.http.get<Fragrance[]>(`${this.base}/fragrances`);
  }

  addFragrance(name: string): Observable<Fragrance> {
    return this.http.post<Fragrance>(`${this.base}/fragrances`, { name });
  }

  deleteFragrance(id: string): Observable<{ message: string; archived: boolean }> {
    return this.http.delete<{ message: string; archived: boolean }>(`${this.base}/fragrances/${id}`);
  }

  // ── Wax Types ───────────────────────────────────────────────────────────────
  getWaxTypes(): Observable<WaxType[]> {
    return this.http.get<WaxType[]>(`${this.base}/wax-types`);
  }

  addWaxType(name: string): Observable<WaxType> {
    return this.http.post<WaxType>(`${this.base}/wax-types`, { name });
  }

  deleteWaxType(id: string): Observable<{ message: string; archived: boolean }> {
    return this.http.delete<{ message: string; archived: boolean }>(`${this.base}/wax-types/${id}`);
  }
}
