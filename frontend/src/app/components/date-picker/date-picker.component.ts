import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select date';
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  @Input() disabled: boolean = false;
  @Output() dateChange = new EventEmitter<Date | null>();

  value: string = '';

  selected: Date | null = null;

  ngOnInit(): void {
    // Sätt dagens datum som default och skicka det till ResourceMenu-komponenten
    const currentDate = new Date();
    this.dateChange.emit(currentDate);

    // Sätt dagens datum som default och visa i UI
    this.value = currentDate.toISOString().split('T')[0];

    this.selected = currentDate;

    // Inaktivera tidigare datum
    this.minDate = currentDate.toISOString().split('T')[0];
  }

  private onChange = (value: Date | null) => {};
  onTouched = () => {}; // Changed from private to public (removed private keyword)

  /*onDateInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateValue = target.value ? new Date(target.value) : null;
    // this.dateValue = target.value ? new Date(target.value) : null;

    this.onChange(dateValue);
    this.dateChange.emit(dateValue);
    this.onTouched();
  }*/

  onCalendarSelected(date: Date | null) {
    this.selected = date;
    //Håll value i synk
    this.value = date ? new Date(date).toISOString().split('T')[0] : '';
    this.onChange(date);
    this.dateChange.emit(date);
    this.onTouched();
  }

  //konvertera sträng-inputs till mat-calendern
  get minDateAsDate(): Date | null {
    return this.minDate ? new Date(this.minDate) : null;
  }

  get maxDateAsDate(): Date | null {
    return this.maxDate ? new Date(this.maxDate) : null;
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | string | null): void {
    if (value instanceof Date) {
      this.selected = value;
      this.value = value.toISOString().split('T')[0];
    } else if (typeof value === 'string' && value) {
      this.value = value;
      this.selected = new Date(value);
    } else {
      this.value = '';
      this.selected = null;
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
