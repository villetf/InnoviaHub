import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../../../core/app-config.service';

export interface ResourceType {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ResourceTypeService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient, private cfg: AppConfigService) {
    this.baseUrl = `${this.cfg.apiUrl}/api/resourcetype`;
  }

  getAll(): Observable<ResourceType[]> {
    return this.http.get<ResourceType[]>(this.baseUrl);
  }
}
