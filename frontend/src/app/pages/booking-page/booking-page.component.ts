import { Component } from '@angular/core';
import { ResourceTypeMenuComponent } from '../../components/ResourceMenu/ResourceMenu.component';
import { DatePickerComponent } from '../../components/date-picker/date-picker.component';

@Component({
  selector: 'app-booking-page',
  imports: [ResourceTypeMenuComponent, DatePickerComponent],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.css',
})
export class BookingPageComponent {}
