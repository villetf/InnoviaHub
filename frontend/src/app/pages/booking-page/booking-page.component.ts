import { Component } from '@angular/core';
import { BookingpagePaneComponent } from '../../components/bookingpage-pane/bookingpage-pane.component';
import { BookingPaneComponent } from '../../components/booking-pane/booking-pane.component';

@Component({
  selector: 'app-booking-page',
  imports: [BookingpagePaneComponent],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.css',
})
export class BookingPageComponent {}
