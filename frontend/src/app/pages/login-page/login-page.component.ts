import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [ButtonComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private router = inject(Router);

  // Validera användares inmatning för inloggning
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  handleLogin() {
    console.log(this.loginForm.value);

    // TODO: Hantera användarens uppgifter med backenden och navigera användaren

    // Detta körs att skicka användaren till profilsidan när hen lyckades med inloggningen
    this.router.navigate(['/profil']);
  }
}
