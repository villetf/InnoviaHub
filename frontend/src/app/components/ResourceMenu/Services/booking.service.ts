import { Injectable } from '@angular/core';
import { AppConfigService } from '../../../core/app-config.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Booking } from '../models/booking.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly url: string;

  constructor(private http: HttpClient, private cfg: AppConfigService) {
    this.url = `${this.cfg.apiUrl}/api/booking`;
    // this.url = `http://172.162.241.249:5184/api/booking`;
  }

  postNewBooking(booking: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as const,
    };

    return this.http.post<any>(this.url, booking, httpOptions).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
