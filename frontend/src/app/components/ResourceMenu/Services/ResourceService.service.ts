import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResourceItem } from '../models/Resource';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private baseUrl = 'http://localhost:5184/api/resource';
  constructor(private http: HttpClient) {}

  //Hämtar resurser för en typ
  getByType(
    typeId: number,
    start?: Date,
    end?: Date
  ): Observable<ResourceItem[]> {
    let params = new HttpParams().set('typeId', typeId);
    if (start) params = params.set('start', start.toISOString());
    if (end) params = params.set('end', end.toISOString());

    return this.http.get<ResourceItem[]>(this.baseUrl, { params });
  }
}
