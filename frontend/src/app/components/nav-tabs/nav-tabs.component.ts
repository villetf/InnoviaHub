import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AdminTabId = 'bookings' | 'sensors' | 'resources';
export type AdminTab = {
  id: AdminTabId;
  label: string;
  countAvailable?: number;
  countAll?: number;
};

@Component({
  selector: 'app-nav-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-tabs.component.html',
  styleUrl: './nav-tabs.component.css',
})
export class NavTabsComponent {
  @Input({ required: true }) tabs!: AdminTab[];
  @Input({ required: true }) activeId!: AdminTabId;
  @Output() changeTab = new EventEmitter<AdminTabId>();
}
