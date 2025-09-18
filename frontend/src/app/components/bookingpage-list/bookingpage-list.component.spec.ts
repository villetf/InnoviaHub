import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingpageListComponent } from './bookingpage-list.component';

describe('BookingpageListComponent', () => {
  let component: BookingpageListComponent;
  let fixture: ComponentFixture<BookingpageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingpageListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingpageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
