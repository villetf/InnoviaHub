import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../components/ResourceMenu/Services/booking.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  bookings: BookingDto[] = [];
  selectedBooking: BookingDto | null = null;
  isLoading = false;
  errorMessage = '';
  
  // Joel's ändringar för rätt userinfo - Editing funktionalitet
  isEditing = false;
  editForm: any = {
    startTime: '',
    endTime: '',
    status: ''
  };
  
  // Cache user data to avoid repeated AuthService calls
  userName = '';
  userEmail = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private bookingService: BookingService
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
    this.isEditing = false; // Reset editing mode when selecting different booking
  }

  // Joel's ändringar för rätt userinfo - Redigeringsfunktionalitet
  startEdit() {
    if (!this.selectedBooking) return;
    
    this.isEditing = true;
    // Populate edit form with current booking data
    const startDate = new Date(this.selectedBooking.startTime);
    const endDate = new Date(this.selectedBooking.endTime);
    
    this.editForm = {
      startTime: this.formatDateTimeLocal(startDate),
      endTime: this.formatDateTimeLocal(endDate),
      status: this.selectedBooking.status
    };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editForm = {
      startTime: '',
      endTime: '',
      status: ''
    };
  }

  async saveEdit() {
    if (!this.selectedBooking || !this.authService.isLoggedIn()) {
      this.errorMessage = 'Du måste vara inloggad för att redigera bokningar';
      return;
    }

    const userId = this.authService.getUserId();
    const userName = this.authService.getUserName();
    
    if (!userId) {
      this.errorMessage = 'Kunde inte hämta användar-ID';
      return;
    }

    try {
      const updateDto = {
        userId: userId,
        userName: userName,
        resourceId: this.selectedBooking.resourceId,
        startTime: new Date(this.editForm.startTime).toISOString(),
        endTime: new Date(this.editForm.endTime).toISOString(),
        status: this.editForm.status
      };

      await this.bookingService.update(this.selectedBooking.id, updateDto).toPromise();
      
      // Refresh bookings list
      await this.loadUserBookings();
      this.isEditing = false;
      this.errorMessage = '';
      
      console.log('✅ Booking updated successfully');
    } catch (error) {
      console.error('❌ Fel vid uppdatering av bokning:', error);
      this.errorMessage = 'Kunde inte uppdatera bokningen';
    }
  }

  async deleteBooking() {
    if (!this.selectedBooking || !this.authService.isLoggedIn()) {
      this.errorMessage = 'Du måste vara inloggad för att radera bokningar';
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Kunde inte hämta användar-ID';
      return;
    }

    // Bekräftelse
    if (!confirm(`Är du säker på att du vill radera bokningen för ${this.selectedBooking.resourceName}?`)) {
      return;
    }

    try {
      // Use booking service with userId parameter for security
      await this.bookingService.delete(this.selectedBooking.id, userId).toPromise();
      
      // Refresh bookings list
      await this.loadUserBookings();
      this.selectedBooking = null;
      this.isEditing = false;
      this.errorMessage = '';
      
      console.log('✅ Booking deleted successfully');
    } catch (error) {
      console.error('❌ Fel vid radering av bokning:', error);
      this.errorMessage = 'Kunde inte radera bokningen';
    }
  }

  private formatDateTimeLocal(date: Date): string {
    // Format för datetime-local input: YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
