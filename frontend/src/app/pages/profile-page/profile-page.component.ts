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
    bookingDate: '',
    status: '',
    // Behåll ursprungliga tider för referens
    originalStartTime: '',
    originalEndTime: ''
  };
  
  // Joel's ändringar - Inaktivera tidigare datum på kalendern
  minDate = '';
  
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
    
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Du måste vara inloggad för att se dina bokningar';
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'Kunde inte hämta användar-ID';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const apiUrl = (window as any).__env?.NG_APP_API_URL || 'http://localhost:5184';
      const fullUrl = `${apiUrl}/api/booking/user/${userId}`;
      
      this.bookings = await this.http.get<BookingDto[]>(fullUrl).toPromise() || [];
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
    
    // Joel's ändringar - Sätt minsta datum till idag för att förhindra tidigare datum
    const today = new Date();
    this.minDate = this.formatDateOnly(today);
    
    // Extrahera endast datum för redigering, behåll tider som de är
    this.editForm = {
      bookingDate: this.formatDateOnly(startDate),
      status: this.selectedBooking.status,
      originalStartTime: this.selectedBooking.startTime,
      originalEndTime: this.selectedBooking.endTime
    };
    
  }

  cancelEdit() {
    this.isEditing = false;
    this.editForm = {
      bookingDate: '',
      status: '',
      originalStartTime: '',
      originalEndTime: ''
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

    // Joel's ändringar - Validering av datum och tid
    const startTime = new Date(this.editForm.startTime);
    const endTime = new Date(this.editForm.endTime);
    const now = new Date();

    if (startTime < now) {
      this.errorMessage = 'Starttiden kan inte vara i det förflutna';
      return;
    }

    if (endTime <= startTime) {
      this.errorMessage = 'Sluttiden måste vara efter starttiden';
      return;
    }

    try {
      // Joel's ändringar - Debug information
      
      // Joel's ändringar - Kombinera nytt datum med bevarade tider
      const originalStartTime = new Date(this.editForm.originalStartTime);
      const originalEndTime = new Date(this.editForm.originalEndTime);
      
      
      // Joel's fix - Skapa datum från bookingDate-strängen och sätt rätt tid
      const dateParts = this.editForm.bookingDate.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JavaScript månader är 0-indexerade
      const day = parseInt(dateParts[2]);
      
      // Skapa nya starttid med rätt datum
      const newStartTime = new Date(year, month, day, 
        originalStartTime.getHours(), 
        originalStartTime.getMinutes(), 
        originalStartTime.getSeconds(),
        originalStartTime.getMilliseconds());
      
      // Joel's fix - Beräkna dagsskillnad korrekt
      // Kontrollera om sluttiden är nästa dag genom att jämföra datum-delen
      const startDateOnly = new Date(originalStartTime.getFullYear(), originalStartTime.getMonth(), originalStartTime.getDate());
      const endDateOnly = new Date(originalEndTime.getFullYear(), originalEndTime.getMonth(), originalEndTime.getDate());
      const originalDayDiff = Math.round((endDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24));
      
      // Skapa nya sluttid - lägg till dagsskillnaden om den finns
      const newEndTime = new Date(year, month, day + originalDayDiff, 
        originalEndTime.getHours(), 
        originalEndTime.getMinutes(), 
        originalEndTime.getSeconds(),
        originalEndTime.getMilliseconds());
      

      const updateDto = {
        userId: userId,
        userName: userName,
        resourceId: this.selectedBooking.resourceId,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        status: this.editForm.status
      };


      await this.bookingService.update(this.selectedBooking.id, updateDto).toPromise();
      
      // Refresh bookings list
      await this.loadUserBookings();
      this.isEditing = false;
      this.errorMessage = '';
      
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
      
    } catch (error) {
      console.error('❌ Fel vid radering av bokning:', error);
      this.errorMessage = 'Kunde inte radera bokningen';
    }
  }

  // Joel's ändringar - Hantera starttidsändring för att uppdatera sluttid minimum
  onStartTimeChange() {
    if (this.editForm.startTime && this.editForm.endTime) {
      const startTime = new Date(this.editForm.startTime);
      const endTime = new Date(this.editForm.endTime);
      
      // Om sluttiden är före eller samma som starttiden, sätt sluttiden till en timme efter starttiden
      if (endTime <= startTime) {
        const newEndTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Lägg till 1 timme
        this.editForm.endTime = this.formatDateTimeLocal(newEndTime);
      }
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

  // Joel's ändringar - Helper metod för endast datum formatering
  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}
