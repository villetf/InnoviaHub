import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResourceType } from '../ResourceMenu/Services/ResourceTypeService.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-resources-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './resources-details.component.html',
})
export class ResourcesDetailsComponent {
  @Input() types: ResourceType[] = [];
  @Input() form!: FormGroup;
  @Input() isEditing = false;

  @Output() submitForm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
