import { Component, Input, input, OnInit, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-confirmation-popup',
  imports: [ButtonComponent, RouterLink],
  templateUrl: './booking-confirmation-popup.component.html',
  styleUrl: './booking-confirmation-popup.component.css',
})
export class BookingConfirmationPopupComponent implements OnInit {
  @Input() selectedDate: Date | null = null;
  @Input() selectedResourceName: string | null = null;
  @Input() bookingIsConfirmed: boolean = false;

  buttonClicked = output<string>();
  localDate: string | undefined = '';

  ngOnInit(): void {
   this.selectedDate = typeof this.selectedDate === 'string' ? new Date(this.selectedDate) : this.selectedDate;
   this.localDate = this.selectedDate?.toLocaleDateString();
  }

  handleCancelClick() {
    this.buttonClicked.emit('cancel');
  }
  handleBookClick() {
    this.buttonClicked.emit('confirm');
  }
}
