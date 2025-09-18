import { Component } from '@angular/core';
import { ResourceTypeMenuComponent } from '../../components/ResourceMenu/ResourceMenu.component';
import { BookingHubService } from '../../components/ResourceMenu/Services/bookingHubService.service';
import { BookingpagePaneComponent } from '../../components/bookingpage-pane/bookingpage-pane.component';

@Component({
  selector: 'app-booking-page',
  imports: [ResourceTypeMenuComponent, BookingpagePaneComponent],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.css',
})
export class BookingPageComponent {}
