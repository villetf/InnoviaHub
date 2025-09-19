import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingpageCalendarComponent } from './bookingpage-calendar.component';

describe('BookingpageCalendarComponent', () => {
  let component: BookingpageCalendarComponent;
  let fixture: ComponentFixture<BookingpageCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingpageCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingpageCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
