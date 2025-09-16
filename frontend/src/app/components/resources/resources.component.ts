import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  CreateResourceDto,
  ResourceService,
  UpdateResourceDto,
} from '../ResourceMenu/Services/ResourceService.service';
import {
  ResourceType,
  ResourceTypeService,
} from '../ResourceMenu/Services/ResourceTypeService.service';
import { ResourceItem } from '../ResourceMenu/models/Resource';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})
export class ResourcesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private resourceApi = inject(ResourceService);
  private typeApi = inject(ResourceTypeService);

  types: ResourceType[] = [];
  resources: ResourceItem[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';

  // UI state
  selectedTypeId = signal<number | null>(null);
  editingId = signal<number | null>(null);

  // Form
  form = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    ],
    resourceTypeId: [null as number | null, [Validators.required]],
  });

  // Visa rätt titel på formulärknappen
  isEditing = computed(() => this.editingId() !== null);

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes() {
    this.typeApi.getAll().subscribe({
      next: (res) => {
        this.types = res ?? [];
        if (this.types.length && this.selectedTypeId() === null) {
          // välj första typ automatiskt
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
    // sätt formets typ om vi skapar ny
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
        this.resources = list;
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

  submit() {
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
      // UPDATE
      this.resourceApi.update(id, payload as UpdateResourceDto).subscribe({
        next: (updated) => {
          this.success = `Resurs uppdaterad: ${updated.name}`;
          this.cancelEdit();
          this.fetchResources();
        },
        error: (err) => {
          this.error = 'Kunde inte uppdatera resurs.';
          console.error(err);
        },
      });
    } else {
      // CREATE
      this.resourceApi.create(payload as CreateResourceDto).subscribe({
        next: (created) => {
          this.success = `Resurs skapad: ${created.name}`;
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

  startEdit(item: ResourceItem) {
    this.editingId.set(item.id);
    this.form.reset({
      name: item.name,
      resourceTypeId: item.resourceTypeId,
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    // nollställ form men behåll vald typ
    const t = this.selectedTypeId();
    this.form.reset({ name: '', resourceTypeId: t ?? null });
  }

  delete(item: ResourceItem) {
    if (!confirm(`Ta bort "${item.name}"?`)) return;
    this.resourceApi.delete(item.id).subscribe({
      next: () => {
        this.success = `Resurs raderad: ${item.name}`;
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
}
