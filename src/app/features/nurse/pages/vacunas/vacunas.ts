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
  PacienteVacunasPendientes,
  OrigenInsumo,
  EstadoCerteza,
  LoteVacuna
} from '../../../../models/vacuna.model';
import { Paciente } from '../../../../models/paciente.model';
import { debounceTime, Subject } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

type TabType = 'pendientes' | 'carnet' | 'esquema';

@Component({
  selector: 'app-vacunas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Vacunas" />

      <!-- Tabs and Action -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <nav class="-mb-px flex space-x-2 overflow-x-auto border-b border-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar]:h-1.5">
          <button
            (click)="activeTab.set('pendientes')"
            [class]="'inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ' +
              (activeTab() === 'pendientes'
                ? 'text-brand-500 border-brand-500'
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700')">
            Pendientes
            @if (pacientesPendientes().length > 0) {
              <span class="inline-flex items-center justify-center rounded-full bg-red-50 px-2 py-0.5 text-center text-xs font-medium text-red-600">{{ pacientesPendientes().length }}</span>
            }
          </button>
          <button
            (click)="activeTab.set('carnet')"
            [class]="'inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ' +
              (activeTab() === 'carnet'
                ? 'text-brand-500 border-brand-500'
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700')">
            Carnet de Vacunación
          </button>
          <button
            (click)="activeTab.set('esquema')"
            [class]="'inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ' +
              (activeTab() === 'esquema'
                ? 'text-brand-500 border-brand-500'
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700')">
            Esquema Nacional
          </button>
        </nav>
        <button (click)="openDosisModalNew()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Registrar Vacuna
        </button>
      </div>

      <!-- Tab: Pendientes -->
      @if (activeTab() === 'pendientes') {
        @if (loadingPendientes()) {
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (pacientesPendientes().length === 0) {
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <div class="text-center py-8">
              <svg class="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-900">Todos al día</p>
              <p class="mt-1 text-sm text-gray-500">No hay pacientes con vacunas pendientes o vencidas</p>
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (item of pacientesPendientes(); track item.paciente.id) {
              <div class="rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
                <div class="p-5">
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                        {{ getInitials(item.paciente.nombre) }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-medium text-gray-900">{{ item.paciente.nombre }}</p>
                          @if (item.total_vencidas > 0) {
                            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{{ item.total_vencidas }} vencidas</span>
                          }
                        </div>
                        <p class="text-sm text-gray-500">{{ item.paciente.edad_texto }}</p>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      @for (vencida of item.vencidas.slice(0, 3); track vencida.vacuna_nombre) {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{{ vencida.vacuna_nombre }} - {{ vencida.nombre_dosis }}</span>
                      }
                      @for (proxima of item.proximas.slice(0, 2); track proxima.vacuna_nombre) {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{{ proxima.vacuna_nombre }} - {{ proxima.nombre_dosis }}</span>
                      }
                    </div>
                    <div class="flex gap-2">
                      <button
                        (click)="viewCarnet(item.paciente.id)"
                        class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                        Ver Carnet
                      </button>
                      <button
                        (click)="openDosisModalForPaciente(item.paciente.id)"
                        class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
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
        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="carnetSearch"
              (ngModelChange)="onCarnetSearch($event)"
              placeholder="Buscar paciente por nombre o documento..."
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
            >
            @if (searchingCarnet()) {
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
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

        @if (loadingCarnet()) {
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (carnetData()) {
          <div class="space-y-6">
            <!-- Paciente Info -->
            <div class="bg-white rounded-lg shadow border border-gray-200 p-5 bg-primary-50 border-primary-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-medium">
                    {{ getInitials(carnetData()!.paciente.nombre) }}
                  </div>
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">{{ carnetData()!.paciente.nombre }}</h2>
                    <p class="text-gray-600">{{ carnetData()!.paciente.edad_texto }} • Nacimiento: {{ carnetData()!.paciente.fecha_nacimiento | date:'dd/MM/yyyy' }}</p>
                  </div>
                </div>
                <button (click)="openDosisModalForPaciente(carnetData()!.paciente.id)" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
                  Registrar Vacuna
                </button>
              </div>
            </div>

            <!-- Resumen -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-white rounded-lg shadow border border-gray-200 p-5 text-center">
                <p class="text-sm text-gray-500">Aplicadas</p>
                <p class="text-3xl font-bold text-green-600">{{ carnetData()!.resumen.total_aplicadas }}</p>
              </div>
              <div class="bg-white rounded-lg shadow border border-gray-200 p-5 text-center">
                <p class="text-sm text-gray-500">Pendientes</p>
                <p class="text-3xl font-bold text-yellow-600">{{ carnetData()!.resumen.total_pendientes }}</p>
              </div>
              <div class="bg-white rounded-lg shadow border border-gray-200 p-5 text-center">
                <p class="text-sm text-gray-500">Vencidas</p>
                <p class="text-3xl font-bold text-red-600">{{ carnetData()!.resumen.total_vencidas }}</p>
              </div>
              <div class="bg-white rounded-lg shadow border border-gray-200 p-5 text-center">
                <p class="text-sm text-gray-500">Estado</p>
                @if (carnetData()!.resumen.tiene_vacunas_pendientes_urgentes) {
                  <span class="inline-flex px-4 py-2 rounded-full text-lg font-medium bg-red-100 text-red-800">Atrasado</span>
                } @else if (carnetData()!.resumen.total_pendientes > 0) {
                  <span class="inline-flex px-4 py-2 rounded-full text-lg font-medium bg-yellow-100 text-yellow-800">Pendiente</span>
                } @else {
                  <span class="inline-flex px-4 py-2 rounded-full text-lg font-medium bg-green-100 text-green-800">Al día</span>
                }
              </div>
            </div>

            <!-- Dosis Vencidas -->
            @if (carnetData()!.dosis_vencidas.length > 0) {
              <div class="bg-white rounded-lg shadow border border-gray-200">
                <div class="px-5 py-4 border-b border-gray-200 bg-red-50 border-red-200">
                  <h3 class="font-semibold text-red-800 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Vacunas Vencidas ({{ carnetData()!.dosis_vencidas.length }})
                  </h3>
                </div>
                <div class="p-5">
                  <div class="flex flex-wrap gap-2">
                    @for (dosis of carnetData()!.dosis_vencidas; track dosis.id) {
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
              <div class="bg-white rounded-lg shadow border border-gray-200">
                <div class="px-5 py-4 border-b border-gray-200 bg-yellow-50 border-yellow-200">
                  <h3 class="font-semibold text-yellow-800">Próximas Vacunas ({{ carnetData()!.proximas_dosis.length }})</h3>
                </div>
                <div class="p-5">
                  <div class="flex flex-wrap gap-2">
                    @for (dosis of carnetData()!.proximas_dosis; track dosis.id) {
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {{ dosis.vacuna_nombre || dosis.vacuna?.nombre }} - {{ dosis.nombre_dosis }}
                        ({{ dosis.edad_meses_ideal }} meses)
                      </span>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Historial de Vacunas Aplicadas -->
            <div class="bg-white rounded-lg shadow border border-gray-200">
              <div class="px-5 py-4 border-b border-gray-200">
                <h3 class="font-semibold text-gray-900">Historial de Vacunas Aplicadas</h3>
              </div>
              @if (carnetData()!.dosis_aplicadas.length === 0) {
                <div class="p-5 text-center text-gray-500">
                  No hay vacunas registradas
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacuna</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosis</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (dosis of carnetData()!.dosis_aplicadas; track dosis.id) {
                        <tr class="hover:bg-gray-50">
                          <td class="px-4 py-3 whitespace-nowrap">
                            <div class="font-medium text-gray-900">{{ dosis.nombre_vacuna_display || dosis.vacuna?.nombre || 'Vacuna manual' }}</div>
                            <div class="text-sm text-gray-500">{{ dosis.vacuna?.enfermedad_previene || '' }}</div>
                            @if (dosis.origen_insumo && dosis.origen_insumo !== 'stock_propio') {
                              <span class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800">{{ dosis.origen_insumo_display || dosis.origen_insumo }}</span>
                            }
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ dosis.esquema_dosis?.nombre_dosis || '-' }}</td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ dosis.fecha_aplicacion | date:'dd/MM/yyyy' }}</td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ dosis.edad_aplicacion_meses }} meses</td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="text-sm text-gray-600">{{ dosis.lote }}</span>
                            @if (dosis.fecha_vencimiento_lote) {
                              <br>
                              <span class="text-xs text-gray-400">Venc: {{ dosis.fecha_vencimiento_lote | date:'MM/yyyy' }}</span>
                            }
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            @if (dosis.aplicada_a_tiempo) {
                              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">A tiempo</span>
                            } @else {
                              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Tardía</span>
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
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <div class="text-center py-8">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-900">Buscar Paciente</p>
              <p class="mt-1 text-sm text-gray-500">Ingresa el nombre o documento del paciente para ver su carnet de vacunación</p>
            </div>
          </div>
        }
      }

      <!-- Tab: Esquema Nacional -->
      @if (activeTab() === 'esquema') {
        @if (loadingEsquema()) {
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (item of esquemaNacional(); track item.vacuna.id) {
              <div class="bg-white rounded-lg shadow border border-gray-200">
                <div class="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ item.vacuna.nombre }}</h3>
                    <p class="text-sm text-gray-500">{{ item.vacuna.enfermedad_previene }}</p>
                  </div>
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ item.vacuna.via_administracion_display || item.vacuna.via_administracion }}</span>
                </div>
                <div class="p-5">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (dosis of item.dosis; track dosis.id) {
                      <div class="p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <span class="font-medium text-gray-900">{{ dosis.nombre_dosis }}</span>
                          @if (dosis.es_refuerzo) {
                            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Refuerzo</span>
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
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeDosisModal()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeDosisModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Registrar Vacuna Aplicada</h4>
          <form [formGroup]="dosisForm" (ngSubmit)="saveDosis()" class="space-y-5">
            <!-- Paciente -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Paciente *</label>
              @if (selectedPaciente()) {
                <!-- Paciente ya seleccionado -->
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
                  @if (!pacienteLocked()) {
                    <button
                      type="button"
                      (click)="clearPaciente()"
                      class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  }
                </div>
              } @else {
                <!-- Buscador de paciente -->
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
                          (click)="selectPaciente(p)"
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
                <p class="mt-1.5 text-xs text-gray-500">Escribe al menos 2 caracteres para buscar</p>
              }
            </div>

            <!-- Modo de Registro -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Registro</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" (click)="onModoRegistroChange('esquema')"
                  [class]="'px-3 py-2 text-sm rounded-lg border text-center transition-colors ' + (modoRegistro() === 'esquema' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')">
                  Stock Propio
                </button>
                <button type="button" (click)="onModoRegistroChange('traido')"
                  [class]="'px-3 py-2 text-sm rounded-lg border text-center transition-colors ' + (modoRegistro() === 'traido' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')">
                  Traída por Paciente
                </button>
                <button type="button" (click)="onModoRegistroChange('manual')"
                  [class]="'px-3 py-2 text-sm rounded-lg border text-center transition-colors ' + (modoRegistro() === 'manual' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')">
                  Registro Manual
                </button>
              </div>
            </div>

            <!-- Vacuna y Dosis (esquema y traido) -->
            @if (modoRegistro() !== 'manual') {
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Vacuna *</label>
                <select formControlName="vacuna" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden" (change)="onVacunaChange()">
                  <option value="">Seleccionar vacuna...</option>
                  @for (v of catalogo(); track v.id) {
                    <option [value]="v.id">{{ v.nombre }} - {{ v.enfermedad_previene }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Dosis *</label>
                <select formControlName="esquema_dosis" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                  <option value="">Seleccionar dosis...</option>
                  @for (d of dosisDisponibles(); track d.id) {
                    <option [value]="d.id">{{ d.nombre_dosis }} ({{ d.edad_meses_ideal }} meses)</option>
                  }
                </select>
              </div>
            }

            <!-- Vacuna Manual -->
            @if (modoRegistro() === 'manual') {
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Nombre de la Vacuna *</label>
                <input type="text" formControlName="vacuna_nombre_manual" placeholder="Ej: Vacuna contra fiebre amarilla"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Laboratorio</label>
                <input type="text" formControlName="vacuna_laboratorio" placeholder="Nombre del laboratorio"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            }

            <!-- Fecha -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha de Aplicación *</label>
              <input type="date" formControlName="fecha_aplicacion" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" [max]="today">
            </div>

            <!-- Lote desde inventario (esquema con lotes disponibles) -->
            @if (modoRegistro() === 'esquema' && lotes().length > 0) {
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Lote (Inventario)</label>
                <select formControlName="lote_vacuna" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                  <option value="">Seleccionar lote...</option>
                  @for (l of lotes(); track l.id) {
                    <option [value]="l.id" [disabled]="l.esta_vencido || l.stock_actual <= 0">
                      {{ l.numero_lote }} - Stock: {{ l.stock_actual }} (Venc: {{ l.fecha_vencimiento }})
                      @if (l.esta_vencido) { [VENCIDO] }
                      @if (l.stock_bajo) { [BAJO STOCK] }
                    </option>
                  }
                </select>
              </div>
            }

            <!-- Lote manual -->
            @if (modoRegistro() !== 'esquema' || lotes().length === 0) {
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Lote</label>
                  <input type="text" formControlName="lote" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Ej: VAC2024A">
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Vencimiento Lote</label>
                  <input type="date" formControlName="fecha_vencimiento_lote" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                </div>
              </div>
            }

            <!-- Estado de Certeza (traido y manual) -->
            @if (modoRegistro() !== 'esquema') {
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Estado de Certeza</label>
                <select formControlName="estado_certeza" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                  <option value="verificado">Verificado</option>
                  <option value="declarado">Declarado por familiar</option>
                  <option value="desconocido">Desconocido</option>
                </select>
              </div>
            }

            <!-- Fotos (traido) -->
            @if (modoRegistro() === 'traido') {
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Foto Receta Médica</label>
                  <input type="file" accept="image/*" (change)="onFotoRecetaChange($event)"
                         class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100">
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Foto Envase</label>
                  <input type="file" accept="image/*" (change)="onFotoEnvaseChange($event)"
                         class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100">
                </div>
              </div>
            }

            <!-- Sitio -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Sitio de Aplicación</label>
              <select formControlName="sitio_aplicacion" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
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
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea formControlName="observaciones" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>

            <!-- Reacciones -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Reacciones Adversas</label>
              <textarea formControlName="reacciones_adversas" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Registrar si hubo alguna reacción..."></textarea>
            </div>

            @if (dosisError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ dosisError() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeDosisModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!selectedPaciente() || savingDosis()"
                class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingDosis()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
  pacienteLocked = signal(false); // true when patient is preselected and cannot be changed
  modalPacienteSearch = '';
  modalPacienteResults = signal<Paciente[]>([]);
  searchingModalPacientes = signal(false);
  showModalPacienteDropdown = signal(false);
  dosisDisponibles = signal<EsquemaDosis[]>([]);
  modoRegistro = signal<'esquema' | 'traido' | 'manual'>('esquema');
  lotes = signal<LoteVacuna[]>([]);
  fotoReceta = signal<File | null>(null);
  fotoEnvase = signal<File | null>(null);
  private searchTimeout: any = null;

  dosisForm = this.fb.group({
    vacuna: [''],
    esquema_dosis: [''],
    vacuna_nombre_manual: [''],
    vacuna_laboratorio: [''],
    fecha_aplicacion: ['', Validators.required],
    lote: [''],
    lote_vacuna: [''],
    fecha_vencimiento_lote: [''],
    sitio_aplicacion: [''],
    origen_insumo: ['stock_propio' as OrigenInsumo],
    estado_certeza: ['verificado' as EstadoCerteza],
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
      next: (data: any) => {
        // Handle both array and paginated response
        if (Array.isArray(data)) {
          this.catalogo.set(data);
        } else if (data && Array.isArray(data.results)) {
          this.catalogo.set(data.results);
        } else {
          this.catalogo.set([]);
        }
      },
      error: () => this.catalogo.set([])
    });
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
  }

  getSelectedPacienteInitials(): string {
    const paciente = this.selectedPaciente();
    if (!paciente) return '';
    return this.getPacienteInitials(paciente);
  }

  getPacienteInitials(paciente: Paciente): string {
    if (!paciente) return '';

    // Try to use nombres and apellido_paterno first
    if (paciente.nombres && paciente.apellido_paterno) {
      return (paciente.nombres.charAt(0) + paciente.apellido_paterno.charAt(0)).toUpperCase();
    }

    // Fallback to nombre_completo
    if (paciente.nombre_completo) {
      const parts = paciente.nombre_completo.split(' ');
      return parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
    }

    return 'P';
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
    console.log('onModalPacienteSearch called with:', term);

    if (!term || term.length < 2) {
      this.modalPacienteResults.set([]);
      this.searchingModalPacientes.set(false);
      this.showModalPacienteDropdown.set(false);
      return;
    }

    // Show loading and dropdown
    this.searchingModalPacientes.set(true);
    this.showModalPacienteDropdown.set(true);

    // Make API call directly
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response) => {
        console.log('Search results:', response.results);
        this.modalPacienteResults.set(response.results);
        this.searchingModalPacientes.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchingModalPacientes.set(false);
        this.modalPacienteResults.set([]);
      }
    });
  }

  selectPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.modalPacienteResults.set([]);
    this.modalPacienteSearch = '';
    this.showModalPacienteDropdown.set(false);
  }

  clearPaciente(): void {
    this.selectedPaciente.set(null);
    this.showModalPacienteDropdown.set(false);
  }

  // Dosis Modal
  openDosisModal(): void {
    this.dosisForm.reset({ fecha_aplicacion: this.today, origen_insumo: 'stock_propio', estado_certeza: 'verificado' });
    this.dosisError.set(null);
    this.dosisDisponibles.set([]);
    this.lotes.set([]);
    this.modoRegistro.set('esquema');
    this.fotoReceta.set(null);
    this.fotoEnvase.set(null);
    // Reset patient search state (but keep selectedPaciente if already set)
    this.modalPacienteSearch = '';
    this.modalPacienteResults.set([]);
    this.showModalPacienteDropdown.set(false);
    this.searchingModalPacientes.set(false);
    this.showDosisModal.set(true);
  }

  openDosisModalForPaciente(pacienteId: number): void {
    this.pacientesService.getById(pacienteId).subscribe({
      next: (paciente) => {
        this.selectedPaciente.set(paciente);
        this.pacienteLocked.set(true); // Lock patient - cannot be changed
        this.openDosisModal();
      }
    });
  }

  openDosisModalNew(): void {
    // Reset everything including selectedPaciente for new registration
    this.selectedPaciente.set(null);
    this.pacienteLocked.set(false); // Patient can be selected
    this.openDosisModal();
  }

  closeDosisModal(): void {
    this.showDosisModal.set(false);
    this.selectedPaciente.set(null);
    this.pacienteLocked.set(false);
    this.modoRegistro.set('esquema');
    this.fotoReceta.set(null);
    this.fotoEnvase.set(null);
    this.lotes.set([]);
    this.modalPacienteSearch = '';
    this.modalPacienteResults.set([]);
    this.showModalPacienteDropdown.set(false);
    this.searchingModalPacientes.set(false);
  }

  onVacunaChange(): void {
    const vacunaId = this.dosisForm.get('vacuna')?.value;
    if (!vacunaId) {
      this.dosisDisponibles.set([]);
      this.lotes.set([]);
      return;
    }

    const esquema = this.esquemaNacional().find(e => e.vacuna.id === +vacunaId);
    if (esquema) {
      this.dosisDisponibles.set(esquema.dosis);
    } else {
      this.dosisDisponibles.set([]);
    }
    this.dosisForm.patchValue({ esquema_dosis: '', lote_vacuna: '' });

    // Load lotes for this vacuna when in stock propio mode
    if (this.modoRegistro() === 'esquema') {
      this.vacunasService.getLotes(+vacunaId).subscribe({
        next: (data: any) => this.lotes.set(Array.isArray(data) ? data : (data?.results || [])),
        error: () => this.lotes.set([])
      });
    }
  }

  onModoRegistroChange(modo: 'esquema' | 'traido' | 'manual'): void {
    this.modoRegistro.set(modo);
    this.dosisForm.patchValue({
      vacuna: '',
      esquema_dosis: '',
      vacuna_nombre_manual: '',
      vacuna_laboratorio: '',
      lote: '',
      lote_vacuna: '',
      origen_insumo: modo === 'traido' ? 'traido_paciente' : 'stock_propio',
      estado_certeza: 'verificado'
    });
    this.dosisDisponibles.set([]);
    this.lotes.set([]);
    this.fotoReceta.set(null);
    this.fotoEnvase.set(null);
  }

  onFotoRecetaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fotoReceta.set(input.files?.[0] || null);
  }

  onFotoEnvaseChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fotoEnvase.set(input.files?.[0] || null);
  }

  saveDosis(): void {
    if (!this.selectedPaciente()) return;

    const modo = this.modoRegistro();
    const formValue = this.dosisForm.value;

    // Validate based on mode
    if ((modo === 'esquema' || modo === 'traido') && (!formValue.vacuna || !formValue.esquema_dosis)) {
      this.dosisError.set('Selecciona una vacuna y dosis');
      return;
    }
    if (modo === 'manual' && !formValue.vacuna_nombre_manual) {
      this.dosisError.set('Ingresa el nombre de la vacuna');
      return;
    }
    if (!formValue.fecha_aplicacion) {
      this.dosisError.set('La fecha de aplicación es requerida');
      return;
    }

    this.savingDosis.set(true);
    this.dosisError.set(null);

    const hasFiles = this.fotoReceta() || this.fotoEnvase();

    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('paciente', this.selectedPaciente()!.id.toString());
      formData.append('fecha_aplicacion', formValue.fecha_aplicacion!);
      formData.append('origen_insumo', formValue.origen_insumo || 'stock_propio');
      formData.append('estado_certeza', formValue.estado_certeza || 'verificado');

      if (formValue.vacuna) formData.append('vacuna', formValue.vacuna.toString());
      if (formValue.esquema_dosis) formData.append('esquema_dosis', formValue.esquema_dosis.toString());
      if (formValue.vacuna_nombre_manual) formData.append('vacuna_nombre_manual', formValue.vacuna_nombre_manual);
      if (formValue.vacuna_laboratorio) formData.append('vacuna_laboratorio', formValue.vacuna_laboratorio);
      if (formValue.lote) formData.append('lote', formValue.lote);
      if (formValue.lote_vacuna) formData.append('lote_vacuna', formValue.lote_vacuna.toString());
      if (formValue.fecha_vencimiento_lote) formData.append('fecha_vencimiento_lote', formValue.fecha_vencimiento_lote);
      if (formValue.sitio_aplicacion) formData.append('sitio_aplicacion', formValue.sitio_aplicacion);
      if (formValue.observaciones) formData.append('observaciones', formValue.observaciones);
      if (formValue.reacciones_adversas) formData.append('reacciones_adversas', formValue.reacciones_adversas);
      if (this.fotoReceta()) formData.append('foto_receta_medica', this.fotoReceta()!);
      if (this.fotoEnvase()) formData.append('foto_envase', this.fotoEnvase()!);

      this.vacunasService.registrarDosis(formData).subscribe({
        next: () => this.onDosisSuccess(),
        error: (err) => this.onDosisError(err)
      });
    } else {
      const data: DosisAplicadaCreate = {
        paciente: this.selectedPaciente()!.id,
        fecha_aplicacion: formValue.fecha_aplicacion!,
        origen_insumo: (formValue.origen_insumo as OrigenInsumo) || 'stock_propio',
        estado_certeza: (formValue.estado_certeza as EstadoCerteza) || 'verificado',
        vacuna: formValue.vacuna ? +formValue.vacuna : undefined,
        esquema_dosis: formValue.esquema_dosis ? +formValue.esquema_dosis : undefined,
        vacuna_nombre_manual: formValue.vacuna_nombre_manual || undefined,
        vacuna_laboratorio: formValue.vacuna_laboratorio || undefined,
        lote: formValue.lote || undefined,
        lote_vacuna: formValue.lote_vacuna ? +formValue.lote_vacuna : undefined,
        fecha_vencimiento_lote: formValue.fecha_vencimiento_lote || undefined,
        sitio_aplicacion: formValue.sitio_aplicacion || undefined,
        observaciones: formValue.observaciones || undefined,
        reacciones_adversas: formValue.reacciones_adversas || undefined
      };

      this.vacunasService.registrarDosis(data).subscribe({
        next: () => this.onDosisSuccess(),
        error: (err) => this.onDosisError(err)
      });
    }
  }

  private onDosisSuccess(): void {
    const pacienteId = this.selectedPaciente()?.id;
    this.closeDosisModal();
    this.loadPendientes();
    if (this.carnetData() && pacienteId && this.carnetData()!.paciente.id === pacienteId) {
      this.viewCarnet(pacienteId);
    }
    this.savingDosis.set(false);
  }

  private onDosisError(err: any): void {
    this.dosisError.set(
      err.error?.detail || err.error?.non_field_errors?.[0] || 'Error al registrar la vacuna'
    );
    this.savingDosis.set(false);
  }
}
