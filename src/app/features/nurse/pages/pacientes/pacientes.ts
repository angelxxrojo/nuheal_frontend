import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacientesService, PacientesQueryParams } from '../../services/pacientes.service';
import { Paciente, PacienteCreate, PacienteStats } from '../../../../models/paciente.model';
import { TipoDocumento, Sexo } from '../../../../models/common.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Pacientes</h1>
          <p class="mt-1 text-sm text-gray-500">Gestiona tu lista de pacientes</p>
        </div>
        <button
          (click)="openCreateModal()"
          class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Paciente
        </button>
      </div>

      <!-- Stats Cards -->
      @if (stats()) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="card card-body">
            <p class="text-sm text-gray-500">Total Pacientes</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats()!.total }}</p>
          </div>
          <div class="card card-body">
            <p class="text-sm text-gray-500">Masculinos</p>
            <p class="text-2xl font-semibold text-blue-600">{{ stats()!.by_sex.masculino }}</p>
          </div>
          <div class="card card-body">
            <p class="text-sm text-gray-500">Femeninos</p>
            <p class="text-2xl font-semibold text-pink-600">{{ stats()!.by_sex.femenino }}</p>
          </div>
          <div class="card card-body">
            <p class="text-sm text-gray-500">Menores de 5 años</p>
            <p class="text-2xl font-semibold text-primary-600">{{ stats()!.by_age['0-5'] || 0 }}</p>
          </div>
        </div>
      }

      <!-- Search and Filters -->
      <div class="card card-body">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              class="form-input w-full">
          </div>
          <div class="flex gap-2">
            <select
              [(ngModel)]="filterSexo"
              (ngModelChange)="loadPacientes()"
              class="form-input">
              <option value="">Todos los sexos</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="spinner spinner-lg"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="alert alert-danger">
          {{ error() }}
          <button (click)="loadPacientes()" class="ml-2 underline">Reintentar</button>
        </div>
      }

      <!-- Pacientes Table -->
      @if (!loading() && !error()) {
        @if (pacientes().length === 0) {
          <div class="card card-body">
            <div class="empty-state">
              <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p class="empty-state-title">No hay pacientes</p>
              <p class="empty-state-description">Comienza agregando tu primer paciente</p>
              <button (click)="openCreateModal()" class="btn btn-primary mt-4">
                Agregar Paciente
              </button>
            </div>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Documento</th>
                  <th>Edad</th>
                  <th>Sexo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (paciente of pacientes(); track paciente.id) {
                  <tr>
                    <td>
                      <div class="flex items-center">
                        <div class="avatar avatar-md bg-primary-100 text-primary-700 mr-3">
                          {{ getInitials(paciente) }}
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">{{ paciente.nombre_completo }}</div>
                          <div class="text-sm text-gray-500">{{ paciente.email || 'Sin email' }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-gray">{{ paciente.tipo_documento_display || paciente.tipo_documento | uppercase }}</span>
                      {{ paciente.numero_documento }}
                    </td>
                    <td>{{ paciente.edad_texto }}</td>
                    <td>
                      <span [class]="paciente.sexo === 'M' ? 'badge badge-info' : 'badge badge-primary'">
                        {{ paciente.sexo_display || (paciente.sexo === 'M' ? 'Masculino' : 'Femenino') }}
                      </span>
                    </td>
                    <td>{{ paciente.telefono || '-' }}</td>
                    <td>
                      <span [class]="paciente.is_active ? 'badge badge-success' : 'badge badge-danger'">
                        {{ paciente.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <a
                          [routerLink]="['/nurse/pacientes', paciente.id]"
                          class="btn btn-ghost btn-sm"
                          title="Ver detalle">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <button
                          (click)="openEditModal(paciente)"
                          class="btn btn-ghost btn-sm"
                          title="Editar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          (click)="confirmDelete(paciente)"
                          class="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                          title="Eliminar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between mt-4">
              <p class="text-sm text-gray-500">
                Mostrando {{ pacientes().length }} de {{ totalCount() }} pacientes
              </p>
              <div class="flex gap-2">
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="btn btn-secondary btn-sm">
                  Anterior
                </button>
                <span class="px-3 py-1 text-sm text-gray-700">
                  Página {{ currentPage() }} de {{ totalPages() }}
                </span>
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="btn btn-secondary btn-sm">
                  Siguiente
                </button>
              </div>
            </div>
          }
        }
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ editingPaciente() ? 'Editar Paciente' : 'Nuevo Paciente' }}
            </h2>
          </div>
          <form [formGroup]="pacienteForm" (ngSubmit)="savePaciente()" class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Tipo Documento -->
              <div>
                <label class="form-label">Tipo de Documento *</label>
                <select formControlName="tipo_documento" class="form-input">
                  <option value="dni">DNI</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <!-- Número Documento -->
              <div>
                <label class="form-label">Número de Documento *</label>
                <input type="text" formControlName="numero_documento" class="form-input">
                @if (pacienteForm.get('numero_documento')?.touched && pacienteForm.get('numero_documento')?.errors) {
                  <p class="form-error">El número de documento es requerido</p>
                }
              </div>

              <!-- Nombres -->
              <div>
                <label class="form-label">Nombres *</label>
                <input type="text" formControlName="nombres" class="form-input">
                @if (pacienteForm.get('nombres')?.touched && pacienteForm.get('nombres')?.errors) {
                  <p class="form-error">Los nombres son requeridos</p>
                }
              </div>

              <!-- Apellido Paterno -->
              <div>
                <label class="form-label">Apellido Paterno *</label>
                <input type="text" formControlName="apellido_paterno" class="form-input">
                @if (pacienteForm.get('apellido_paterno')?.touched && pacienteForm.get('apellido_paterno')?.errors) {
                  <p class="form-error">El apellido paterno es requerido</p>
                }
              </div>

              <!-- Apellido Materno -->
              <div>
                <label class="form-label">Apellido Materno</label>
                <input type="text" formControlName="apellido_materno" class="form-input">
              </div>

              <!-- Fecha Nacimiento -->
              <div>
                <label class="form-label">Fecha de Nacimiento *</label>
                <input type="date" formControlName="fecha_nacimiento" class="form-input">
                @if (pacienteForm.get('fecha_nacimiento')?.touched && pacienteForm.get('fecha_nacimiento')?.errors) {
                  <p class="form-error">La fecha de nacimiento es requerida</p>
                }
              </div>

              <!-- Sexo -->
              <div>
                <label class="form-label">Sexo *</label>
                <select formControlName="sexo" class="form-input">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <!-- Lugar de Nacimiento -->
              <div>
                <label class="form-label">Lugar de Nacimiento</label>
                <input type="text" formControlName="lugar_nacimiento" class="form-input">
              </div>

              <!-- Teléfono -->
              <div>
                <label class="form-label">Teléfono</label>
                <input type="tel" formControlName="telefono" class="form-input">
              </div>

              <!-- Email -->
              <div>
                <label class="form-label">Email</label>
                <input type="email" formControlName="email" class="form-input">
              </div>

              <!-- Dirección -->
              <div class="md:col-span-2">
                <label class="form-label">Dirección</label>
                <input type="text" formControlName="direccion" class="form-input">
              </div>

              <!-- Distrito -->
              <div>
                <label class="form-label">Distrito</label>
                <input type="text" formControlName="distrito" class="form-input">
              </div>

              <!-- Provincia -->
              <div>
                <label class="form-label">Provincia</label>
                <input type="text" formControlName="provincia" class="form-input">
              </div>

              <!-- Departamento -->
              <div>
                <label class="form-label">Departamento</label>
                <input type="text" formControlName="departamento" class="form-input">
              </div>

              <!-- Observaciones -->
              <div class="md:col-span-2">
                <label class="form-label">Observaciones</label>
                <textarea formControlName="observaciones" rows="3" class="form-input"></textarea>
              </div>
            </div>

            @if (formError()) {
              <div class="alert alert-danger">{{ formError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="pacienteForm.invalid || saving()"
                class="btn btn-primary">
                @if (saving()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                {{ editingPaciente() ? 'Guardar Cambios' : 'Crear Paciente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md animate-slideIn">
          <div class="p-6">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-center text-gray-900">Eliminar Paciente</h3>
            <p class="mt-2 text-sm text-center text-gray-500">
              ¿Estás seguro de que deseas eliminar a <strong>{{ deletingPaciente()?.nombre_completo }}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div class="flex gap-3 mt-6">
              <button (click)="closeDeleteModal()" class="btn btn-secondary flex-1">
                Cancelar
              </button>
              <button
                (click)="deletePaciente()"
                [disabled]="deleting()"
                class="btn btn-danger flex-1">
                @if (deleting()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class PacientesComponent implements OnInit {
  private pacientesService = inject(PacientesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private searchSubject = new Subject<string>();

  // List state
  pacientes = signal<Paciente[]>([]);
  stats = signal<PacienteStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);

  // Filters
  searchTerm = '';
  filterSexo = '';

  // Modal state
  showModal = signal(false);
  editingPaciente = signal<Paciente | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  // Delete modal state
  showDeleteModal = signal(false);
  deletingPaciente = signal<Paciente | null>(null);
  deleting = signal(false);

  pacienteForm = this.fb.group({
    tipo_documento: ['dni' as TipoDocumento, Validators.required],
    numero_documento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellido_paterno: ['', Validators.required],
    apellido_materno: [''],
    fecha_nacimiento: ['', Validators.required],
    sexo: ['M' as Sexo, Validators.required],
    lugar_nacimiento: [''],
    direccion: [''],
    distrito: [''],
    provincia: [''],
    departamento: [''],
    telefono: [''],
    email: [''],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.loadPacientes();
    this.loadStats();

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage.set(1);
      this.loadPacientes();
    });
  }

  loadPacientes(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: PacientesQueryParams = {
      page: this.currentPage(),
      page_size: 10
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    if (this.filterSexo) {
      params.sexo = this.filterSexo;
    }

    this.pacientesService.getAll(params).subscribe({
      next: (response) => {
        this.pacientes.set(response.results);
        this.totalPages.set(response.total_pages);
        this.totalCount.set(response.count);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los pacientes');
        this.loading.set(false);
        console.error('Error loading pacientes:', err);
      }
    });
  }

  loadStats(): void {
    this.pacientesService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPacientes();
    }
  }

  getInitials(paciente: Paciente): string {
    const first = paciente.nombres?.charAt(0) || '';
    const last = paciente.apellido_paterno?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  openCreateModal(): void {
    this.editingPaciente.set(null);
    this.pacienteForm.reset({
      tipo_documento: 'dni',
      sexo: 'M'
    });
    this.formError.set(null);
    this.showModal.set(true);
  }

  openEditModal(paciente: Paciente): void {
    this.editingPaciente.set(paciente);
    this.pacienteForm.patchValue({
      tipo_documento: paciente.tipo_documento,
      numero_documento: paciente.numero_documento,
      nombres: paciente.nombres,
      apellido_paterno: paciente.apellido_paterno,
      apellido_materno: paciente.apellido_materno || '',
      fecha_nacimiento: paciente.fecha_nacimiento,
      sexo: paciente.sexo,
      lugar_nacimiento: paciente.lugar_nacimiento || '',
      direccion: paciente.direccion || '',
      distrito: paciente.distrito || '',
      provincia: paciente.provincia || '',
      departamento: paciente.departamento || '',
      telefono: paciente.telefono || '',
      email: paciente.email || '',
      observaciones: paciente.observaciones || ''
    });
    this.formError.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingPaciente.set(null);
  }

  savePaciente(): void {
    if (this.pacienteForm.invalid) return;

    this.saving.set(true);
    this.formError.set(null);

    const data = this.pacienteForm.value as PacienteCreate;

    const request = this.editingPaciente()
      ? this.pacientesService.update(this.editingPaciente()!.id, data)
      : this.pacientesService.create(data);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadPacientes();
        this.loadStats();
        this.saving.set(false);
      },
      error: (err) => {
        this.formError.set(err.error?.detail || 'Error al guardar el paciente');
        this.saving.set(false);
      }
    });
  }

  confirmDelete(paciente: Paciente): void {
    this.deletingPaciente.set(paciente);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingPaciente.set(null);
  }

  deletePaciente(): void {
    const paciente = this.deletingPaciente();
    if (!paciente) return;

    this.deleting.set(true);

    this.pacientesService.delete(paciente.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadPacientes();
        this.loadStats();
        this.deleting.set(false);
      },
      error: (err) => {
        console.error('Error deleting paciente:', err);
        this.deleting.set(false);
      }
    });
  }
}
