import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

export interface BookingDto {
  id: number;
  userId: string;
  userName?: string;
  resourceId: number;
  resourceName: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  bookings: BookingDto[] = [];
  selectedBooking: BookingDto | null = null;
  isLoading = false;
  errorMessage = '';
  
  // Cache user data to avoid repeated AuthService calls
  userName = '';
  userEmail = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Load user data once
    this.loadUserData();
    // Load bookings
    this.loadUserBookings();
  }

  private loadUserData() {
    // Cache user data to avoid repeated AuthService calls during change detection
    this.userName = this.authService.getUserName();
    const account = this.authService.getActiveAccount();
    this.userEmail = account?.username || (account?.idTokenClaims?.['email'] as string) || 'Ingen e-post';
  }

  private async loadUserBookings() {
    console.log('📋 Loading user bookings...');
    
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Du måste vara inloggad för att se dina bokningar';
      console.log('❌ User not logged in');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Kunde inte hämta användar-ID';
      console.log('❌ No user ID found');
      return;
    }

    console.log('🆔 User ID:', userId);
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const apiUrl = (window as any).__env?.NG_APP_API_URL || 'http://localhost:5184';
      const fullUrl = `${apiUrl}/api/booking/user/${userId}`;
      console.log('🌐 Making API call to:', fullUrl);
      
      this.bookings = await this.http.get<BookingDto[]>(fullUrl).toPromise() || [];
      console.log('✅ Bookings loaded:', this.bookings);
    } catch (error) {
      console.error('❌ Fel vid hämtning av bokningar:', error);
      this.errorMessage = 'Kunde inte hämta dina bokningar';
    } finally {
      this.isLoading = false;
    }
  }

  selectBooking(booking: BookingDto) {
    this.selectedBooking = this.selectedBooking?.id === booking.id ? null : booking;
  }
}
