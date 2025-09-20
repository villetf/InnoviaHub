import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../ResourceMenu/Services/booking.service';
import { BookingRead } from '../ResourceMenu/models/booking.model';
import { BookingListComponent } from '../booking-list/booking-list.component';
import { BookingDetailComponent } from '../booking-detail/booking-detail.component';

@Component({
  selector: 'app-booking-pane',
  standalone: true,
  imports: [CommonModule, BookingListComponent, BookingDetailComponent],
  templateUrl: './booking-pane.component.html',
})
export class BookingPaneComponent implements OnInit {
  private all: BookingRead[] = [];
  items: BookingRead[] = [];
  loading = false;
  error = '';
  search = signal('');
  selectedId = signal<number | null>(null);

  constructor(private api: BookingService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.getAll().subscribe({
      next: (list) => {
        this.all = list ?? [];
        this.applyFilter();
        if (!this.selectedId() && this.items.length)
          this.selectedId.set(this.items[0].id);
      },
      error: (err) => {
        this.error = 'Kunde inte hämta bokningar';
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  handleSelect(id: number) {
    this.selectedId.set(id);
  }
  handleSaved() {
    this.load();
  }
  handleDeleted() {
    this.selectedId.set(null);
    this.load();
  }

  handleSearch(term: string) {
    this.search.set(term);
    this.applyFilter();
  }

  applyFilter() {
    const q = this.search().trim().toLowerCase();
    if (!q) {
      this.items = this.all.slice();
    } else {
      this.items = this.all.filter((b) => {
        const idMatch = String(b.id).includes(q);
        const resName = (b.resourceName || '').toLowerCase();
        const user = (b.userId || '').toLowerCase();
        return idMatch || resName.includes(q) || user.includes(q);
      });
    }

    //Om vald bokning försvann
    const sel = this.selectedId();
    if (sel != null && !this.items.some((x) => x.id == sel)) {
      this.selectedId.set(this.items.length ? this.items[0].id : null);
    }
  }
}
