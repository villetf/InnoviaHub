import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResourceItem } from '../models/Resource';
import { AppConfigService } from '../../../core/app-config.service';

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
    let params = new HttpParams().set('typeId', typeId);
    if (start) params = params.set('start', start.toISOString());
    if (end) params = params.set('end', end.toISOString());

    return this.http.get<ResourceItem[]>(this.baseUrl, { params });
  }
}
