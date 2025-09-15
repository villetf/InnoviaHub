import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class BookingHubService {
  private hub?: signalR.HubConnection;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async start(): Promise<void> {
    //kör bara i browser, inte under SSR
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.hub) return;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5184/hubs/bookings', {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
        //withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    await this.hub.start();
    console.log('SignalR connected');
  }

  onCreated(cb: (b: any) => void) {
    this.hub?.on('BookingCreated', cb);
  }
  onUpdated(cb: (b: any) => void) {
    this.hub?.on('BookingUpdated', cb);
  }
  onDeleted(cb: (id: number) => void) {
    this.hub?.on('BookingDeleted', cb);
  }
}
