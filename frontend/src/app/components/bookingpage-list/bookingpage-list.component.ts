import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { Booking } from '../ResourceMenu/models/booking.model';
import { BookingService } from '../ResourceMenu/Services/booking.service';
import { BookingConfirmationPopupComponent } from '../booking-confirmation-popup/booking-confirmation-popup.component';

@Component({
  selector: 'app-bookingpage-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BookingConfirmationPopupComponent],
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

  //UI-state
  confirmationIsVisible = false;
  isBooked = false;
  errorMessage = '';

  private bookingApi = inject(BookingService);

  //Namn på vald resurs
  get selectedResourceName(): string | null {
    const r = this.resources?.find(
      (x: any) => x.id === this.selectedResourceId
    );
    return r?.name ?? null;
  }

  handleClickBook() {
    const screenWidth = this.getCurrentScreenWidth();

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

    // Visa popup för bekräftelse
    this.isBooked = false; //Startar ny bokning i "bekräfta" läge
    this.confirmationIsVisible = true;
  }

  // Mottag från bekräftelse-popup
  async receiveButtonClickedFromConfirmation(e: string) {
    if (e === 'cancel') {
      this.confirmationIsVisible = false;
      this.isBooked = false;
      return;
    }

    if (e === 'stay') {
      this.confirmationIsVisible = false;
      this.isBooked = false;
      return;
    }

    if (this.selectedDate && this.selectedResourceId) {
      const dateIso = this.selectedDate.toISOString();
      const beginningOfDay = new Date(
        dateIso.split('T')[0].concat('T00:00:00.000Z')
      );
      const endOfDay = new Date(dateIso.split('T')[0].concat('T23:59:59.999Z'));

      const newBooking: Booking = {
        // TODO: riktig userId
        userId: '11111111-1111-1111-1111-111111111111',
        resourceId: this.selectedResourceId,
        startTime: beginningOfDay,
        endTime: endOfDay,
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

  // Hjälpmetoder
  getCurrentScreenWidth() {
    return window.innerWidth;
  }

  resetAllStates() {
    this.isBooked = false;
    this.confirmationIsVisible = false;
    this.errorMessage = '';
  }
}
