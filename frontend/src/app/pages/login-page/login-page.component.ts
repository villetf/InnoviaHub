import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  imports: [ButtonComponent, ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private readonly _destroying$ = new Subject<void>();
  
  isLoading = false;
  showTraditionalLogin = false;

  // Validera användares inmatning för inloggning
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    // Kontrollera om användaren redan är inloggad
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profil']);
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  // Azure Entra ID login
  async loginWithMicrosoft(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      await this.authService.login();
      
      // Vänta lite för att säkerställa att autentiseringen är klar
      setTimeout(() => {
        if (this.authService.isLoggedIn()) {
          this.router.navigate(['/profil']);
        } else {
          this.isLoading = false;
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Microsoft login error:', error);
      this.isLoading = false;
    }
  }

  // Traditionell e-post/lösenord login (för framtida användning)
  handleLogin() {

    // TODO: Implementera traditionell inloggning med backend
    // För nu, visa att denna funktion inte är implementerad än
    alert('Traditionell inloggning är inte implementerad än. Använd "Logga in med Microsoft" istället.');
  }

  // Växla mellan Microsoft-login och traditionell login
  toggleLoginMethod(): void {
    this.showTraditionalLogin = !this.showTraditionalLogin;
  }
}
