import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, output, Output } from '@angular/core';
import { BookingRead } from '../ResourceMenu/models/booking.model';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css',
})
export class BookingListComponent {
  @Input() items: BookingRead[] = [];
  @Input() selectedId: number | null = null;
  @Input() loading: boolean = false;
  @Input() error: string = '';

  bookingSelected = output<number>();

  shortGuid(guid: string) {
    return guid?.length > 10 ? `${guid.slice(0, 8)}…${guid.slice(-4)}` : guid;
  }
}
