import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { SensorPageComponent } from './pages/sensor-page/sensor-page.component';

export const routes: Routes = [
  { path: 'profil', component: ProfilePageComponent },
  { path: 'boka', component: BookingPageComponent },
  { path: 'sensorer', component: SensorPageComponent },
  //   { path: '', redirectTo: 'inloggning?', pathMatch: 'full' },
  { path: '**', component: NotFoundPageComponent },
];
