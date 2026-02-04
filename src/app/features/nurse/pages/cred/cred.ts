import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CREDService } from '../../services/cred.service';
import { PacientesService } from '../../services/pacientes.service';
import { ControlCRED, ControlCREDCreate, GraficoCRED, TipoAlerta, CalculadoraOMSResponse } from '../../../../models/cred.model';
import { Paciente } from '../../../../models/paciente.model';
import { Sexo } from '../../../../models/common.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-cred',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Control CRED</h1>
          <p class="mt-1 text-sm text-gray-500">Control de Crecimiento y Desarrollo</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openCalculatorModal()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            Calculadora OMS
          </button>
          <button (click)="openControlModal()" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Control
          </button>
        </div>
      </div>

      <!-- Alertas -->
      @if (alertas().length > 0) {
        <div class="bg-white rounded-lg shadow border border-gray-200 p-5 bg-red-50 border-red-200">
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

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow border border-gray-200 p-5">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <input
              type="text"
              [(ngModel)]="pacienteSearch"
              (ngModelChange)="onPacienteSearchForFilter($event)"
              placeholder="Filtrar por paciente..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-full"
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
          <div class="flex gap-2">
            <select [(ngModel)]="filterAlerta" (ngModelChange)="loadControles()" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
              <option value="">Todas las alertas</option>
              <option value="true">Con alerta</option>
              <option value="false">Sin alerta</option>
            </select>
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
          <div class="bg-white rounded-lg shadow border border-gray-200 p-5">
            <div class="text-center py-8">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-900">No hay controles registrados</p>
              <p class="mt-1 text-sm text-gray-500">Registra el primer control CRED</p>
              <button (click)="openControlModal()" class="btn btn-primary mt-4">
                Nuevo Control
              </button>
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (control of controles(); track control.id) {
              <div class="bg-white rounded-lg shadow border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" (click)="viewControlDetail(control)">
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
              <div class="flex gap-2">
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                  Anterior
                </button>
                <span class="px-3 py-1 text-sm text-gray-700">
                  Página {{ currentPage() }} de {{ totalPages() }}
                </span>
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
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
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ editingControl() ? 'Editar Control' : 'Nuevo Control CRED' }}
            </h2>
          </div>
          <form [formGroup]="controlForm" (ngSubmit)="saveControl()" class="p-6 space-y-4">
            <!-- Paciente Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="modalPacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onModalPacienteSearch($event)"
                    placeholder="Buscar paciente..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                  @if (modalPacienteResults().length > 0) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (p of modalPacienteResults(); track p.id) {
                        <button
                          type="button"
                          (click)="selectModalPaciente(p)"
                          class="w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          <p class="font-medium">{{ p.nombre_completo }}</p>
                          <p class="text-sm text-gray-500">{{ p.edad_texto }} • {{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }}</p>
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
                  <button type="button" (click)="clearModalPaciente()" class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" formControlName="fecha" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" [max]="today">
              </div>
              <div></div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                <input type="number" formControlName="peso_kg" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.01" min="0" (blur)="calculatePreview()">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Talla (cm) *</label>
                <input type="number" formControlName="talla_cm" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.1" min="0" (blur)="calculatePreview()">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">P. Cefálico (cm)</label>
                <input type="number" formControlName="perimetro_cefalico_cm" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.1" min="0">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">P. Torácico (cm)</label>
                <input type="number" formControlName="perimetro_toracico_cm" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.1" min="0">
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

            <div class="border-t border-gray-200 pt-4">
              <h4 class="font-medium text-gray-900 mb-3">Desarrollo (opcional)</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Desarrollo Motor</label>
                  <textarea formControlName="desarrollo_motor" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Desarrollo Lenguaje</label>
                  <textarea formControlName="desarrollo_lenguaje" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Desarrollo Social</label>
                  <textarea formControlName="desarrollo_social" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Desarrollo Cognitivo</label>
                  <textarea formControlName="desarrollo_cognitivo" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea formControlName="observaciones" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Recomendaciones</label>
              <textarea formControlName="recomendaciones" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Próxima Cita</label>
              <input type="date" formControlName="proxima_cita" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" [min]="today">
            </div>

            @if (controlError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">{{ controlError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeControlModal()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="controlForm.invalid || !selectedPaciente() || savingControl()"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50">
                @if (savingControl()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Detalle del Control</h2>
            <button (click)="closeDetailModal()" class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          @if (selectedControl()) {
            <div class="p-6 space-y-6">
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

              <div class="flex gap-3 pt-4 border-t border-gray-200">
                <button (click)="editControl(selectedControl()!)" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Editar
                </button>
                <button (click)="viewGrowthChart(selectedControl()!)" class="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
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
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
              Curvas de Crecimiento - {{ chartData()?.paciente_nombre }}
            </h2>
            <button (click)="closeChartModal()" class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
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
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Calculadora OMS</h2>
          </div>
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                <input type="number" formControlName="peso_kg" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.01">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Talla (cm) *</label>
                <input type="number" formControlName="talla_cm" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" step="0.1">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Edad (meses) *</label>
                <input type="number" formControlName="edad_meses" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
                <select formControlName="sexo" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="calculatorForm.invalid || calculating()"
              class="btn btn-primary w-full">
              @if (calculating()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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

            <div class="flex justify-end pt-4 border-t border-gray-200">
              <button type="button" (click)="closeCalculatorModal()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
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
      return;
    }
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => this.modalPacienteResults.set(response.results)
    });
  }

  selectModalPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.modalPacienteResults.set([]);
    this.modalPacienteSearch = '';
    this.calculatePreview();
  }

  clearModalPaciente(): void {
    this.selectedPaciente.set(null);
    this.previewResult.set(null);
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
