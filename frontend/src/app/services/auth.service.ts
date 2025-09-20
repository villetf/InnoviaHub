import { inject, Injectable } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, PopupRequest, RedirectRequest, EndSessionRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil, firstValueFrom } from 'rxjs';
import { loginRequest } from '../auth-config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _destroying$ = new Subject<void>();
  private _initialized = false;
  private router = inject(Router);
  
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
    console.log('🔐 Login method called');
    
    if (!this.msalService) {
      console.error('❌ MSAL Service is not available');
      return;
    }

    try {
      // Ensure initialization before login
      await this.initializeMsal();
      
      console.log('🚀 Attempting login popup...');
      console.log('📋 Login request config:', loginRequest);
      console.log('🌐 Environment config:', window.__env);
      
      const result = await firstValueFrom(this.msalService.loginPopup(loginRequest));
      
      console.log('✅ Login successful', result);
      if (result?.account) {
        this.msalService.instance.setActiveAccount(result.account);
        console.log('✅ Active account set:', result.account);
      }
      
    } catch (error) {
      console.error('❌ Login failed', error);
      
      // Försök med redirect som fallback
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
        console.log('🔄 Popup blocked, trying redirect...');
        try {
          await firstValueFrom(this.msalService.loginRedirect(loginRequest));
        } catch (redirectError) {
          console.error('❌ Redirect login also failed:', redirectError);
        }
      }
    }
  }

  logout(): void {
    const logoutRequest: EndSessionRequest = {
      postLogoutRedirectUri: window.__env?.NG_APP_LOGOUT_REDIRECT_URL
    };

    const lsKeys = { ...localStorage };
    for (const key in lsKeys) {
      if (key.startsWith('msal')) {
        localStorage.removeItem(key)
      }
    }

    this.router.navigate(['/logga-in']);
  }

  isLoggedIn(): boolean {
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      // Removed debug logging to prevent spam
      return accounts.length > 0;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  }

  getActiveAccount() {
    try {
      const activeAccount = this.msalService.instance.getActiveAccount();
      // Removed debug logging to prevent spam
      return activeAccount;
    } catch (error) {
      console.error('❌ Error getting active account:', error);
      return null;
    }
  }

  getUserName(): string {
    const account = this.getActiveAccount();
    // Removed debug logging to prevent spam
    
    if (!account) {
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
    
    return name;
  }

  getUserId(): string {
    const account = this.getActiveAccount();
    // Only log when debugging is specifically needed
    
    if (!account) {
      return '';
    }

    // Använd Object ID (oid) från token claims som är det korrekta GUID:et
    const userId = account.idTokenClaims?.['oid'] as string || 
                   account.localAccountId || 
                   account.homeAccountId || 
                   '';
    
    return userId;
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