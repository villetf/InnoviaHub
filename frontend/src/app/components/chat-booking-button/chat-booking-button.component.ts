import { Component, inject, Input } from '@angular/core';
import { BookingObject } from '../../../types/BookingObject';
import { ButtonComponent } from "../button/button.component";
import { HandleBookingService } from '../../services/handleBooking.service';

@Component({
  selector: 'app-chat-booking-button',
  imports: [ButtonComponent],
  templateUrl: './chat-booking-button.component.html',
  styleUrl: './chat-booking-button.component.css'
})
export class ChatBookingButtonComponent {
   @Input() bookingObject?: BookingObject;

   handleBookingService = inject(HandleBookingService);
}
