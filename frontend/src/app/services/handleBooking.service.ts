import { EventEmitter, inject, Injectable, Input, Output, signal } from "@angular/core";
import { HttpResponse } from "@microsoft/signalr";
import { Booking } from "../components/ResourceMenu/models/booking.model";
import { AuthService } from "./auth.service";
import { BookingService } from "../components/ResourceMenu/Services/booking.service";
import { ResourceItem } from "../components/ResourceMenu/models/Resource";
import { BookingObject } from "../../types/BookingObject";

@Injectable({ providedIn: 'root' })
export class HandleBookingService {
   loading = signal(false);
   error = signal<string>('');
   resources = signal<any[]>([]);
   selectedResourceId = signal<number | null>(null);

   selectedTypeId? = signal<number | null>(0);
   selectedDate = signal<Date | null>(null);

   setLoading(isLoading: boolean) {
      this.loading.set(isLoading);
   }

   setError(error: string) {
      this.error.set(error);
   }

   setResources(resources: any[]) {
      this.resources.set(resources);
   }

   setSelectedResourceId(selected: number) {
      this.selectedResourceId.set(selected);
   }

   setSelectedTypeId(selectedType: number) {
      this.selectedTypeId?.set(selectedType);
   }

   setSelectedDate(date: Date) {
      this.selectedDate.set(date);
   }

   selectResource(resource: {id: number, name: string, isAvailable: boolean}) {
      this.selectedResourceId.set(resource.id);
   }

   bookingCommitted = signal(false);

   commitBooking() {
      this.bookingCommitted.set(true);
      setTimeout(() => this.bookingCommitted.set(false), 0);
   }

   // UI-state
   confirmationIsVisible = false;
   isBooked = false;
   errorMessage = '';

   private bookingApi = inject(BookingService);
   private authService = inject(AuthService);

   get selectedResourceName(): string | null {
      const r = this.resources()?.find(
         (x: any) => x.id === this.selectedResourceId
      );
      return r?.name ?? null;
   }

   makeAiBooking(bookingObject: BookingObject) {
      this.setSelectedResourceId(bookingObject.resourceId);
      this.setSelectedDate(bookingObject.date);
      console.log('valt datum: ', this.selectedDate());
      this.confirmationIsVisible = true;
   }

   handleClickBook() {
      const screenWidth = window.innerWidth;

      // Mobile: guida användaren till saknade steg
      if (screenWidth < 768) {
         if (!this.selectedTypeId)
         return document.getElementById('resourceType')?.scrollIntoView();
         else if (!this.selectedDate)
         return document.getElementById('calendar')?.scrollIntoView();
         else if (!this.selectedResourceId)
         return document.getElementById('resourceList')?.scrollIntoView();
      }

      // Desktop: kräver alla val
      if (!this.selectedTypeId || !this.selectedDate || !this.selectedResourceId)
         return;

      // nollställ och visa popup
      this.isBooked = false;
      this.errorMessage = '';
      this.confirmationIsVisible = true;
   }

   async receiveButtonClickedFromConfirmation(e: string) {
      if (e === 'cancel' || e === 'stay') {
         this.confirmationIsVisible = false;
         this.isBooked = false;
         return;
      }

      if (this.selectedDate && this.selectedResourceId) {
         const { start, end } = this.getUtcDayRange(this.selectedDate()!);

         const currentUserId = this.authService.getUserId();
         const currentUserName = this.authService.getUserName();
         if (!currentUserId) {
         console.error('❌ Cannot create booking: User not logged in');
         return;
         }

         const newBooking: Booking = {
            userId: currentUserId,
            userName: currentUserName,
            resourceId: this.selectedResourceId()!,
            startTime: start,
            endTime: end,
            status: 'Confirmed',
         };

         this.postNewBooking(newBooking);
      }
   }

   postNewBooking(booking: Booking) {
      if (!this.authService.isAdmin() && !this.authService.isUser())
         return console.error('Unauthorized');

      this.bookingApi.postNewBooking(booking).subscribe(
         (response) => {
         if (response.status > 201) {
            this.confirmationIsVisible = false;
            return;
         }
         this.isBooked = true;

         // be parent (pane) att ladda om resources direkt
         this.commitBooking();

         // (valfritt) optimistisk lokalt:
         this.resources.set(this.resources().map((it: any) =>
            it.id === this.selectedResourceId ? { ...it, isAvailable: false } : it
         ));
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

   private getUtcDayRange(d: Date) {
      d = typeof d === 'string' ? new Date(d) : d;
      const isoDate = d.toISOString().split('T')[0]; // YYYY-MM-DD baserat på d i UTC
      return {
         start: new Date(`${isoDate}T00:00:00.000Z`),
         end: new Date(`${isoDate}T23:59:59.999Z`),
      };
   }
}