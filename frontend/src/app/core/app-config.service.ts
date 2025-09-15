import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  readonly apiUrl = window.__env?.NG_APP_API_URL || 'http://localhost:5184';

  readonly hubUrl =
    window.__env?.NG_APP_HUB_URL || 'ws://localhost:5184/hubs/bookings';
}
