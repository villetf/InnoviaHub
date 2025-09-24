import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  AfterViewInit, // ← lägg till
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
export class DatePickerComponent
  implements ControlValueAccessor, OnInit, AfterViewInit
{
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

  // === HELPERS (lokal, TZ-säkra) ======================================

  // Normalisera ett datum till lokal tid kl 12:00 (noon)
  private toLocalNoon(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  }

  // Bygg YYYY-MM-DD av lokala delar (utan ISO/UTC)
  private toLocalYmd(d: Date): string {
    const pad = (n: number, len = 2) => String(n).padStart(len, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}-${m}-${day}`;
  }

  // Säker parse av 'YYYY-MM-DD' till lokal Date (midnatt lokalt) — använder noon för robusthet
  private parseYmdLocal(ymd: string): Date | null {
    if (!ymd) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!m) return null;
    const y = +m[1],
      mo = +m[2] - 1,
      d = +m[3];
    return new Date(y, mo, d, 12, 0, 0, 0);
  }

  // =====================================================================

  ngOnInit(): void {
    // Sätt endast minDate här (påverkar inte föräldern och triggar inte NG0100)
    this.minDate = this.toLocalYmd(new Date());
  }

  ngAfterViewInit(): void {
    // Första emitten sker efter första change detection för att undvika NG0100
    queueMicrotask(() => {
      const currentDate = this.toLocalNoon(new Date());
      this.selected = currentDate;
      this.value = this.toLocalYmd(currentDate);
      this.dateChange.emit(currentDate);

      if (this.calendar) {
        this.calendar.activeDate = currentDate;
        this.calendar.stateChanges.next();
      }
    });
  }

  private onChange = (value: Date | null) => {};
  onTouched = () => {};

  // När användaren väljer ett datum i mat-calendar
  onCalendarSelected(date: Date | null) {
    const safe = date ? this.toLocalNoon(date) : null;
    this.selected = safe;
    this.value = safe ? this.toLocalYmd(safe) : '';
    this.onChange(safe);
    this.dateChange.emit(safe);
    this.onTouched();

    // Håll kalenderns "activeDate" i synk med valt datum
    if (safe && this.calendar) {
      this.calendar.activeDate = safe;
      this.calendar.stateChanges.next();
    }
  }

  // konvertera sträng-inputs till mat-calendern
  get minDateAsDate(): Date | null {
    return this.parseYmdLocal(this.minDate);
  }
  get maxDateAsDate(): Date | null {
    return this.parseYmdLocal(this.maxDate);
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | string | null): void {
    if (value instanceof Date) {
      const safe = this.toLocalNoon(value);
      this.selected = safe;
      this.value = this.toLocalYmd(safe);
    } else if (typeof value === 'string' && value) {
      const parsed = this.parseYmdLocal(value);
      this.selected = parsed;
      this.value = parsed ? this.toLocalYmd(parsed) : '';
    } else {
      this.value = '';
      this.selected = null;
    }

    if (this.selected && this.calendar) {
      this.calendar.activeDate = this.selected;
      this.calendar.stateChanges.next();
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

  // normalisera till lokal YYYY-MM-DD utan ISO/UTC
  private normalize(d: Date): string {
    const localMid = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      12,
      0,
      0,
      0
    );
    return this.toLocalYmd(localMid);
  }

  private isHighlighted(d: Date): boolean {
    const dayStr = this.normalize(d);
    return this.highlightedDates.some((x) => {
      const asDate =
        typeof x === 'string' ? this.parseYmdLocal(x) ?? new Date(x) : x;
      return this.normalize(asDate) === dayStr;
    });
  }

  // CSS-klasser per datum (ex: helger)
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate: Date, view: string) => {
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
