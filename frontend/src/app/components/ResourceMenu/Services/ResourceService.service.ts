import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResourceItem } from '../models/Resource';
import { AppConfigService } from '../../../core/app-config.service';

export interface CreateResourceDto {
  name: string;
  resourceTypeId: number;
}

export interface UpdateResourceDto {
  name: string;
  resourceTypeId: number;
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly baseUrl: string;
  constructor(private http: HttpClient, private cfg: AppConfigService) {
    this.baseUrl = `${this.cfg.apiUrl}/api/resource`;
  }

  //Hämtar resurser för en typ
  getByType(
    typeId: number,
    start?: Date,
    end?: Date
  ): Observable<ResourceItem[]> {
    // defaulta till nu → +1h
    const now = new Date();
    const s = start ?? now;
    const e = end ?? new Date(s.getTime() + 60 * 60 * 1000);

    let params = new HttpParams()
      .set('typeId', typeId)
      .set('start', s.toISOString())
      .set('end', e.toISOString());

    return this.http.get<ResourceItem[]>(this.baseUrl, { params });
  }

  //Hämta resurs via id
  getById(id: number): Observable<ResourceItem> {
    return this.http.get<ResourceItem>(`${this.baseUrl}/${id}`);
  }

  //Skapa ny
  create(dto: CreateResourceDto): Observable<ResourceItem> {
    return this.http.post<ResourceItem>(this.baseUrl, dto);
  }

  //Uppdatera
  update(id: number, dto: UpdateResourceDto): Observable<ResourceItem> {
    return this.http.put<ResourceItem>(`${this.baseUrl}/${id}`, dto);
  }

  //Ta bort
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
