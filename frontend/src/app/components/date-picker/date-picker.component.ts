import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
export class DatePickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select date';
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  @Input() disabled: boolean = false;
  @Output() dateChange = new EventEmitter<Date | null>();

  value: string = '';

  private onChange = (value: Date | null) => {};
  onTouched = () => {}; // Changed from private to public (removed private keyword)

  onDateInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateValue = target.value ? new Date(target.value) : null;

    this.onChange(dateValue);
    this.dateChange.emit(dateValue);
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | string | null): void {
    if (value instanceof Date) {
      this.value = value.toISOString().split('T')[0];
    } else if (typeof value === 'string') {
      this.value = value;
    } else {
      this.value = '';
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
