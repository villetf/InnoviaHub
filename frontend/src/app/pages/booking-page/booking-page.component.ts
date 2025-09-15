import { Component } from '@angular/core';
import { ResourceTypeMenuComponent } from '../../components/ResourceMenu/ResourceMenu.component';
import { BookingHubService } from '../../components/ResourceMenu/Services/bookingHubService.service';

@Component({
  selector: 'app-booking-page',
  imports: [ResourceTypeMenuComponent],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.css',
})
export class BookingPageComponent {}
