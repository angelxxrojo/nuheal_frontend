import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DocumentosService } from '../../services/documentos.service';
import { PacientesService } from '../../services/pacientes.service';
import { PlantillaConsentimiento, Consentimiento, ConsentimientoCreate } from '../../../../models/documento.model';
import { Paciente, Responsable } from '../../../../models/paciente.model';

type TabType = 'plantillas' | 'consentimientos';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Documentos</h1>
        <p class="mt-1 text-sm text-gray-500">Plantillas de consentimiento y documentos generados</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex" aria-label="Tabs">
            <button
              (click)="tabActivo.set('plantillas')"
              [class]="tabActivo() === 'plantillas'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              Plantillas
            </button>
            <button
              (click)="tabActivo.set('consentimientos')"
              [class]="tabActivo() === 'consentimientos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              Consentimientos Generados
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Tab Plantillas -->
          @if (tabActivo() === 'plantillas') {
            @if (loadingPlantillas()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else if (plantillas().length === 0) {
              <div class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay plantillas disponibles</h3>
                <p class="mt-1 text-sm text-gray-500">Las plantillas de consentimiento se configuran en el sistema.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (plantilla of plantillas(); track plantilla.id) {
                  <div class="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-900">{{ plantilla.nombre }}</h3>
                        <p class="mt-1 text-sm text-gray-500">{{ plantilla.descripcion || 'Sin descripción' }}</p>
                        <span class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="plantilla.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                          {{ plantilla.activo ? 'Activa' : 'Inactiva' }}
                        </span>
                      </div>
                      <div class="ml-4">
                        <svg class="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="mt-4">
                      <button
                        (click)="seleccionarPlantilla(plantilla)"
                        [disabled]="!plantilla.activo"
                        class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Generar Consentimiento
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          }

          <!-- Tab Consentimientos -->
          @if (tabActivo() === 'consentimientos') {
            <div class="space-y-4">
              <!-- Búsqueda de paciente -->
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-1">Buscar paciente</label>
                <input
                  type="text"
                  [ngModel]="searchPaciente()"
                  (ngModelChange)="onSearchPaciente($event)"
                  placeholder="Escriba nombre o DNI del paciente..."
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >

                @if (searchingPacientes()) {
                  <div class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500">
                    Buscando...
                  </div>
                }

                @if (pacientesResultados().length > 0 && searchPaciente().length >= 3) {
                  <div class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                    @for (paciente of pacientesResultados(); track paciente.id) {
                      <button
                        (click)="seleccionarPaciente(paciente)"
                        class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                      >
                        <p class="text-sm font-medium text-gray-900">{{ paciente.nombre_completo }}</p>
                        <p class="text-xs text-gray-500">DNI: {{ paciente.numero_documento }} | {{ paciente.edad_texto }}</p>
                      </button>
                    }
                  </div>
                }
              </div>

              @if (pacienteSeleccionado()) {
                <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-sm font-medium text-indigo-900">{{ pacienteSeleccionado()!.nombre_completo }}</p>
                      <p class="text-xs text-indigo-700">DNI: {{ pacienteSeleccionado()!.numero_documento }} | {{ pacienteSeleccionado()!.edad_texto }}</p>
                    </div>
                    <button (click)="limpiarPaciente()" class="text-indigo-600 hover:text-indigo-800">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                @if (loadingConsentimientos()) {
                  <div class="flex justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                } @else if (consentimientos().length === 0) {
                  <div class="text-center py-8 text-gray-500">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="mt-2">No hay consentimientos generados para este paciente</p>
                    <button
                      (click)="tabActivo.set('plantillas')"
                      class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Ir a plantillas para generar uno
                    </button>
                  </div>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
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
                              {{ cons.tipo_procedimiento }}
                              @if (cons.plantilla_nombre) {
                                <p class="text-xs text-gray-500">{{ cons.plantilla_nombre }}</p>
                              }
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">
                              {{ cons.responsable_nombre }}
                              <p class="text-xs">DNI: {{ cons.responsable_dni }} ({{ cons.responsable_parentesco }})</p>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button (click)="verConsentimiento(cons)" class="text-indigo-600 hover:text-indigo-900 mr-3">
                                Ver
                              </button>
                              <button (click)="descargarPdf(cons)" class="text-green-600 hover:text-green-900 mr-3">
                                PDF
                              </button>
                              <button (click)="confirmarEliminar(cons)" class="text-red-600 hover:text-red-900">
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              } @else {
                <div class="text-center py-8 text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p class="mt-2">Busque un paciente para ver sus consentimientos</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Modal Crear Consentimiento -->
    @if (modalCrearVisible()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="cerrarModalCrear()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Generar Consentimiento Informado
              </h3>

              <!-- Paso 1: Seleccionar paciente -->
              @if (!pacienteParaConsentimiento()) {
                <div class="space-y-4">
                  <p class="text-sm text-gray-600">Plantilla: <strong>{{ plantillaSeleccionada()?.nombre }}</strong></p>
                  <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buscar paciente *</label>
                    <input
                      type="text"
                      [ngModel]="searchPacienteModal()"
                      (ngModelChange)="onSearchPacienteModal($event)"
                      placeholder="Escriba nombre o DNI del paciente..."
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >

                    @if (searchingPacientesModal()) {
                      <div class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500">
                        Buscando...
                      </div>
                    }

                    @if (pacientesResultadosModal().length > 0 && searchPacienteModal().length >= 3) {
                      <div class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto border">
                        @for (paciente of pacientesResultadosModal(); track paciente.id) {
                          <button
                            (click)="seleccionarPacienteParaConsentimiento(paciente)"
                            class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                          >
                            <p class="text-sm font-medium text-gray-900">{{ paciente.nombre_completo }}</p>
                            <p class="text-xs text-gray-500">DNI: {{ paciente.numero_documento }} | {{ paciente.edad_texto }}</p>
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <div class="mt-4 flex justify-end">
                    <button type="button" (click)="cerrarModalCrear()"
                            class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              } @else {
                <!-- Paso 2: Completar formulario -->
                <div class="space-y-4">
                  <div class="bg-gray-50 rounded-lg p-3 text-sm">
                    <p><strong>Plantilla:</strong> {{ plantillaSeleccionada()?.nombre }}</p>
                    <p><strong>Paciente:</strong> {{ pacienteParaConsentimiento()!.nombre_completo }}</p>
                  </div>

                  <form [formGroup]="consentimientoForm" (ngSubmit)="guardarConsentimiento()" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Tipo de procedimiento *</label>
                      <input type="text" formControlName="tipo_procedimiento"
                             placeholder="Ej: Aplicación de vacuna BCG"
                             class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre del responsable *</label>
                        <input type="text" formControlName="responsable_nombre"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">DNI del responsable *</label>
                        <input type="text" formControlName="responsable_dni" maxlength="8"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Parentesco *</label>
                      <select formControlName="responsable_parentesco"
                              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="">Seleccione...</option>
                        <option value="Madre">Madre</option>
                        <option value="Padre">Padre</option>
                        <option value="Abuelo/a">Abuelo/a</option>
                        <option value="Tío/a">Tío/a</option>
                        <option value="Hermano/a">Hermano/a</option>
                        <option value="Tutor legal">Tutor legal</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Contenido del consentimiento *</label>
                      <textarea formControlName="contenido" rows="6"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                      <p class="mt-1 text-xs text-gray-500">Puede editar el texto según sea necesario</p>
                    </div>

                    <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
                      <button type="button" (click)="volverPaso1()"
                              class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">
                        Atrás
                      </button>
                      <button type="submit" [disabled]="consentimientoForm.invalid || guardandoConsentimiento()"
                              class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:text-sm disabled:opacity-50">
                        @if (guardandoConsentimiento()) {
                          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        } @else {
                          Generar Consentimiento
                        }
                      </button>
                    </div>
                  </form>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Ver Consentimiento -->
    @if (modalVerVisible() && consentimientoSeleccionado()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="cerrarModalVer()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
            <div>
              <div class="flex justify-between items-start">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Consentimiento Informado
                </h3>
                <button (click)="cerrarModalVer()" class="text-gray-400 hover:text-gray-500">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="mt-4 space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-gray-500">Paciente</p>
                      <p class="font-medium">{{ consentimientoSeleccionado()!.paciente_nombre }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Fecha de firma</p>
                      <p class="font-medium">{{ formatDate(consentimientoSeleccionado()!.fecha_firma) }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Procedimiento</p>
                      <p class="font-medium">{{ consentimientoSeleccionado()!.tipo_procedimiento }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Responsable</p>
                      <p class="font-medium">{{ consentimientoSeleccionado()!.responsable_nombre }}</p>
                      <p class="text-xs text-gray-500">DNI: {{ consentimientoSeleccionado()!.responsable_dni }} ({{ consentimientoSeleccionado()!.responsable_parentesco }})</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p class="text-sm text-gray-500 mb-2">Contenido</p>
                  <div class="bg-white border rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {{ consentimientoSeleccionado()!.contenido }}
                  </div>
                </div>
              </div>

              <div class="mt-5 flex justify-end space-x-3">
                <button
                  (click)="descargarPdf(consentimientoSeleccionado()!)"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </button>
                <button type="button" (click)="cerrarModalVer()"
                        class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminación -->
    @if (modalConfirmarVisible()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Eliminar consentimiento</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Está seguro de eliminar este consentimiento? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="ejecutarEliminar()"
                      [disabled]="eliminando()"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                @if (eliminando()) {
                  Eliminando...
                } @else {
                  Eliminar
                }
              </button>
              <button type="button" (click)="cerrarModalConfirmar()"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                Cancelar
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

  // Estado
  tabActivo = signal<TabType>('plantillas');

  // Data
  plantillas = signal<PlantillaConsentimiento[]>([]);
  consentimientos = signal<Consentimiento[]>([]);

  // Loading
  loadingPlantillas = signal(false);
  loadingConsentimientos = signal(false);

  // Búsqueda pacientes (tab consentimientos)
  searchPaciente = signal('');
  searchingPacientes = signal(false);
  pacientesResultados = signal<Paciente[]>([]);
  pacienteSeleccionado = signal<Paciente | null>(null);
  private searchSubject = new Subject<string>();

  // Búsqueda pacientes (modal)
  searchPacienteModal = signal('');
  searchingPacientesModal = signal(false);
  pacientesResultadosModal = signal<Paciente[]>([]);
  private searchSubjectModal = new Subject<string>();

  // Modal crear
  modalCrearVisible = signal(false);
  plantillaSeleccionada = signal<PlantillaConsentimiento | null>(null);
  pacienteParaConsentimiento = signal<Paciente | null>(null);
  guardandoConsentimiento = signal(false);

  // Modal ver
  modalVerVisible = signal(false);
  consentimientoSeleccionado = signal<Consentimiento | null>(null);

  // Modal eliminar
  modalConfirmarVisible = signal(false);
  consentimientoAEliminar = signal<Consentimiento | null>(null);
  eliminando = signal(false);

  // Form
  consentimientoForm = this.fb.group({
    tipo_procedimiento: ['', Validators.required],
    contenido: ['', Validators.required],
    responsable_nombre: ['', Validators.required],
    responsable_dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    responsable_parentesco: ['', Validators.required]
  });

  ngOnInit() {
    this.cargarPlantillas();

    // Configurar debounce para búsqueda de pacientes
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term.length >= 3) {
        this.buscarPacientes(term);
      } else {
        this.pacientesResultados.set([]);
      }
    });

    this.searchSubjectModal.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term.length >= 3) {
        this.buscarPacientesModal(term);
      } else {
        this.pacientesResultadosModal.set([]);
      }
    });
  }

  cargarPlantillas() {
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

  // Búsqueda de pacientes
  onSearchPaciente(term: string) {
    this.searchPaciente.set(term);
    this.searchSubject.next(term);
  }

  buscarPacientes(term: string) {
    this.searchingPacientes.set(true);
    this.pacientesService.getAll({ search: term, page_size: 10 }).subscribe({
      next: (response) => {
        this.pacientesResultados.set(response.results);
        this.searchingPacientes.set(false);
      },
      error: () => {
        this.pacientesResultados.set([]);
        this.searchingPacientes.set(false);
      }
    });
  }

  seleccionarPaciente(paciente: Paciente) {
    this.pacienteSeleccionado.set(paciente);
    this.pacientesResultados.set([]);
    this.searchPaciente.set('');
    this.cargarConsentimientos();
  }

  limpiarPaciente() {
    this.pacienteSeleccionado.set(null);
    this.consentimientos.set([]);
  }

  cargarConsentimientos() {
    const paciente = this.pacienteSeleccionado();
    if (!paciente) return;

    this.loadingConsentimientos.set(true);
    this.documentosService.getConsentimientos({ paciente: paciente.id, page_size: 50 }).subscribe({
      next: (response) => {
        this.consentimientos.set(response.results);
        this.loadingConsentimientos.set(false);
      },
      error: () => {
        this.consentimientos.set([]);
        this.loadingConsentimientos.set(false);
      }
    });
  }

  // Modal búsqueda pacientes
  onSearchPacienteModal(term: string) {
    this.searchPacienteModal.set(term);
    this.searchSubjectModal.next(term);
  }

  buscarPacientesModal(term: string) {
    this.searchingPacientesModal.set(true);
    this.pacientesService.getAll({ search: term, page_size: 10 }).subscribe({
      next: (response) => {
        this.pacientesResultadosModal.set(response.results);
        this.searchingPacientesModal.set(false);
      },
      error: () => {
        this.pacientesResultadosModal.set([]);
        this.searchingPacientesModal.set(false);
      }
    });
  }

  // Modal Crear
  seleccionarPlantilla(plantilla: PlantillaConsentimiento) {
    this.plantillaSeleccionada.set(plantilla);
    this.pacienteParaConsentimiento.set(null);
    this.searchPacienteModal.set('');
    this.pacientesResultadosModal.set([]);
    this.consentimientoForm.reset();
    this.modalCrearVisible.set(true);
  }

  seleccionarPacienteParaConsentimiento(paciente: Paciente) {
    this.pacienteParaConsentimiento.set(paciente);
    this.pacientesResultadosModal.set([]);

    // Pre-llenar datos del responsable si el paciente tiene uno
    if (paciente.responsable_principal) {
      const resp = paciente.responsable_principal;
      this.consentimientoForm.patchValue({
        responsable_nombre: `${resp.nombres} ${resp.apellidos}`,
        responsable_dni: resp.numero_documento,
        responsable_parentesco: resp.parentesco_display || ''
      });
    }

    // Pre-llenar contenido de la plantilla
    const plantilla = this.plantillaSeleccionada();
    if (plantilla) {
      let contenido = plantilla.contenido_template || '';
      contenido = contenido.replace(/\{paciente_nombre\}/g, paciente.nombre_completo);
      contenido = contenido.replace(/\{paciente_dni\}/g, paciente.numero_documento);
      this.consentimientoForm.patchValue({ contenido });
    }
  }

  volverPaso1() {
    this.pacienteParaConsentimiento.set(null);
    this.searchPacienteModal.set('');
    this.pacientesResultadosModal.set([]);
  }

  cerrarModalCrear() {
    this.modalCrearVisible.set(false);
    this.plantillaSeleccionada.set(null);
    this.pacienteParaConsentimiento.set(null);
  }

  guardarConsentimiento() {
    if (this.consentimientoForm.invalid || !this.pacienteParaConsentimiento()) return;

    this.guardandoConsentimiento.set(true);
    const formValue = this.consentimientoForm.value;
    const data: ConsentimientoCreate = {
      paciente: this.pacienteParaConsentimiento()!.id,
      plantilla_id: this.plantillaSeleccionada()?.id,
      tipo_procedimiento: formValue.tipo_procedimiento!,
      contenido: formValue.contenido!,
      responsable_nombre: formValue.responsable_nombre!,
      responsable_dni: formValue.responsable_dni!,
      responsable_parentesco: formValue.responsable_parentesco!
    };

    this.documentosService.createConsentimiento(data).subscribe({
      next: () => {
        this.guardandoConsentimiento.set(false);
        this.cerrarModalCrear();
        // Si el paciente actual es el mismo, recargar consentimientos
        if (this.pacienteSeleccionado()?.id === data.paciente) {
          this.cargarConsentimientos();
        }
      },
      error: () => {
        this.guardandoConsentimiento.set(false);
      }
    });
  }

  // Modal Ver
  verConsentimiento(cons: Consentimiento) {
    this.consentimientoSeleccionado.set(cons);
    this.modalVerVisible.set(true);
  }

  cerrarModalVer() {
    this.modalVerVisible.set(false);
    this.consentimientoSeleccionado.set(null);
  }

  // Descargar PDF
  descargarPdf(cons: Consentimiento) {
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
        // Fallback: abrir en nueva pestaña
        window.open(this.documentosService.getConsentimientoPdfUrl(cons.id), '_blank');
      }
    });
  }

  // Modal Eliminar
  confirmarEliminar(cons: Consentimiento) {
    this.consentimientoAEliminar.set(cons);
    this.modalConfirmarVisible.set(true);
  }

  cerrarModalConfirmar() {
    this.modalConfirmarVisible.set(false);
    this.consentimientoAEliminar.set(null);
  }

  ejecutarEliminar() {
    const cons = this.consentimientoAEliminar();
    if (!cons) return;

    this.eliminando.set(true);
    this.documentosService.deleteConsentimiento(cons.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.cerrarModalConfirmar();
        this.cargarConsentimientos();
      },
      error: () => {
        this.eliminando.set(false);
      }
    });
  }

  // Helpers
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
