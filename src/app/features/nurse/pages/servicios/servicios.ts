import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { TipoServicio, TipoServicioCreate } from '../../../../models/cita.model';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Tipos de Servicio" />

      <!-- Header -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Gestionar Servicios</h2>
            <p class="text-sm text-gray-500">Configura los tipos de servicio que ofreces en tu consultorio</p>
          </div>
          <button (click)="openModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Servicio
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Services List -->
      @if (!loading()) {
        @if (servicios().length === 0) {
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <div class="text-center py-12">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-900">No hay servicios registrados</p>
              <p class="mt-1 text-sm text-gray-500">Crea tu primer tipo de servicio</p>
              <button (click)="openModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors mt-4">
                Nuevo Servicio
              </button>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (servicio of servicios(); track servicio.id) {
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                <div class="h-2" [style.background-color]="servicio.color"></div>
                <div class="p-5">
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-gray-900 truncate">{{ servicio.nombre }}</h3>
                        @if (!servicio.is_active) {
                          <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactivo</span>
                        }
                      </div>
                      @if (servicio.descripcion) {
                        <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ servicio.descripcion }}</p>
                      }
                    </div>
                    <div class="flex items-center gap-1 ml-2">
                      <button (click)="editServicio(servicio)" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button (click)="confirmDelete(servicio)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-2 gap-3">
                    <div class="text-center p-2 bg-gray-50 rounded-lg">
                      <p class="text-xs text-gray-500">Duracion</p>
                      <p class="font-semibold text-gray-900">{{ servicio.duracion_minutos }} min</p>
                    </div>
                    <div class="text-center p-2 bg-gray-50 rounded-lg">
                      <p class="text-xs text-gray-500">Precio</p>
                      <p class="font-semibold text-gray-900">S/ {{ servicio.precio }}</p>
                    </div>
                  </div>

                  @if (servicio.requiere_consentimiento) {
                    <div class="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Requiere consentimiento
                    </div>
                  }

                  @if (servicio.instrucciones_previas) {
                    <div class="mt-3 p-2 bg-blue-50 rounded-lg">
                      <p class="text-xs text-blue-600 font-medium">Instrucciones previas:</p>
                      <p class="text-xs text-blue-800 mt-0.5 line-clamp-2">{{ servicio.instrucciones_previas }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Modal Crear/Editar -->
    @if (showModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeModal()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">
            {{ editingServicio() ? 'Editar Servicio' : 'Nuevo Servicio' }}
          </h4>
          <form [formGroup]="servicioForm" (ngSubmit)="saveServicio()" class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Nombre *</label>
              <input type="text" formControlName="nombre" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Ej: Control CRED">
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Descripcion</label>
              <textarea formControlName="descripcion" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Descripcion del servicio..."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Duracion (minutos) *</label>
                <input type="number" formControlName="duracion_minutos" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" min="5" step="5">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Precio (S/) *</label>
                <input type="number" formControlName="precio" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" min="0" step="0.01">
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Color</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="color" class="h-11 w-14 rounded-lg border border-gray-300 cursor-pointer">
                <div class="flex flex-wrap gap-2">
                  @for (c of coloresPreset; track c) {
                    <button type="button" (click)="selectColor(c)" class="w-8 h-8 rounded-lg border-2 transition-all" [style.background-color]="c" [class.border-gray-900]="servicioForm.get('color')?.value === c" [class.border-transparent]="servicioForm.get('color')?.value !== c"></button>
                  }
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Instrucciones previas para el paciente</label>
              <textarea formControlName="instrucciones_previas" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Ej: Traer carnet de vacunacion..."></textarea>
            </div>

            <div class="flex items-center gap-2">
              <input type="checkbox" formControlName="requiere_consentimiento" id="requiere_consentimiento" class="h-4 w-4 rounded border-gray-300 text-primary-600">
              <label for="requiere_consentimiento" class="text-sm text-gray-700">Requiere consentimiento informado</label>
            </div>

            @if (error()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ error() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="servicioForm.invalid || saving()" class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (saving()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                {{ editingServicio() ? 'Guardar Cambios' : 'Crear Servicio' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminacion -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeDeleteModal()"></div>
        <div class="relative w-full max-w-[400px] rounded-3xl bg-white p-6 lg:p-8 m-5 sm:m-0">
          <div class="text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Eliminar Servicio</h3>
            <p class="mt-2 text-sm text-gray-500">
              Estas seguro de eliminar el servicio <span class="font-medium">{{ deletingServicio()?.nombre }}</span>? Esta accion no se puede deshacer.
            </p>
            <div class="mt-6 flex gap-3 justify-center">
              <button (click)="closeDeleteModal()" class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button (click)="deleteServicio()" [disabled]="deleting()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300 transition">
                @if (deleting()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
export class ServiciosComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private fb = inject(FormBuilder);

  servicios = signal<TipoServicio[]>([]);
  loading = signal(false);

  // Modal state
  showModal = signal(false);
  editingServicio = signal<TipoServicio | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  // Delete modal state
  showDeleteModal = signal(false);
  deletingServicio = signal<TipoServicio | null>(null);
  deleting = signal(false);

  coloresPreset = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1'  // Indigo
  ];

  servicioForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    duracion_minutos: [30, [Validators.required, Validators.min(5)]],
    precio: ['0.00', Validators.required],
    color: ['#10B981'],
    requiere_consentimiento: [false],
    instrucciones_previas: ['']
  });

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.loading.set(true);
    this.agendaService.getServicios().subscribe({
      next: (response: any) => {
        const servicios = Array.isArray(response) ? response : (response?.results || []);
        this.servicios.set(servicios);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading servicios:', err);
        this.loading.set(false);
      }
    });
  }

  openModal(): void {
    this.editingServicio.set(null);
    this.servicioForm.reset({
      duracion_minutos: 30,
      precio: '0.00',
      color: '#10B981',
      requiere_consentimiento: false
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  editServicio(servicio: TipoServicio): void {
    this.editingServicio.set(servicio);
    this.servicioForm.patchValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      duracion_minutos: servicio.duracion_minutos,
      precio: servicio.precio,
      color: servicio.color,
      requiere_consentimiento: servicio.requiere_consentimiento,
      instrucciones_previas: servicio.instrucciones_previas || ''
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingServicio.set(null);
  }

  selectColor(color: string): void {
    this.servicioForm.patchValue({ color });
  }

  saveServicio(): void {
    if (this.servicioForm.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const data: TipoServicioCreate = {
      nombre: this.servicioForm.value.nombre!,
      descripcion: this.servicioForm.value.descripcion || undefined,
      duracion_minutos: this.servicioForm.value.duracion_minutos!,
      precio: this.servicioForm.value.precio!.toString(),
      color: this.servicioForm.value.color || undefined,
      requiere_consentimiento: this.servicioForm.value.requiere_consentimiento || false,
      instrucciones_previas: this.servicioForm.value.instrucciones_previas || undefined
    };

    const request = this.editingServicio()
      ? this.agendaService.updateServicio(this.editingServicio()!.id, data)
      : this.agendaService.createServicio(data);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadServicios();
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail || err.error?.nombre?.[0] || 'Error al guardar el servicio');
        this.saving.set(false);
      }
    });
  }

  confirmDelete(servicio: TipoServicio): void {
    this.deletingServicio.set(servicio);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingServicio.set(null);
  }

  deleteServicio(): void {
    const servicio = this.deletingServicio();
    if (!servicio) return;

    this.deleting.set(true);
    this.agendaService.deleteServicio(servicio.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadServicios();
        this.deleting.set(false);
      },
      error: (err) => {
        console.error('Error deleting servicio:', err);
        this.deleting.set(false);
      }
    });
  }
}
