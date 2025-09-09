import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  imports: [],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css',
})
export class MenuBarComponent {
  currentPage = signal<string>('');

  handleClick(e: any) {
    this.currentPage.set(e.target.closest('li').id);
  }
}
