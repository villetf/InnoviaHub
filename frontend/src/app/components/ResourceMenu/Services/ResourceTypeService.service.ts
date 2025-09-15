import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResourceType {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ResourceTypeService {
  private baseUrl = 'http://localhost:5184/api/resourcetype';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ResourceType[]> {
    return this.http.get<ResourceType[]>(this.baseUrl);
  }
}
