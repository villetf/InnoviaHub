import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from '../date-picker/date-picker.component';

@Component({
  selector: 'app-bookingpage-calendar',
  standalone: true,
  imports: [CommonModule, DatePickerComponent],
  templateUrl: './bookingpage-calendar.component.html',
})
export class BookingpageCalendarComponent {
  @Output() dateSelected = new EventEmitter<Date | null>();
}
