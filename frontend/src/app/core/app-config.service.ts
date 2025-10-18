import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  readonly apiUrl = window.__env?.NG_APP_API_URL || 'http://localhost:5184';

  readonly hubUrl = window.__env?.NG_APP_HUB_URL || 'ws://localhost:5184/hubs/bookings';

  readonly deviceRegistryUrl = window.__env?.NG_APP_DEVREG_URL || 'http://localhost:5101';

  readonly portalAdapterUrl = window.__env?.NG_APP_PORTADAPT_URL || 'http://localhost:5104';

  readonly loginRedirectUrl = window.__env?.NG_APP_LOGIN_REDIRECT_URL || 'http://localhost:4200/profil';

  readonly logoutRedirectUrl = window.__env?.NG_APP_LOGOUT_REDIRECT_URL || 'http://localhost:4200/logga-in';
}
