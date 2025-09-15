import { Injectable } from '@angular/core';
import { AppConfigService } from '../../../core/app-config.service';
import { HttpClient } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BookingServiceService {
  private readonly url: string;

  constructor(private http: HttpClient, private cfg: AppConfigService) {
    // this.url = `${this.cfg.apiUrl}/api/booking`;
    this.url = `http://localhost:5184/api/booking`;
  }

  postNewBooking(booking: Booking): Observable<Booking> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.post<Booking>(this.url, booking, httpOptions);
  }
}
