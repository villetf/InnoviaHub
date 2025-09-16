import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-azure-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container">
      <h1>🔧 Azure Entra ID Debug Panel</h1>
      
      <div class="debug-warning">
        <p><strong>⚠️ Development Mode Only</strong> - This component is for debugging Azure authentication</p>
      </div>
      
      <!-- Debug Information -->
      <div class="debug-info">
        <h3>Debug Information:</h3>
        <p><strong>Component Status:</strong> ✅ Debug Component Loaded</p>
        <p><strong>Authentication Status:</strong> {{ isAuthenticated ? '✅ Logged In' : '❌ Not Logged In' }}</p>
        <p><strong>User Name:</strong> {{ userName || 'None' }}</p>
        <p><strong>MSAL Service:</strong> {{ msalServiceStatus }}</p>
        <p><strong>Current Time:</strong> {{ currentTime }}</p>
      </div>

      <!-- Authentication Test Section -->
      <div class="auth-test-section">
        <div *ngIf="!isAuthenticated" class="login-section">
          <h2>🔐 Test Azure Login</h2>
          <button 
            type="button" 
            class="debug-login-btn"
            (click)="testLogin()">
            🚀 Test Login with Microsoft
          </button>
        </div>

        <div *ngIf="isAuthenticated" class="user-section">
          <h2>👋 Debug: Welcome, {{ userName }}!</h2>
          <button 
            type="button" 
            class="debug-logout-btn"
            (click)="testLogout()">
            🚪 Test Logout
          </button>
        </div>
      </div>

      <!-- Navigation back to main app -->
      <div class="navigation">
        <button 
          type="button" 
          class="back-btn"
          (click)="goBackToApp()">
          🔙 Back to Main App
        </button>
      </div>
    </div>
  `,
  styles: [`
    .debug-container {
      padding: 20px;
      font-family: 'Courier New', monospace;
      max-width: 800px;
      margin: 0 auto;
      background-color: #1e1e1e;
      color: #d4d4d4;
      min-height: 100vh;
    }

    .debug-warning {
      background-color: #ffcc02;
      color: #000;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: bold;
    }

    .debug-info {
      background-color: #2d2d30;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      border-left: 4px solid #007acc;
    }

    .auth-test-section {
      background-color: #252526;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .debug-login-btn, .debug-logout-btn, .back-btn {
      background-color: #007acc;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 3px;
      cursor: pointer;
      margin: 10px 5px;
      font-family: inherit;
    }

    .debug-logout-btn {
      background-color: #f14c4c;
    }

    .back-btn {
      background-color: #28a745;
    }

    .navigation {
      text-align: center;
      margin-top: 30px;
    }

    h1, h2, h3 {
      color: #ffffff;
    }
  `]
})
export class AzureDebugComponent implements OnInit {
  isAuthenticated = false;
  userName = '';
  msalServiceStatus = '';
  currentTime = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('🔧 Azure Debug Component initialized');
    this.updateCurrentTime();
    this.checkMsalService();
    this.checkAuthentication();
    
    setInterval(() => this.updateCurrentTime(), 1000);
  }

  private updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString();
  }

  private checkMsalService(): void {
    try {
      this.msalServiceStatus = this.authService.getMsalServiceStatus();
      console.log('📊 MSAL Service Status:', this.msalServiceStatus);
    } catch (error) {
      this.msalServiceStatus = '❌ Error checking MSAL';
      console.error('❌ Error checking MSAL service:', error);
    }
  }

  private checkAuthentication(): void {
    try {
      this.isAuthenticated = this.authService.isLoggedIn();
      if (this.isAuthenticated) {
        this.userName = this.authService.getUserName();
      }
      console.log('🔐 Authentication Status:', this.isAuthenticated);
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
    }
  }

  testLogin(): void {
    console.log('🔑 Debug Login clicked');
    try {
      this.authService.login();
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login error: ' + error);
    }
  }

  testLogout(): void {
    console.log('🚪 Debug Logout clicked');
    try {
      this.authService.logout();
      setTimeout(() => this.checkAuthentication(), 1000);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  goBackToApp(): void {
    // Navigate back to main app
    window.location.href = '/';
  }
}