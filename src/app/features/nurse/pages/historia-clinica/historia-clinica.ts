import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { PacientesService } from '../../services/pacientes.service';
import {
  HistoriaClinica,
  HistoriaClinicaCreate,
  NotaSOAPIE,
  NotaSOAPIECreate,
  GrupoSanguineo,
  TipoParto
} from '../../../../models/historia-clinica.model';
import { Paciente } from '../../../../models/paciente.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Historia Clínica</h1>
          <p class="mt-1 text-sm text-gray-500">Gestión de historias clínicas y notas SOAPIE</p>
        </div>
      </div>

      <!-- Search Paciente -->
      <div class="bg-white rounded-lg shadow border border-gray-200 p-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Paciente</label>
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="pacienteSearch"
            (ngModelChange)="onPacienteSearch($event)"
            placeholder="Buscar por nombre o documento..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-full"
          >
          @if (searching()) {
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
              <div class="spinner spinner-sm"></div>
            </div>
          }
          @if (searchResults().length > 0) {
            <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              @for (p of searchResults(); track p.id) {
                <button
                  type="button"
                  (click)="selectPaciente(p)"
                  class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
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

      <!-- Loading -->
      @if (loadingHistoria()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Sin paciente seleccionado -->
      @if (!selectedPaciente() && !loadingHistoria()) {
        <div class="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div class="text-center py-8">
            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="mt-2 text-sm font-medium text-gray-900">Selecciona un paciente</p>
            <p class="mt-1 text-sm text-gray-500">Busca un paciente para ver o crear su historia clínica</p>
          </div>
        </div>
      }

      <!-- Paciente seleccionado -->
      @if (selectedPaciente() && !loadingHistoria()) {
        <!-- Paciente Header -->
        <div class="bg-white rounded-lg shadow border border-gray-200 p-5 bg-primary-50 border-primary-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-medium">
                {{ selectedPaciente()!.nombres.charAt(0) }}{{ selectedPaciente()!.apellido_paterno.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ selectedPaciente()!.nombre_completo }}</h2>
                <p class="text-gray-600">{{ selectedPaciente()!.edad_texto }} • {{ selectedPaciente()!.sexo === 'M' ? 'Masculino' : 'Femenino' }}</p>
                @if (historia()) {
                  <p class="text-sm text-gray-500">HC: {{ historia()!.numero }}</p>
                }
              </div>
            </div>
            <button (click)="clearSelection()" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- No tiene historia -->
        @if (!historia() && !historiaError()) {
          <div class="bg-white rounded-lg shadow border border-gray-200 p-5">
            <div class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Sin Historia Clínica</h3>
              <p class="text-gray-500 mb-4">Este paciente no tiene historia clínica registrada</p>
              <button (click)="openHistoriaModal()" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50">
                Crear Historia Clínica
              </button>
            </div>
          </div>
        }

        <!-- Error -->
        @if (historiaError()) {
          <div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {{ historiaError() }}
            <button (click)="loadHistoria()" class="ml-2 underline">Reintentar</button>
          </div>
        }

        <!-- Historia existente -->
        @if (historia()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Historia Clínica Panel -->
            <div class="lg:col-span-1 space-y-6">
              <div class="bg-white rounded-lg shadow border border-gray-200">
                <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">Datos de Historia</h3>
                  <button (click)="openHistoriaModal()" class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                </div>
                <div class="p-5 space-y-4">
                  <div>
                    <p class="text-sm text-gray-500">Fecha de Apertura</p>
                    <p class="font-medium">{{ historia()!.fecha_apertura | date:'dd/MM/yyyy' }}</p>
                  </div>

                  @if (historia()!.peso_nacimiento_gr) {
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-sm text-gray-500">Peso Nac.</p>
                        <p class="font-medium">{{ historia()!.peso_nacimiento_gr }} gr</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500">Talla Nac.</p>
                        <p class="font-medium">{{ historia()!.talla_nacimiento_cm || '-' }} cm</p>
                      </div>
                    </div>
                  }

                  @if (historia()!.semanas_gestacion) {
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-sm text-gray-500">Semanas Gest.</p>
                        <p class="font-medium">{{ historia()!.semanas_gestacion }} sem</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500">Tipo Parto</p>
                        <p class="font-medium">{{ historia()!.tipo_parto_display || historia()!.tipo_parto || '-' }}</p>
                      </div>
                    </div>
                  }

                  @if (historia()!.apgar_1min !== undefined || historia()!.apgar_5min !== undefined) {
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-sm text-gray-500">APGAR 1min</p>
                        <p class="font-medium">{{ historia()!.apgar_1min ?? '-' }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500">APGAR 5min</p>
                        <p class="font-medium">{{ historia()!.apgar_5min ?? '-' }}</p>
                      </div>
                    </div>
                  }

                  @if (historia()!.grupo_sanguineo) {
                    <div>
                      <p class="text-sm text-gray-500">Grupo Sanguíneo</p>
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{{ historia()!.grupo_sanguineo_display || historia()!.grupo_sanguineo }}</span>
                    </div>
                  }

                  @if (historia()!.alergias) {
                    <div>
                      <p class="text-sm text-gray-500">Alergias</p>
                      <p class="text-red-600 font-medium">{{ historia()!.alergias }}</p>
                    </div>
                  }

                  @if (historia()!.antecedentes_personales) {
                    <div>
                      <p class="text-sm text-gray-500">Antecedentes Personales</p>
                      <p class="text-gray-700">{{ historia()!.antecedentes_personales }}</p>
                    </div>
                  }

                  @if (historia()!.antecedentes_familiares) {
                    <div>
                      <p class="text-sm text-gray-500">Antecedentes Familiares</p>
                      <p class="text-gray-700">{{ historia()!.antecedentes_familiares }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Notas SOAPIE Panel -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow border border-gray-200">
                <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">
                    Notas de Enfermería SOAPIE
                    <span class="text-gray-500 font-normal">({{ notas().length }})</span>
                  </h3>
                  <button (click)="openNotaModal()" class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Nueva Nota
                  </button>
                </div>

                @if (loadingNotas()) {
                  <div class="p-5 flex justify-center py-8">
                    <div class="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                } @else if (notas().length === 0) {
                  <div class="p-5 text-center py-8 text-gray-500">
                    No hay notas registradas
                  </div>
                } @else {
                  <div class="divide-y divide-gray-200">
                    @for (nota of notas(); track nota.id) {
                      <div class="p-4 hover:bg-gray-50 cursor-pointer" (click)="viewNota(nota)">
                        <div class="flex items-start justify-between mb-2">
                          <div>
                            <p class="font-medium text-gray-900">{{ nota.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
                            @if (nota.cita_info) {
                              <p class="text-sm text-gray-500">{{ nota.cita_info.servicio_nombre }}</p>
                            }
                          </div>
                          <div class="flex items-center gap-2">
                            @if (nota.temperatura) {
                              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ nota.temperatura }}°C</span>
                            }
                            @if (nota.frecuencia_cardiaca) {
                              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ nota.frecuencia_cardiaca }} bpm</span>
                            }
                          </div>
                        </div>
                        <p class="text-sm text-gray-600 line-clamp-2">
                          <strong>S:</strong> {{ nota.subjetivo }}
                        </p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }
      }
    </div>

    <!-- Historia Modal -->
    @if (showHistoriaModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ historia() ? 'Editar Historia Clínica' : 'Nueva Historia Clínica' }}
            </h2>
          </div>
          <form [formGroup]="historiaForm" (ngSubmit)="saveHistoria()" class="p-6 space-y-4">
            <h4 class="font-medium text-gray-900">Datos del Nacimiento</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Peso (gr)</label>
                <input type="number" formControlName="peso_nacimiento_gr" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="3200">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Talla (cm)</label>
                <input type="number" formControlName="talla_nacimiento_cm" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.1" placeholder="50.5">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">P. Cefálico (cm)</label>
                <input type="number" formControlName="perimetro_cefalico_nacimiento_cm" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.1">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Semanas Gestación</label>
                <input type="number" formControlName="semanas_gestacion" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="39">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Parto</label>
                <select formControlName="tipo_parto" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Seleccionar...</option>
                  <option value="vaginal">Vaginal</option>
                  <option value="cesarea">Cesárea</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Grupo Sanguíneo</label>
                <select formControlName="grupo_sanguineo" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Seleccionar...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="ND">No determinado</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">APGAR 1 min</label>
                <input type="number" formControlName="apgar_1min" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" min="0" max="10">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">APGAR 5 min</label>
                <input type="number" formControlName="apgar_5min" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" min="0" max="10">
              </div>
            </div>

            <h4 class="font-medium text-gray-900 pt-4 border-t border-gray-200">Antecedentes</h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
              <input type="text" formControlName="alergias" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Ninguna conocida">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Antecedentes Personales</label>
              <textarea formControlName="antecedentes_personales" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Antecedentes Familiares</label>
              <textarea formControlName="antecedentes_familiares" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Antecedentes Perinatales</label>
              <textarea formControlName="antecedentes_perinatales" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Alimentación</label>
              <input type="text" formControlName="tipo_alimentacion" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Lactancia materna exclusiva">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea formControlName="observaciones" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>

            @if (historiaFormError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">{{ historiaFormError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeHistoriaModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" [disabled]="savingHistoria()" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50">
                @if (savingHistoria()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                }
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Nota SOAPIE Modal -->
    @if (showNotaModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ editingNota() ? 'Editar Nota SOAPIE' : 'Nueva Nota SOAPIE' }}
            </h2>
          </div>
          <form [formGroup]="notaForm" (ngSubmit)="saveNota()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora *</label>
              <input type="datetime-local" formControlName="fecha" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
                <input type="number" formControlName="temperatura" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.1" placeholder="36.5">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">FC (bpm)</label>
                <input type="number" formControlName="frecuencia_cardiaca" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="80">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">FR (rpm)</label>
                <input type="number" formControlName="frecuencia_respiratoria" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="18">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SatO2 (%)</label>
                <input type="number" formControlName="saturacion_oxigeno" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="98">
              </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 text-blue-800">S - Subjetivo *</label>
                <textarea formControlName="subjetivo" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Lo que el paciente o familiar refiere..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 text-blue-800">O - Objetivo *</label>
                <textarea formControlName="objetivo" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Hallazgos de la valoración física..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 text-blue-800">A - Análisis *</label>
                <textarea formControlName="analisis" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Diagnóstico de enfermería..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 text-blue-800">P - Planificación *</label>
                <textarea formControlName="planificacion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Plan de cuidados..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 text-blue-800">I - Intervención *</label>
                <textarea formControlName="intervencion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Acciones realizadas..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 text-blue-800">E - Evaluación *</label>
                <textarea formControlName="evaluacion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Resultado de las intervenciones..."></textarea>
              </div>
            </div>

            @if (notaFormError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">{{ notaFormError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeNotaModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" [disabled]="notaForm.invalid || savingNota()" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50">
                @if (savingNota()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                }
                Guardar Nota
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- View Nota Modal -->
    @if (showNotaDetailModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Detalle de Nota SOAPIE</h2>
            <button (click)="closeNotaDetailModal()" class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          @if (viewingNota()) {
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <p class="text-lg font-medium">{{ viewingNota()!.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
                <div class="flex gap-2">
                  <button (click)="editNota(viewingNota()!)" class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Editar
                  </button>
                  <button (click)="confirmDeleteNota(viewingNota()!)" class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                    Eliminar
                  </button>
                </div>
              </div>

              @if (viewingNota()!.temperatura || viewingNota()!.frecuencia_cardiaca || viewingNota()!.frecuencia_respiratoria || viewingNota()!.saturacion_oxigeno) {
                <div class="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  @if (viewingNota()!.temperatura) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">Temp.</p>
                      <p class="font-semibold">{{ viewingNota()!.temperatura }}°C</p>
                    </div>
                  }
                  @if (viewingNota()!.frecuencia_cardiaca) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">FC</p>
                      <p class="font-semibold">{{ viewingNota()!.frecuencia_cardiaca }} bpm</p>
                    </div>
                  }
                  @if (viewingNota()!.frecuencia_respiratoria) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">FR</p>
                      <p class="font-semibold">{{ viewingNota()!.frecuencia_respiratoria }} rpm</p>
                    </div>
                  }
                  @if (viewingNota()!.saturacion_oxigeno) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">SatO2</p>
                      <p class="font-semibold">{{ viewingNota()!.saturacion_oxigeno }}%</p>
                    </div>
                  }
                </div>
              }

              <div class="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <p class="text-sm font-semibold text-blue-800">S - Subjetivo</p>
                  <p class="text-gray-700">{{ viewingNota()!.subjetivo }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800">O - Objetivo</p>
                  <p class="text-gray-700">{{ viewingNota()!.objetivo }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800">A - Análisis</p>
                  <p class="text-gray-700">{{ viewingNota()!.analisis }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800">P - Planificación</p>
                  <p class="text-gray-700">{{ viewingNota()!.planificacion }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800">I - Intervención</p>
                  <p class="text-gray-700">{{ viewingNota()!.intervencion }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800">E - Evaluación</p>
                  <p class="text-gray-700">{{ viewingNota()!.evaluacion }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class HistoriaClinicaComponent implements OnInit {
  private historiaService = inject(HistoriaClinicaService);
  private pacientesService = inject(PacientesService);
  private fb = inject(FormBuilder);
  private searchSubject = new Subject<string>();

  // Search
  pacienteSearch = '';
  searching = signal(false);
  searchResults = signal<Paciente[]>([]);

  // Selected
  selectedPaciente = signal<Paciente | null>(null);
  historia = signal<HistoriaClinica | null>(null);
  notas = signal<NotaSOAPIE[]>([]);
  loadingHistoria = signal(false);
  loadingNotas = signal(false);
  historiaError = signal<string | null>(null);

  // Historia Modal
  showHistoriaModal = signal(false);
  savingHistoria = signal(false);
  historiaFormError = signal<string | null>(null);

  // Nota Modal
  showNotaModal = signal(false);
  editingNota = signal<NotaSOAPIE | null>(null);
  savingNota = signal(false);
  notaFormError = signal<string | null>(null);

  // Nota Detail Modal
  showNotaDetailModal = signal(false);
  viewingNota = signal<NotaSOAPIE | null>(null);

  historiaForm = this.fb.group({
    peso_nacimiento_gr: [null as number | null],
    talla_nacimiento_cm: [null as number | null],
    perimetro_cefalico_nacimiento_cm: [null as number | null],
    semanas_gestacion: [null as number | null],
    tipo_parto: ['' as TipoParto | ''],
    apgar_1min: [null as number | null],
    apgar_5min: [null as number | null],
    alergias: [''],
    grupo_sanguineo: ['' as GrupoSanguineo | ''],
    antecedentes_personales: [''],
    antecedentes_familiares: [''],
    antecedentes_perinatales: [''],
    tipo_alimentacion: [''],
    observaciones: ['']
  });

  notaForm = this.fb.group({
    fecha: ['', Validators.required],
    subjetivo: ['', Validators.required],
    objetivo: ['', Validators.required],
    analisis: ['', Validators.required],
    planificacion: ['', Validators.required],
    intervencion: ['', Validators.required],
    evaluacion: ['', Validators.required],
    temperatura: [null as number | null],
    frecuencia_cardiaca: [null as number | null],
    frecuencia_respiratoria: [null as number | null],
    saturacion_oxigeno: [null as number | null]
  });

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchPacientes(term);
    });
  }

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
    this.loadHistoria();
  }

  clearSelection(): void {
    this.selectedPaciente.set(null);
    this.historia.set(null);
    this.notas.set([]);
    this.historiaError.set(null);
  }

  loadHistoria(): void {
    const paciente = this.selectedPaciente();
    if (!paciente) return;

    this.loadingHistoria.set(true);
    this.historiaError.set(null);

    this.historiaService.getHistoria(paciente.id).subscribe({
      next: (historia) => {
        this.historia.set(historia);
        this.loadingHistoria.set(false);
        this.loadNotas();
      },
      error: (err) => {
        if (err.status === 404) {
          this.historia.set(null);
        } else {
          this.historiaError.set('Error al cargar la historia clínica');
        }
        this.loadingHistoria.set(false);
      }
    });
  }

  loadNotas(): void {
    const paciente = this.selectedPaciente();
    if (!paciente) return;

    this.loadingNotas.set(true);
    this.historiaService.getNotas(paciente.id).subscribe({
      next: (notas) => {
        this.notas.set(notas);
        this.loadingNotas.set(false);
      },
      error: () => this.loadingNotas.set(false)
    });
  }

  // Historia Modal
  openHistoriaModal(): void {
    const h = this.historia();
    if (h) {
      this.historiaForm.patchValue({
        peso_nacimiento_gr: h.peso_nacimiento_gr || null,
        talla_nacimiento_cm: h.talla_nacimiento_cm ? parseFloat(h.talla_nacimiento_cm) : null,
        perimetro_cefalico_nacimiento_cm: h.perimetro_cefalico_nacimiento_cm ? parseFloat(h.perimetro_cefalico_nacimiento_cm) : null,
        semanas_gestacion: h.semanas_gestacion || null,
        tipo_parto: h.tipo_parto || '',
        apgar_1min: h.apgar_1min ?? null,
        apgar_5min: h.apgar_5min ?? null,
        alergias: h.alergias || '',
        grupo_sanguineo: h.grupo_sanguineo || '',
        antecedentes_personales: h.antecedentes_personales || '',
        antecedentes_familiares: h.antecedentes_familiares || '',
        antecedentes_perinatales: h.antecedentes_perinatales || '',
        tipo_alimentacion: h.tipo_alimentacion || '',
        observaciones: h.observaciones || ''
      });
    } else {
      this.historiaForm.reset();
    }
    this.historiaFormError.set(null);
    this.showHistoriaModal.set(true);
  }

  closeHistoriaModal(): void {
    this.showHistoriaModal.set(false);
  }

  saveHistoria(): void {
    const paciente = this.selectedPaciente();
    if (!paciente) return;

    this.savingHistoria.set(true);
    this.historiaFormError.set(null);

    const data: HistoriaClinicaCreate = {};
    const formValue = this.historiaForm.value;

    if (formValue.peso_nacimiento_gr) data.peso_nacimiento_gr = formValue.peso_nacimiento_gr;
    if (formValue.talla_nacimiento_cm) data.talla_nacimiento_cm = formValue.talla_nacimiento_cm;
    if (formValue.perimetro_cefalico_nacimiento_cm) data.perimetro_cefalico_nacimiento_cm = formValue.perimetro_cefalico_nacimiento_cm;
    if (formValue.semanas_gestacion) data.semanas_gestacion = formValue.semanas_gestacion;
    if (formValue.tipo_parto) data.tipo_parto = formValue.tipo_parto as TipoParto;
    if (formValue.apgar_1min !== null) data.apgar_1min = formValue.apgar_1min;
    if (formValue.apgar_5min !== null) data.apgar_5min = formValue.apgar_5min;
    if (formValue.alergias) data.alergias = formValue.alergias;
    if (formValue.grupo_sanguineo) data.grupo_sanguineo = formValue.grupo_sanguineo as GrupoSanguineo;
    if (formValue.antecedentes_personales) data.antecedentes_personales = formValue.antecedentes_personales;
    if (formValue.antecedentes_familiares) data.antecedentes_familiares = formValue.antecedentes_familiares;
    if (formValue.antecedentes_perinatales) data.antecedentes_perinatales = formValue.antecedentes_perinatales;
    if (formValue.tipo_alimentacion) data.tipo_alimentacion = formValue.tipo_alimentacion;
    if (formValue.observaciones) data.observaciones = formValue.observaciones;

    const request = this.historia()
      ? this.historiaService.updateHistoria(paciente.id, data)
      : this.historiaService.createHistoria(paciente.id, data);

    request.subscribe({
      next: () => {
        this.closeHistoriaModal();
        this.loadHistoria();
        this.savingHistoria.set(false);
      },
      error: (err) => {
        this.historiaFormError.set(err.error?.detail || 'Error al guardar');
        this.savingHistoria.set(false);
      }
    });
  }

  // Nota Modal
  openNotaModal(): void {
    this.editingNota.set(null);
    const now = new Date();
    const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.notaForm.reset({ fecha: localDatetime });
    this.notaFormError.set(null);
    this.showNotaModal.set(true);
  }

  closeNotaModal(): void {
    this.showNotaModal.set(false);
    this.editingNota.set(null);
  }

  saveNota(): void {
    const paciente = this.selectedPaciente();
    if (!paciente || this.notaForm.invalid) return;

    this.savingNota.set(true);
    this.notaFormError.set(null);

    const formValue = this.notaForm.value;
    const data: NotaSOAPIECreate = {
      fecha: formValue.fecha!,
      subjetivo: formValue.subjetivo!,
      objetivo: formValue.objetivo!,
      analisis: formValue.analisis!,
      planificacion: formValue.planificacion!,
      intervencion: formValue.intervencion!,
      evaluacion: formValue.evaluacion!,
      temperatura: formValue.temperatura || undefined,
      frecuencia_cardiaca: formValue.frecuencia_cardiaca || undefined,
      frecuencia_respiratoria: formValue.frecuencia_respiratoria || undefined,
      saturacion_oxigeno: formValue.saturacion_oxigeno || undefined
    };

    const editing = this.editingNota();
    const request = editing
      ? this.historiaService.updateNota(paciente.id, editing.id, data)
      : this.historiaService.createNota(paciente.id, data);

    request.subscribe({
      next: () => {
        this.closeNotaModal();
        this.loadNotas();
        this.savingNota.set(false);
      },
      error: (err) => {
        this.notaFormError.set(err.error?.detail || 'Error al guardar la nota');
        this.savingNota.set(false);
      }
    });
  }

  // Nota Detail
  viewNota(nota: NotaSOAPIE): void {
    this.viewingNota.set(nota);
    this.showNotaDetailModal.set(true);
  }

  closeNotaDetailModal(): void {
    this.showNotaDetailModal.set(false);
    this.viewingNota.set(null);
  }

  editNota(nota: NotaSOAPIE): void {
    this.closeNotaDetailModal();
    this.editingNota.set(nota);
    this.notaForm.patchValue({
      fecha: nota.fecha.slice(0, 16),
      subjetivo: nota.subjetivo,
      objetivo: nota.objetivo,
      analisis: nota.analisis,
      planificacion: nota.planificacion,
      intervencion: nota.intervencion,
      evaluacion: nota.evaluacion,
      temperatura: nota.temperatura || null,
      frecuencia_cardiaca: nota.frecuencia_cardiaca || null,
      frecuencia_respiratoria: nota.frecuencia_respiratoria || null,
      saturacion_oxigeno: nota.saturacion_oxigeno || null
    });
    this.notaFormError.set(null);
    this.showNotaModal.set(true);
  }

  confirmDeleteNota(nota: NotaSOAPIE): void {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
      const paciente = this.selectedPaciente();
      if (!paciente) return;

      this.historiaService.deleteNota(paciente.id, nota.id).subscribe({
        next: () => {
          this.closeNotaDetailModal();
          this.loadNotas();
        },
        error: (err) => alert(err.error?.detail || 'Error al eliminar')
      });
    }
  }
}
