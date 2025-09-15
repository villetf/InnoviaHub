import { Component, Input, input, OnInit, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-booking-confirmation-popup',
  imports: [ButtonComponent],
  templateUrl: './booking-confirmation-popup.component.html',
  styleUrl: './booking-confirmation-popup.component.css',
})
export class BookingConfirmationPopupComponent implements OnInit {
  @Input() selectedDate: Date | null = null;
  buttonClicked = output<string>();
  localDate: string | undefined = '';

  ngOnInit(): void {
    this.localDate = this.selectedDate?.toLocaleDateString();
  }

  handleCancelClick() {
    this.buttonClicked.emit('cancel');
  }
  handleBookClick() {
    this.buttonClicked.emit('confirm');
  }
}
