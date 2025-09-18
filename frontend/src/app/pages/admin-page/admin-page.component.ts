import { Component, signal } from '@angular/core';
import { NavTabsComponent } from '../../components/nav-tabs/nav-tabs.component';
import { BookingPaneComponent } from '../../components/booking-pane/booking-pane.component';
import { ResourceTypeMenuComponent } from '../../components/ResourceMenu/ResourceMenu.component';
import { ResourcesPaneComponent } from '../../components/resources-pane/resources-pane.component';

@Component({
  selector: 'app-admin-page',
  imports: [
    NavTabsComponent,
    ResourcesPaneComponent,
    BookingPaneComponent,
    ResourceTypeMenuComponent,
    ResourcesPaneComponent,
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
})
export class AdminPageComponent {
  tabs = [
    { id: 'bookings' as const, label: 'Alla bokningar' },
    { id: 'sensors' as const, label: 'Alla sensorer' },
    { id: 'resources' as const, label: 'Resurser' },
  ];
  active = signal<'bookings' | 'sensors' | 'resources'>('bookings');
  setTab(id: 'bookings' | 'sensors' | 'resources') {
    this.active.set(id);
  }
}
