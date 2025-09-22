import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-bar',
  imports: [RouterLink, CommonModule],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css',
})
export class MenuBarComponent {
  currentRoute = signal<string>('');

  constructor(private router: Router, public authService: AuthService) {
    // Hämta och spara nuvarande route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.url);
      });
  }

  onLogout(): void {
    this.authService.logout();
  }

  checkIfAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
