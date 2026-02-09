import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReportesService,
  Dashboard,
  ReporteProduccion,
  ReporteHIS,
  ReporteVacunacion,
  ReporteCRED
} from '../../services/reportes.service';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

type TabType = 'dashboard' | 'produccion' | 'his' | 'vacunacion' | 'cred';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Reportes" />

      <!-- Tabs -->
      <div class="rounded-2xl border border-gray-200 bg-white">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex overflow-x-auto" aria-label="Tabs">
            <button
              (click)="cambiarTab('dashboard')"
              [class]="tabActivo() === 'dashboard'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-6 text-center border-b-2 font-medium text-sm"
            >
              Dashboard
            </button>
            <button
              (click)="cambiarTab('produccion')"
              [class]="tabActivo() === 'produccion'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-6 text-center border-b-2 font-medium text-sm"
            >
              Producción
            </button>
            <button
              (click)="cambiarTab('his')"
              [class]="tabActivo() === 'his'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-6 text-center border-b-2 font-medium text-sm"
            >
              Reporte HIS
            </button>
            <button
              (click)="cambiarTab('vacunacion')"
              [class]="tabActivo() === 'vacunacion'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-6 text-center border-b-2 font-medium text-sm"
            >
              Vacunación
            </button>
            <button
              (click)="cambiarTab('cred')"
              [class]="tabActivo() === 'cred'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-6 text-center border-b-2 font-medium text-sm"
            >
              CRED
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Tab Dashboard -->
          @if (tabActivo() === 'dashboard') {
            @if (loadingDashboard()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else if (dashboard()) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Pacientes -->
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-blue-100 text-sm font-medium">Total Pacientes</p>
                      <p class="text-3xl font-bold mt-1">{{ dashboard()!.total_pacientes }}</p>
                    </div>
                    <div class="bg-blue-400 bg-opacity-30 rounded-full p-3">
                      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Citas Hoy -->
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-green-100 text-sm font-medium">Citas Hoy</p>
                      <p class="text-3xl font-bold mt-1">{{ dashboard()!.citas_hoy.total }}</p>
                      <p class="text-green-200 text-xs mt-1">
                        {{ dashboard()!.citas_hoy.atendidas }} atendidas / {{ dashboard()!.citas_hoy.pendientes }} pendientes
                      </p>
                    </div>
                    <div class="bg-green-400 bg-opacity-30 rounded-full p-3">
                      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Atenciones Mes -->
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-purple-100 text-sm font-medium">Atenciones este mes</p>
                      <p class="text-3xl font-bold mt-1">{{ dashboard()!.atenciones_mes }}</p>
                    </div>
                    <div class="bg-purple-400 bg-opacity-30 rounded-full p-3">
                      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Alertas -->
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-orange-100 text-sm font-medium">Alertas</p>
                      <p class="text-3xl font-bold mt-1">{{ dashboard()!.alertas_nutricionales + dashboard()!.pacientes_vacunas_pendientes }}</p>
                      <p class="text-orange-200 text-xs mt-1">
                        {{ dashboard()!.alertas_nutricionales }} nutricionales / {{ dashboard()!.pacientes_vacunas_pendientes }} vacunas
                      </p>
                    </div>
                    <div class="bg-orange-400 bg-opacity-30 rounded-full p-3">
                      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <div class="text-center py-8 text-gray-500">
                No se pudo cargar el dashboard
              </div>
            }
          }

          <!-- Tab Producción -->
          @if (tabActivo() === 'produccion') {
            <div class="space-y-6">
              <!-- Filtros de fecha -->
              <div class="flex flex-wrap items-end gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <input type="date"
                         [ngModel]="fechaInicio()"
                         (ngModelChange)="fechaInicio.set($event)"
                         class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input type="date"
                         [ngModel]="fechaFin()"
                         (ngModelChange)="fechaFin.set($event)"
                         class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>
                <button
                  (click)="cargarProduccion()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Generar
                </button>
              </div>

              @if (loadingProduccion()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (produccion()) {
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Total y periodo -->
                  <div class="bg-white border rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen de Producción</h3>
                    <div class="space-y-4">
                      <div class="flex justify-between items-center py-2 border-b">
                        <span class="text-gray-600">Período</span>
                        <span class="font-medium">
                          {{ formatDate(produccion()!.periodo.fecha_inicio) }} -
                          {{ formatDate(produccion()!.periodo.fecha_fin) }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center py-2">
                        <span class="text-gray-600">Total Atenciones</span>
                        <span class="text-2xl font-bold text-indigo-600">{{ produccion()!.total_atenciones }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Por servicio -->
                  <div class="bg-white border rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Por Tipo de Servicio</h3>
                    @if (produccion()!.por_servicio.length > 0) {
                      <div class="space-y-3">
                        @for (item of produccion()!.por_servicio; track item.tipo_servicio__nombre) {
                          <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">{{ item.tipo_servicio__nombre }}</span>
                            <span class="text-sm font-medium">{{ item.total }}</span>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-sm text-gray-500">Sin datos</p>
                    }
                  </div>

                  <!-- Por sexo -->
                  <div class="bg-white border rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Por Sexo</h3>
                    <div class="flex gap-8">
                      <div class="text-center">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                          <span class="text-2xl font-bold text-blue-600">{{ produccion()!.por_sexo['M'] || 0 }}</span>
                        </div>
                        <p class="mt-2 text-sm text-gray-600">Masculino</p>
                      </div>
                      <div class="text-center">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100">
                          <span class="text-2xl font-bold text-pink-600">{{ produccion()!.por_sexo['F'] || 0 }}</span>
                        </div>
                        <p class="mt-2 text-sm text-gray-600">Femenino</p>
                      </div>
                    </div>
                  </div>

                  <!-- Por edad -->
                  <div class="bg-white border rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Por Grupo de Edad</h3>
                    <div class="space-y-3">
                      @for (item of getEdades(produccion()!.por_edad); track item.key) {
                        <div class="flex justify-between items-center">
                          <span class="text-sm text-gray-600">{{ item.key }}</span>
                          <span class="text-sm font-medium">{{ item.value }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              } @else {
                <div class="text-center py-8 text-gray-500">
                  Seleccione un rango de fechas y presione "Generar"
                </div>
              }
            </div>
          }

          <!-- Tab HIS -->
          @if (tabActivo() === 'his') {
            <div class="space-y-6">
              <!-- Filtros -->
              <div class="flex flex-wrap items-end gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <select
                    [ngModel]="mesHIS()"
                    (ngModelChange)="mesHIS.set($event)"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    @for (mes of meses; track mes.value) {
                      <option [value]="mes.value">{{ mes.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select
                    [ngModel]="anioHIS()"
                    (ngModelChange)="anioHIS.set($event)"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    @for (anio of anios; track anio) {
                      <option [value]="anio">{{ anio }}</option>
                    }
                  </select>
                </div>
                <button
                  (click)="cargarHIS()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Generar
                </button>
              </div>

              @if (loadingHIS()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (his()) {
                <div class="space-y-6">
                  <!-- Info establecimiento -->
                  <div class="bg-gray-50 border rounded-lg p-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span class="text-gray-500">Establecimiento:</span>
                        <span class="ml-2 font-medium">{{ his()!.establecimiento }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Profesional:</span>
                        <span class="ml-2 font-medium">{{ his()!.profesional }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">CEP:</span>
                        <span class="ml-2 font-medium">{{ his()!.cep }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Resumen -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white border rounded-lg p-4 text-center">
                      <p class="text-3xl font-bold text-indigo-600">{{ his()!.resumen.total_atenciones }}</p>
                      <p class="text-sm text-gray-500">Total Atenciones</p>
                    </div>
                    <div class="bg-white border rounded-lg p-4 text-center">
                      <p class="text-3xl font-bold text-green-600">{{ his()!.resumen.controles_cred }}</p>
                      <p class="text-sm text-gray-500">Controles CRED</p>
                    </div>
                    <div class="bg-white border rounded-lg p-4 text-center">
                      <p class="text-3xl font-bold text-purple-600">{{ his()!.resumen.vacunas_aplicadas }}</p>
                      <p class="text-sm text-gray-500">Vacunas Aplicadas</p>
                    </div>
                  </div>

                  <!-- Tabla de registros -->
                  @if (his()!.registros.length > 0) {
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HC</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sexo</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edad</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnóstico</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          @for (registro of his()!.registros; track registro) {
                            <tr class="hover:bg-gray-50">
                              <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDate(registro.fecha) }}</td>
                              <td class="px-4 py-3 whitespace-nowrap text-sm">{{ registro.historia_clinica }}</td>
                              <td class="px-4 py-3 whitespace-nowrap text-sm">{{ registro.dni }}</td>
                              <td class="px-4 py-3 text-sm">{{ registro.apellidos_nombres }}</td>
                              <td class="px-4 py-3 whitespace-nowrap text-sm">{{ registro.sexo }}</td>
                              <td class="px-4 py-3 whitespace-nowrap text-sm">{{ registro.edad }}</td>
                              <td class="px-4 py-3 text-sm">{{ registro.diagnostico }}</td>
                              <td class="px-4 py-3 whitespace-nowrap text-sm">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                      [ngClass]="registro.tipo === 'CRED' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'">
                                  {{ registro.tipo }}
                                </span>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  } @else {
                    <div class="text-center py-8 text-gray-500">
                      No hay registros para el período seleccionado
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8 text-gray-500">
                  Seleccione mes y año y presione "Generar"
                </div>
              }
            </div>
          }

          <!-- Tab Vacunación -->
          @if (tabActivo() === 'vacunacion') {
            <div class="space-y-6">
              <!-- Filtros -->
              <div class="flex flex-wrap items-end gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <select
                    [ngModel]="mesVacunacion()"
                    (ngModelChange)="mesVacunacion.set($event)"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    @for (mes of meses; track mes.value) {
                      <option [value]="mes.value">{{ mes.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select
                    [ngModel]="anioVacunacion()"
                    (ngModelChange)="anioVacunacion.set($event)"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    @for (anio of anios; track anio) {
                      <option [value]="anio">{{ anio }}</option>
                    }
                  </select>
                </div>
                <button
                  (click)="cargarVacunacion()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Generar
                </button>
              </div>

              @if (loadingVacunacion()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (vacunacion()) {
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Total -->
                  <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <p class="text-purple-100 text-sm font-medium">Total Dosis Aplicadas</p>
                    <p class="text-4xl font-bold mt-2">{{ vacunacion()!.total_dosis_aplicadas }}</p>
                    <p class="text-purple-200 text-sm mt-1">{{ vacunacion()!.periodo }}</p>
                  </div>

                  <!-- Por grupo de edad -->
                  <div class="bg-white border rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Por Grupo de Edad</h3>
                    <div class="space-y-3">
                      @for (item of getEdades(vacunacion()!.por_grupo_edad); track item.key) {
                        <div class="flex justify-between items-center">
                          <span class="text-sm text-gray-600">{{ item.key }}</span>
                          <span class="text-sm font-medium">{{ item.value }} dosis</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Por vacuna -->
                  <div class="bg-white border rounded-lg p-6 lg:col-span-2">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Por Tipo de Vacuna</h3>
                    @if (vacunacion()!.por_vacuna.length > 0) {
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        @for (item of vacunacion()!.por_vacuna; track item.vacuna) {
                          <div class="bg-gray-50 rounded-lg p-4 text-center">
                            <p class="text-2xl font-bold text-purple-600">{{ item.total }}</p>
                            <p class="text-sm text-gray-600 mt-1">{{ item.vacuna }}</p>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-sm text-gray-500">Sin datos de vacunación</p>
                    }
                  </div>
                </div>
              } @else {
                <div class="text-center py-8 text-gray-500">
                  Seleccione mes y año y presione "Generar"
                </div>
              }
            </div>
          }

          <!-- Tab CRED -->
          @if (tabActivo() === 'cred') {
            <div class="space-y-6">
              <!-- Filtros -->
              <div class="flex flex-wrap items-end gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <select
                    [ngModel]="mesCRED()"
                    (ngModelChange)="mesCRED.set($event)"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    @for (mes of meses; track mes.value) {
                      <option [value]="mes.value">{{ mes.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select
                    [ngModel]="anioCRED()"
                    (ngModelChange)="anioCRED.set($event)"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    @for (anio of anios; track anio) {
                      <option [value]="anio">{{ anio }}</option>
                    }
                  </select>
                </div>
                <button
                  (click)="cargarCRED()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Generar
                </button>
              </div>

              @if (loadingCRED()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (cred()) {
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Total -->
                  <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <p class="text-green-100 text-sm font-medium">Total Controles CRED</p>
                    <p class="text-4xl font-bold mt-2">{{ cred()!.total_controles }}</p>
                    <p class="text-green-200 text-sm mt-1">{{ cred()!.periodo }}</p>
                  </div>

                  <!-- Por estado nutricional -->
                  <div class="bg-white border rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Por Estado Nutricional</h3>
                    <div class="space-y-3">
                      @for (item of getEstados(cred()!.por_estado_nutricional); track item.key) {
                        <div class="flex justify-between items-center">
                          <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full mr-2"
                                  [ngClass]="getEstadoNutricionalColor(item.key)"></span>
                            <span class="text-sm text-gray-600">{{ item.key }}</span>
                          </div>
                          <span class="text-sm font-medium">{{ item.value }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Alertas -->
                  @if (cred()!.alertas.length > 0) {
                    <div class="bg-white border rounded-lg p-6 lg:col-span-2">
                      <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <svg class="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Alertas Nutricionales
                      </h3>
                      <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnóstico</th>
                              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Control</th>
                            </tr>
                          </thead>
                          <tbody class="bg-white divide-y divide-gray-200">
                            @for (alerta of cred()!.alertas; track alerta) {
                              <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ alerta.paciente }}</td>
                                <td class="px-4 py-3 text-sm">
                                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                    {{ alerta.diagnostico }}
                                  </span>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ formatDate(alerta.fecha) }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8 text-gray-500">
                  Seleccione mes y año y presione "Generar"
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ReportesComponent implements OnInit {
  private reportesService = inject(ReportesService);

  // Estado
  tabActivo = signal<TabType>('dashboard');

  // Data
  dashboard = signal<Dashboard | null>(null);
  produccion = signal<ReporteProduccion | null>(null);
  his = signal<ReporteHIS | null>(null);
  vacunacion = signal<ReporteVacunacion | null>(null);
  cred = signal<ReporteCRED | null>(null);

  // Loading
  loadingDashboard = signal(false);
  loadingProduccion = signal(false);
  loadingHIS = signal(false);
  loadingVacunacion = signal(false);
  loadingCRED = signal(false);

  // Filtros
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  mesHIS = signal<number>(new Date().getMonth() + 1);
  anioHIS = signal<number>(new Date().getFullYear());
  mesVacunacion = signal<number>(new Date().getMonth() + 1);
  anioVacunacion = signal<number>(new Date().getFullYear());
  mesCRED = signal<number>(new Date().getMonth() + 1);
  anioCRED = signal<number>(new Date().getFullYear());

  // Opciones
  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  anios: number[] = [];

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.anios = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Fechas por defecto para producción (primer día del mes actual hasta hoy)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.fechaInicio.set(firstDayOfMonth.toISOString().split('T')[0]);
    this.fechaFin.set(today.toISOString().split('T')[0]);

    this.cargarDashboard();
  }

  cambiarTab(tab: TabType) {
    this.tabActivo.set(tab);
    if (tab === 'dashboard' && !this.dashboard()) {
      this.cargarDashboard();
    }
  }

  cargarDashboard() {
    this.loadingDashboard.set(true);
    this.reportesService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loadingDashboard.set(false);
      },
      error: () => {
        this.dashboard.set(null);
        this.loadingDashboard.set(false);
      }
    });
  }

  cargarProduccion() {
    this.loadingProduccion.set(true);
    this.reportesService.getProduccion(this.fechaInicio(), this.fechaFin()).subscribe({
      next: (data) => {
        this.produccion.set(data);
        this.loadingProduccion.set(false);
      },
      error: () => {
        this.produccion.set(null);
        this.loadingProduccion.set(false);
      }
    });
  }

  cargarHIS() {
    this.loadingHIS.set(true);
    this.reportesService.getHIS(this.mesHIS(), this.anioHIS()).subscribe({
      next: (data) => {
        this.his.set(data);
        this.loadingHIS.set(false);
      },
      error: () => {
        this.his.set(null);
        this.loadingHIS.set(false);
      }
    });
  }

  cargarVacunacion() {
    this.loadingVacunacion.set(true);
    this.reportesService.getVacunacion(this.mesVacunacion(), this.anioVacunacion()).subscribe({
      next: (data) => {
        this.vacunacion.set(data);
        this.loadingVacunacion.set(false);
      },
      error: () => {
        this.vacunacion.set(null);
        this.loadingVacunacion.set(false);
      }
    });
  }

  cargarCRED() {
    this.loadingCRED.set(true);
    this.reportesService.getCRED(this.mesCRED(), this.anioCRED()).subscribe({
      next: (data) => {
        this.cred.set(data);
        this.loadingCRED.set(false);
      },
      error: () => {
        this.cred.set(null);
        this.loadingCRED.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getEdades(data: Record<string, number>): { key: string; value: number }[] {
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({ key, value }));
  }

  getEstados(data: Record<string, number>): { key: string; value: number }[] {
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({ key, value }));
  }

  getEstadoNutricionalColor(estado: string): string {
    const colors: Record<string, string> = {
      'Normal': 'bg-green-500',
      'Riesgo': 'bg-yellow-500',
      'Desnutrición': 'bg-orange-500',
      'Desnutrición severa': 'bg-red-500',
      'Sobrepeso': 'bg-blue-500',
      'Obesidad': 'bg-purple-500'
    };
    return colors[estado] || 'bg-gray-500';
  }
}
