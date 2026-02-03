import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FacturacionService } from '../../services/facturacion.service';
import { Ingreso, Gasto, ResumenMensual, ResumenAnual } from '../../../../models/facturacion.model';
import { MetodoPago, CategoriaGasto } from '../../../../models/common.model';

type TabType = 'resumen' | 'ingresos' | 'gastos';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Facturación</h1>
          <p class="mt-1 text-sm text-gray-500">Control de ingresos y gastos del consultorio</p>
        </div>
      </div>

      <!-- Filtros de período -->
      <div class="bg-white rounded-lg shadow p-4">
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
        <div class="bg-white rounded-lg shadow p-6">
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
        <div class="bg-white rounded-lg shadow p-6">
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
        <div class="bg-white rounded-lg shadow p-6">
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
      <div class="bg-white rounded-lg shadow">
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
          <div class="bg-white rounded-lg shadow p-6">
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
          <div class="bg-white rounded-lg shadow p-6">
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
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="cerrarModalIngreso()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ ingresoSeleccionado() ? 'Editar Ingreso' : 'Nuevo Ingreso' }}
              </h3>
              <form [formGroup]="ingresoForm" (ngSubmit)="guardarIngreso()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha *</label>
                  <input type="date" formControlName="fecha"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Concepto *</label>
                  <input type="text" formControlName="concepto" placeholder="Ej: Consulta de control"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea formControlName="descripcion" rows="2"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Monto (S/) *</label>
                    <input type="number" formControlName="monto" step="0.01" min="0"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Método de pago *</label>
                    <select formControlName="metodo_pago"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      @for (metodo of metodosPago; track metodo.value) {
                        <option [value]="metodo.value">{{ metodo.label }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Número de recibo</label>
                  <input type="text" formControlName="numero_recibo"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button type="submit" [disabled]="ingresoForm.invalid || guardandoIngreso()"
                          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50">
                    @if (guardandoIngreso()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    } @else {
                      Guardar
                    }
                  </button>
                  <button type="button" (click)="cerrarModalIngreso()"
                          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Gasto -->
    @if (modalGastoVisible()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="cerrarModalGasto()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ gastoSeleccionado() ? 'Editar Gasto' : 'Nuevo Gasto' }}
              </h3>
              <form [formGroup]="gastoForm" (ngSubmit)="guardarGasto()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha *</label>
                  <input type="date" formControlName="fecha"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Categoría *</label>
                  <select formControlName="categoria"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    @for (cat of categoriasGasto; track cat.value) {
                      <option [value]="cat.value">{{ cat.label }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Concepto *</label>
                  <input type="text" formControlName="concepto" placeholder="Ej: Compra de insumos"
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Monto (S/) *</label>
                    <input type="number" formControlName="monto" step="0.01" min="0"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Proveedor</label>
                    <input type="text" formControlName="proveedor"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">N° Documento</label>
                  <input type="text" formControlName="numero_documento" placeholder="Factura, boleta, etc."
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button type="submit" [disabled]="gastoForm.invalid || guardandoGasto()"
                          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50">
                    @if (guardandoGasto()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    } @else {
                      Guardar
                    }
                  </button>
                  <button type="button" (click)="cerrarModalGasto()"
                          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
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
                <h3 class="text-lg leading-6 font-medium text-gray-900">Confirmar eliminación</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="ejecutarEliminacion()"
                      [disabled]="eliminando()"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                @if (eliminando()) {
                  Eliminando...
                } @else {
                  Eliminar
                }
              </button>
              <button type="button" (click)="cerrarModalConfirmar()"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class FacturacionComponent implements OnInit {
  private facturacionService = inject(FacturacionService);
  private fb = inject(FormBuilder);

  // Estado
  tabActivo = signal<TabType>('resumen');
  mesSeleccionado = signal<number>(new Date().getMonth() + 1);
  anioSeleccionado = signal<number>(new Date().getFullYear());

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

  // Modal Ingreso
  abrirModalIngreso() {
    this.ingresoSeleccionado.set(null);
    this.ingresoForm.reset({
      fecha: new Date().toISOString().split('T')[0],
      metodo_pago: 'efectivo'
    });
    this.modalIngresoVisible.set(true);
  }

  editarIngreso(ingreso: Ingreso) {
    this.ingresoSeleccionado.set(ingreso);
    this.ingresoForm.patchValue({
      fecha: ingreso.fecha,
      concepto: ingreso.concepto,
      descripcion: ingreso.descripcion || '',
      monto: ingreso.monto,
      metodo_pago: ingreso.metodo_pago,
      numero_recibo: ingreso.numero_recibo || ''
    });
    this.modalIngresoVisible.set(true);
  }

  cerrarModalIngreso() {
    this.modalIngresoVisible.set(false);
    this.ingresoSeleccionado.set(null);
  }

  guardarIngreso() {
    if (this.ingresoForm.invalid) return;

    this.guardandoIngreso.set(true);
    const formValue = this.ingresoForm.value;
    const data = {
      fecha: formValue.fecha!,
      concepto: formValue.concepto!,
      descripcion: formValue.descripcion || undefined,
      monto: formValue.monto!.toString(),
      metodo_pago: formValue.metodo_pago as MetodoPago,
      numero_recibo: formValue.numero_recibo || undefined
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
