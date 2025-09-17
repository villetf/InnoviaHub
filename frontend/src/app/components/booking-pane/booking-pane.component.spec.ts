import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingPaneComponent } from './booking-pane.component';

describe('BookingPaneComponent', () => {
  let component: BookingPaneComponent;
  let fixture: ComponentFixture<BookingPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingPaneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
