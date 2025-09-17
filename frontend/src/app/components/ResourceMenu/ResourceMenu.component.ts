import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { ResourceTypeService } from './Services/ResourceTypeService.service';
import { ResourceService } from './Services/ResourceService.service';
import { BookingHubService } from './Services/bookingHubService.service';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { ButtonComponent } from '../button/button.component';
import { BookingConfirmationPopupComponent } from '../booking-confirmation-popup/booking-confirmation-popup.component';
import { BookingService } from './Services/booking.service';
import { Booking } from './models/booking.model';

@Component({
  selector: 'app-resource-type-menu',
  standalone: true,
  imports: [
    CommonModule,
    DatePickerComponent,
    ButtonComponent,
    BookingConfirmationPopupComponent,
  ],
  templateUrl: './ResourceMenu.component.html',
})
export class ResourceTypeMenuComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  selectedDate: Date | null = null;
  selectedResourceId: number | null = null;
  selectedResourceName: string | null = null;
  confirmationIsVisible: boolean = false;
  isBooked: boolean = false;
  errorMessage: string = '';

  types: any[] = [];
  selectedTypeId?: number;
  resources: any[] = [];
  loading = false;
  error?: string;

  start?: Date;
  end?: Date;

  private subs: Subscription[] = [];

  constructor(
    private typeApi: ResourceTypeService,
    private resourceApi: ResourceService,
    private hub: BookingHubService,
    private bookingApi: BookingService
  ) {}

  ngOnInit(): void {
    //KÖR INTE nätverkskod under SSR
    if (!this.isBrowser) return;

    //hämta typer
    this.subs.push(
      this.typeApi.getAll().subscribe({
        next: (types) => {
          this.types = types.map((t: any) => ({
            id: t.id,
            name: t.name,
            countAll: 0,
            countAvailable: 0,
          }));
          // if (this.types.length) this.selectType(this.types[0].id);
        },
        error: () => (this.error = 'Kunde inte hämta resurstyp-lista.'),
      })
    );

    //Starta SignalR i browser
    this.hub.start().then(() => {
      const refresh = () => this.refreshResources();
      this.hub.onCreated(refresh);
      this.hub.onUpdated(refresh);
      this.hub.onDeleted(refresh);
    });

    //Polling
    // this.subs.push(
    //   timer(60000, 60000).subscribe(() => this.refreshResources())
    // );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  selectType(typeId: number) {
    if (this.selectedTypeId === typeId) return;
    this.selectedTypeId = typeId;
    this.refreshResources();

    // Scrolla ner till nästa steg(kalender) i mobilläge
    const screenWidth = this.getCurrentScreenWidth();
    if (screenWidth < 768) {
      document.getElementById('calendar')?.scrollIntoView();
    }
  }

  refreshResources() {
    if (!this.isBrowser || !this.selectedTypeId) return;

    this.loading = true;
    this.error = undefined;

    this.subs.push(
      this.resourceApi
        .getByType(this.selectedTypeId, this.start, this.end)
        .subscribe({
          next: (list) => {
            this.resources = list;
            this.loading = false;
            this.updateTypeCounts();
          },
          error: () => {
            this.error = 'Kunde inte hämta resurser.';
            this.loading = false;
          },
        })
    );
  }

  private updateTypeCounts() {
    this.types = this.types.map((t) => {
      if (t.id !== this.selectedTypeId) return t;
      const all = this.resources.length;
      const avail = this.resources.filter((r: any) => r.isAvailable).length;
      return { ...t, countAll: all, countAvailable: avail };
    });
  }

  // setNowRange(hours = 1) {
  //   this.start = new Date();
  //   this.end = new Date(this.start.getTime() + hours * 3600_000);
  //   this.refreshResources();
  // }

  selectResource(
    resourceId: number | null,
    name: string | null,
    isAvailable: boolean
  ) {
    this.resetAllStates();

    if (isAvailable === false) return;

    if (!resourceId) return;
    this.selectedResourceId = resourceId;
    this.selectedResourceName = name;

    // Scrolla ner till nästa steg(resurslista) i mobilläge
    const screenWidth = this.getCurrentScreenWidth();
    if (screenWidth < 768) {
      document.getElementById('bookButton')?.scrollIntoView();
    }
  }

  handleClickBook() {
    const screenWidth = this.getCurrentScreenWidth();

    // Mobile
    if (screenWidth < 768) {
      if (!this.selectedTypeId) {
        return document.getElementById('resourceType')?.scrollIntoView();
      } else if (!this.selectedDate) {
        return document.getElementById('calendar')?.scrollIntoView();
      } else if (!this.selectedResourceId) {
        return document.getElementById('resourceList')?.scrollIntoView();
      }
    }

    // Desktop
    if (!this.selectedTypeId || !this.selectedDate || !this.selectedResourceId)
      return;

    // Visa popup för bekräftelse
    this.confirmationIsVisible = true;
  }

  receiveSelectedDateFromDatePicker(e: Date | null) {
    this.resetAllStates();

    this.selectedDate = e;

    // Scrolla ner till nästa steg(resurslista) i mobilläge
    const screenWidth = this.getCurrentScreenWidth();
    if (screenWidth < 768) {
      document.getElementById('resourceList')?.scrollIntoView();
    }
  }

  getCurrentScreenWidth() {
    return window.innerWidth;
  }

  async receiveButtonClickedFromConfirmation(e: string) {
    if (e === 'cancel') {
      this.confirmationIsVisible = false;
    } else {
      if (this.selectedDate && this.selectedResourceId) {
        // TEMP tills funktionen för tidsval läggs till --------------------
        const dateIso = this.selectedDate.toISOString();

        const beginningOfDay = new Date(
          dateIso.split('T')[0].concat('T00:00:00.000Z')
        );
        const endOfDay = new Date(
          dateIso.split('T')[0].concat('T23:59:59.999Z')
        );

        // -----------------------------------------------------------------

        const newBooking: Booking = {
          // TODO: Riktig userId ska användas
          userId: '11111111-1111-1111-1111-111111111111', // TEMP
          resourceId: this.selectedResourceId,
          startTime: beginningOfDay,
          endTime: endOfDay,
          status: 'Confirmed',
        };

        this.postNewBooking(newBooking);
      }
    }
  }

  postNewBooking(booking: Booking) {
    this.bookingApi.postNewBooking(booking).subscribe(
      (response) => {
        // Om statusen är högre än 201 så stängs bekräftelse-popup
        if (response.status > 201) return (this.confirmationIsVisible = false);

        // Annars bekräftas bokningen (statuskod 200 eller 201)
        return (this.isBooked = true);
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

  resetAllStates() {
    this.isBooked = false;
    this.confirmationIsVisible = false;
    this.errorMessage = '';
  }
}
