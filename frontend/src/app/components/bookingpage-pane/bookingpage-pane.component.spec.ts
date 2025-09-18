import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingpagePaneComponent } from './bookingpage-pane.component';

describe('BookingpagePaneComponent', () => {
  let component: BookingpagePaneComponent;
  let fixture: ComponentFixture<BookingpagePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingpagePaneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingpagePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
