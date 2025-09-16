import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuBarComponent, DatePickerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'InnoviaHub';
  selectedDate: Date | null = null;
  isAuthenticated = false; // Keep this for the template logic
  showDebugLink = true; // Azure debug component visibility
  
  currentRoute = signal<string>('');

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Hämta och spara nuvarande route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.url);
      });
      
    // Check authentication status
    this.isAuthenticated = this.authService.isLoggedIn();
  }

  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
    console.log('Date selected:', date);
  }
}
