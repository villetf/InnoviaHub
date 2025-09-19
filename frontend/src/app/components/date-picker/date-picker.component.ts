import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatCalendarCellClassFunction,
  MatDatepickerModule,
  MatCalendar,
} from '@angular/material/datepicker';
import {
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  DateAdapter,
} from '@angular/material/core';
import { Component as NgComponent, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'sv-SE' },
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
  headerCmp = CalendarHeaderComponent;

  selected: Date | null = null;

  @ViewChild(MatCalendar) calendar?: MatCalendar<Date>;
  today = new Date();

  ngOnInit(): void {
    // Sätt dagens datum som default och skicka det till parent
    const currentDate = new Date();
    this.dateChange.emit(currentDate);

    // Visa dagens datum i UI
    this.value = currentDate.toISOString().split('T')[0];
    this.selected = currentDate;

    // Inaktivera tidigare datum
    this.minDate = currentDate.toISOString().split('T')[0];
  }

  private onChange = (value: Date | null) => {};
  onTouched = () => {};

  // När användaren väljer ett datum i mat-calendar
  onCalendarSelected(date: Date | null) {
    this.selected = date;
    // Håll value i synk
    this.value = date ? new Date(date).toISOString().split('T')[0] : '';
    this.onChange(date);
    this.dateChange.emit(date);
    this.onTouched();

    // Tvinga kalenderns "activeDate" att följa det valda datumet
    if (date && this.calendar) {
      this.calendar.activeDate = date; // FIX
      this.calendar.stateChanges.next(); // FIX: trigga omritning
    }
  }

  // konvertera sträng-inputs till mat-calendern
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

    // Om vi får nytt värde utifrån, synka även activeDate
    if (this.selected && this.calendar) {
      this.calendar.activeDate = this.selected; // FIX
      this.calendar.stateChanges.next(); // FIX
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

  // (valfritt) datum att highlighta från parent
  @Input() highlightedDates: Array<Date | string> = [];

  // Hjälpare: normalisera datum till yyyy-mm-dd för jämförelse
  private normalize(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
      .toISOString()
      .slice(0, 10);
  }
  private isHighlighted(d: Date): boolean {
    const dayStr = this.normalize(d);
    return this.highlightedDates.some((x) => {
      const asDate = typeof x === 'string' ? new Date(x) : x;
      return this.normalize(asDate) === dayStr;
    });
  }

  // Tailwind-klasser per datum (ex: helger)
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view !== 'month') return '';
    const classes: string[] = [];
    const day = cellDate.getDay();
    if (day === 0 || day === 6) classes.push('cal-weekend');
    if (this.isHighlighted(cellDate)) classes.push('cal-highlight');
    return classes.join(' ');
  };
}

/* ===================== HEADER ===================== */

@NgComponent({
  selector: 'app-calendar-header',
  standalone: true,
  template: `
<div class="cal-head__sub text-sm opacity-70 text-[#993f3b] mb-1">Välj datum</div>

<div class="cal-head__row flex items-center justify-between mb-3">
  <div>
    <!-- ÖVERST: vald dag -->
    <div class="cal-head__title text-2xl font-semibold text-heading text-[#993f3b]">
      {{ selectedLabel }}
    </div>

    <!-- UNDER: månadsetikett -->
    <div class="cal-head__month">
      {{ monthLabel }}
    </div>
  </div>

  <div class="cal-head__nav flex items-center gap-1">
    <button class="cal-nav-btn" (click)="prevMonth()" aria-label="Föregående månad">
      <span class="material-symbols-rounded">chevron_left</span>
    </button>
    <button class="cal-nav-btn" (click)="nextMonth()" aria-label="Nästa månad">
      <span class="material-symbols-rounded">chevron_right</span>
    </button>
  </div>
</div>
  `,
})
export class CalendarHeaderComponent {
  private calendar = inject<MatCalendar<Date>>(MatCalendar as any);
  private adapter = inject<DateAdapter<Date>>(DateAdapter);

  /** Rubrik: “Måndag 22 sept.” — prioritera valt datum */
  get selectedLabel(): string {
    const d =
      (this.calendar.selected as Date) ??
      this.calendar.activeDate ??
      new Date();
    return this.formatSvSelected(d);
  }

  get monthLabel(): string {
    const d = this.calendar.activeDate ?? new Date();
    return d.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
  }

  private formatSvSelected(d: Date): string {
    const days = [
      'Söndag',
      'Måndag',
      'Tisdag',
      'Onsdag',
      'Torsdag',
      'Fredag',
      'Lördag',
    ];
    const monthsShort = [
      'jan.',
      'feb.',
      'mars',
      'apr.',
      'maj',
      'juni',
      'juli',
      'aug.',
      'sept.',
      'okt.',
      'nov.',
      'dec.',
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${monthsShort[d.getMonth()]}`;
  }

  prevMonth() {
    this.calendar.activeDate = this.adapter.addCalendarMonths(
      this.calendar.activeDate,
      -1
    );
    this.calendar.stateChanges.next();
  }
  nextMonth() {
    this.calendar.activeDate = this.adapter.addCalendarMonths(
      this.calendar.activeDate,
      1
    );
    this.calendar.stateChanges.next();
  }
}
