import { Component, OnInit, OnDestroy,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { AuthService } from './services/auth.service';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { Subject, filter, takeUntil } from 'rxjs';
import { EventMessage, EventType } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuBarComponent, DatePickerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'InnoviaHub';
  selectedDate: Date | null = null;
  isAuthenticated = false;
  userName = '';
  private readonly _destroying$ = new Subject<void>();

  currentRoute = signal<string>('');

  constructor(
    private router: Router,
    private authService: AuthService,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    // Hämta och spara nuvarande route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.url);
      });
      
  }
   ngOnInit(): void {
    // Check if user is already logged in
    this.checkAuthentication();

    // Listen for authentication state changes
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => 
          msg.eventType === EventType.LOGIN_SUCCESS || 
          msg.eventType === EventType.LOGOUT_SUCCESS ||
          msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAuthentication();
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  private checkAuthentication(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.userName = this.authService.getUserName();
    }
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
    console.log('Date selected:', date);
  }
}
