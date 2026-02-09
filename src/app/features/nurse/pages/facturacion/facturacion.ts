import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FacturacionService } from '../../services/facturacion.service';
import { PacientesService } from '../../services/pacientes.service';
import { AgendaService } from '../../services/agenda.service';
import { Ingreso, Gasto, ResumenMensual, ResumenAnual, IngresoCreate } from '../../../../models/facturacion.model';
import { Paciente } from '../../../../models/paciente.model';
import { Cita } from '../../../../models/cita.model';
import { MetodoPago, CategoriaGasto } from '../../../../models/common.model';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';
import { debounceTime, Subject } from 'rxjs';

type TabType = 'resumen' | 'ingresos' | 'gastos';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Facturación" />

      <!-- Filtros de período -->
      <div class="rounded-2xl border border-gray-200 bg-white p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              [ngModel]="mesSeleccionado()"
              (ngModelChange)="mesSeleccionado.set($event); cargarDatos()"
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
              [ngModel]="anioSeleccionado()"
              (ngModelChange)="anioSeleccionado.set($event); cargarDatos()"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              @for (anio of anios; track anio) {
                <option [value]="anio">{{ anio }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Resumen Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Ingresos -->
        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Ingresos</dt>
                <dd class="text-lg font-semibold text-green-600">
                  S/ {{ resumenMensual()?.total_ingresos?.toFixed(2) || '0.00' }}
                </dd>
              </dl>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            {{ resumenMensual()?.cantidad_ingresos || 0 }} transacciones
          </div>
        </div>

        <!-- Gastos -->
        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-red-100 rounded-md p-3">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Gastos</dt>
                <dd class="text-lg font-semibold text-red-600">
                  S/ {{ resumenMensual()?.total_gastos?.toFixed(2) || '0.00' }}
                </dd>
              </dl>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            {{ resumenMensual()?.cantidad_gastos || 0 }} transacciones
          </div>
        </div>

        <!-- Balance -->
        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 rounded-md p-3"
                 [ngClass]="(resumenMensual()?.balance || 0) >= 0 ? 'bg-blue-100' : 'bg-yellow-100'">
              <svg class="h-6 w-6"
                   [ngClass]="(resumenMensual()?.balance || 0) >= 0 ? 'text-blue-600' : 'text-yellow-600'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Balance</dt>
                <dd class="text-lg font-semibold"
                    [ngClass]="(resumenMensual()?.balance || 0) >= 0 ? 'text-blue-600' : 'text-yellow-600'">
                  S/ {{ resumenMensual()?.balance?.toFixed(2) || '0.00' }}
                </dd>
              </dl>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            {{ getMesNombre(mesSeleccionado()) }} {{ anioSeleccionado() }}
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="rounded-2xl border border-gray-200 bg-white">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex" aria-label="Tabs">
            <button
              (click)="tabActivo.set('resumen')"
              [class]="tabActivo() === 'resumen'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              Resumen Anual
            </button>
            <button
              (click)="tabActivo.set('ingresos')"
              [class]="tabActivo() === 'ingresos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              Ingresos
            </button>
            <button
              (click)="tabActivo.set('gastos')"
              [class]="tabActivo() === 'gastos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm"
            >
              Gastos
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Tab Resumen Anual -->
          @if (tabActivo() === 'resumen') {
            @if (loadingResumenAnual()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else if (resumenAnual()) {
              <div class="space-y-6">
                <!-- Totales anuales -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <p class="text-sm text-gray-600">Ingresos {{ anioSeleccionado() }}</p>
                    <p class="text-2xl font-bold text-green-600">S/ {{ resumenAnual()!.total_ingresos.toFixed(2) }}</p>
                  </div>
                  <div class="text-center p-4 bg-red-50 rounded-lg">
                    <p class="text-sm text-gray-600">Gastos {{ anioSeleccionado() }}</p>
                    <p class="text-2xl font-bold text-red-600">S/ {{ resumenAnual()!.total_gastos.toFixed(2) }}</p>
                  </div>
                  <div class="text-center p-4 rounded-lg"
                       [ngClass]="resumenAnual()!.balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'">
                    <p class="text-sm text-gray-600">Balance {{ anioSeleccionado() }}</p>
                    <p class="text-2xl font-bold"
                       [ngClass]="resumenAnual()!.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'">
                      S/ {{ resumenAnual()!.balance.toFixed(2) }}
                    </p>
                  </div>
                </div>

                <!-- Tabla por mes -->
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gastos</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (item of resumenAnual()!.por_mes; track item.mes) {
                        <tr class="hover:bg-gray-50 cursor-pointer" (click)="irAMes(item.mes)">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ getMesNombre(item.mes) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            S/ {{ item.ingresos.toFixed(2) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                            S/ {{ item.gastos.toFixed(2) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-right"
                              [ngClass]="item.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'">
                            S/ {{ item.balance.toFixed(2) }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            } @else {
              <div class="text-center py-8 text-gray-500">
                No hay datos para el año seleccionado
              </div>
            }
          }

          <!-- Tab Ingresos -->
          @if (tabActivo() === 'ingresos') {
            <div class="space-y-4">
              <div class="flex justify-end">
                <button
                  (click)="abrirModalIngreso()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Ingreso
                </button>
              </div>

              @if (loadingIngresos()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (ingresos().length === 0) {
                <div class="text-center py-8 text-gray-500">
                  No hay ingresos registrados para este período
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (ingreso of ingresos(); track ingreso.id) {
                        <tr class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ formatDate(ingreso.fecha) }}
                          </td>
                          <td class="px-6 py-4 text-sm text-gray-900">
                            {{ ingreso.concepto }}
                            @if (ingreso.descripcion) {
                              <p class="text-xs text-gray-500">{{ ingreso.descripcion }}</p>
                            }
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ ingreso.paciente_nombre || '-' }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  [ngClass]="getMetodoPagoClass(ingreso.metodo_pago)">
                              {{ ingreso.metodo_pago_display || ingreso.metodo_pago }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                            S/ {{ ingreso.monto }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button (click)="editarIngreso(ingreso)" class="text-indigo-600 hover:text-indigo-900 mr-3">
                              Editar
                            </button>
                            <button (click)="confirmarEliminarIngreso(ingreso)" class="text-red-600 hover:text-red-900">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }

          <!-- Tab Gastos -->
          @if (tabActivo() === 'gastos') {
            <div class="space-y-4">
              <div class="flex justify-end">
                <button
                  (click)="abrirModalGasto()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Gasto
                </button>
              </div>

              @if (loadingGastos()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (gastos().length === 0) {
                <div class="text-center py-8 text-gray-500">
                  No hay gastos registrados para este período
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (gasto of gastos(); track gasto.id) {
                        <tr class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ formatDate(gasto.fecha) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  [ngClass]="getCategoriaClass(gasto.categoria)">
                              {{ gasto.categoria_display || gasto.categoria }}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-sm text-gray-900">
                            {{ gasto.concepto }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ gasto.proveedor || '-' }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                            S/ {{ gasto.monto }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button (click)="editarGasto(gasto)" class="text-indigo-600 hover:text-indigo-900 mr-3">
                              Editar
                            </button>
                            <button (click)="confirmarEliminarGasto(gasto)" class="text-red-600 hover:text-red-900">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Desglose por método de pago / categoría -->
      @if (tabActivo() !== 'resumen' && resumenMensual()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Ingresos por método -->
          <div class="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Ingresos por método de pago</h3>
            @if (resumenMensual()?.ingresos_por_metodo) {
              <div class="space-y-3">
                @for (item of getIngresosPorMetodo(); track item.key) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">{{ item.nombre }}</span>
                    <span class="text-sm font-medium text-green-600">S/ {{ item.total.toFixed(2) }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-sm text-gray-500">Sin datos</p>
            }
          </div>

          <!-- Gastos por categoría -->
          <div class="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Gastos por categoría</h3>
            @if (resumenMensual()?.gastos_por_categoria) {
              <div class="space-y-3">
                @for (item of getGastosPorCategoria(); track item.key) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">{{ item.nombre }}</span>
                    <span class="text-sm font-medium text-red-600">S/ {{ item.total.toFixed(2) }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-sm text-gray-500">Sin datos</p>
            }
          </div>
        </div>
      }
    </div>

    <!-- Modal Ingreso -->
    @if (modalIngresoVisible()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="cerrarModalIngreso()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ ingresoSeleccionado() ? 'Editar Ingreso' : 'Nuevo Ingreso' }}
          </h3>
          <form [formGroup]="ingresoForm" (ngSubmit)="guardarIngreso()" class="space-y-4">
            <!-- Paciente (opcional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Paciente (opcional)</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="pacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onPacienteSearch($event)"
                    (focus)="showPacienteDropdown.set(true)"
                    placeholder="Buscar paciente..."
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                  >
                  @if (searchingPacientes()) {
                    <div class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    </div>
                  }
                  @if (pacienteResults().length > 0 && showPacienteDropdown()) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (p of pacienteResults(); track p.id) {
                        <button
                          type="button"
                          (click)="selectPaciente(p)"
                          class="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                            {{ getInitials(p.nombre_completo) }}
                          </div>
                          <span>{{ p.nombre_completo }}</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="flex items-center gap-2">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                      {{ getInitials(selectedPaciente()!.nombre_completo) }}
                    </div>
                    <span class="text-sm font-medium">{{ selectedPaciente()!.nombre_completo }}</span>
                  </div>
                  <button type="button" (click)="clearPaciente()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <!-- Cita (opcional, aparece si hay paciente seleccionado) -->
            @if (selectedPaciente()) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Cita (opcional)</label>
                @if (loadingCitas()) {
                  <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    <span class="text-sm text-gray-500">Cargando citas...</span>
                  </div>
                } @else if (!selectedCita()) {
                  @if (citasPaciente().length === 0) {
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                      No hay citas registradas para este paciente
                    </div>
                  } @else {
                    <select
                      (change)="onCitaChange($event)"
                      class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                    >
                      <option value="">Seleccionar cita...</option>
                      @for (cita of citasPaciente(); track cita.id) {
                        <option [value]="cita.id">
                          {{ formatDate(cita.fecha) }} - {{ cita.servicio_nombre }} ({{ cita.estado_display || cita.estado }})
                        </option>
                      }
                    </select>
                  }
                } @else {
                  <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                    <div class="flex items-center gap-2">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                           [style.background-color]="selectedCita()!.servicio_color || '#e0e7ff'"
                           [style.color]="'#fff'">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div>
                        <span class="text-sm font-medium">{{ selectedCita()!.servicio_nombre }}</span>
                        <p class="text-xs text-gray-500">{{ formatDate(selectedCita()!.fecha) }} - {{ selectedCita()!.hora_inicio }}</p>
                      </div>
                    </div>
                    <button type="button" (click)="clearCita()" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha *</label>
              <input type="date" formControlName="fecha"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Concepto *</label>
              <input type="text" formControlName="concepto" placeholder="Ej: Consulta de control"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
              <textarea formControlName="descripcion" rows="2"
                        class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Monto (S/) *</label>
                <input type="number" formControlName="monto" step="0.01" min="0"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Método de pago *</label>
                <select formControlName="metodo_pago"
                        class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                  @for (metodo of metodosPago; track metodo.value) {
                    <option [value]="metodo.value">{{ metodo.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Número de recibo</label>
              <input type="text" formControlName="numero_recibo"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button type="button" (click)="cerrarModalIngreso()"
                      class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="ingresoForm.invalid || guardandoIngreso()"
                      class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (guardandoIngreso()) {
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                } @else {
                  Guardar
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Gasto -->
    @if (modalGastoVisible()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="cerrarModalGasto()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ gastoSeleccionado() ? 'Editar Gasto' : 'Nuevo Gasto' }}
          </h3>
          <form [formGroup]="gastoForm" (ngSubmit)="guardarGasto()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha *</label>
              <input type="date" formControlName="fecha"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Categoría *</label>
              <select formControlName="categoria"
                      class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                @for (cat of categoriasGasto; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Concepto *</label>
              <input type="text" formControlName="concepto" placeholder="Ej: Compra de insumos"
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Monto (S/) *</label>
                <input type="number" formControlName="monto" step="0.01" min="0"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Proveedor</label>
                <input type="text" formControlName="proveedor"
                       class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">N° Documento</label>
              <input type="text" formControlName="numero_documento" placeholder="Factura, boleta, etc."
                     class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button type="button" (click)="cerrarModalGasto()"
                      class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="gastoForm.invalid || guardandoGasto()"
                      class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (guardandoGasto()) {
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                } @else {
                  Guardar
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminación -->
    @if (modalConfirmarVisible()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="cerrarModalConfirmar()"></div>
        <div class="relative w-full max-w-[400px] rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <div class="flex flex-col items-center text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar eliminación</h3>
            <p class="text-sm text-gray-500 mb-6">
              ¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
            <button type="button" (click)="cerrarModalConfirmar()"
                    class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="button" (click)="ejecutarEliminacion()"
                    [disabled]="eliminando()"
                    class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-red-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300 transition">
              @if (eliminando()) {
                Eliminando...
              } @else {
                Eliminar
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class FacturacionComponent implements OnInit {
  private facturacionService = inject(FacturacionService);
  private pacientesService = inject(PacientesService);
  private agendaService = inject(AgendaService);
  private fb = inject(FormBuilder);
  private pacienteSearchSubject = new Subject<string>();

  // Estado
  tabActivo = signal<TabType>('resumen');
  mesSeleccionado = signal<number>(new Date().getMonth() + 1);
  anioSeleccionado = signal<number>(new Date().getFullYear());

  // Paciente para ingreso
  pacienteSearch = '';
  pacienteResults = signal<Paciente[]>([]);
  selectedPaciente = signal<Paciente | null>(null);
  searchingPacientes = signal(false);
  showPacienteDropdown = signal(false);

  // Citas del paciente
  citasPaciente = signal<Cita[]>([]);
  selectedCita = signal<Cita | null>(null);
  loadingCitas = signal(false);

  // Data
  ingresos = signal<Ingreso[]>([]);
  gastos = signal<Gasto[]>([]);
  resumenMensual = signal<ResumenMensual | null>(null);
  resumenAnual = signal<ResumenAnual | null>(null);

  // Loading states
  loadingIngresos = signal(false);
  loadingGastos = signal(false);
  loadingResumenMensual = signal(false);
  loadingResumenAnual = signal(false);

  // Modales
  modalIngresoVisible = signal(false);
  modalGastoVisible = signal(false);
  modalConfirmarVisible = signal(false);

  ingresoSeleccionado = signal<Ingreso | null>(null);
  gastoSeleccionado = signal<Gasto | null>(null);
  tipoEliminacion = signal<'ingreso' | 'gasto' | null>(null);
  itemAEliminar = signal<number | null>(null);

  guardandoIngreso = signal(false);
  guardandoGasto = signal(false);
  eliminando = signal(false);

  // Forms
  ingresoForm = this.fb.group({
    fecha: ['', Validators.required],
    concepto: ['', Validators.required],
    descripcion: [''],
    monto: ['', [Validators.required, Validators.min(0)]],
    metodo_pago: ['efectivo' as MetodoPago, Validators.required],
    numero_recibo: ['']
  });

  gastoForm = this.fb.group({
    fecha: ['', Validators.required],
    categoria: ['insumos' as CategoriaGasto, Validators.required],
    concepto: ['', Validators.required],
    monto: ['', [Validators.required, Validators.min(0)]],
    proveedor: [''],
    numero_documento: ['']
  });

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

  metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'otro', label: 'Otro' }
  ];

  categoriasGasto = [
    { value: 'insumos', label: 'Insumos médicos' },
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'servicios', label: 'Servicios (luz, agua, etc.)' },
    { value: 'equipos', label: 'Equipos' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'otro', label: 'Otro' }
  ];

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.anios = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.cargarDatos();

    this.pacienteSearchSubject.pipe(debounceTime(300)).subscribe(term => {
      this.buscarPacientes(term);
    });
  }

  cargarDatos() {
    this.cargarResumenMensual();
    this.cargarResumenAnual();
    this.cargarIngresos();
    this.cargarGastos();
  }

  cargarResumenMensual() {
    this.loadingResumenMensual.set(true);
    this.facturacionService.getResumenMensual(this.mesSeleccionado(), this.anioSeleccionado()).subscribe({
      next: (data) => {
        this.resumenMensual.set(data);
        this.loadingResumenMensual.set(false);
      },
      error: () => {
        this.resumenMensual.set(null);
        this.loadingResumenMensual.set(false);
      }
    });
  }

  cargarResumenAnual() {
    this.loadingResumenAnual.set(true);
    this.facturacionService.getResumenAnual(this.anioSeleccionado()).subscribe({
      next: (data) => {
        this.resumenAnual.set(data);
        this.loadingResumenAnual.set(false);
      },
      error: () => {
        this.resumenAnual.set(null);
        this.loadingResumenAnual.set(false);
      }
    });
  }

  cargarIngresos() {
    this.loadingIngresos.set(true);
    this.facturacionService.getIngresos({
      mes: this.mesSeleccionado(),
      anio: this.anioSeleccionado(),
      page_size: 100
    }).subscribe({
      next: (response) => {
        this.ingresos.set(response.results);
        this.loadingIngresos.set(false);
      },
      error: () => {
        this.ingresos.set([]);
        this.loadingIngresos.set(false);
      }
    });
  }

  cargarGastos() {
    this.loadingGastos.set(true);
    this.facturacionService.getGastos({
      mes: this.mesSeleccionado(),
      anio: this.anioSeleccionado(),
      page_size: 100
    }).subscribe({
      next: (response) => {
        this.gastos.set(response.results);
        this.loadingGastos.set(false);
      },
      error: () => {
        this.gastos.set([]);
        this.loadingGastos.set(false);
      }
    });
  }

  getMesNombre(mes: number): string {
    return this.meses.find(m => m.value === mes)?.label || '';
  }

  irAMes(mes: number) {
    this.mesSeleccionado.set(mes);
    this.tabActivo.set('ingresos');
    this.cargarDatos();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getMetodoPagoClass(metodo: MetodoPago): string {
    const classes: Record<MetodoPago, string> = {
      'efectivo': 'bg-green-100 text-green-800',
      'transferencia': 'bg-blue-100 text-blue-800',
      'yape': 'bg-purple-100 text-purple-800',
      'plin': 'bg-cyan-100 text-cyan-800',
      'tarjeta': 'bg-orange-100 text-orange-800',
      'otro': 'bg-gray-100 text-gray-800'
    };
    return classes[metodo] || 'bg-gray-100 text-gray-800';
  }

  getCategoriaClass(categoria: CategoriaGasto): string {
    const classes: Record<CategoriaGasto, string> = {
      'insumos': 'bg-red-100 text-red-800',
      'alquiler': 'bg-yellow-100 text-yellow-800',
      'servicios': 'bg-blue-100 text-blue-800',
      'equipos': 'bg-purple-100 text-purple-800',
      'marketing': 'bg-pink-100 text-pink-800',
      'otro': 'bg-gray-100 text-gray-800'
    };
    return classes[categoria] || 'bg-gray-100 text-gray-800';
  }

  getIngresosPorMetodo(): { key: string; nombre: string; total: number }[] {
    const data = this.resumenMensual()?.ingresos_por_metodo;
    if (!data) return [];
    return Object.entries(data)
      .filter(([_, v]) => v.total > 0)
      .map(([key, value]) => ({ key, ...value }));
  }

  getGastosPorCategoria(): { key: string; nombre: string; total: number }[] {
    const data = this.resumenMensual()?.gastos_por_categoria;
    if (!data) return [];
    return Object.entries(data)
      .filter(([_, v]) => v.total > 0)
      .map(([key, value]) => ({ key, ...value }));
  }

  // Búsqueda de paciente
  onPacienteSearch(term: string) {
    this.pacienteSearchSubject.next(term);
  }

  buscarPacientes(term: string) {
    if (!term || term.length < 2) {
      this.pacienteResults.set([]);
      this.showPacienteDropdown.set(false);
      return;
    }
    this.searchingPacientes.set(true);
    this.showPacienteDropdown.set(true);
    this.pacientesService.getAll({ search: term, page_size: 5 }).subscribe({
      next: (response: any) => {
        const results = Array.isArray(response) ? response : (response?.results || []);
        this.pacienteResults.set(results);
        this.searchingPacientes.set(false);
      },
      error: () => {
        this.pacienteResults.set([]);
        this.searchingPacientes.set(false);
      }
    });
  }

  selectPaciente(paciente: Paciente) {
    this.selectedPaciente.set(paciente);
    this.pacienteResults.set([]);
    this.pacienteSearch = '';
    this.showPacienteDropdown.set(false);
    this.cargarCitasPaciente(paciente.id);
  }

  clearPaciente() {
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.citasPaciente.set([]);
    this.selectedCita.set(null);
  }

  cargarCitasPaciente(pacienteId: number) {
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

  onCitaChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const citaId = parseInt(select.value, 10);
    if (citaId) {
      const cita = this.citasPaciente().find(c => c.id === citaId);
      if (cita) {
        this.selectCita(cita);
      }
    }
  }

  selectCita(cita: Cita) {
    this.selectedCita.set(cita);
    // Auto-llenar datos del formulario con la información de la cita
    const tipoServicio = cita.tipo_servicio as any;
    const precio = tipoServicio?.precio || '';
    this.ingresoForm.patchValue({
      fecha: cita.fecha,
      concepto: cita.servicio_nombre || '',
      monto: precio
    });
  }

  clearCita() {
    this.selectedCita.set(null);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
  }

  // Modal Ingreso
  abrirModalIngreso() {
    this.ingresoSeleccionado.set(null);
    this.selectedPaciente.set(null);
    this.selectedCita.set(null);
    this.citasPaciente.set([]);
    this.pacienteSearch = '';
    this.ingresoForm.reset({
      fecha: new Date().toISOString().split('T')[0],
      metodo_pago: 'efectivo'
    });
    this.modalIngresoVisible.set(true);
  }

  editarIngreso(ingreso: Ingreso) {
    this.ingresoSeleccionado.set(ingreso);
    this.selectedCita.set(null);
    this.citasPaciente.set([]);
    this.ingresoForm.patchValue({
      fecha: ingreso.fecha,
      concepto: ingreso.concepto,
      descripcion: ingreso.descripcion || '',
      monto: ingreso.monto,
      metodo_pago: ingreso.metodo_pago,
      numero_recibo: ingreso.numero_recibo || ''
    });
    // Cargar paciente y citas si existe
    if (ingreso.paciente) {
      this.pacientesService.getById(ingreso.paciente).subscribe({
        next: (paciente) => {
          this.selectedPaciente.set(paciente);
          this.cargarCitasPaciente(paciente.id);
          // Si el ingreso tiene una cita asociada, seleccionarla después de cargar
          if (ingreso.cita) {
            this.agendaService.getCita(ingreso.cita).subscribe({
              next: (cita) => this.selectedCita.set(cita),
              error: () => this.selectedCita.set(null)
            });
          }
        },
        error: () => this.selectedPaciente.set(null)
      });
    } else {
      this.selectedPaciente.set(null);
    }
    this.modalIngresoVisible.set(true);
  }

  cerrarModalIngreso() {
    this.modalIngresoVisible.set(false);
    this.ingresoSeleccionado.set(null);
    this.selectedPaciente.set(null);
    this.selectedCita.set(null);
    this.citasPaciente.set([]);
    this.pacienteSearch = '';
    this.pacienteResults.set([]);
    this.showPacienteDropdown.set(false);
  }

  guardarIngreso() {
    if (this.ingresoForm.invalid) return;

    this.guardandoIngreso.set(true);
    const formValue = this.ingresoForm.value;
    const data: IngresoCreate = {
      fecha: formValue.fecha!,
      concepto: formValue.concepto!,
      descripcion: formValue.descripcion || undefined,
      monto: formValue.monto!.toString(),
      metodo_pago: formValue.metodo_pago as MetodoPago,
      numero_recibo: formValue.numero_recibo || undefined,
      paciente: this.selectedPaciente()?.id || undefined,
      cita: this.selectedCita()?.id || undefined
    };

    const observable = this.ingresoSeleccionado()
      ? this.facturacionService.updateIngreso(this.ingresoSeleccionado()!.id, data)
      : this.facturacionService.createIngreso(data);

    observable.subscribe({
      next: () => {
        this.guardandoIngreso.set(false);
        this.cerrarModalIngreso();
        this.cargarDatos();
      },
      error: () => {
        this.guardandoIngreso.set(false);
      }
    });
  }

  confirmarEliminarIngreso(ingreso: Ingreso) {
    this.tipoEliminacion.set('ingreso');
    this.itemAEliminar.set(ingreso.id);
    this.modalConfirmarVisible.set(true);
  }

  // Modal Gasto
  abrirModalGasto() {
    this.gastoSeleccionado.set(null);
    this.gastoForm.reset({
      fecha: new Date().toISOString().split('T')[0],
      categoria: 'insumos'
    });
    this.modalGastoVisible.set(true);
  }

  editarGasto(gasto: Gasto) {
    this.gastoSeleccionado.set(gasto);
    this.gastoForm.patchValue({
      fecha: gasto.fecha,
      categoria: gasto.categoria,
      concepto: gasto.concepto,
      monto: gasto.monto,
      proveedor: gasto.proveedor || '',
      numero_documento: gasto.numero_documento || ''
    });
    this.modalGastoVisible.set(true);
  }

  cerrarModalGasto() {
    this.modalGastoVisible.set(false);
    this.gastoSeleccionado.set(null);
  }

  guardarGasto() {
    if (this.gastoForm.invalid) return;

    this.guardandoGasto.set(true);
    const formValue = this.gastoForm.value;
    const data = {
      fecha: formValue.fecha!,
      categoria: formValue.categoria as CategoriaGasto,
      concepto: formValue.concepto!,
      monto: formValue.monto!.toString(),
      proveedor: formValue.proveedor || undefined,
      numero_documento: formValue.numero_documento || undefined
    };

    const observable = this.gastoSeleccionado()
      ? this.facturacionService.updateGasto(this.gastoSeleccionado()!.id, data)
      : this.facturacionService.createGasto(data);

    observable.subscribe({
      next: () => {
        this.guardandoGasto.set(false);
        this.cerrarModalGasto();
        this.cargarDatos();
      },
      error: () => {
        this.guardandoGasto.set(false);
      }
    });
  }

  confirmarEliminarGasto(gasto: Gasto) {
    this.tipoEliminacion.set('gasto');
    this.itemAEliminar.set(gasto.id);
    this.modalConfirmarVisible.set(true);
  }

  // Eliminación
  cerrarModalConfirmar() {
    this.modalConfirmarVisible.set(false);
    this.tipoEliminacion.set(null);
    this.itemAEliminar.set(null);
  }

  ejecutarEliminacion() {
    const tipo = this.tipoEliminacion();
    const id = this.itemAEliminar();
    if (!tipo || !id) return;

    this.eliminando.set(true);

    const observable = tipo === 'ingreso'
      ? this.facturacionService.deleteIngreso(id)
      : this.facturacionService.deleteGasto(id);

    observable.subscribe({
      next: () => {
        this.eliminando.set(false);
        this.cerrarModalConfirmar();
        this.cargarDatos();
      },
      error: () => {
        this.eliminando.set(false);
      }
    });
  }
}
