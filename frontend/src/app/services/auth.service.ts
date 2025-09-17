import { Injectable } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, PopupRequest, RedirectRequest, EndSessionRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil, firstValueFrom } from 'rxjs';
import { loginRequest } from '../auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _destroying$ = new Subject<void>();
  private _initialized = false;
  
  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    this.initializeMsal();
    
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

  private async initializeMsal(): Promise<void> {
    try {
      if (!this._initialized) {
        await this.msalService.instance.initialize();
        this._initialized = true;
        console.log('✅ MSAL initialized successfully');
      }
    } catch (error) {
      console.error('❌ MSAL initialization failed:', error);
    }
  }

  async login(): Promise<void> {
    console.log('� Login method called');
    
    if (!this.msalService) {
      console.error('❌ MSAL Service is not available');
      return;
    }

    try {
      // Ensure initialization before login
      await this.initializeMsal();
      
      console.log('🚀 Attempting login popup...');
      const result = await firstValueFrom(this.msalService.loginPopup(loginRequest));
      
      console.log('✅ Login successful', result);
      if (result?.account) {
        this.msalService.instance.setActiveAccount(result.account);
        console.log('✅ Active account set:', result.account);
      }
      
    } catch (error) {
      console.error('❌ Login failed', error);
    }
  }

  logout(): void {
    const logoutRequest: EndSessionRequest = {
      postLogoutRedirectUri: window.__env?.NG_APP_LOGOUT_REDIRECT_URL
    };

    this.msalService.logoutPopup(logoutRequest);
  }

  isLoggedIn(): boolean {
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      console.log('🔍 Checking login status, accounts:', accounts);
      return accounts.length > 0;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  }

  getActiveAccount() {
    try {
      const activeAccount = this.msalService.instance.getActiveAccount();
      console.log('🔍 Getting active account:', activeAccount);
      return activeAccount;
    } catch (error) {
      console.error('❌ Error getting active account:', error);
      return null;
    }
  }

  getUserName(): string {
    const account = this.getActiveAccount();
    console.log('👤 Getting user name, account:', account);
    
    if (!account) {
      console.log('❌ No active account found');
      return 'No Account';
    }

    // Try different properties to get the user name
    const name = account.name || 
                 account.username || 
                 (account.idTokenClaims?.['name'] as string) ||
                 (account.idTokenClaims?.['preferred_username'] as string) ||
                 (account.idTokenClaims?.['given_name'] as string) ||
                 (account.idTokenClaims?.['family_name'] as string) ||
                 'Unknown User';
    
    console.log('👤 User name found:', name);
    console.log('👤 Account properties:', {
      name: account.name,
      username: account.username,
      idTokenClaims: account.idTokenClaims
    });
    
    return name;
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

  getMsalServiceStatus(): string {
    try {
      if (!this.msalService) {
        return '❌ MSAL Service not available';
      }
      
      const instance = this.msalService.instance;
      if (!instance) {
        return '❌ MSAL Instance not available';
      }

      const accounts = instance.getAllAccounts();
      return `✅ MSAL Ready (${accounts.length} accounts)`;
    } catch (error) {
      return `❌ MSAL Error: ${error}`;
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}