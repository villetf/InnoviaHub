import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingpageMenuComponent } from './bookingpage-menu.component';

describe('BookingpageMenuComponent', () => {
  let component: BookingpageMenuComponent;
  let fixture: ComponentFixture<BookingpageMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingpageMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingpageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
