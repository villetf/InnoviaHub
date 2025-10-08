import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../ResourceMenu/models/booking.model';
import { BookingService } from '../ResourceMenu/Services/booking.service';
import { BookingConfirmationPopupComponent } from '../booking-confirmation-popup/booking-confirmation-popup.component';
import { AuthService } from '../../services/auth.service';
import { HttpResponse } from '@angular/common/http';
import { HandleBookingService } from '../../services/handleBooking.service';

@Component({
  selector: 'app-bookingpage-list',
  standalone: true,
  imports: [CommonModule, BookingConfirmationPopupComponent],
  templateUrl: './bookingpage-list.component.html',
})
export class BookingpageListComponent {
   @Input() loading = false;
   @Input() error?: string;
   @Input() resources: any[] = [];
   @Input() selectedResourceId: number | null = null;

   @Input() selectedTypeId?: number;
   @Input() selectedDate: Date | null = null;

   @Output() selectResource = new EventEmitter<{
      id: number;
      name: string;
      isAvailable: boolean;
   }>();
   @Output() bookingCommitted = new EventEmitter<void>(); // meddela parent efter lyckad bokning

   handleBookingService: HandleBookingService = inject(HandleBookingService);

   ngOnChanges(changes: SimpleChanges) {
      if (changes['loading']) {
         this.handleBookingService.setLoading(this.loading);
      }
      if (changes['error']) {
         this.handleBookingService.setError(this.error ?? '');
      }
      if (changes['resources']) {
         this.handleBookingService.setResources(this.resources);
      }
      if (changes['selectedResourceId']) {
         if (this.selectedResourceId != null) {
           this.handleBookingService.setSelectedResourceId(this.selectedResourceId);
         }
      }
      if (changes['selectedTypeId']) {
         if (this.selectedTypeId != null) {
           this.handleBookingService.setSelectedTypeId(this.selectedTypeId);
         }
      }
      if (changes['selectedDate']) {
         if (this.selectedDate != null) {
           this.handleBookingService.setSelectedDate(this.selectedDate);
         }
      }
   }
}
