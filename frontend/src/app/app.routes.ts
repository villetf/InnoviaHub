import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { SensorPageComponent } from './pages/sensor-page/sensor-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { AzureDebugComponent } from './components/azure-debug/azure-debug.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';

export const routes: Routes = [
  { path: 'admin', component: AdminPageComponent },
  { path: 'logga-in', component: LoginPageComponent },
  { path: 'registrera', component: RegistrationPageComponent },
  { path: 'profil', component: ProfilePageComponent },
  { path: 'boka', component: BookingPageComponent },
  { path: 'sensorer', component: SensorPageComponent },
  { path: 'azure-debug', component: AzureDebugComponent },
  { path: '', redirectTo: 'logga-in', pathMatch: 'full' },
  { path: '**', component: NotFoundPageComponent },
];
