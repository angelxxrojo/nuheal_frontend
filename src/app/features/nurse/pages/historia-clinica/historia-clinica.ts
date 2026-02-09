import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { PacientesService } from '../../services/pacientes.service';
import { AgendaService } from '../../services/agenda.service';
import {
  HistoriaClinica,
  HistoriaClinicaCreate,
  NotaSOAPIE,
  NotaSOAPIECreate,
  GrupoSanguineo,
  TipoParto,
  DiagnosticoNANDA,
  DiagnosticoCIE10
} from '../../../../models/historia-clinica.model';
import { Paciente } from '../../../../models/paciente.model';
import { Cita } from '../../../../models/cita.model';
import { debounceTime, Subject, finalize } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Historia Clínica" />

      <!-- Search Paciente -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5">
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
                    {{ getInitials(p.nombre_completo) }}
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
          <div class="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Sin paciente seleccionado -->
      @if (!selectedPaciente() && !loadingHistoria()) {
        <div class="rounded-2xl border border-gray-200 bg-white p-5">
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
                {{ getInitials(selectedPaciente()!.nombre_completo) }}
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
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <div class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Sin Historia Clínica</h3>
              <p class="text-gray-500 mb-4">Este paciente no tiene historia clínica registrada</p>
              <button (click)="openHistoriaModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
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
                  <button (click)="openNotaModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Nueva Nota
                  </button>
                </div>

                @if (loadingNotas()) {
                  <div class="p-5 flex justify-center py-8">
                    <div class="w-6 h-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
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
                              <p class="text-sm text-gray-500">{{ nota.cita_info.servicio }}</p>
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
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeHistoriaModal()"></div>
        <div class="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeHistoriaModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">
            {{ historia() ? 'Editar Historia Clínica' : 'Nueva Historia Clínica' }}
          </h4>
          <form [formGroup]="historiaForm" (ngSubmit)="saveHistoria()" class="space-y-5">
            <h4 class="font-medium text-gray-900">Datos del Nacimiento</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Peso (gr)</label>
                <input type="number" formControlName="peso_nacimiento_gr" placeholder="3200"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Talla (cm)</label>
                <input type="number" formControlName="talla_nacimiento_cm" step="0.1" placeholder="50.5"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">P. Cefálico (cm)</label>
                <input type="number" formControlName="perimetro_cefalico_nacimiento_cm" step="0.1"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Semanas Gestación</label>
                <input type="number" formControlName="semanas_gestacion" placeholder="39"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Parto</label>
                <select formControlName="tipo_parto"
                        class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                  <option value="">Seleccionar...</option>
                  <option value="vaginal">Vaginal</option>
                  <option value="cesarea">Cesárea</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Grupo Sanguíneo</label>
                <select formControlName="grupo_sanguineo"
                        class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
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
                <label class="block text-sm font-medium text-gray-700 mb-1.5">APGAR 1 min</label>
                <input type="number" formControlName="apgar_1min" min="0" max="10"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">APGAR 5 min</label>
                <input type="number" formControlName="apgar_5min" min="0" max="10"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>

            <h4 class="font-medium text-gray-900 pt-4 border-t border-gray-200">Antecedentes</h4>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Alergias</label>
              <input type="text" formControlName="alergias" placeholder="Ninguna conocida"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Antecedentes Personales</label>
              <textarea formControlName="antecedentes_personales" rows="2"
                        class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Antecedentes Familiares</label>
              <textarea formControlName="antecedentes_familiares" rows="2"
                        class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Antecedentes Perinatales</label>
              <textarea formControlName="antecedentes_perinatales" rows="2"
                        class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Alimentación</label>
              <input type="text" formControlName="tipo_alimentacion" placeholder="Lactancia materna exclusiva"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Observaciones</label>
              <textarea formControlName="observaciones" rows="2"
                        class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>

            @if (historiaFormError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{{ historiaFormError() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button type="button" (click)="closeHistoriaModal()"
                      class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="savingHistoria()"
                      class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingHistoria()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeNotaModal()"></div>
        <div class="relative w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeNotaModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">
            {{ editingNota() ? 'Editar Nota SOAPIE' : 'Nueva Nota SOAPIE' }}
          </h4>
          <form [formGroup]="notaForm" (ngSubmit)="saveNota()" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha y Hora *</label>
                <input type="datetime-local" formControlName="fecha"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Cita relacionada (opcional)</label>
                @if (loadingCitas()) {
                  <div class="flex items-center gap-2 h-11 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    <span class="text-sm text-gray-500">Cargando citas...</span>
                  </div>
                } @else if (!selectedCita()) {
                  @if (citasPaciente().length === 0) {
                    <div class="h-11 flex items-center px-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                      Sin citas registradas
                    </div>
                  } @else {
                    <select (change)="onCitaChange($event)"
                            class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                      <option value="">Seleccionar cita...</option>
                      @for (cita of citasPaciente(); track cita.id) {
                        <option [value]="cita.id">
                          {{ formatDateShort(cita.fecha) }} - {{ cita.servicio_nombre }} ({{ cita.estado_display || cita.estado }})
                        </option>
                      }
                    </select>
                  }
                } @else {
                  <div class="flex items-center justify-between h-11 px-3 bg-green-50 rounded-lg border border-green-200">
                    <div class="flex items-center gap-2">
                      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs"
                           [style.background-color]="selectedCita()!.servicio_color || '#10B981'"
                           [style.color]="'#fff'">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <span class="text-sm font-medium text-gray-700">{{ selectedCita()!.servicio_nombre }} - {{ formatDateShort(selectedCita()!.fecha) }}</span>
                    </div>
                    <button type="button" (click)="clearCita()" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Temperatura (°C)</label>
                <input type="number" formControlName="temperatura" step="0.1" placeholder="36.5"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">FC (bpm)</label>
                <input type="number" formControlName="frecuencia_cardiaca" placeholder="80"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">FR (rpm)</label>
                <input type="number" formControlName="frecuencia_respiratoria" placeholder="18"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">SatO2 (%)</label>
                <input type="number" formControlName="saturacion_oxigeno" placeholder="98"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">PA Sistólica (mmHg)</label>
                <input type="number" formControlName="presion_sistolica" placeholder="120"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">PA Diastólica (mmHg)</label>
                <input type="number" formControlName="presion_diastolica" placeholder="80"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Glucosa Capilar (mg/dL)</label>
                <input type="number" formControlName="glucosa_capilar" placeholder="90"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-xl space-y-4">
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1.5">S - Subjetivo *</label>
                <textarea formControlName="subjetivo" rows="2" placeholder="Lo que el paciente o familiar refiere..."
                          class="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1.5">O - Objetivo *</label>
                <textarea formControlName="objetivo" rows="2" placeholder="Hallazgos de la valoración física..."
                          class="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1.5">A - Análisis *</label>
                <textarea formControlName="analisis" rows="2" placeholder="Diagnóstico de enfermería..."
                          class="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1.5">P - Planificación *</label>
                <textarea formControlName="planificacion" rows="2" placeholder="Plan de cuidados..."
                          class="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1.5">I - Intervención *</label>
                <textarea formControlName="intervencion" rows="2" placeholder="Acciones realizadas..."
                          class="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1.5">E - Evaluación *</label>
                <textarea formControlName="evaluacion" rows="2" placeholder="Resultado de las intervenciones..."
                          class="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20"></textarea>
              </div>
            </div>

            <!-- Diagnósticos (opcional) -->
            <div class="space-y-4">
              <h5 class="font-medium text-gray-900">Diagnósticos (opcional)</h5>

              <!-- NANDA -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Diagnósticos NANDA</label>
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="nandaSearchTerm"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="searchNanda($event)"
                    placeholder="Buscar diagnóstico NANDA..."
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                  >
                  @if (nandaResults().length > 0) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (d of nandaResults(); track d.id) {
                        <button type="button" (click)="addNanda(d)" class="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0">
                          <span class="font-medium">{{ d.codigo }}</span> - {{ d.etiqueta }}
                        </button>
                      }
                    </div>
                  }
                </div>
                @if (selectedNandaDiags().length > 0) {
                  <div class="flex flex-wrap gap-2 mt-2">
                    @for (d of selectedNandaDiags(); track d.id) {
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ d.codigo }} - {{ d.etiqueta }}
                        <button type="button" (click)="removeNanda(d)" class="ml-1 text-blue-600 hover:text-blue-900">&times;</button>
                      </span>
                    }
                  </div>
                }
              </div>

              <!-- CIE-10 -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Diagnósticos CIE-10</label>
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="cie10SearchTerm"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="searchCie10($event)"
                    placeholder="Buscar diagnóstico CIE-10..."
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                  >
                  @if (cie10Results().length > 0) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (d of cie10Results(); track d.id) {
                        <button type="button" (click)="addCie10(d)" class="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0">
                          <span class="font-medium">{{ d.codigo }}</span> - {{ d.descripcion }}
                        </button>
                      }
                    </div>
                  }
                </div>
                @if (selectedCie10Diags().length > 0) {
                  <div class="flex flex-wrap gap-2 mt-2">
                    @for (d of selectedCie10Diags(); track d.id) {
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {{ d.codigo }} - {{ d.descripcion }}
                        <button type="button" (click)="removeCie10(d)" class="ml-1 text-green-600 hover:text-green-900">&times;</button>
                      </span>
                    }
                  </div>
                }
              </div>
            </div>

            @if (notaFormError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{{ notaFormError() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button type="button" (click)="closeNotaModal()"
                      class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="notaForm.invalid || savingNota()"
                      class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingNota()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeNotaDetailModal()"></div>
        <div class="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeNotaDetailModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Detalle de Nota SOAPIE</h4>
          @if (viewingNota()) {
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-lg font-medium text-gray-900">{{ viewingNota()!.fecha | date:'dd/MM/yyyy HH:mm' }}</p>
                  @if (viewingNota()!.cita_info) {
                    <p class="text-sm text-gray-500">Cita: {{ viewingNota()!.cita_info?.servicio }}</p>
                  }
                </div>
                <div class="flex gap-2">
                  <button (click)="editNota(viewingNota()!)"
                          class="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                    Editar
                  </button>
                  <button (click)="confirmDeleteNota(viewingNota()!)"
                          class="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition">
                    Eliminar
                  </button>
                </div>
              </div>

              @if (viewingNota()!.temperatura || viewingNota()!.frecuencia_cardiaca || viewingNota()!.frecuencia_respiratoria || viewingNota()!.saturacion_oxigeno || viewingNota()!.presion_arterial || viewingNota()!.glucosa_capilar) {
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                  @if (viewingNota()!.temperatura) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">Temp.</p>
                      <p class="font-semibold text-gray-900">{{ viewingNota()!.temperatura }}°C</p>
                    </div>
                  }
                  @if (viewingNota()!.frecuencia_cardiaca) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">FC</p>
                      <p class="font-semibold text-gray-900">{{ viewingNota()!.frecuencia_cardiaca }} bpm</p>
                    </div>
                  }
                  @if (viewingNota()!.frecuencia_respiratoria) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">FR</p>
                      <p class="font-semibold text-gray-900">{{ viewingNota()!.frecuencia_respiratoria }} rpm</p>
                    </div>
                  }
                  @if (viewingNota()!.saturacion_oxigeno) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">SatO2</p>
                      <p class="font-semibold text-gray-900">{{ viewingNota()!.saturacion_oxigeno }}%</p>
                    </div>
                  }
                  @if (viewingNota()!.presion_arterial) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">PA</p>
                      <p class="font-semibold text-gray-900">{{ viewingNota()!.presion_arterial }}</p>
                    </div>
                  }
                  @if (viewingNota()!.glucosa_capilar) {
                    <div class="text-center">
                      <p class="text-sm text-gray-500">Glucosa</p>
                      <p class="font-semibold text-gray-900">{{ viewingNota()!.glucosa_capilar }} mg/dL</p>
                    </div>
                  }
                </div>
              }

              @if (viewingNota()!.diagnosticos_nanda?.length || viewingNota()!.diagnosticos_cie10?.length) {
                <div class="space-y-3">
                  @if (viewingNota()!.diagnosticos_nanda?.length) {
                    <div>
                      <p class="text-sm font-medium text-gray-700 mb-1">Diagnósticos NANDA</p>
                      <div class="flex flex-wrap gap-2">
                        @for (d of viewingNota()!.diagnosticos_nanda!; track d.id) {
                          <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{{ d.codigo }} - {{ d.etiqueta }}</span>
                        }
                      </div>
                    </div>
                  }
                  @if (viewingNota()!.diagnosticos_cie10?.length) {
                    <div>
                      <p class="text-sm font-medium text-gray-700 mb-1">Diagnósticos CIE-10</p>
                      <div class="flex flex-wrap gap-2">
                        @for (d of viewingNota()!.diagnosticos_cie10!; track d.id) {
                          <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{{ d.codigo }} - {{ d.descripcion }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <div class="space-y-4 bg-blue-50 p-5 rounded-xl">
                <div>
                  <p class="text-sm font-semibold text-blue-800 mb-1">S - Subjetivo</p>
                  <p class="text-gray-700">{{ viewingNota()!.subjetivo }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800 mb-1">O - Objetivo</p>
                  <p class="text-gray-700">{{ viewingNota()!.objetivo }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800 mb-1">A - Análisis</p>
                  <p class="text-gray-700">{{ viewingNota()!.analisis }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800 mb-1">P - Planificación</p>
                  <p class="text-gray-700">{{ viewingNota()!.planificacion }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800 mb-1">I - Intervención</p>
                  <p class="text-gray-700">{{ viewingNota()!.intervencion }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-blue-800 mb-1">E - Evaluación</p>
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
  private agendaService = inject(AgendaService);
  private fb = inject(FormBuilder);
  private searchSubject = new Subject<string>();

  // Search
  pacienteSearch = '';
  searching = signal(false);
  searchResults = signal<Paciente[]>([]);

  // Citas del paciente para vincular notas
  citasPaciente = signal<Cita[]>([]);
  selectedCita = signal<Cita | null>(null);
  loadingCitas = signal(false);

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

  // Diagnostics
  nandaSearchTerm = '';
  cie10SearchTerm = '';
  nandaResults = signal<DiagnosticoNANDA[]>([]);
  cie10Results = signal<DiagnosticoCIE10[]>([]);
  selectedNandaDiags = signal<DiagnosticoNANDA[]>([]);
  selectedCie10Diags = signal<DiagnosticoCIE10[]>([]);

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
    saturacion_oxigeno: [null as number | null],
    presion_sistolica: [null as number | null],
    presion_diastolica: [null as number | null],
    glucosa_capilar: [null as number | null]
  });

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchPacientes(term);
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
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
    this.loadCitasPaciente(paciente.id);
  }

  loadCitasPaciente(pacienteId: number): void {
    this.loadingCitas.set(true);
    this.citasPaciente.set([]);
    this.selectedCita.set(null);
    this.agendaService.getCitas({ paciente: pacienteId, page_size: 50 }).subscribe({
      next: (response) => {
        this.citasPaciente.set(response.results);
        this.loadingCitas.set(false);
      },
      error: () => {
        this.citasPaciente.set([]);
        this.loadingCitas.set(false);
      }
    });
  }

  onCitaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const citaId = parseInt(select.value, 10);
    if (citaId) {
      const cita = this.citasPaciente().find(c => c.id === citaId);
      if (cita) {
        this.selectedCita.set(cita);
        // Auto-llenar fecha con la fecha de la cita
        const citaDate = new Date(cita.fecha + 'T' + cita.hora_inicio);
        const localDatetime = new Date(citaDate.getTime() - citaDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        this.notaForm.patchValue({ fecha: localDatetime });
      }
    }
  }

  clearCita(): void {
    this.selectedCita.set(null);
  }

  formatDateShort(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  clearSelection(): void {
    this.selectedPaciente.set(null);
    this.historia.set(null);
    this.notas.set([]);
    this.historiaError.set(null);
    this.citasPaciente.set([]);
    this.selectedCita.set(null);
  }

  loadHistoria(): void {
    const paciente = this.selectedPaciente();
    if (!paciente) return;

    this.loadingHistoria.set(true);
    this.historiaError.set(null);
    this.historia.set(null);
    this.notas.set([]);

    this.historiaService.getHistoria(paciente.id)
      .pipe(finalize(() => this.loadingHistoria.set(false)))
      .subscribe({
        next: (historia) => {
          this.historia.set(historia);
          this.loadNotas();
        },
        error: (err) => {
          // 404 significa que el paciente no tiene historia clínica aún - no es error
          const isNotFound = err?.status === 404 || err?.message?.toLowerCase().includes('no encontrado');
          if (!isNotFound) {
            this.historiaError.set(err?.message || 'Error al cargar la historia clínica');
          }
          // Si es 404, historia ya está en null, solo mostrará "Sin Historia Clínica"
        }
      });
  }

  loadNotas(): void {
    const paciente = this.selectedPaciente();
    const historia = this.historia();
    if (!paciente || !historia) return;

    this.loadingNotas.set(true);
    this.historiaService.getNotas(paciente.id, historia.id).subscribe({
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
      ? this.historiaService.updateHistoria(paciente.id, this.historia()!.id, data)
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
    this.selectedCita.set(null);
    const now = new Date();
    const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.notaForm.reset({ fecha: localDatetime });
    this.notaFormError.set(null);
    this.selectedNandaDiags.set([]);
    this.selectedCie10Diags.set([]);
    this.nandaSearchTerm = '';
    this.cie10SearchTerm = '';
    this.showNotaModal.set(true);
  }

  closeNotaModal(): void {
    this.showNotaModal.set(false);
    this.editingNota.set(null);
    this.selectedCita.set(null);
  }

  saveNota(): void {
    const paciente = this.selectedPaciente();
    const historia = this.historia();
    if (!paciente || !historia || this.notaForm.invalid) return;

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
      saturacion_oxigeno: formValue.saturacion_oxigeno || undefined,
      presion_sistolica: formValue.presion_sistolica || undefined,
      presion_diastolica: formValue.presion_diastolica || undefined,
      glucosa_capilar: formValue.glucosa_capilar || undefined,
      diagnosticos_nanda_ids: this.selectedNandaDiags().length > 0 ? this.selectedNandaDiags().map(d => d.id) : undefined,
      diagnosticos_cie10_ids: this.selectedCie10Diags().length > 0 ? this.selectedCie10Diags().map(d => d.id) : undefined,
      cita: this.selectedCita()?.id || undefined
    };

    const editing = this.editingNota();
    const request = editing
      ? this.historiaService.updateNota(paciente.id, historia.id, editing.id, data)
      : this.historiaService.createNota(paciente.id, historia.id, data);

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
    // Si la nota tiene cita, seleccionarla
    if (nota.cita) {
      const cita = this.citasPaciente().find(c => c.id === nota.cita);
      this.selectedCita.set(cita || null);
    } else {
      this.selectedCita.set(null);
    }
    this.notaForm.patchValue({
      fecha: nota.fecha.slice(0, 16),
      subjetivo: nota.subjetivo,
      objetivo: nota.objetivo,
      analisis: nota.analisis,
      planificacion: nota.planificacion,
      intervencion: nota.intervencion,
      evaluacion: nota.evaluacion,
      temperatura: nota.temperatura ? parseFloat(nota.temperatura) : null,
      frecuencia_cardiaca: nota.frecuencia_cardiaca || null,
      frecuencia_respiratoria: nota.frecuencia_respiratoria || null,
      saturacion_oxigeno: nota.saturacion_oxigeno || null,
      presion_sistolica: nota.presion_sistolica || null,
      presion_diastolica: nota.presion_diastolica || null,
      glucosa_capilar: nota.glucosa_capilar ? parseFloat(nota.glucosa_capilar) : null
    });
    this.selectedNandaDiags.set(nota.diagnosticos_nanda || []);
    this.selectedCie10Diags.set(nota.diagnosticos_cie10 || []);
    this.nandaSearchTerm = '';
    this.cie10SearchTerm = '';
    this.notaFormError.set(null);
    this.showNotaModal.set(true);
  }

  confirmDeleteNota(nota: NotaSOAPIE): void {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
      const paciente = this.selectedPaciente();
      const historia = this.historia();
      if (!paciente || !historia) return;

      this.historiaService.deleteNota(paciente.id, historia.id, nota.id).subscribe({
        next: () => {
          this.closeNotaDetailModal();
          this.loadNotas();
        },
        error: (err) => alert(err.error?.detail || 'Error al eliminar')
      });
    }
  }

  // Diagnostics search
  searchNanda(term: string): void {
    if (!term || term.length < 2) {
      this.nandaResults.set([]);
      return;
    }
    this.historiaService.getDiagnosticosNANDA(term).subscribe({
      next: (data: any) => this.nandaResults.set(Array.isArray(data) ? data : (data?.results || [])),
      error: () => this.nandaResults.set([])
    });
  }

  searchCie10(term: string): void {
    if (!term || term.length < 2) {
      this.cie10Results.set([]);
      return;
    }
    this.historiaService.getDiagnosticosCIE10(term).subscribe({
      next: (data: any) => this.cie10Results.set(Array.isArray(data) ? data : (data?.results || [])),
      error: () => this.cie10Results.set([])
    });
  }

  addNanda(diag: DiagnosticoNANDA): void {
    const current = this.selectedNandaDiags();
    if (!current.find(d => d.id === diag.id)) {
      this.selectedNandaDiags.set([...current, diag]);
    }
    this.nandaSearchTerm = '';
    this.nandaResults.set([]);
  }

  removeNanda(diag: DiagnosticoNANDA): void {
    this.selectedNandaDiags.set(this.selectedNandaDiags().filter(d => d.id !== diag.id));
  }

  addCie10(diag: DiagnosticoCIE10): void {
    const current = this.selectedCie10Diags();
    if (!current.find(d => d.id === diag.id)) {
      this.selectedCie10Diags.set([...current, diag]);
    }
    this.cie10SearchTerm = '';
    this.cie10Results.set([]);
  }

  removeCie10(diag: DiagnosticoCIE10): void {
    this.selectedCie10Diags.set(this.selectedCie10Diags().filter(d => d.id !== diag.id));
  }
}
