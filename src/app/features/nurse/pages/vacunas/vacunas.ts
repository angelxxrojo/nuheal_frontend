import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VacunasService } from '../../services/vacunas.service';
import { PacientesService } from '../../services/pacientes.service';
import {
  Vacuna,
  EsquemaNacional,
  CarnetVacunacion,
  DosisAplicada,
  DosisAplicadaCreate,
  EsquemaDosis,
  PacienteVacunasPendientes
} from '../../../../models/vacuna.model';
import { Paciente } from '../../../../models/paciente.model';
import { debounceTime, Subject } from 'rxjs';

type TabType = 'pendientes' | 'carnet' | 'esquema';

@Component({
  selector: 'app-vacunas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Vacunas</h1>
          <p class="mt-1 text-sm text-gray-500">Gestión de vacunación según esquema nacional</p>
        </div>
        <button (click)="openDosisModal()" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Registrar Vacuna
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex gap-4">
          <button
            (click)="activeTab.set('pendientes')"
            [class]="'px-4 py-2 text-sm font-medium border-b-2 -mb-px ' +
              (activeTab() === 'pendientes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700')">
            Pendientes
            @if (pacientesPendientes().length > 0) {
              <span class="ml-2 badge badge-danger">{{ pacientesPendientes().length }}</span>
            }
          </button>
          <button
            (click)="activeTab.set('carnet')"
            [class]="'px-4 py-2 text-sm font-medium border-b-2 -mb-px ' +
              (activeTab() === 'carnet'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700')">
            Carnet de Vacunación
          </button>
          <button
            (click)="activeTab.set('esquema')"
            [class]="'px-4 py-2 text-sm font-medium border-b-2 -mb-px ' +
              (activeTab() === 'esquema'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700')">
            Esquema Nacional
          </button>
        </nav>
      </div>

      <!-- Tab: Pendientes -->
      @if (activeTab() === 'pendientes') {
        @if (loadingPendientes()) {
          <div class="flex justify-center py-12">
            <div class="spinner spinner-lg"></div>
          </div>
        } @else if (pacientesPendientes().length === 0) {
          <div class="card card-body">
            <div class="empty-state">
              <svg class="empty-state-icon text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="empty-state-title">Todos al día</p>
              <p class="empty-state-description">No hay pacientes con vacunas pendientes o vencidas</p>
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (item of pacientesPendientes(); track item.paciente.id) {
              <div class="card hover:shadow-md transition-shadow">
                <div class="card-body">
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex items-start gap-4">
                      <div class="avatar avatar-md bg-primary-100 text-primary-700">
                        {{ getInitials(item.paciente.nombre) }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-medium text-gray-900">{{ item.paciente.nombre }}</p>
                          @if (item.total_vencidas > 0) {
                            <span class="badge badge-danger">{{ item.total_vencidas }} vencidas</span>
                          }
                        </div>
                        <p class="text-sm text-gray-500">{{ item.paciente.edad_texto }}</p>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      @for (vencida of item.vencidas.slice(0, 3); track vencida.vacuna_nombre) {
                        <span class="badge badge-danger">{{ vencida.vacuna_nombre }} - {{ vencida.nombre_dosis }}</span>
                      }
                      @for (proxima of item.proximas.slice(0, 2); track proxima.vacuna_nombre) {
                        <span class="badge badge-warning">{{ proxima.vacuna_nombre }} - {{ proxima.nombre_dosis }}</span>
                      }
                    </div>
                    <div class="flex gap-2">
                      <button
                        (click)="viewCarnet(item.paciente.id)"
                        class="btn btn-secondary btn-sm">
                        Ver Carnet
                      </button>
                      <button
                        (click)="openDosisModalForPaciente(item.paciente.id)"
                        class="btn btn-primary btn-sm">
                        Vacunar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Tab: Carnet -->
      @if (activeTab() === 'carnet') {
        <div class="card card-body">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="carnetSearch"
              (ngModelChange)="onCarnetSearch($event)"
              placeholder="Buscar paciente por nombre o documento..."
              class="form-input w-full"
            >
            @if (searchingCarnet()) {
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <div class="spinner spinner-sm"></div>
              </div>
            }
            @if (carnetSearchResults().length > 0) {
              <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                @for (p of carnetSearchResults(); track p.id) {
                  <button
                    type="button"
                    (click)="viewCarnet(p.id)"
                    class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="avatar avatar-sm bg-primary-100 text-primary-700">
                      {{ p.nombres.charAt(0) }}{{ p.apellido_paterno.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ p.nombre_completo }}</p>
                      <p class="text-sm text-gray-500">{{ p.numero_documento }} • {{ p.edad_texto }}</p>
                    </div>
                  </button>
                }
              </div>
            }
          </div>
        </div>

        @if (loadingCarnet()) {
          <div class="flex justify-center py-12">
            <div class="spinner spinner-lg"></div>
          </div>
        } @else if (carnetData()) {
          <div class="space-y-6">
            <!-- Paciente Info -->
            <div class="card card-body bg-primary-50 border-primary-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="avatar avatar-lg bg-primary-600 text-white">
                    {{ getInitials(carnetData()!.paciente.nombre) }}
                  </div>
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">{{ carnetData()!.paciente.nombre }}</h2>
                    <p class="text-gray-600">{{ carnetData()!.paciente.edad_texto }} • Nacimiento: {{ carnetData()!.paciente.fecha_nacimiento | date:'dd/MM/yyyy' }}</p>
                  </div>
                </div>
                <button (click)="openDosisModalForPaciente(carnetData()!.paciente.id)" class="btn btn-primary">
                  Registrar Vacuna
                </button>
              </div>
            </div>

            <!-- Resumen -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="card card-body text-center">
                <p class="text-sm text-gray-500">Aplicadas</p>
                <p class="text-3xl font-bold text-green-600">{{ carnetData()!.resumen.total_aplicadas }}</p>
              </div>
              <div class="card card-body text-center">
                <p class="text-sm text-gray-500">Pendientes</p>
                <p class="text-3xl font-bold text-yellow-600">{{ carnetData()!.resumen.total_pendientes }}</p>
              </div>
              <div class="card card-body text-center">
                <p class="text-sm text-gray-500">Vencidas</p>
                <p class="text-3xl font-bold text-red-600">{{ carnetData()!.resumen.total_vencidas }}</p>
              </div>
              <div class="card card-body text-center">
                <p class="text-sm text-gray-500">Estado</p>
                @if (carnetData()!.resumen.tiene_vacunas_pendientes_urgentes) {
                  <span class="badge badge-danger text-lg px-4 py-2">Atrasado</span>
                } @else if (carnetData()!.resumen.total_pendientes > 0) {
                  <span class="badge badge-warning text-lg px-4 py-2">Pendiente</span>
                } @else {
                  <span class="badge badge-success text-lg px-4 py-2">Al día</span>
                }
              </div>
            </div>

            <!-- Dosis Vencidas -->
            @if (carnetData()!.dosis_vencidas.length > 0) {
              <div class="card">
                <div class="card-header bg-red-50 border-red-200">
                  <h3 class="font-semibold text-red-800 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Vacunas Vencidas ({{ carnetData()!.dosis_vencidas.length }})
                  </h3>
                </div>
                <div class="card-body">
                  <div class="flex flex-wrap gap-2">
                    @for (dosis of carnetData()!.dosis_vencidas; track dosis.id) {
                      <span class="badge badge-danger">
                        {{ dosis.vacuna_nombre || dosis.vacuna?.nombre }} - {{ dosis.nombre_dosis }}
                        (desde {{ dosis.edad_meses_ideal }} meses)
                      </span>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Próximas Dosis -->
            @if (carnetData()!.proximas_dosis.length > 0) {
              <div class="card">
                <div class="card-header bg-yellow-50 border-yellow-200">
                  <h3 class="font-semibold text-yellow-800">Próximas Vacunas ({{ carnetData()!.proximas_dosis.length }})</h3>
                </div>
                <div class="card-body">
                  <div class="flex flex-wrap gap-2">
                    @for (dosis of carnetData()!.proximas_dosis; track dosis.id) {
                      <span class="badge badge-warning">
                        {{ dosis.vacuna_nombre || dosis.vacuna?.nombre }} - {{ dosis.nombre_dosis }}
                        ({{ dosis.edad_meses_ideal }} meses)
                      </span>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Historial de Vacunas Aplicadas -->
            <div class="card">
              <div class="card-header">
                <h3 class="font-semibold text-gray-900">Historial de Vacunas Aplicadas</h3>
              </div>
              @if (carnetData()!.dosis_aplicadas.length === 0) {
                <div class="card-body text-center text-gray-500">
                  No hay vacunas registradas
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Vacuna</th>
                        <th>Dosis</th>
                        <th>Fecha</th>
                        <th>Edad</th>
                        <th>Lote</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (dosis of carnetData()!.dosis_aplicadas; track dosis.id) {
                        <tr>
                          <td>
                            <div class="font-medium text-gray-900">{{ dosis.vacuna.nombre }}</div>
                            <div class="text-sm text-gray-500">{{ dosis.vacuna.enfermedad_previene }}</div>
                          </td>
                          <td>{{ dosis.esquema_dosis.nombre_dosis }}</td>
                          <td>{{ dosis.fecha_aplicacion | date:'dd/MM/yyyy' }}</td>
                          <td>{{ dosis.edad_aplicacion_meses }} meses</td>
                          <td>
                            <span class="text-sm text-gray-600">{{ dosis.lote }}</span>
                            @if (dosis.fecha_vencimiento_lote) {
                              <br>
                              <span class="text-xs text-gray-400">Venc: {{ dosis.fecha_vencimiento_lote | date:'MM/yyyy' }}</span>
                            }
                          </td>
                          <td>
                            @if (dosis.aplicada_a_tiempo) {
                              <span class="badge badge-success">A tiempo</span>
                            } @else {
                              <span class="badge badge-warning">Tardía</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="card card-body">
            <div class="empty-state">
              <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p class="empty-state-title">Buscar Paciente</p>
              <p class="empty-state-description">Ingresa el nombre o documento del paciente para ver su carnet de vacunación</p>
            </div>
          </div>
        }
      }

      <!-- Tab: Esquema Nacional -->
      @if (activeTab() === 'esquema') {
        @if (loadingEsquema()) {
          <div class="flex justify-center py-12">
            <div class="spinner spinner-lg"></div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (item of esquemaNacional(); track item.vacuna.id) {
              <div class="card">
                <div class="card-header bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ item.vacuna.nombre }}</h3>
                    <p class="text-sm text-gray-500">{{ item.vacuna.enfermedad_previene }}</p>
                  </div>
                  <span class="badge badge-gray">{{ item.vacuna.via_administracion_display || item.vacuna.via_administracion }}</span>
                </div>
                <div class="card-body">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (dosis of item.dosis; track dosis.id) {
                      <div class="p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <span class="font-medium text-gray-900">{{ dosis.nombre_dosis }}</span>
                          @if (dosis.es_refuerzo) {
                            <span class="badge badge-info text-xs">Refuerzo</span>
                          }
                        </div>
                        <div class="text-sm text-gray-600">
                          <p>Edad ideal: <strong>{{ dosis.edad_meses_ideal }} meses</strong></p>
                          <p>Rango: {{ dosis.edad_meses_minima }} - {{ dosis.edad_meses_maxima || '∞' }} meses</p>
                        </div>
                      </div>
                    }
                  </div>
                  @if (item.vacuna.descripcion) {
                    <p class="mt-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
                      {{ item.vacuna.descripcion }}
                    </p>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Registrar Dosis Modal -->
    @if (showDosisModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Registrar Vacuna Aplicada</h2>
          </div>
          <form [formGroup]="dosisForm" (ngSubmit)="saveDosis()" class="p-6 space-y-4">
            <!-- Paciente -->
            <div>
              <label class="form-label">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="modalPacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onModalPacienteSearch($event)"
                    placeholder="Buscar paciente..."
                    class="form-input"
                  >
                  @if (modalPacienteResults().length > 0) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (p of modalPacienteResults(); track p.id) {
                        <button
                          type="button"
                          (click)="selectPaciente(p)"
                          class="w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          <p class="font-medium">{{ p.nombre_completo }}</p>
                          <p class="text-sm text-gray-500">{{ p.edad_texto }}</p>
                        </button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium">{{ selectedPaciente()!.nombre_completo }}</p>
                    <p class="text-sm text-gray-500">{{ selectedPaciente()!.edad_texto }}</p>
                  </div>
                  <button type="button" (click)="clearPaciente()" class="btn btn-ghost btn-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <!-- Vacuna -->
            <div>
              <label class="form-label">Vacuna *</label>
              <select formControlName="vacuna" class="form-input" (change)="onVacunaChange()">
                <option value="">Seleccionar vacuna...</option>
                @for (v of catalogo(); track v.id) {
                  <option [value]="v.id">{{ v.nombre }} - {{ v.enfermedad_previene }}</option>
                }
              </select>
            </div>

            <!-- Dosis -->
            <div>
              <label class="form-label">Dosis *</label>
              <select formControlName="esquema_dosis" class="form-input" [disabled]="!dosisDisponibles().length">
                <option value="">Seleccionar dosis...</option>
                @for (d of dosisDisponibles(); track d.id) {
                  <option [value]="d.id">{{ d.nombre_dosis }} ({{ d.edad_meses_ideal }} meses)</option>
                }
              </select>
            </div>

            <!-- Fecha -->
            <div>
              <label class="form-label">Fecha de Aplicación *</label>
              <input type="date" formControlName="fecha_aplicacion" class="form-input" [max]="today">
            </div>

            <!-- Lote -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Lote *</label>
                <input type="text" formControlName="lote" class="form-input" placeholder="Ej: VAC2024A">
              </div>
              <div>
                <label class="form-label">Vencimiento Lote</label>
                <input type="date" formControlName="fecha_vencimiento_lote" class="form-input">
              </div>
            </div>

            <!-- Sitio -->
            <div>
              <label class="form-label">Sitio de Aplicación</label>
              <select formControlName="sitio_aplicacion" class="form-input">
                <option value="">Seleccionar...</option>
                <option value="Brazo derecho">Brazo derecho</option>
                <option value="Brazo izquierdo">Brazo izquierdo</option>
                <option value="Muslo derecho">Muslo derecho</option>
                <option value="Muslo izquierdo">Muslo izquierdo</option>
                <option value="Glúteo derecho">Glúteo derecho</option>
                <option value="Glúteo izquierdo">Glúteo izquierdo</option>
                <option value="Vía oral">Vía oral</option>
                <option value="Vía nasal">Vía nasal</option>
              </select>
            </div>

            <!-- Observaciones -->
            <div>
              <label class="form-label">Observaciones</label>
              <textarea formControlName="observaciones" rows="2" class="form-input"></textarea>
            </div>

            <!-- Reacciones -->
            <div>
              <label class="form-label">Reacciones Adversas</label>
              <textarea formControlName="reacciones_adversas" rows="2" class="form-input" placeholder="Registrar si hubo alguna reacción..."></textarea>
            </div>

            @if (dosisError()) {
              <div class="alert alert-danger">{{ dosisError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeDosisModal()" class="btn btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="dosisForm.invalid || !selectedPaciente() || savingDosis()"
                class="btn btn-primary">
                @if (savingDosis()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                Registrar Vacuna
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class VacunasComponent implements OnInit {
  private vacunasService = inject(VacunasService);
  private pacientesService = inject(PacientesService);
  private fb = inject(FormBuilder);
  private carnetSearchSubject = new Subject<string>();
  private modalSearchSubject = new Subject<string>();

  today = new Date().toISOString().split('T')[0];

  // Tabs
  activeTab = signal<TabType>('pendientes');

  // Pendientes
  pacientesPendientes = signal<PacienteVacunasPendientes[]>([]);
  loadingPendientes = signal(false);

  // Carnet
  carnetSearch = '';
  carnetSearchResults = signal<Paciente[]>([]);
  searchingCarnet = signal(false);
  carnetData = signal<CarnetVacunacion | null>(null);
  loadingCarnet = signal(false);

  // Esquema
  esquemaNacional = signal<EsquemaNacional[]>([]);
  loadingEsquema = signal(false);
  catalogo = signal<Vacuna[]>([]);

  // Dosis Modal
  showDosisModal = signal(false);
  savingDosis = signal(false);
  dosisError = signal<string | null>(null);
  selectedPaciente = signal<Paciente | null>(null);
  modalPacienteSearch = '';
  modalPacienteResults = signal<Paciente[]>([]);
  dosisDisponibles = signal<EsquemaDosis[]>([]);

  dosisForm = this.fb.group({
    vacuna: ['', Validators.required],
    esquema_dosis: ['', Validators.required],
    fecha_aplicacion: ['', Validators.required],
    lote: ['', Validators.required],
    fecha_vencimiento_lote: [''],
    sitio_aplicacion: [''],
    observaciones: [''],
    reacciones_adversas: ['']
  });

  ngOnInit(): void {
    this.loadPendientes();
    this.loadEsquema();
    this.loadCatalogo();

    this.carnetSearchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchCarnetPacientes(term);
    });

    this.modalSearchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchModalPacientes(term);
    });
  }

  loadPendientes(): void {
    this.loadingPendientes.set(true);
    this.vacunasService.getPacientesPendientes().subscribe({
      next: (data) => {
        this.pacientesPendientes.set(data);
        this.loadingPendientes.set(false);
      },
      error: () => this.loadingPendientes.set(false)
    });
  }

  loadEsquema(): void {
    this.loadingEsquema.set(true);
    this.vacunasService.getEsquemaNacional().subscribe({
      next: (data) => {
        this.esquemaNacional.set(data);
        this.loadingEsquema.set(false);
      },
      error: () => this.loadingEsquema.set(false)
    });
  }

  loadCatalogo(): void {
    this.vacunasService.getCatalogo().subscribe({
      next: (data) => this.catalogo.set(data)
    });
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
  }

  // Carnet search
  onCarnetSearch(term: string): void {
    this.carnetSearchSubject.next(term);
  }

  searchCarnetPacientes(term: string): void {
    if (!term || term.length < 2) {
      this.carnetSearchResults.set([]);
      return;
    }
    this.searchingCarnet.set(true);
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => {
        this.carnetSearchResults.set(response.results);
        this.searchingCarnet.set(false);
      },
      error: () => this.searchingCarnet.set(false)
    });
  }

  viewCarnet(pacienteId: number): void {
    this.activeTab.set('carnet');
    this.carnetSearch = '';
    this.carnetSearchResults.set([]);
    this.loadingCarnet.set(true);

    this.vacunasService.getCarnet(pacienteId).subscribe({
      next: (data) => {
        this.carnetData.set(data);
        this.loadingCarnet.set(false);
      },
      error: () => this.loadingCarnet.set(false)
    });
  }

  // Modal paciente search
  onModalPacienteSearch(term: string): void {
    this.modalSearchSubject.next(term);
  }

  searchModalPacientes(term: string): void {
    if (!term || term.length < 2) {
      this.modalPacienteResults.set([]);
      return;
    }
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => this.modalPacienteResults.set(response.results)
    });
  }

  selectPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.modalPacienteResults.set([]);
    this.modalPacienteSearch = '';
  }

  clearPaciente(): void {
    this.selectedPaciente.set(null);
  }

  // Dosis Modal
  openDosisModal(): void {
    this.dosisForm.reset({ fecha_aplicacion: this.today });
    this.dosisError.set(null);
    this.dosisDisponibles.set([]);
    this.showDosisModal.set(true);
  }

  openDosisModalForPaciente(pacienteId: number): void {
    this.pacientesService.getById(pacienteId).subscribe({
      next: (paciente) => {
        this.selectedPaciente.set(paciente);
        this.openDosisModal();
      }
    });
  }

  closeDosisModal(): void {
    this.showDosisModal.set(false);
    this.selectedPaciente.set(null);
    this.modalPacienteSearch = '';
  }

  onVacunaChange(): void {
    const vacunaId = this.dosisForm.get('vacuna')?.value;
    if (!vacunaId) {
      this.dosisDisponibles.set([]);
      return;
    }

    const esquema = this.esquemaNacional().find(e => e.vacuna.id === +vacunaId);
    if (esquema) {
      this.dosisDisponibles.set(esquema.dosis);
    } else {
      this.dosisDisponibles.set([]);
    }
    this.dosisForm.patchValue({ esquema_dosis: '' });
  }

  saveDosis(): void {
    if (this.dosisForm.invalid || !this.selectedPaciente()) return;

    this.savingDosis.set(true);
    this.dosisError.set(null);

    const data: DosisAplicadaCreate = {
      paciente: this.selectedPaciente()!.id,
      vacuna: +this.dosisForm.value.vacuna!,
      esquema_dosis: +this.dosisForm.value.esquema_dosis!,
      fecha_aplicacion: this.dosisForm.value.fecha_aplicacion!,
      lote: this.dosisForm.value.lote!,
      fecha_vencimiento_lote: this.dosisForm.value.fecha_vencimiento_lote || undefined,
      sitio_aplicacion: this.dosisForm.value.sitio_aplicacion || undefined,
      observaciones: this.dosisForm.value.observaciones || undefined,
      reacciones_adversas: this.dosisForm.value.reacciones_adversas || undefined
    };

    this.vacunasService.registrarDosis(data).subscribe({
      next: () => {
        this.closeDosisModal();
        this.loadPendientes();
        if (this.carnetData() && this.carnetData()!.paciente.id === data.paciente) {
          this.viewCarnet(data.paciente);
        }
        this.savingDosis.set(false);
      },
      error: (err) => {
        this.dosisError.set(err.error?.detail || 'Error al registrar la vacuna');
        this.savingDosis.set(false);
      }
    });
  }
}
