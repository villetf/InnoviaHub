import { Injectable } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, PopupRequest, RedirectRequest, EndSessionRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { loginRequest } from '../auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _destroying$ = new Subject<void>();
  
  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    // Listen for login success/failure
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: any) => msg.eventType === 'msal:loginSuccess'),
        takeUntil(this._destroying$)
      )
      .subscribe((result: any) => {
        console.log('Login successful:', result);
      });
  }

  login(): void {
    this.msalService.loginPopup(loginRequest)
      .subscribe({
        next: (result: AuthenticationResult) => {
          console.log('Login successful', result);
          this.msalService.instance.setActiveAccount(result.account);
        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
  }

  logout(): void {
    const logoutRequest: EndSessionRequest = {
      postLogoutRedirectUri: 'http://localhost:4200'
    };

    this.msalService.logoutPopup(logoutRequest);
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  getActiveAccount() {
    return this.msalService.instance.getActiveAccount();
  }

  getUserName(): string {
    const account = this.getActiveAccount();
    return account?.name || account?.username || 'Unknown User';
  }

  getUserId(): string {
    const account = this.getActiveAccount();
    return account?.homeAccountId || '';
  }

  getUserRoles(): string[] {
    const account = this.getActiveAccount();
    return account?.idTokenClaims?.['roles'] || [];
  }

  isAdmin(): boolean {
    return this.getUserRoles().includes('Admin');
  }

  isUser(): boolean {
    return this.getUserRoles().includes('User') || this.isAdmin();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}