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

@Component({
  selector: 'app-resource-type-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ResourceMenu.component.html',
})
export class ResourceTypeMenuComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

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
          if (this.types.length) this.selectType(this.types[0].id);
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
    this.subs.push(
      timer(60000, 60000).subscribe(() => this.refreshResources())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  selectType(typeId: number) {
    if (this.selectedTypeId === typeId) return;
    this.selectedTypeId = typeId;
    this.refreshResources();
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
}
