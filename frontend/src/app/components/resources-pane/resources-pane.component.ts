import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  ResourceService,
  CreateResourceDto,
  UpdateResourceDto,
} from '../ResourceMenu/Services/ResourceService.service';
import {
  ResourceTypeService,
  ResourceType,
} from '../ResourceMenu/Services/ResourceTypeService.service';
import { ResourceItem } from '../ResourceMenu/models/Resource';
import { ResourcesListComponent } from '../resources-list/resources-list.component';
import { ResourcesDetailsComponent } from '../resources-details/resources-details.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-resources-pane',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ResourcesListComponent,
    ResourcesDetailsComponent
],
  templateUrl: './resources-pane.component.html',
})
export class ResourcesPaneComponent implements OnInit {
  private fb = inject(FormBuilder);
  private resourceApi = inject(ResourceService);
  private typeApi = inject(ResourceTypeService);

  types: ResourceType[] = [];
  resources: ResourceItem[] = [];

  loading = false;
  error = '';
  success = '';

  selectedTypeId = signal<number | null>(null);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    ],
    resourceTypeId: [null as number | null, [Validators.required]],
  });

  isEditing = computed(() => this.editingId() !== null);

  ngOnInit(): void {
    this.loadTypes();
  }

  private showSuccess(msg: string, ms = 4000) {
    this.success = msg;
    setTimeout(() => (this.success = ''), ms);
  }

  loadTypes() {
    this.loading = true;
    this.typeApi.getAll().subscribe({
      next: (res) => {
        this.types = res ?? [];
        if (this.types.length && this.selectedTypeId() === null) {
          this.selectType(this.types[0].id);
        }
      },
      error: (err) => {
        this.error = 'Kunde inte hämta resurstyper.';
        console.error(err);
      },
    });
  }

  selectType(typeId: number) {
    this.selectedTypeId.set(typeId);
    if (!this.isEditing()) this.form.patchValue({ resourceTypeId: typeId });
    this.fetchResources();
  }

  fetchResources() {
    const t = this.selectedTypeId();
    if (!t) return;
    this.loading = true;
    this.error = '';
    this.resourceApi.getByType(t).subscribe({
      next: (list) => {
        this.resources = list ?? [];
      },
      error: (err) => {
        this.error = 'Kunde inte hämta resurser';
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // events från listan
  handleEdit(item: ResourceItem) {
    this.editingId.set(item.id);
    this.form.reset({
      name: item.name,
      resourceTypeId: item.resourceTypeId,
    });
  }

  handleDelete(item: ResourceItem) {
    if (!confirm(`Ta bort "${item.name}"?`)) return;
    this.resourceApi.delete(item.id).subscribe({
      next: () => {
        this.showSuccess(`Resurs raderad: ${item.name}`);
        this.fetchResources();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.error = 'Resursen kan inte raderas eftersom den har bokningar.';
        } else {
          this.error = 'Kunde inte radera resurs.';
        }
        console.error(err);
      },
    });
  }

  // events från details
  handleSubmit() {
    this.error = '';
    this.success = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      name: this.form.value.name!.trim(),
      resourceTypeId: Number(this.form.value.resourceTypeId),
    };

    const id = this.editingId();
    if (id) {
      this.resourceApi.update(id, payload as UpdateResourceDto).subscribe({
        next: (updated) => {
          this.showSuccess(`Resurs uppdaterad: ${updated.name}`);
          this.cancelEdit();
          this.fetchResources();
        },
        error: (err) => {
          this.error = 'Kunde inte uppdatera resurs.';
          console.error(err);
        },
      });
    } else {
      this.resourceApi.create(payload as CreateResourceDto).subscribe({
        next: (created) => {
          this.showSuccess(`Resurs skapad: ${created.name}`);
          this.form.reset({
            name: '',
            resourceTypeId: this.selectedTypeId(),
          });
          this.fetchResources();
        },
        error: (err) => {
          this.error = 'Kunde inte skapa resurs.';
          console.error(err);
        },
      });
    }
  }

  cancelEdit() {
    this.editingId.set(null);
    const t = this.selectedTypeId();
    this.form.reset({ name: '', resourceTypeId: t ?? null });
  }
}
