import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from '../date-picker/date-picker.component';

type DaySelection = { date: Date; start: Date; end: Date };

@Component({
  selector: 'app-bookingpage-calendar',
  standalone: true,
  imports: [CommonModule, DatePickerComponent],
  templateUrl: './bookingpage-calendar.component.html',
})
export class BookingpageCalendarComponent {
  @Output() daySelected = new EventEmitter<DaySelection | null>();

  onDateChange(e: Date | null) {
    if (!e) {
      this.daySelected.emit(null);
      return;
    }

    const y = e.getFullYear();
    const m = e.getMonth();
    const d = e.getDate();

    const start = new Date(y, m, d, 0, 0, 0, 0);
    const end = new Date(y, m, d, 23, 59, 59, 999);

    this.daySelected.emit({ date: e, start, end });
  }
}
