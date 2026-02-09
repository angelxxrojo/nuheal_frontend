import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CREDService } from '../../services/cred.service';
import { PacientesService } from '../../services/pacientes.service';
import { ControlCRED, ControlCREDCreate, GraficoCRED, TipoAlerta, CalculadoraOMSResponse, SuplementoHierroEstado } from '../../../../models/cred.model';
import { Paciente } from '../../../../models/paciente.model';
import { Sexo } from '../../../../models/common.model';
import { debounceTime, Subject } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-cred',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Control CRED" />

      <!-- Alertas -->
      @if (alertas().length > 0) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div class="flex items-center gap-3 mb-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 class="font-semibold text-red-800">Alertas Nutricionales ({{ alertas().length }})</h3>
          </div>
          <div class="space-y-2">
            @for (alerta of alertas().slice(0, 5); track alerta.id) {
              <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div class="flex items-center gap-3">
                  <span [class]="getAlertBadgeClass(alerta.tipo_alerta)">
                    {{ getAlertLabel(alerta.tipo_alerta) }}
                  </span>
                  <div>
                    <p class="font-medium text-gray-900">{{ alerta.paciente_nombre }}</p>
                    <p class="text-sm text-gray-500">
                      {{ alerta.diagnostico_peso_talla_display || alerta.diagnostico_peso_edad_display }}
                    </p>
                  </div>
                </div>
                <button (click)="viewControlDetail(alerta)" class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  Ver
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Filters and Actions -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <input
              type="text"
              [(ngModel)]="pacienteSearch"
              (ngModelChange)="onPacienteSearchForFilter($event)"
              placeholder="Filtrar por paciente..."
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
            >
            @if (filterPacienteResults().length > 0) {
              <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                @for (p of filterPacienteResults(); track p.id) {
                  <button
                    type="button"
                    (click)="selectFilterPaciente(p)"
                    class="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    {{ p.nombre_completo }}
                  </button>
                }
              </div>
            }
          </div>
          @if (selectedFilterPaciente()) {
            <div class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <span>{{ selectedFilterPaciente()!.nombre_completo }}</span>
              <button (click)="clearFilterPaciente()" class="text-gray-500 hover:text-gray-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          }
          <div class="flex gap-3">
            <select [(ngModel)]="filterAlerta" (ngModelChange)="loadControles()" class="h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
              <option value="">Todas las alertas</option>
              <option value="true">Con alerta</option>
              <option value="false">Sin alerta</option>
            </select>
            <button (click)="openCalculatorModal()" class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              Calculadora OMS
            </button>
            <button (click)="openControlModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nuevo Control
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Controls List -->
      @if (!loading()) {
        @if (controles().length === 0) {
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <div class="text-center py-8">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-900">No hay controles registrados</p>
              <p class="mt-1 text-sm text-gray-500">Registra el primer control CRED</p>
              <button (click)="openControlModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors mt-4">
                Nuevo Control
              </button>
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (control of controles(); track control.id) {
              <div class="rounded-2xl border border-gray-200 bg-white cursor-pointer hover:shadow-md transition-shadow" (click)="viewControlDetail(control)">
                <div class="p-5">
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                        {{ getInitials(control.paciente_nombre || '') }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-medium text-gray-900">{{ control.paciente_nombre }}</p>
                          @if (control.tiene_alerta) {
                            <span [class]="getAlertBadgeClass(control.tipo_alerta)">
                              {{ getAlertLabel(control.tipo_alerta) }}
                            </span>
                          }
                        </div>
                        <p class="text-sm text-gray-500">
                          {{ control.fecha | date:'dd/MM/yyyy' }} • {{ control.edad_meses }} meses
                        </p>
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p class="text-xs text-gray-500">Peso</p>
                        <p class="font-semibold text-gray-900">{{ control.peso_kg }} kg</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">Talla</p>
                        <p class="font-semibold text-gray-900">{{ control.talla_cm }} cm</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">PC</p>
                        <p class="font-semibold text-gray-900">{{ control.perimetro_cefalico_cm || '-' }} cm</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      @if (control.diagnostico_peso_talla_display) {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ control.diagnostico_peso_talla_display }}</span>
                      }
                      <button
                        (click)="viewGrowthChart(control); $event.stopPropagation()"
                        class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                        title="Ver gráfico">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between mt-4">
              <p class="text-sm text-gray-500">
                Mostrando {{ controles().length }} de {{ totalCount() }} controles
              </p>
              <div class="flex items-center gap-2">
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Anterior
                </button>
                <span class="px-3 py-2 text-sm text-gray-700">
                  Página {{ currentPage() }} de {{ totalPages() }}
                </span>
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Siguiente
                </button>
              </div>
            </div>
          }
        }
      }
    </div>

    <!-- New Control Modal -->
    @if (showControlModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeControlModal()"></div>
        <div class="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeControlModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">
            {{ editingControl() ? 'Editar Control' : 'Nuevo Control CRED' }}
          </h4>
          <form [formGroup]="controlForm" (ngSubmit)="saveControl()" class="space-y-5">
            <!-- Paciente Search -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="modalPacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onModalPacienteSearch($event)"
                    (focus)="showModalPacienteDropdown.set(true)"
                    placeholder="Buscar paciente por nombre o documento..."
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                  >
                  @if (searchingModalPacientes()) {
                    <div class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                    </div>
                  }
                  @if (modalPacienteResults().length > 0 && showModalPacienteDropdown()) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      @for (p of modalPacienteResults(); track p.id) {
                        <button
                          type="button"
                          (click)="selectModalPaciente(p)"
                          class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                            {{ getInitials(p.nombre_completo) }}
                          </div>
                          <div class="min-w-0 flex-1">
                            <p class="font-medium text-gray-900 truncate">{{ p.nombre_completo }}</p>
                            <p class="text-sm text-gray-500 truncate">{{ p.edad_texto }}</p>
                          </div>
                        </button>
                      }
                    </div>
                  }
                  @if (modalPacienteSearch.length >= 2 && modalPacienteResults().length === 0 && !searchingModalPacientes() && showModalPacienteDropdown()) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                      <p class="text-sm text-gray-500">No se encontraron pacientes</p>
                    </div>
                  }
                </div>
                @if (modalPacienteSearch.length < 2) {
                  <p class="mt-1.5 text-xs text-gray-500">Escribe al menos 2 caracteres para buscar</p>
                }
              } @else {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {{ getInitials(selectedPaciente()!.nombre_completo) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ selectedPaciente()!.nombre_completo }}</p>
                      <p class="text-sm text-gray-500">{{ selectedPaciente()!.edad_texto }}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="clearModalPaciente()"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha *</label>
                <input type="date" formControlName="fecha" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" [max]="today">
              </div>
              <div></div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Peso (kg) *</label>
                <input type="number" formControlName="peso_kg" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" step="0.01" min="0" (blur)="calculatePreview()">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Talla (cm) *</label>
                <input type="number" formControlName="talla_cm" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" step="0.1" min="0" (blur)="calculatePreview()">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">P. Cefálico (cm)</label>
                <input type="number" formControlName="perimetro_cefalico_cm" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" step="0.1" min="0">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">P. Torácico (cm)</label>
                <input type="number" formControlName="perimetro_toracico_cm" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" step="0.1" min="0">
              </div>
            </div>

            <!-- Hemoglobina y Suplemento de Hierro -->
            <div class="border-t border-gray-100 pt-5">
              <h4 class="font-medium text-gray-800 mb-4">Hemoglobina y Suplemento de Hierro</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Hemoglobina (g/dL)</label>
                  <input type="number" formControlName="dosaje_hemoglobina" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" step="0.1" min="0" placeholder="Ej: 11.5">
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Estado Suplemento Hierro</label>
                  <select formControlName="suplemento_hierro_estado" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                    <option value="">-- Seleccionar --</option>
                    <option value="no_iniciado">No iniciado</option>
                    <option value="iniciado">Iniciado</option>
                    <option value="continuando">Continuando</option>
                    <option value="terminado">Terminado</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo Suplemento</label>
                  <select formControlName="suplemento_hierro_tipo" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                    <option value="">-- Seleccionar --</option>
                    <option value="gotas">Gotas</option>
                    <option value="jarabe">Jarabe</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Preview de Z-Scores -->
            @if (previewResult()) {
              <div class="p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-3">Vista Previa de Evaluación</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500">IMC</p>
                    <p class="font-semibold">{{ previewResult()!.input.imc | number:'1.1-1' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Z-Score P/E</p>
                    <p class="font-semibold">{{ previewResult()!.zscores.zscore_peso_edad | number:'1.2-2' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Z-Score T/E</p>
                    <p class="font-semibold">{{ previewResult()!.zscores.zscore_talla_edad | number:'1.2-2' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Diagnóstico</p>
                    <span [class]="previewResult()!.diagnosticos.tiene_alerta ? 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800' : 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'">
                      {{ previewResult()!.diagnosticos.diagnostico_peso_edad_display }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <div class="border-t border-gray-100 pt-5">
              <h4 class="font-medium text-gray-800 mb-4">Desarrollo (opcional)</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Desarrollo Motor</label>
                  <textarea formControlName="desarrollo_motor" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Desarrollo Lenguaje</label>
                  <textarea formControlName="desarrollo_lenguaje" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Desarrollo Social</label>
                  <textarea formControlName="desarrollo_social" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Desarrollo Cognitivo</label>
                  <textarea formControlName="desarrollo_cognitivo" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea formControlName="observaciones" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Recomendaciones</label>
              <textarea formControlName="recomendaciones" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Próxima Cita</label>
              <input type="date" formControlName="proxima_cita" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" [min]="today">
            </div>

            @if (controlError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ controlError() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeControlModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="controlForm.invalid || !selectedPaciente() || savingControl()"
                class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingControl()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Guardar Control
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Control Detail Modal -->
    @if (showDetailModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeDetailModal()"></div>
        <div class="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeDetailModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Detalle del Control</h4>
          @if (selectedControl()) {
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Paciente</p>
                  <p class="font-medium text-lg">{{ selectedControl()!.paciente_nombre }}</p>
                </div>
                @if (selectedControl()!.tiene_alerta) {
                  <span [class]="getAlertBadgeClass(selectedControl()!.tipo_alerta) + ' text-lg px-4 py-2'">
                    {{ getAlertLabel(selectedControl()!.tipo_alerta) }}
                  </span>
                }
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="p-3 bg-gray-50 rounded-lg text-center">
                  <p class="text-sm text-gray-500">Fecha</p>
                  <p class="font-semibold">{{ selectedControl()!.fecha | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg text-center">
                  <p class="text-sm text-gray-500">Edad</p>
                  <p class="font-semibold">{{ selectedControl()!.edad_meses }} meses</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg text-center">
                  <p class="text-sm text-gray-500">Peso</p>
                  <p class="font-semibold">{{ selectedControl()!.peso_kg }} kg</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg text-center">
                  <p class="text-sm text-gray-500">Talla</p>
                  <p class="font-semibold">{{ selectedControl()!.talla_cm }} cm</p>
                </div>
              </div>

              @if (selectedControl()!.perimetro_cefalico_cm || selectedControl()!.perimetro_toracico_cm || selectedControl()!.imc) {
                <div class="grid grid-cols-3 gap-4">
                  @if (selectedControl()!.perimetro_cefalico_cm) {
                    <div>
                      <p class="text-sm text-gray-500">P. Cefálico</p>
                      <p class="font-medium">{{ selectedControl()!.perimetro_cefalico_cm }} cm</p>
                    </div>
                  }
                  @if (selectedControl()!.perimetro_toracico_cm) {
                    <div>
                      <p class="text-sm text-gray-500">P. Torácico</p>
                      <p class="font-medium">{{ selectedControl()!.perimetro_toracico_cm }} cm</p>
                    </div>
                  }
                  @if (selectedControl()!.imc) {
                    <div>
                      <p class="text-sm text-gray-500">IMC</p>
                      <p class="font-medium">{{ selectedControl()!.imc }}</p>
                    </div>
                  }
                </div>
              }

              @if (selectedControl()!.dosaje_hemoglobina || selectedControl()!.suplemento_hierro_estado) {
                <div class="grid grid-cols-3 gap-4">
                  @if (selectedControl()!.dosaje_hemoglobina) {
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-sm text-gray-500">Hemoglobina</p>
                      <p class="font-semibold" [class.text-red-600]="+(selectedControl()!.dosaje_hemoglobina!) < 11">{{ selectedControl()!.dosaje_hemoglobina }} g/dL</p>
                    </div>
                  }
                  @if (selectedControl()!.suplemento_hierro_estado) {
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-sm text-gray-500">Suplemento Hierro</p>
                      <p class="font-semibold capitalize">{{ selectedControl()!.suplemento_hierro_estado!.replace('_', ' ') }}</p>
                    </div>
                  }
                  @if (selectedControl()!.suplemento_hierro_tipo) {
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-sm text-gray-500">Tipo Suplemento</p>
                      <p class="font-semibold capitalize">{{ selectedControl()!.suplemento_hierro_tipo }}</p>
                    </div>
                  }
                </div>
              }

              <div class="border-t border-gray-200 pt-4">
                <h4 class="font-medium text-gray-900 mb-3">Indicadores Z-Score OMS</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="text-center">
                    <p class="text-sm text-gray-500">Peso/Edad</p>
                    <p class="text-lg font-semibold">{{ selectedControl()!.zscore_peso_edad || '-' }}</p>
                    <p class="text-xs text-gray-500">{{ selectedControl()!.diagnostico_peso_edad_display }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-500">Talla/Edad</p>
                    <p class="text-lg font-semibold">{{ selectedControl()!.zscore_talla_edad || '-' }}</p>
                    <p class="text-xs text-gray-500">{{ selectedControl()!.diagnostico_talla_edad_display }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-500">Peso/Talla</p>
                    <p class="text-lg font-semibold">{{ selectedControl()!.zscore_peso_talla || '-' }}</p>
                    <p class="text-xs text-gray-500">{{ selectedControl()!.diagnostico_peso_talla_display }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-500">IMC/Edad</p>
                    <p class="text-lg font-semibold">{{ selectedControl()!.zscore_imc_edad || '-' }}</p>
                  </div>
                </div>
              </div>

              @if (selectedControl()!.alertas_activas && selectedControl()!.alertas_activas!.length > 0) {
                <div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                  <h4 class="font-medium mb-2">Alertas Activas</h4>
                  <ul class="list-disc list-inside">
                    @for (alerta of selectedControl()!.alertas_activas; track alerta.indicador) {
                      <li>{{ alerta.indicador }}: {{ alerta.diagnostico }}</li>
                    }
                  </ul>
                </div>
              }

              @if (selectedControl()!.observaciones) {
                <div>
                  <p class="text-sm text-gray-500">Observaciones</p>
                  <p class="text-gray-900">{{ selectedControl()!.observaciones }}</p>
                </div>
              }

              @if (selectedControl()!.recomendaciones) {
                <div>
                  <p class="text-sm text-gray-500">Recomendaciones</p>
                  <p class="text-gray-900">{{ selectedControl()!.recomendaciones }}</p>
                </div>
              }

              <div class="flex flex-col sm:flex-row gap-3 mt-8">
                <button (click)="editControl(selectedControl()!)" class="flex-1 inline-flex items-center justify-center rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                  Editar
                </button>
                <button (click)="viewGrowthChart(selectedControl()!)" class="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition">
                  Ver Gráfico
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Growth Chart Modal -->
    @if (showChartModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeChartModal()"></div>
        <div class="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeChartModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">
            Curvas de Crecimiento - {{ chartData()?.paciente_nombre }}
          </h4>
          @if (loadingChart()) {
            <div class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else if (chartData()) {
            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Peso/Edad Chart (simplified representation) -->
                <div class="bg-white rounded-lg shadow border border-gray-200">
                  <div class="px-5 py-4 border-b border-gray-200">
                    <h3 class="font-semibold">Peso para la Edad</h3>
                  </div>
                  <div class="p-5">
                    <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div class="text-center">
                        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                        </svg>
                        <p class="mt-2 text-sm text-gray-500">{{ chartData()!.controles.length }} controles registrados</p>
                      </div>
                    </div>
                    <div class="mt-4">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="text-gray-500">
                            <th class="text-left py-1">Fecha</th>
                            <th class="text-right py-1">Edad</th>
                            <th class="text-right py-1">Peso</th>
                            <th class="text-right py-1">Z-Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (c of chartData()!.controles.slice(-5); track c.fecha) {
                            <tr class="border-t border-gray-100">
                              <td class="py-1">{{ c.fecha | date:'dd/MM/yy' }}</td>
                              <td class="text-right py-1">{{ c.edad_meses }}m</td>
                              <td class="text-right py-1">{{ c.peso_kg }} kg</td>
                              <td class="text-right py-1">{{ c.zscore_peso_edad || '-' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Talla/Edad Chart -->
                <div class="bg-white rounded-lg shadow border border-gray-200">
                  <div class="px-5 py-4 border-b border-gray-200">
                    <h3 class="font-semibold">Talla para la Edad</h3>
                  </div>
                  <div class="p-5">
                    <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div class="text-center">
                        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                        </svg>
                        <p class="mt-2 text-sm text-gray-500">Curvas OMS disponibles</p>
                      </div>
                    </div>
                    <div class="mt-4">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="text-gray-500">
                            <th class="text-left py-1">Fecha</th>
                            <th class="text-right py-1">Edad</th>
                            <th class="text-right py-1">Talla</th>
                            <th class="text-right py-1">Z-Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (c of chartData()!.controles.slice(-5); track c.fecha) {
                            <tr class="border-t border-gray-100">
                              <td class="py-1">{{ c.fecha | date:'dd/MM/yy' }}</td>
                              <td class="text-right py-1">{{ c.edad_meses }}m</td>
                              <td class="text-right py-1">{{ c.talla_cm }} cm</td>
                              <td class="text-right py-1">{{ c.zscore_talla_edad || '-' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                  <strong>Nota:</strong> Los gráficos interactivos completos requieren integración con una librería de charts como Chart.js o D3.js.
                  Los datos de las curvas de referencia OMS están disponibles en la API para su visualización.
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Calculator Modal -->
    @if (showCalculatorModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeCalculatorModal()"></div>
        <div class="relative w-full max-w-[450px] rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeCalculatorModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Calculadora OMS</h4>
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Peso (kg) *</label>
                <input type="number" formControlName="peso_kg" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" step="0.01">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Talla (cm) *</label>
                <input type="number" formControlName="talla_cm" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" step="0.1">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Edad (meses) *</label>
                <input type="number" formControlName="edad_meses" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Sexo *</label>
                <select formControlName="sexo" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="calculatorForm.invalid || calculating()"
              class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
              @if (calculating()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              }
              Calcular
            </button>

            @if (calculatorResult()) {
              <div class="border-t border-gray-200 pt-4">
                <h4 class="font-medium text-gray-900 mb-3">Resultados</h4>
                <div class="space-y-3">
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500">IMC</p>
                    <p class="text-xl font-semibold">{{ calculatorResult()!.input.imc | number:'1.2-2' }}</p>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-sm text-gray-500">Z-Score P/E</p>
                      <p class="font-semibold">{{ calculatorResult()!.zscores.zscore_peso_edad | number:'1.2-2' }}</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-sm text-gray-500">Z-Score T/E</p>
                      <p class="font-semibold">{{ calculatorResult()!.zscores.zscore_talla_edad | number:'1.2-2' }}</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-sm text-gray-500">Z-Score IMC/E</p>
                      <p class="font-semibold">{{ calculatorResult()!.zscores.zscore_imc_edad | number:'1.2-2' }}</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg text-center">
                      <p class="text-sm text-gray-500">Z-Score P/T</p>
                      <p class="font-semibold">{{ calculatorResult()!.zscores.zscore_peso_talla !== null ? (calculatorResult()!.zscores.zscore_peso_talla | number:'1.2-2') : 'N/A' }}</p>
                    </div>
                  </div>
                  <div [class]="'p-4 rounded-lg text-center ' + (calculatorResult()!.diagnosticos.tiene_alerta ? 'bg-red-50' : 'bg-green-50')">
                    <span [class]="calculatorResult()!.diagnosticos.tiene_alerta ? 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800' : 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'">
                      {{ calculatorResult()!.diagnosticos.diagnostico_peso_edad_display }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <div class="flex justify-end mt-8">
              <button type="button" (click)="closeCalculatorModal()" class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class CREDComponent implements OnInit {
  private credService = inject(CREDService);
  private pacientesService = inject(PacientesService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private filterSearchSubject = new Subject<string>();
  private modalSearchSubject = new Subject<string>();

  today = new Date().toISOString().split('T')[0];

  // List state
  controles = signal<ControlCRED[]>([]);
  alertas = signal<ControlCRED[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);

  // Filter state
  pacienteSearch = '';
  filterAlerta = '';
  filterPacienteResults = signal<Paciente[]>([]);
  selectedFilterPaciente = signal<Paciente | null>(null);

  // Control Modal
  showControlModal = signal(false);
  editingControl = signal<ControlCRED | null>(null);
  savingControl = signal(false);
  controlError = signal<string | null>(null);
  selectedPaciente = signal<Paciente | null>(null);
  modalPacienteSearch = '';
  modalPacienteResults = signal<Paciente[]>([]);
  searchingModalPacientes = signal(false);
  showModalPacienteDropdown = signal(false);
  previewResult = signal<CalculadoraOMSResponse | null>(null);

  // Detail Modal
  showDetailModal = signal(false);
  selectedControl = signal<ControlCRED | null>(null);

  // Chart Modal
  showChartModal = signal(false);
  chartData = signal<GraficoCRED | null>(null);
  loadingChart = signal(false);

  // Calculator Modal
  showCalculatorModal = signal(false);
  calculating = signal(false);
  calculatorResult = signal<CalculadoraOMSResponse | null>(null);

  controlForm = this.fb.group({
    fecha: ['', Validators.required],
    peso_kg: [null as number | null, [Validators.required, Validators.min(0)]],
    talla_cm: [null as number | null, [Validators.required, Validators.min(0)]],
    perimetro_cefalico_cm: [null as number | null],
    perimetro_toracico_cm: [null as number | null],
    dosaje_hemoglobina: [null as number | null],
    suplemento_hierro_estado: [''],
    suplemento_hierro_tipo: [''],
    desarrollo_motor: [''],
    desarrollo_lenguaje: [''],
    desarrollo_social: [''],
    desarrollo_cognitivo: [''],
    observaciones: [''],
    recomendaciones: [''],
    proxima_cita: ['']
  });

  calculatorForm = this.fb.group({
    peso_kg: [null as number | null, Validators.required],
    talla_cm: [null as number | null, Validators.required],
    edad_meses: [null as number | null, Validators.required],
    sexo: ['M' as Sexo, Validators.required]
  });

  ngOnInit(): void {
    this.loadControles();
    this.loadAlertas();

    this.filterSearchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchFilterPacientes(term);
    });

    this.modalSearchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.searchModalPacientes(term);
    });

    this.route.queryParams.subscribe(params => {
      if (params['paciente']) {
        this.loadPacienteById(+params['paciente']);
      }
    });
  }

  loadControles(): void {
    this.loading.set(true);

    const params: any = {
      page: this.currentPage(),
      page_size: 10
    };

    if (this.selectedFilterPaciente()) {
      params.paciente = this.selectedFilterPaciente()!.id;
    }

    if (this.filterAlerta === 'true') {
      params.con_alerta = true;
    } else if (this.filterAlerta === 'false') {
      params.con_alerta = false;
    }

    this.credService.getControles(params).subscribe({
      next: (response) => {
        this.controles.set(response.results);
        this.totalPages.set(response.total_pages);
        this.totalCount.set(response.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadAlertas(): void {
    this.credService.getAlertas().subscribe({
      next: (alertas) => this.alertas.set(alertas),
      error: (err) => console.error('Error loading alertas:', err)
    });
  }

  loadPacienteById(id: number): void {
    this.pacientesService.getById(id).subscribe({
      next: (paciente) => {
        this.selectedPaciente.set(paciente);
        this.openControlModal();
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadControles();
    }
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
  }

  getAlertBadgeClass(tipo: TipoAlerta): string {
    const classes: Record<TipoAlerta, string> = {
      verde: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      amarillo: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      rojo: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
    };
    return classes[tipo];
  }

  getAlertLabel(tipo: TipoAlerta): string {
    const labels: Record<TipoAlerta, string> = {
      verde: 'Normal',
      amarillo: 'Riesgo',
      rojo: 'Alerta'
    };
    return labels[tipo];
  }

  // Filter methods
  onPacienteSearchForFilter(term: string): void {
    this.filterSearchSubject.next(term);
  }

  searchFilterPacientes(term: string): void {
    if (!term || term.length < 2) {
      this.filterPacienteResults.set([]);
      return;
    }
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => this.filterPacienteResults.set(response.results)
    });
  }

  selectFilterPaciente(paciente: Paciente): void {
    this.selectedFilterPaciente.set(paciente);
    this.filterPacienteResults.set([]);
    this.pacienteSearch = '';
    this.currentPage.set(1);
    this.loadControles();
  }

  clearFilterPaciente(): void {
    this.selectedFilterPaciente.set(null);
    this.currentPage.set(1);
    this.loadControles();
  }

  // Modal methods
  onModalPacienteSearch(term: string): void {
    this.modalSearchSubject.next(term);
  }

  searchModalPacientes(term: string): void {
    if (!term || term.length < 2) {
      this.modalPacienteResults.set([]);
      this.searchingModalPacientes.set(false);
      this.showModalPacienteDropdown.set(false);
      return;
    }
    this.searchingModalPacientes.set(true);
    this.showModalPacienteDropdown.set(true);
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => {
        this.modalPacienteResults.set(response.results);
        this.searchingModalPacientes.set(false);
      },
      error: () => this.searchingModalPacientes.set(false)
    });
  }

  selectModalPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.modalPacienteResults.set([]);
    this.modalPacienteSearch = '';
    this.showModalPacienteDropdown.set(false);
    this.calculatePreview();
  }

  clearModalPaciente(): void {
    this.selectedPaciente.set(null);
    this.previewResult.set(null);
    this.showModalPacienteDropdown.set(false);
  }

  openControlModal(): void {
    this.editingControl.set(null);
    this.controlForm.reset({ fecha: this.today });
    this.previewResult.set(null);
    this.controlError.set(null);
    this.showControlModal.set(true);
  }

  closeControlModal(): void {
    this.showControlModal.set(false);
    this.selectedPaciente.set(null);
    this.modalPacienteSearch = '';
    this.modalPacienteResults.set([]);
    this.showModalPacienteDropdown.set(false);
    this.searchingModalPacientes.set(false);
  }

  calculatePreview(): void {
    const paciente = this.selectedPaciente();
    const peso = this.controlForm.get('peso_kg')?.value;
    const talla = this.controlForm.get('talla_cm')?.value;

    if (!paciente || !peso || !talla || !paciente.edad?.total_months) return;

    this.credService.calcularZScores({
      peso_kg: peso,
      talla_cm: talla,
      edad_meses: paciente.edad.total_months,
      sexo: paciente.sexo
    }).subscribe({
      next: (result) => this.previewResult.set(result),
      error: () => this.previewResult.set(null)
    });
  }

  saveControl(): void {
    if (this.controlForm.invalid || !this.selectedPaciente()) return;

    this.savingControl.set(true);
    this.controlError.set(null);

    const data: ControlCREDCreate = {
      paciente: this.selectedPaciente()!.id,
      fecha: this.controlForm.value.fecha!,
      peso_kg: this.controlForm.value.peso_kg!,
      talla_cm: this.controlForm.value.talla_cm!,
      perimetro_cefalico_cm: this.controlForm.value.perimetro_cefalico_cm || undefined,
      perimetro_toracico_cm: this.controlForm.value.perimetro_toracico_cm || undefined,
      dosaje_hemoglobina: this.controlForm.value.dosaje_hemoglobina || undefined,
      suplemento_hierro_estado: (this.controlForm.value.suplemento_hierro_estado as SuplementoHierroEstado) || undefined,
      suplemento_hierro_tipo: (this.controlForm.value.suplemento_hierro_tipo as any) || undefined,
      desarrollo_motor: this.controlForm.value.desarrollo_motor || undefined,
      desarrollo_lenguaje: this.controlForm.value.desarrollo_lenguaje || undefined,
      desarrollo_social: this.controlForm.value.desarrollo_social || undefined,
      desarrollo_cognitivo: this.controlForm.value.desarrollo_cognitivo || undefined,
      observaciones: this.controlForm.value.observaciones || undefined,
      recomendaciones: this.controlForm.value.recomendaciones || undefined,
      proxima_cita: this.controlForm.value.proxima_cita || undefined
    };

    const request = this.editingControl()
      ? this.credService.updateControl(this.editingControl()!.id, data)
      : this.credService.createControl(data);

    request.subscribe({
      next: () => {
        this.closeControlModal();
        this.loadControles();
        this.loadAlertas();
        this.savingControl.set(false);
      },
      error: (err) => {
        this.controlError.set(err.error?.detail || 'Error al guardar el control');
        this.savingControl.set(false);
      }
    });
  }

  viewControlDetail(control: ControlCRED): void {
    this.selectedControl.set(control);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedControl.set(null);
  }

  editControl(control: ControlCRED): void {
    this.closeDetailModal();
    this.editingControl.set(control);
    this.controlForm.patchValue({
      fecha: control.fecha,
      peso_kg: parseFloat(control.peso_kg),
      talla_cm: parseFloat(control.talla_cm),
      perimetro_cefalico_cm: control.perimetro_cefalico_cm ? parseFloat(control.perimetro_cefalico_cm) : null,
      perimetro_toracico_cm: control.perimetro_toracico_cm ? parseFloat(control.perimetro_toracico_cm) : null,
      dosaje_hemoglobina: control.dosaje_hemoglobina ? parseFloat(control.dosaje_hemoglobina) : null,
      suplemento_hierro_estado: control.suplemento_hierro_estado || '',
      suplemento_hierro_tipo: control.suplemento_hierro_tipo || '',
      desarrollo_motor: control.desarrollo_motor || '',
      desarrollo_lenguaje: control.desarrollo_lenguaje || '',
      desarrollo_social: control.desarrollo_social || '',
      desarrollo_cognitivo: control.desarrollo_cognitivo || '',
      observaciones: control.observaciones || '',
      recomendaciones: control.recomendaciones || '',
      proxima_cita: control.proxima_cita || ''
    });

    if (typeof control.paciente === 'object') {
      this.selectedPaciente.set(control.paciente as Paciente);
    } else {
      this.pacientesService.getById(control.paciente as number).subscribe({
        next: (p) => this.selectedPaciente.set(p)
      });
    }

    this.showControlModal.set(true);
  }

  viewGrowthChart(control: ControlCRED): void {
    this.showChartModal.set(true);
    this.loadingChart.set(true);

    const pacienteId = typeof control.paciente === 'object'
      ? (control.paciente as Paciente).id
      : control.paciente as number;

    this.credService.getGrafico(pacienteId).subscribe({
      next: (data) => {
        this.chartData.set(data);
        this.loadingChart.set(false);
      },
      error: () => this.loadingChart.set(false)
    });
  }

  closeChartModal(): void {
    this.showChartModal.set(false);
    this.chartData.set(null);
  }

  openCalculatorModal(): void {
    this.calculatorForm.reset({ sexo: 'M' });
    this.calculatorResult.set(null);
    this.showCalculatorModal.set(true);
  }

  closeCalculatorModal(): void {
    this.showCalculatorModal.set(false);
    this.calculatorResult.set(null);
  }

  calculate(): void {
    if (this.calculatorForm.invalid) return;

    this.calculating.set(true);

    this.credService.calcularZScores({
      peso_kg: this.calculatorForm.value.peso_kg!,
      talla_cm: this.calculatorForm.value.talla_cm!,
      edad_meses: this.calculatorForm.value.edad_meses!,
      sexo: this.calculatorForm.value.sexo!
    }).subscribe({
      next: (result) => {
        this.calculatorResult.set(result);
        this.calculating.set(false);
      },
      error: () => this.calculating.set(false)
    });
  }
}
