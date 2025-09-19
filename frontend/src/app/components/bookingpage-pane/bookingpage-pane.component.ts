import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ResourceTypeService } from '../ResourceMenu/Services/ResourceTypeService.service';
import { ResourceService } from '../ResourceMenu/Services/ResourceService.service';
import { BookingHubService } from '../ResourceMenu/Services/bookingHubService.service';
import { ButtonComponent } from '../button/button.component';
import { BookingConfirmationPopupComponent } from '../booking-confirmation-popup/booking-confirmation-popup.component';
import { BookingService } from '../ResourceMenu/Services/booking.service';
import { Booking } from '../ResourceMenu/models/booking.model';
import { BookingpageMenuComponent } from '../bookingpage-menu/bookingpage-menu.component';
import { BookingpageCalendarComponent } from '../bookingpage-calendar/bookingpage-calendar.component';
import { BookingpageListComponent } from '../bookingpage-list/bookingpage-list.component';
import { NavTabsComponent } from '../nav-tabs/nav-tabs.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bookingpage-pane',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    BookingConfirmationPopupComponent,
    BookingpageMenuComponent,
    BookingpageCalendarComponent,
    BookingpageListComponent,
    NavTabsComponent,
  ],
  templateUrl: './bookingpage-pane.component.html',
})
export class BookingpagePaneComponent implements OnInit, OnDestroy {
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
    private bookingApi: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.subs.push(
      this.typeApi.getAll().subscribe({
        next: (types) => {
          this.types = types.map((t: any) => ({
            id: t.id,
            name: t.name,
            countAll: 0,
            countAvailable: 0,
          }));
          if (this.start && this.end) this.refreshAllTypeCounts();
        },
        error: () => (this.error = 'Kunde inte hämta resurstyp-lista.'),
      })
    );

    this.hub.start().then(() => {
      const refresh = () => this.refreshResources();
      this.hub.onCreated(refresh);
      this.hub.onUpdated(refresh);
      this.hub.onDeleted(refresh);
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  selectType(typeId: number) {
    if (this.selectedTypeId === typeId) return;
    this.selectedTypeId = typeId;
    this.refreshResources();

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

    const screenWidth = this.getCurrentScreenWidth();
    if (screenWidth < 768) {
      document.getElementById('bookButton')?.scrollIntoView();
    }
  }

  handleClickBook() {
    const screenWidth = this.getCurrentScreenWidth();

    if (screenWidth < 768) {
      if (!this.selectedTypeId) {
        return document.getElementById('resourceType')?.scrollIntoView();
      } else if (!this.selectedDate) {
        return document.getElementById('calendar')?.scrollIntoView();
      } else if (!this.selectedResourceId) {
        return document.getElementById('resourceList')?.scrollIntoView();
      }
    }

    if (!this.selectedTypeId || !this.selectedDate || !this.selectedResourceId)
      return;

    this.confirmationIsVisible = true;
  }

  receiveSelectedDateFromDatePicker(e: Date | null) {
    this.resetAllStates();
    this.selectedDate = e;

    // Sätt dagsintervall och hämta om listan
    if (e) {
      this.start = new Date(
        e.getFullYear(),
        e.getMonth(),
        e.getDate(),
        0,
        0,
        0,
        0
      );
      this.end = new Date(
        e.getFullYear(),
        e.getMonth(),
        e.getDate(),
        23,
        59,
        59,
        999
      );

      this.refreshResources();
      this.refreshAllTypeCounts();
    }

    // Scrolla till listan på mobil
    const screenWidth = this.getCurrentScreenWidth();
    if (screenWidth < 768) {
      document.getElementById('resourceList')?.scrollIntoView();
    }
  }

  getCurrentScreenWidth() {
    return window.innerWidth;
  }

  // Bygg dygnets gränser i lokal tid (inga "Z"-strängar)
  private getLocalDayRange(d: Date) {
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return {
      start: new Date(y, m, day, 0, 0, 0, 0),
      end: new Date(y, m, day, 23, 59, 59, 999),
    };
  }

  async receiveButtonClickedFromConfirmation(e: string) {
    if (e === 'cancel') {
      this.confirmationIsVisible = false;
    } else {
      if (this.selectedDate && this.selectedResourceId) {
        const { start, end } = this.getLocalDayRange(this.selectedDate);

        // Get the actual logged-in user ID and name from Azure AD
        const currentUserId = this.authService.getUserId();
        const currentUserName = this.authService.getUserName();

        if (!currentUserId) {
          console.error('❌ Cannot create booking: User not logged in');
          return;
        }

        const newBooking: Booking = {
          userId: currentUserId, // Real Azure AD user ID
          userName: currentUserName, // Real Azure AD user name
          resourceId: this.selectedResourceId,
          startTime: start,
          endTime: end,
          status: 'Confirmed',
        };

        this.postNewBooking(newBooking);
      }
    }
  }

  postNewBooking(booking: Booking) {
    this.bookingApi.postNewBooking(booking).subscribe(
      (response) => {
        if (response.status > 201) return (this.confirmationIsVisible = false);
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

  private refreshAllTypeCounts() {
    if (!this.isBrowser || !this.start || !this.end || !this.types?.length)
      return;

    // Hämta varje typs resurser för valt datumintervall och uppdatera counts
    const localSubs = this.types.map((t) =>
      this.resourceApi.getByType(t.id, this.start!, this.end!).subscribe({
        next: (list) => {
          const all = list.length;
          const avail = list.filter((r: any) => r.isAvailable).length;
          this.types = this.types.map((x) =>
            x.id === t.id ? { ...x, countAll: all, countAvailable: avail } : x
          );
        },
        error: () => {
          this.types = this.types.map((x) =>
            x.id === t.id ? { ...x, countAll: 0, countAvailable: 0 } : x
          );
        },
      })
    );

    this.subs.push(...localSubs);
  }
}
