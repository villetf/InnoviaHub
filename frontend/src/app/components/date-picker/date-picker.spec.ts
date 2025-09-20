import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';
import { beforeEach, describe, it } from 'node:test';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit dateChange when date is selected', () => {
    spyOn(component.dateChange, 'emit');
    const input = fixture.nativeElement.querySelector('input');
    const testDate = '2024-12-25';

    input.value = testDate;
    input.dispatchEvent(new Event('input'));

    expect(component.dateChange.emit).toHaveBeenCalledWith(new Date(testDate));
  });
});
