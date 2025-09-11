import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResourceTypeMenuComponent } from './components/ResourceMenu/ResourceMenu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ResourceTypeMenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'frontend';
}
