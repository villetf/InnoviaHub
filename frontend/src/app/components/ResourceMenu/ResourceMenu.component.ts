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

@Component({
  selector: 'app-resource-type-menu',
  standalone: true,
  imports: [CommonModule, DatePickerComponent, ButtonComponent],
  templateUrl: './ResourceMenu.component.html',
})
export class ResourceTypeMenuComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  selectedDate: Date | null = null;
  selectedResourceId: number | null = null;

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
    private hub: BookingHubService
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

  setNowRange(hours = 1) {
    this.start = new Date();
    this.end = new Date(this.start.getTime() + hours * 3600_000);
    this.refreshResources();
  }

  selectResource(resourceId: number | null) {
    if (!resourceId) return;
    this.selectedResourceId = resourceId;

    // Scrolla ner till nästa steg(resurslista) i mobilläge
    const screenWidth = this.getCurrentScreenWidth();
    if (screenWidth < 768) {
      document.getElementById('bookButton')?.scrollIntoView();
    }
  }

  handleClickBook() {
    const screenWidth = this.getCurrentScreenWidth();
    if (screenWidth < 768) {
      if (!this.selectedTypeId) {
        document.getElementById('resourceType')?.scrollIntoView();
      } else if (!this.selectedDate) {
        document.getElementById('calendar')?.scrollIntoView();
      } else if (!this.selectedResourceId) {
        document.getElementById('resourceList')?.scrollIntoView();
      }
    }

    console.log('ResourceTypeId: ', this.selectedResourceId);
    console.log('SelectedDate: ', this.selectedDate);
  }

  receiveSelectedDateFromDatePicker(e: Date | null) {
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
}
