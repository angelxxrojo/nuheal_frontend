import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { DocumentosService } from '../../services/documentos.service';
import { PacientesService } from '../../services/pacientes.service';
import { PlantillaConsentimiento, Consentimiento, ConsentimientoCreate } from '../../../../models/documento.model';
import { Paciente } from '../../../../models/paciente.model';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Documentos" />

      <!-- Header -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Consentimientos Informados</h2>
            <p class="text-sm text-gray-500">Genera y gestiona los consentimientos de tus pacientes</p>
          </div>
          <button (click)="openModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Consentimiento
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Lista de Consentimientos -->
      @if (!loading()) {
        @if (consentimientos().length === 0) {
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <div class="text-center py-12">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-900">No hay consentimientos registrados</p>
              <p class="mt-1 text-sm text-gray-500">Genera tu primer consentimiento informado</p>
              <button (click)="openModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors mt-4">
                Nuevo Consentimiento
              </button>
            </div>
          </div>
        } @else {
          <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedimiento</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (cons of consentimientos(); track cons.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ formatDate(cons.fecha_firma) }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">
                        <p class="font-medium">{{ cons.paciente_nombre }}</p>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">
                        {{ cons.tipo_procedimiento }}
                        @if (cons.plantilla_nombre) {
                          <p class="text-xs text-gray-500">{{ cons.plantilla_nombre }}</p>
                        }
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500">
                        {{ cons.responsable_nombre }}
                        <p class="text-xs">{{ cons.responsable_parentesco }}</p>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end gap-1">
                          <button (click)="viewConsentimiento(cons)" class="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Ver">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </button>
                          <button (click)="downloadPdf(cons)" class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Descargar PDF">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          </button>
                          <button (click)="confirmDelete(cons)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        }
      }
    </div>

    <!-- Modal Crear Consentimiento -->
    @if (showModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeModal()"></div>
        <div class="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Nuevo Consentimiento</h4>

          <form [formGroup]="form" (ngSubmit)="saveConsentimiento()" class="space-y-5">
            <!-- Buscar Paciente -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="pacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onPacienteSearch($event)"
                    placeholder="Buscar por nombre o documento..."
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                  >
                  @if (searching()) {
                    <div class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }
                  @if (searchResults().length > 0) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (p of searchResults(); track p.id) {
                        <button type="button" (click)="selectPaciente(p)" class="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <p class="text-sm font-medium text-gray-900">{{ p.nombre_completo }}</p>
                          <p class="text-xs text-gray-500">{{ p.numero_documento }} • {{ p.edad_texto }}</p>
                        </button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="flex items-center justify-between p-3 bg-brand-50 border border-brand-200 rounded-lg">
                  <div>
                    <p class="text-sm font-medium text-brand-900">{{ selectedPaciente()!.nombre_completo }}</p>
                    <p class="text-xs text-brand-700">{{ selectedPaciente()!.numero_documento }} • {{ selectedPaciente()!.edad_texto }}</p>
                  </div>
                  <button type="button" (click)="clearPaciente()" class="text-brand-500 hover:text-brand-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <!-- Plantilla -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Plantilla *</label>
              @if (loadingPlantillas()) {
                <div class="h-11 flex items-center px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span class="text-sm text-gray-500">Cargando plantillas...</span>
                </div>
              } @else {
                <select formControlName="plantilla_id" (change)="onPlantillaChange()" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                  <option value="">Seleccionar plantilla...</option>
                  @for (p of plantillas(); track p.id) {
                    <option [value]="p.id" [disabled]="!isPlantillaActiva(p)">{{ p.nombre }}{{ !isPlantillaActiva(p) ? ' (Inactiva)' : '' }}</option>
                  }
                </select>
              }
            </div>

            <!-- Tipo de procedimiento -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de procedimiento *</label>
              <input type="text" formControlName="tipo_procedimiento" placeholder="Ej: Aplicación de vacuna BCG"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>

            <!-- Responsable -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Nombre del responsable *</label>
                <input type="text" formControlName="responsable_nombre"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">DNI del responsable *</label>
                <input type="text" formControlName="responsable_dni" maxlength="8"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Parentesco *</label>
              <select formControlName="responsable_parentesco" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                <option value="">Seleccionar...</option>
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Abuelo/a">Abuelo/a</option>
                <option value="Tío/a">Tío/a</option>
                <option value="Hermano/a">Hermano/a</option>
                <option value="Tutor legal">Tutor legal</option>
                <option value="Paciente">Paciente (mayor de edad)</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <!-- Contenido -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Contenido del consentimiento *</label>
              <textarea formControlName="contenido" rows="5"
                        class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
              <p class="mt-1 text-xs text-gray-500">Puede editar el texto según sea necesario</p>
            </div>

            @if (error()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ error() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button type="button" (click)="closeModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="form.invalid || !selectedPaciente() || saving()" class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (saving()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Generar Consentimiento
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Ver Consentimiento -->
    @if (showViewModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeViewModal()"></div>
        <div class="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeViewModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Detalle del Consentimiento</h4>

          @if (viewingConsentimiento()) {
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p class="text-xs text-gray-500">Paciente</p>
                  <p class="font-medium text-gray-900">{{ viewingConsentimiento()!.paciente_nombre }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Fecha</p>
                  <p class="font-medium text-gray-900">{{ formatDate(viewingConsentimiento()!.fecha_firma) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Procedimiento</p>
                  <p class="font-medium text-gray-900">{{ viewingConsentimiento()!.tipo_procedimiento }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Responsable</p>
                  <p class="font-medium text-gray-900">{{ viewingConsentimiento()!.responsable_nombre }}</p>
                  <p class="text-xs text-gray-500">DNI: {{ viewingConsentimiento()!.responsable_dni }} ({{ viewingConsentimiento()!.responsable_parentesco }})</p>
                </div>
              </div>

              <div>
                <p class="text-xs text-gray-500 mb-2">Contenido</p>
                <div class="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {{ viewingConsentimiento()!.contenido }}
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button (click)="downloadPdf(viewingConsentimiento()!)" class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Descargar PDF
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminación -->
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
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Eliminar Consentimiento</h3>
            <p class="mt-2 text-sm text-gray-500">
              ¿Estás seguro de eliminar este consentimiento? Esta acción no se puede deshacer.
            </p>
            <div class="mt-6 flex gap-3 justify-center">
              <button (click)="closeDeleteModal()" class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button (click)="deleteConsentimiento()" [disabled]="deleting()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300 transition">
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
export class DocumentosComponent implements OnInit {
  private documentosService = inject(DocumentosService);
  private pacientesService = inject(PacientesService);
  private fb = inject(FormBuilder);
  private searchSubject = new Subject<string>();

  // Data
  consentimientos = signal<Consentimiento[]>([]);
  plantillas = signal<PlantillaConsentimiento[]>([]);
  loading = signal(false);
  loadingPlantillas = signal(false);

  // Search paciente
  pacienteSearch = '';
  searching = signal(false);
  searchResults = signal<Paciente[]>([]);
  selectedPaciente = signal<Paciente | null>(null);

  // Modal crear
  showModal = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  // Modal ver
  showViewModal = signal(false);
  viewingConsentimiento = signal<Consentimiento | null>(null);

  // Modal eliminar
  showDeleteModal = signal(false);
  deletingConsentimiento = signal<Consentimiento | null>(null);
  deleting = signal(false);

  form = this.fb.group({
    plantilla_id: [''],
    tipo_procedimiento: ['', Validators.required],
    contenido: ['', Validators.required],
    responsable_nombre: ['', Validators.required],
    responsable_dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    responsable_parentesco: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadConsentimientos();
    this.loadPlantillas();

    this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchPacientes(term);
    });
  }

  loadConsentimientos(): void {
    this.loading.set(true);
    this.documentosService.getConsentimientos({ page_size: 100 }).subscribe({
      next: (response) => {
        this.consentimientos.set(response.results);
        this.loading.set(false);
      },
      error: () => {
        this.consentimientos.set([]);
        this.loading.set(false);
      }
    });
  }

  loadPlantillas(): void {
    this.loadingPlantillas.set(true);
    this.documentosService.getPlantillas().subscribe({
      next: (data) => {
        this.plantillas.set(data);
        this.loadingPlantillas.set(false);
      },
      error: () => {
        this.plantillas.set([]);
        this.loadingPlantillas.set(false);
      }
    });
  }

  isPlantillaActiva(p: PlantillaConsentimiento): boolean {
    // Si no existe el campo, asumimos que está activa
    if (p.activo === undefined && p.is_active === undefined) {
      return true;
    }
    return p.activo === true || p.is_active === true;
  }

  // Search paciente
  onPacienteSearch(term: string): void {
    this.searchSubject.next(term);
  }

  searchPacientes(term: string): void {
    if (!term || term.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.searching.set(true);
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => {
        this.searchResults.set(response.results);
        this.searching.set(false);
      },
      error: () => this.searching.set(false)
    });
  }

  selectPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.searchResults.set([]);
    this.pacienteSearch = '';

    // Pre-llenar responsable si tiene
    if (paciente.responsable_principal) {
      const resp = paciente.responsable_principal;
      this.form.patchValue({
        responsable_nombre: `${resp.nombres} ${resp.apellidos}`,
        responsable_dni: resp.numero_documento,
        responsable_parentesco: resp.parentesco_display || ''
      });
    }
  }

  clearPaciente(): void {
    this.selectedPaciente.set(null);
    this.form.patchValue({
      responsable_nombre: '',
      responsable_dni: '',
      responsable_parentesco: ''
    });
  }

  onPlantillaChange(): void {
    const plantillaId = this.form.get('plantilla_id')?.value;
    if (plantillaId) {
      const plantilla = this.plantillas().find(p => p.id === Number(plantillaId));
      const templateContent = plantilla?.contenido || plantilla?.contenido_template;
      if (plantilla && templateContent) {
        let contenido = templateContent;
        const paciente = this.selectedPaciente();
        if (paciente) {
          // Soporta ambos formatos: {{variable}} y {variable}
          contenido = contenido.replace(/\{\{?paciente\}?\}/g, paciente.nombre_completo);
          contenido = contenido.replace(/\{\{?paciente_nombre\}?\}/g, paciente.nombre_completo);
          contenido = contenido.replace(/\{\{?paciente_dni\}?\}/g, paciente.numero_documento);
        }
        this.form.patchValue({ contenido });
      }
    }
  }

  // Modal crear
  openModal(): void {
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.searchResults.set([]);
    this.form.reset();
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveConsentimiento(): void {
    const paciente = this.selectedPaciente();
    if (!paciente || this.form.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const data: ConsentimientoCreate = {
      paciente: paciente.id,
      plantilla_id: formValue.plantilla_id ? Number(formValue.plantilla_id) : undefined,
      tipo_procedimiento: formValue.tipo_procedimiento!,
      contenido: formValue.contenido!,
      responsable_nombre: formValue.responsable_nombre!,
      responsable_dni: formValue.responsable_dni!,
      responsable_parentesco: formValue.responsable_parentesco!
    };

    this.documentosService.createConsentimiento(data).subscribe({
      next: () => {
        this.closeModal();
        this.loadConsentimientos();
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail || err.message || 'Error al guardar el consentimiento');
        this.saving.set(false);
      }
    });
  }

  // Modal ver
  viewConsentimiento(cons: Consentimiento): void {
    this.viewingConsentimiento.set(cons);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.viewingConsentimiento.set(null);
  }

  // Descargar PDF
  downloadPdf(cons: Consentimiento): void {
    this.documentosService.downloadConsentimientoPdf(cons.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `consentimiento_${cons.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        window.open(this.documentosService.getConsentimientoPdfUrl(cons.id), '_blank');
      }
    });
  }

  // Modal eliminar
  confirmDelete(cons: Consentimiento): void {
    this.deletingConsentimiento.set(cons);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingConsentimiento.set(null);
  }

  deleteConsentimiento(): void {
    const cons = this.deletingConsentimiento();
    if (!cons) return;

    this.deleting.set(true);
    this.documentosService.deleteConsentimiento(cons.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadConsentimientos();
        this.deleting.set(false);
      },
      error: () => {
        this.deleting.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
