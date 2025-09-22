import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: MsalService, private router: Router) {}

  canActivate(route: { data: { [x: string]: string[]; }; }): boolean {
    const account = this.authService.instance.getActiveAccount();
    const roles = account?.idTokenClaims?.roles || [];

    const expectedRoles = route.data['roles'] as Array<string>;

    if (roles.some(r => expectedRoles.includes(r))) {
      return true;
    } else {
      this.router.navigate(['/logga-in']);
      return false;
    }
  }
}