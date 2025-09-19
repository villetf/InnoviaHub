import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../ResourceMenu/models/booking.model';
import { BookingService } from '../ResourceMenu/Services/booking.service';
import { BookingConfirmationPopupComponent } from '../booking-confirmation-popup/booking-confirmation-popup.component';
import { AuthService } from '../../services/auth.service';

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

  // UI-state
  confirmationIsVisible = false;
  isBooked = false;
  errorMessage = '';

  private bookingApi = inject(BookingService);
  private authService = inject(AuthService);

  // Namn på vald resurs (för felmeddelanden i UI)
  get selectedResourceName(): string | null {
    const r = this.resources?.find(
      (x: any) => x.id === this.selectedResourceId
    );
    return r?.name ?? null;
  }

  handleClickBook() {
    const screenWidth = window.innerWidth;

    // Mobile: guida användaren till saknade steg
    if (screenWidth < 768) {
      if (!this.selectedTypeId) {
        return document.getElementById('resourceType')?.scrollIntoView();
      } else if (!this.selectedDate) {
        return document.getElementById('calendar')?.scrollIntoView();
      } else if (!this.selectedResourceId) {
        return document.getElementById('resourceList')?.scrollIntoView();
      }
    }

    // Desktop: kräver alla val
    if (!this.selectedTypeId || !this.selectedDate || !this.selectedResourceId)
      return;

    //nollställ och visa popup
    this.isBooked = false;
    this.errorMessage = '';
    this.confirmationIsVisible = true;
  }

  // Bokningsflöde synkat med bookingpage-pane
  async receiveButtonClickedFromConfirmation(e: string) {
    if (e === 'cancel' || e === 'stay') {
      this.confirmationIsVisible = false;
      this.isBooked = false;
      return;
    }

    if (this.selectedDate && this.selectedResourceId) {
      const { start, end } = this.getLocalDayRange(this.selectedDate);

      const currentUserId = this.authService.getUserId();
      const currentUserName = this.authService.getUserName();

      if (!currentUserId) {
        console.error('❌ Cannot create booking: User not logged in');
        return;
      }

      const newBooking: Booking = {
        userId: currentUserId,
        userName: currentUserName,
        resourceId: this.selectedResourceId,
        startTime: start,
        endTime: end,
        status: 'Confirmed',
      };

      this.postNewBooking(newBooking);
    }
  }

  // POST bokning
  postNewBooking(booking: Booking) {
    this.bookingApi.postNewBooking(booking).subscribe(
      (response) => {
        // Om statusen är högre än 201 så stängs bekräftelse-popup
        if (response.status > 201) {
          this.confirmationIsVisible = false;
          return;
        }
        // Annars bekräftas bokningen (statuskod 200 eller 201)
        this.isBooked = true;
      },
      (error: any) => {
        console.error('Status code: ', error.status);
        if (error.status === 409) {
          this.errorMessage = `${this.selectedResourceName} är upptagen.`;
          this.confirmationIsVisible = false;
        }
      }
    );
  }

  //Lokal dagsintervall
  private getLocalDayRange(d: Date) {
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return {
      start: new Date(y, m, day, 0, 0, 0, 0),
      end: new Date(y, m, day, 23, 59, 59, 999),
    };
  }
}
