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
import { BookingpageMenuComponent } from '../bookingpage-menu/bookingpage-menu.component';
import { BookingpageCalendarComponent } from '../bookingpage-calendar/bookingpage-calendar.component';
import { BookingpageListComponent } from '../bookingpage-list/bookingpage-list.component';

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
interface ResourceListItem {
  id: number;
  name: string;
  isAvailable: boolean;
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
export class BookingpagePaneComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
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

  private subs: Subscription[] = [];

  constructor(
    private typeApi: ResourceTypeService,
    private resourceApi: ResourceService,
    private hub: BookingHubService
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.subs.push(
      this.typeApi.getAll().subscribe({
        next: (types: ResourceTypeDto[]) => {
          this.types = types.map((t) => ({
            id: t.id,
            name: t.name,
            countAll: 0,
            countAvailable: 0,
          }));
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

    if (window.innerWidth < 768) {
      document.getElementById('calendar')?.scrollIntoView();
    }
  }

  // Ny handler: tar emot färdigberäknat dagsintervall från kalendern
  onDaySelected(sel: { date: Date; start: Date; end: Date } | null) {
    this.selectedDate = sel?.date ?? null;
    this.start = sel?.start;
    this.end = sel?.end;

    if (sel) {
      this.refreshResources();
      this.refreshAllTypeCounts();
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
          next: (list: ResourceListItem[]) => {
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
      const avail = this.resources.filter((r) => r.isAvailable).length;
      return { ...t, countAll: all, countAvailable: avail };
    });
  }

  selectResource(
    resourceId: number | null,
    _name: string | null,
    isAvailable: boolean
  ) {
    if (isAvailable === false) return;
    if (!resourceId) return;

    this.selectedResourceId = resourceId;

    if (window.innerWidth < 768) {
      document.getElementById('bookButton')?.scrollIntoView();
    }
  }

  private refreshAllTypeCounts() {
    if (!this.isBrowser || !this.start || !this.end || !this.types?.length)
      return;

    const localSubs = this.types.map((t) =>
      this.resourceApi.getByType(t.id, this.start!, this.end!).subscribe({
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
      })
    );

    this.subs.push(...localSubs);
  }
}
