import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ResourceTypeService } from '../ResourceMenu/Services/ResourceTypeService.service';
import { ResourceService } from '../ResourceMenu/Services/ResourceService.service';
import { BookingHubService } from '../ResourceMenu/Services/bookingHubService.service';

import { BookingpageMenuComponent } from '../bookingpage-menu/bookingpage-menu.component';
import { BookingpageCalendarComponent } from '../bookingpage-calendar/bookingpage-calendar.component';
import { BookingpageListComponent } from '../bookingpage-list/bookingpage-list.component';
import { AuthService } from '../../services/auth.service';
import { ResourceListItem } from '../../../types/ResourceListItem';

interface ResourceTypeDto {
  id: number;
  name: string;
}
interface ResourceTypeMenuItem {
  id: number;
  name: string;
  countAll: number;
  countAvailable: number;
}


@Component({
  selector: 'app-bookingpage-pane',
  standalone: true,
  imports: [
    CommonModule,
    BookingpageMenuComponent,
    BookingpageCalendarComponent,
    BookingpageListComponent,
  ],
  templateUrl: './bookingpage-pane.component.html',
})
export class BookingpagePaneComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  selectedDate: Date | null = null;
  selectedResourceId: number | null = null;

  types: ResourceTypeMenuItem[] = [];
  selectedTypeId?: number;
  resources: ResourceListItem[] = [];
  loading = false;
  error?: string;

  start?: Date;
  end?: Date;

  private hubRefreshBusy = false;

  constructor(
    private typeApi: ResourceTypeService,
    private resourceApi: ResourceService,
    private hub: BookingHubService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    if (!this.authService.isAdmin() && !this.authService.isUser())
      return console.error('Unauthorized');

    this.typeApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types: ResourceTypeDto[]) => {
          this.types = types.map((t) => ({
            id: t.id,
            name: t.name,
            countAll: 0,
            countAvailable: 0,
          }));
          if (this.start && this.end) this.refreshAllTypeCounts();
        },
        error: () => (this.error = 'Kunde inte hämta resurstyp-lista.'),
      });

    this.hub.start().then(() => {
      const refreshFromHub = () => {
        if (!this.selectedTypeId || !this.start || !this.end) return;

        if (this.hubRefreshBusy) return;
        this.hubRefreshBusy = true;
        setTimeout(() => (this.hubRefreshBusy = false), 250);

        this.refreshResources();
        this.refreshAllTypeCounts();
      };

      this.hub.onCreated(refreshFromHub);
      this.hub.onUpdated(refreshFromHub);
      this.hub.onDeleted(refreshFromHub);
    });
  }

  selectType(typeId: number) {
    if (this.selectedTypeId === typeId) return;
    this.selectedTypeId = typeId;
    this.refreshResources();

    if (window.innerWidth < 768) {
      if (!this.selectedTypeId) return;
      document.getElementById('calendar')?.scrollIntoView();
    }
  }

  onDaySelected(sel: { date: Date; start: Date; end: Date } | null) {
    this.selectedDate = sel?.date ?? null;

    if (sel?.date) {
      // Bygg *UTC*-dygn för API:t (matchar backend)
      const isoDate = sel.date.toISOString().split('T')[0];
      this.start = new Date(`${isoDate}T00:00:00.000Z`);
      this.end = new Date(`${isoDate}T23:59:59.999Z`);
    } else {
      this.start = undefined;
      this.end = undefined;
    }

    if (sel) {
      this.refreshResources();
      this.refreshAllTypeCounts();
    }
  }

  onBookingCommitted() {
    if (this.selectedTypeId && this.start && this.end) {
      this.refreshResources();
      this.refreshAllTypeCounts();
    }
  }

  selectResource(
    resourceId: number | null,
    _name: string | null,
    isAvailable: boolean
  ) {
    if (isAvailable === false || !resourceId) return;
    this.selectedResourceId = resourceId;
  }

  refreshResources() {
    if (!this.isBrowser || !this.selectedTypeId) return;

    this.loading = true;
    this.error = undefined;

    this.resourceApi
      .getByType(this.selectedTypeId, this.start, this.end)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list: ResourceListItem[]) => {
          this.resources = list;
          this.loading = false;
          this.updateTypeCounts();
        },
        error: () => {
          this.error = 'Kunde inte hämta resurser.';
          this.loading = false;
        },
      });
  }

  private updateTypeCounts() {
    this.types = this.types.map((t) => {
      if (t.id !== this.selectedTypeId) return t;
      const all = this.resources.length;
      const avail = this.resources.filter((r) => r.isAvailable).length;
      return { ...t, countAll: all, countAvailable: avail };
    });
  }

  private refreshAllTypeCounts() {
    if (!this.authService.isAdmin() && !this.authService.isUser())
      return console.error('Unauthorized');

    if (!this.isBrowser || !this.start || !this.end || !this.types?.length)
      return;

    this.types.forEach((t) => {
      this.resourceApi
        .getByType(t.id, this.start!, this.end!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (list: ResourceListItem[]) => {
            const all = list.length;
            const avail = list.filter((r) => r.isAvailable).length;
            this.types = this.types.map((x) =>
              x.id === t.id ? { ...x, countAll: all, countAvailable: avail } : x
            );
          },
          error: () => {
            this.types = this.types.map((x) =>
              x.id === t.id ? { ...x, countAll: 0, countAvailable: 0 } : x
            );
          },
        });
    });
  }
}
