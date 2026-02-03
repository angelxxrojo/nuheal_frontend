import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgendaService } from '../../services/agenda.service';
import { PacientesService } from '../../services/pacientes.service';
import { Cita, CitaCreate, TipoServicio, SlotDisponible, CitaEstado, ConfiguracionAgenda } from '../../../../models/cita.model';
import { Paciente } from '../../../../models/paciente.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Agenda</h1>
          <p class="mt-1 text-sm text-gray-500">Gestiona tus citas y horarios</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openConfigModal()" class="btn btn-secondary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Configuración
          </button>
          <button (click)="openCitaModal()" class="btn btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva Cita
          </button>
        </div>
      </div>

      <!-- Stats for Today -->
      @if (citasHoy()) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="card card-body">
            <p class="text-sm text-gray-500">Citas Hoy</p>
            <p class="text-2xl font-semibold text-gray-900">{{ citasHoy()!.total }}</p>
          </div>
          <div class="card card-body">
            <p class="text-sm text-gray-500">Pendientes</p>
            <p class="text-2xl font-semibold text-yellow-600">{{ citasHoy()!.pendientes }}</p>
          </div>
          <div class="card card-body">
            <p class="text-sm text-gray-500">Atendidas</p>
            <p class="text-2xl font-semibold text-green-600">{{ citasHoy()!.atendidas }}</p>
          </div>
          <div class="card card-body">
            <p class="text-sm text-gray-500">Próxima Cita</p>
            <p class="text-lg font-semibold text-primary-600">
              {{ getProximaCita() || 'Sin citas pendientes' }}
            </p>
          </div>
        </div>
      }

      <!-- Calendar Navigation -->
      <div class="card card-body">
        <div class="flex items-center justify-between">
          <button (click)="previousWeek()" class="btn btn-ghost">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="text-center">
            <button (click)="goToToday()" class="btn btn-secondary btn-sm mb-2">Hoy</button>
            <h2 class="text-lg font-semibold text-gray-900">{{ getWeekRangeText() }}</h2>
          </div>
          <button (click)="nextWeek()" class="btn btn-ghost">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="spinner spinner-lg"></div>
        </div>
      }

      <!-- Weekly Calendar View -->
      @if (!loading()) {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <div class="min-w-[800px]">
              <!-- Header Row -->
              <div class="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                <div class="p-3 text-sm font-medium text-gray-500 text-center border-r border-gray-200">
                  Hora
                </div>
                @for (day of weekDays(); track day.date) {
                  <div
                    [class]="'p-3 text-center border-r border-gray-200 last:border-r-0 ' + (isToday(day.date) ? 'bg-primary-50' : '')"
                  >
                    <p class="text-sm font-medium text-gray-900">{{ day.dayName }}</p>
                    <p [class]="'text-lg font-semibold ' + (isToday(day.date) ? 'text-primary-600' : 'text-gray-700')">
                      {{ day.dayNumber }}
                    </p>
                  </div>
                }
              </div>

              <!-- Time Slots -->
              @for (hora of horasDelDia(); track hora) {
                <div class="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                  <div class="p-2 text-sm text-gray-500 text-center border-r border-gray-200 bg-gray-50">
                    {{ hora }}
                  </div>
                  @for (day of weekDays(); track day.date) {
                    <div
                      class="p-1 border-r border-gray-200 last:border-r-0 min-h-[60px] hover:bg-gray-50 cursor-pointer"
                      (click)="openCitaModalForSlot(day.date, hora)"
                    >
                      @for (cita of getCitasForSlot(day.date, hora); track cita.id) {
                        <div
                          [style.background-color]="cita.servicio_color || '#14b8a6'"
                          class="text-white text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80"
                          (click)="openCitaDetail(cita); $event.stopPropagation()"
                        >
                          <div class="font-medium truncate">{{ cita.paciente_nombre }}</div>
                          <div class="opacity-80 truncate">{{ cita.servicio_nombre }}</div>
                          <div class="flex items-center gap-1 mt-0.5">
                            <span class="truncate">{{ cita.hora_inicio }}</span>
                            <span [class]="getStatusBadgeClass(cita.estado)">
                              {{ getStatusShort(cita.estado) }}
                            </span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Citas List View for Mobile -->
      <div class="md:hidden">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Citas del día seleccionado</h3>
        @if (citasDelDia().length === 0) {
          <div class="card card-body text-center text-gray-500">
            No hay citas para este día
          </div>
        } @else {
          <div class="space-y-3">
            @for (cita of citasDelDia(); track cita.id) {
              <div class="card card-body cursor-pointer hover:shadow-md" (click)="openCitaDetail(cita)">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ cita.paciente_nombre }}</p>
                    <p class="text-sm text-gray-500">{{ cita.servicio_nombre }}</p>
                    <p class="text-sm text-gray-500">{{ cita.hora_inicio }} - {{ cita.hora_fin }}</p>
                  </div>
                  <span [class]="getStatusBadgeClassFull(cita.estado)">
                    {{ cita.estado_display || cita.estado }}
                  </span>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Nueva/Editar Cita Modal -->
    @if (showCitaModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ editingCita() ? 'Editar Cita' : 'Nueva Cita' }}
            </h2>
          </div>
          <form [formGroup]="citaForm" (ngSubmit)="saveCita()" class="p-6 space-y-4">
            <!-- Paciente Search -->
            <div>
              <label class="form-label">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="pacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onPacienteSearch($event)"
                    placeholder="Buscar paciente por nombre o documento..."
                    class="form-input"
                  >
                  @if (searchingPacientes()) {
                    <div class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="spinner spinner-sm"></div>
                    </div>
                  }
                  @if (pacienteResults().length > 0) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (p of pacienteResults(); track p.id) {
                        <button
                          type="button"
                          (click)="selectPaciente(p)"
                          class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
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
              } @else {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="avatar avatar-sm bg-primary-100 text-primary-700">
                      {{ selectedPaciente()!.nombres.charAt(0) }}{{ selectedPaciente()!.apellido_paterno.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ selectedPaciente()!.nombre_completo }}</p>
                      <p class="text-sm text-gray-500">{{ selectedPaciente()!.edad_texto }}</p>
                    </div>
                  </div>
                  <button type="button" (click)="clearPaciente()" class="btn btn-ghost btn-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <!-- Tipo de Servicio -->
            <div>
              <label class="form-label">Tipo de Servicio *</label>
              <select formControlName="tipo_servicio" class="form-input" (change)="onServicioChange()">
                <option value="">Seleccionar servicio...</option>
                @for (s of servicios(); track s.id) {
                  <option [value]="s.id">{{ s.nombre }} ({{ s.duracion_minutos }} min) - S/ {{ s.precio }}</option>
                }
              </select>
            </div>

            <!-- Fecha -->
            <div>
              <label class="form-label">Fecha *</label>
              <input
                type="date"
                formControlName="fecha"
                class="form-input"
                [min]="getMinDate()"
                (change)="loadDisponibilidad()"
              >
            </div>

            <!-- Hora -->
            <div>
              <label class="form-label">Hora *</label>
              @if (loadingDisponibilidad()) {
                <div class="flex items-center gap-2 text-gray-500">
                  <div class="spinner spinner-sm"></div>
                  <span>Cargando disponibilidad...</span>
                </div>
              } @else if (slotsDisponibles().length === 0) {
                <p class="text-sm text-gray-500">Selecciona una fecha para ver la disponibilidad</p>
              } @else {
                <div class="grid grid-cols-4 gap-2">
                  @for (slot of slotsDisponibles(); track slot.hora) {
                    <button
                      type="button"
                      [disabled]="!slot.disponible"
                      [class]="'px-3 py-2 text-sm rounded-lg border ' +
                        (citaForm.get('hora_inicio')?.value === slot.hora
                          ? 'bg-primary-600 text-white border-primary-600'
                          : slot.disponible
                            ? 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed')"
                      (click)="selectHora(slot.hora)"
                    >
                      {{ slot.hora }}
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Notas -->
            <div>
              <label class="form-label">Notas</label>
              <textarea formControlName="notas" rows="2" class="form-input" placeholder="Notas adicionales..."></textarea>
            </div>

            @if (citaError()) {
              <div class="alert alert-danger">{{ citaError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeCitaModal()" class="btn btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="citaForm.invalid || !selectedPaciente() || savingCita()"
                class="btn btn-primary">
                @if (savingCita()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                {{ editingCita() ? 'Guardar Cambios' : 'Agendar Cita' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Cita Detail Modal -->
    @if (showCitaDetail()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Detalle de Cita</h2>
            <button (click)="closeCitaDetail()" class="btn btn-ghost btn-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          @if (selectedCita()) {
            <div class="p-6 space-y-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-3 h-3 rounded-full"
                  [style.background-color]="selectedCita()!.servicio_color || '#14b8a6'"
                ></div>
                <span [class]="getStatusBadgeClassFull(selectedCita()!.estado)">
                  {{ selectedCita()!.estado_display || selectedCita()!.estado }}
                </span>
              </div>

              <div>
                <p class="text-sm text-gray-500">Paciente</p>
                <p class="font-medium text-gray-900">{{ selectedCita()!.paciente_nombre }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">Servicio</p>
                <p class="font-medium text-gray-900">{{ selectedCita()!.servicio_nombre }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Fecha</p>
                  <p class="font-medium text-gray-900">{{ selectedCita()!.fecha | date:'dd/MM/yyyy' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Hora</p>
                  <p class="font-medium text-gray-900">{{ selectedCita()!.hora_inicio }} - {{ selectedCita()!.hora_fin }}</p>
                </div>
              </div>

              @if (selectedCita()!.notas) {
                <div>
                  <p class="text-sm text-gray-500">Notas</p>
                  <p class="text-gray-900">{{ selectedCita()!.notas }}</p>
                </div>
              }

              @if (selectedCita()!.motivo_cancelacion) {
                <div class="alert alert-warning">
                  <strong>Motivo de cancelación:</strong> {{ selectedCita()!.motivo_cancelacion }}
                </div>
              }

              <!-- Actions -->
              <div class="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                @if (selectedCita()!.estado === 'programada') {
                  <button (click)="confirmarCita(selectedCita()!)" class="btn btn-primary btn-sm flex-1">
                    Confirmar
                  </button>
                }
                @if (selectedCita()!.estado === 'confirmada') {
                  <button (click)="atenderCita(selectedCita()!)" class="btn btn-primary btn-sm flex-1">
                    Iniciar Atención
                  </button>
                }
                @if (selectedCita()!.estado === 'en_atencion') {
                  <button (click)="finalizarCita(selectedCita()!)" class="btn btn-success btn-sm flex-1">
                    Finalizar
                  </button>
                }
                @if (selectedCita()!.puede_cancelarse) {
                  <button (click)="cancelarCitaConfirm(selectedCita()!)" class="btn btn-danger btn-sm flex-1">
                    Cancelar Cita
                  </button>
                }
                @if (selectedCita()!.estado === 'confirmada' || selectedCita()!.estado === 'programada') {
                  <button (click)="marcarNoAsistio(selectedCita()!)" class="btn btn-secondary btn-sm flex-1">
                    No Asistió
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Config Modal -->
    @if (showConfigModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Configuración de Agenda</h2>
          </div>
          <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Hora de Inicio</label>
                <input type="time" formControlName="hora_inicio" class="form-input">
              </div>
              <div>
                <label class="form-label">Hora de Fin</label>
                <input type="time" formControlName="hora_fin" class="form-input">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Intervalo (minutos)</label>
                <input type="number" formControlName="intervalo_minutos" class="form-input" min="15" step="15">
              </div>
              <div>
                <label class="form-label">Tiempo entre citas (min)</label>
                <input type="number" formControlName="tiempo_entre_citas" class="form-input" min="0">
              </div>
            </div>

            <div>
              <label class="form-label">Días anticipación máxima</label>
              <input type="number" formControlName="dias_anticipacion_maxima" class="form-input" min="1">
            </div>

            <div>
              <label class="form-label mb-2">Días Laborables</label>
              <div class="flex flex-wrap gap-2">
                @for (dia of diasSemana; track dia.value) {
                  <label class="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      [checked]="isDiaSeleccionado(dia.value)"
                      (change)="toggleDia(dia.value)"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600"
                    >
                    <span class="text-sm">{{ dia.label }}</span>
                  </label>
                }
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                formControlName="permite_citas_mismo_dia"
                id="mismo_dia"
                class="h-4 w-4 rounded border-gray-300 text-primary-600"
              >
              <label for="mismo_dia" class="text-sm text-gray-700">Permitir citas el mismo día</label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeConfigModal()" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" [disabled]="savingConfig()" class="btn btn-primary">
                @if (savingConfig()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class AgendaComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private pacientesService = inject(PacientesService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private pacienteSearchSubject = new Subject<string>();

  // Data
  citas = signal<Cita[]>([]);
  servicios = signal<TipoServicio[]>([]);
  citasHoy = signal<{ total: number; pendientes: number; atendidas: number; citas: Cita[] } | null>(null);
  loading = signal(false);

  // Calendar
  currentWeekStart = signal(this.getWeekStart(new Date()));
  weekDays = computed(() => this.generateWeekDays());
  horasDelDia = computed(() => this.generateHorasDelDia());
  citasDelDia = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.citas().filter(c => c.fecha === today);
  });

  // Cita Modal
  showCitaModal = signal(false);
  editingCita = signal<Cita | null>(null);
  savingCita = signal(false);
  citaError = signal<string | null>(null);
  selectedPaciente = signal<Paciente | null>(null);
  pacienteSearch = '';
  pacienteResults = signal<Paciente[]>([]);
  searchingPacientes = signal(false);
  slotsDisponibles = signal<SlotDisponible[]>([]);
  loadingDisponibilidad = signal(false);

  // Cita Detail
  showCitaDetail = signal(false);
  selectedCita = signal<Cita | null>(null);

  // Config Modal
  showConfigModal = signal(false);
  savingConfig = signal(false);
  diasLaborables = signal<number[]>([1, 2, 3, 4, 5]);

  diasSemana = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' }
  ];

  citaForm = this.fb.group({
    tipo_servicio: ['', Validators.required],
    fecha: ['', Validators.required],
    hora_inicio: ['', Validators.required],
    notas: ['']
  });

  configForm = this.fb.group({
    hora_inicio: ['08:00'],
    hora_fin: ['18:00'],
    intervalo_minutos: [30],
    tiempo_entre_citas: [0],
    dias_anticipacion_maxima: [30],
    permite_citas_mismo_dia: [true]
  });

  ngOnInit(): void {
    this.loadServicios();
    this.loadCitasHoy();
    this.loadCitasSemana();
    this.loadConfiguracion();

    this.pacienteSearchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchPacientes(term);
    });

    // Check for paciente query param
    this.route.queryParams.subscribe(params => {
      if (params['paciente']) {
        this.loadPacienteById(+params['paciente']);
      }
    });
  }

  loadServicios(): void {
    this.agendaService.getServicios().subscribe({
      next: (servicios) => this.servicios.set(servicios.filter(s => s.is_active)),
      error: (err) => console.error('Error loading servicios:', err)
    });
  }

  loadCitasHoy(): void {
    this.agendaService.getCitasHoy().subscribe({
      next: (data) => this.citasHoy.set(data),
      error: (err) => console.error('Error loading citas hoy:', err)
    });
  }

  loadCitasSemana(): void {
    this.loading.set(true);
    const weekStart = this.currentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    this.agendaService.getCitas({
      fecha_inicio: weekStart.toISOString().split('T')[0],
      fecha_fin: weekEnd.toISOString().split('T')[0],
      page_size: 100
    }).subscribe({
      next: (response) => {
        this.citas.set(response.results);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading citas:', err);
        this.loading.set(false);
      }
    });
  }

  loadConfiguracion(): void {
    this.agendaService.getConfiguracion().subscribe({
      next: (config) => {
        this.diasLaborables.set(config.dias_laborables);
        this.configForm.patchValue({
          hora_inicio: config.hora_inicio,
          hora_fin: config.hora_fin,
          intervalo_minutos: config.intervalo_minutos,
          tiempo_entre_citas: config.tiempo_entre_citas,
          dias_anticipacion_maxima: config.dias_anticipacion_maxima,
          permite_citas_mismo_dia: config.permite_citas_mismo_dia
        });
      },
      error: (err) => console.error('Error loading config:', err)
    });
  }

  // Calendar helpers
  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  generateWeekDays(): { date: string; dayName: string; dayNumber: number }[] {
    const days = [];
    const weekStart = this.currentWeekStart();
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: dayNames[i],
        dayNumber: d.getDate()
      });
    }
    return days;
  }

  generateHorasDelDia(): string[] {
    const horas = [];
    for (let h = 7; h <= 20; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horas;
  }

  isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().split('T')[0];
  }

  getCitasForSlot(date: string, hora: string): Cita[] {
    const horaNum = parseInt(hora.split(':')[0]);
    return this.citas().filter(c => {
      if (c.fecha !== date) return false;
      const citaHora = parseInt(c.hora_inicio.split(':')[0]);
      return citaHora === horaNum;
    });
  }

  getWeekRangeText(): string {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  }

  previousWeek(): void {
    const newStart = new Date(this.currentWeekStart());
    newStart.setDate(newStart.getDate() - 7);
    this.currentWeekStart.set(newStart);
    this.loadCitasSemana();
  }

  nextWeek(): void {
    const newStart = new Date(this.currentWeekStart());
    newStart.setDate(newStart.getDate() + 7);
    this.currentWeekStart.set(newStart);
    this.loadCitasSemana();
  }

  goToToday(): void {
    this.currentWeekStart.set(this.getWeekStart(new Date()));
    this.loadCitasSemana();
  }

  getProximaCita(): string | null {
    const now = new Date();
    const proxima = this.citasHoy()?.citas
      .filter(c => c.estado === 'programada' || c.estado === 'confirmada')
      .find(c => {
        const [h, m] = c.hora_inicio.split(':').map(Number);
        const citaTime = new Date();
        citaTime.setHours(h, m, 0, 0);
        return citaTime > now;
      });
    return proxima ? `${proxima.hora_inicio} - ${proxima.paciente_nombre}` : null;
  }

  // Status helpers
  getStatusBadgeClass(estado: CitaEstado): string {
    const classes: Record<CitaEstado, string> = {
      programada: 'bg-yellow-100 text-yellow-800 px-1 rounded text-[10px]',
      confirmada: 'bg-blue-100 text-blue-800 px-1 rounded text-[10px]',
      en_atencion: 'bg-purple-100 text-purple-800 px-1 rounded text-[10px]',
      atendida: 'bg-green-100 text-green-800 px-1 rounded text-[10px]',
      cancelada: 'bg-red-100 text-red-800 px-1 rounded text-[10px]',
      no_asistio: 'bg-gray-100 text-gray-800 px-1 rounded text-[10px]'
    };
    return classes[estado];
  }

  getStatusBadgeClassFull(estado: CitaEstado): string {
    const classes: Record<CitaEstado, string> = {
      programada: 'badge badge-warning',
      confirmada: 'badge badge-info',
      en_atencion: 'badge badge-primary',
      atendida: 'badge badge-success',
      cancelada: 'badge badge-danger',
      no_asistio: 'badge badge-gray'
    };
    return classes[estado];
  }

  getStatusShort(estado: CitaEstado): string {
    const short: Record<CitaEstado, string> = {
      programada: 'P',
      confirmada: 'C',
      en_atencion: 'A',
      atendida: 'OK',
      cancelada: 'X',
      no_asistio: 'NA'
    };
    return short[estado];
  }

  // Cita Modal
  openCitaModal(): void {
    this.editingCita.set(null);
    this.citaForm.reset();
    this.slotsDisponibles.set([]);
    this.citaError.set(null);
    this.showCitaModal.set(true);
  }

  openCitaModalForSlot(date: string, hora: string): void {
    this.editingCita.set(null);
    this.citaForm.reset();
    this.citaForm.patchValue({ fecha: date, hora_inicio: hora });
    this.loadDisponibilidad();
    this.citaError.set(null);
    this.showCitaModal.set(true);
  }

  closeCitaModal(): void {
    this.showCitaModal.set(false);
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.pacienteResults.set([]);
  }

  onPacienteSearch(term: string): void {
    this.pacienteSearchSubject.next(term);
  }

  searchPacientes(term: string): void {
    if (!term || term.length < 2) {
      this.pacienteResults.set([]);
      return;
    }

    this.searchingPacientes.set(true);
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => {
        this.pacienteResults.set(response.results);
        this.searchingPacientes.set(false);
      },
      error: () => this.searchingPacientes.set(false)
    });
  }

  loadPacienteById(id: number): void {
    this.pacientesService.getById(id).subscribe({
      next: (paciente) => {
        this.selectedPaciente.set(paciente);
        this.openCitaModal();
      },
      error: (err) => console.error('Error loading paciente:', err)
    });
  }

  selectPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.pacienteResults.set([]);
    this.pacienteSearch = '';
  }

  clearPaciente(): void {
    this.selectedPaciente.set(null);
  }

  onServicioChange(): void {
    this.loadDisponibilidad();
  }

  loadDisponibilidad(): void {
    const fecha = this.citaForm.get('fecha')?.value;
    const servicioId = this.citaForm.get('tipo_servicio')?.value;

    if (!fecha) return;

    this.loadingDisponibilidad.set(true);
    this.agendaService.getDisponibilidad(fecha, servicioId ? +servicioId : undefined).subscribe({
      next: (resp) => {
        this.slotsDisponibles.set(resp.slots);
        this.loadingDisponibilidad.set(false);
      },
      error: () => this.loadingDisponibilidad.set(false)
    });
  }

  selectHora(hora: string): void {
    this.citaForm.patchValue({ hora_inicio: hora });
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  saveCita(): void {
    if (this.citaForm.invalid || !this.selectedPaciente()) return;

    this.savingCita.set(true);
    this.citaError.set(null);

    const data: CitaCreate = {
      paciente: this.selectedPaciente()!.id,
      tipo_servicio: +this.citaForm.value.tipo_servicio!,
      fecha: this.citaForm.value.fecha!,
      hora_inicio: this.citaForm.value.hora_inicio!,
      notas: this.citaForm.value.notas || undefined
    };

    const request = this.editingCita()
      ? this.agendaService.updateCita(this.editingCita()!.id, data)
      : this.agendaService.createCita(data);

    request.subscribe({
      next: () => {
        this.closeCitaModal();
        this.loadCitasSemana();
        this.loadCitasHoy();
        this.savingCita.set(false);
      },
      error: (err) => {
        this.citaError.set(err.error?.detail || 'Error al guardar la cita');
        this.savingCita.set(false);
      }
    });
  }

  // Cita Detail
  openCitaDetail(cita: Cita): void {
    this.selectedCita.set(cita);
    this.showCitaDetail.set(true);
  }

  closeCitaDetail(): void {
    this.showCitaDetail.set(false);
    this.selectedCita.set(null);
  }

  confirmarCita(cita: Cita): void {
    this.agendaService.confirmarCita(cita.id).subscribe({
      next: () => {
        this.closeCitaDetail();
        this.loadCitasSemana();
        this.loadCitasHoy();
      },
      error: (err) => console.error('Error confirming cita:', err)
    });
  }

  atenderCita(cita: Cita): void {
    this.agendaService.atenderCita(cita.id).subscribe({
      next: () => {
        this.closeCitaDetail();
        this.loadCitasSemana();
        this.loadCitasHoy();
      },
      error: (err) => console.error('Error starting cita:', err)
    });
  }

  finalizarCita(cita: Cita): void {
    this.agendaService.updateCita(cita.id, { estado: 'atendida' }).subscribe({
      next: () => {
        this.closeCitaDetail();
        this.loadCitasSemana();
        this.loadCitasHoy();
      },
      error: (err) => console.error('Error finishing cita:', err)
    });
  }

  cancelarCitaConfirm(cita: Cita): void {
    const motivo = prompt('Ingrese el motivo de cancelación:');
    if (motivo !== null) {
      this.agendaService.cancelarCita(cita.id, motivo).subscribe({
        next: () => {
          this.closeCitaDetail();
          this.loadCitasSemana();
          this.loadCitasHoy();
        },
        error: (err) => console.error('Error canceling cita:', err)
      });
    }
  }

  marcarNoAsistio(cita: Cita): void {
    this.agendaService.marcarNoAsistio(cita.id).subscribe({
      next: () => {
        this.closeCitaDetail();
        this.loadCitasSemana();
        this.loadCitasHoy();
      },
      error: (err) => console.error('Error marking no show:', err)
    });
  }

  // Config Modal
  openConfigModal(): void {
    this.showConfigModal.set(true);
  }

  closeConfigModal(): void {
    this.showConfigModal.set(false);
  }

  isDiaSeleccionado(dia: number): boolean {
    return this.diasLaborables().includes(dia);
  }

  toggleDia(dia: number): void {
    const current = this.diasLaborables();
    if (current.includes(dia)) {
      this.diasLaborables.set(current.filter(d => d !== dia));
    } else {
      this.diasLaborables.set([...current, dia].sort());
    }
  }

  saveConfig(): void {
    this.savingConfig.set(true);
    const formValue = this.configForm.value;
    const data: Partial<ConfiguracionAgenda> = {
      dias_laborables: this.diasLaborables(),
      hora_inicio: formValue.hora_inicio || undefined,
      hora_fin: formValue.hora_fin || undefined,
      intervalo_minutos: formValue.intervalo_minutos || undefined,
      tiempo_entre_citas: formValue.tiempo_entre_citas || undefined,
      dias_anticipacion_maxima: formValue.dias_anticipacion_maxima || undefined,
      permite_citas_mismo_dia: formValue.permite_citas_mismo_dia ?? undefined
    };

    this.agendaService.updateConfiguracion(data).subscribe({
      next: () => {
        this.closeConfigModal();
        this.savingConfig.set(false);
      },
      error: (err) => {
        console.error('Error saving config:', err);
        this.savingConfig.set(false);
      }
    });
  }
}
