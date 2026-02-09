import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgendaService } from '../../services/agenda.service';
import { PacientesService } from '../../services/pacientes.service';
import {
  Cita, CitaCreate, TipoServicio, TipoAtencion, SlotDisponible, CitaEstado,
  ConfiguracionAgenda, BloqueoAgenda, BloqueoAgendaCreate, TipoBloqueo,
  PatronRecurrenciaCreate, ListaEspera, ListaEsperaCreate,
  PlanTratamiento, PlanTratamientoCreate
} from '../../../../models/cita.model';
import { Paciente } from '../../../../models/paciente.model';
import { debounceTime, Subject } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Agenda" />

      <!-- Tab Navigation -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-4 overflow-x-auto">
          @for (tab of mainTabs; track tab.key) {
            <button
              (click)="onTabChange(tab.key)"
              class="whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors"
              [class]="mainTab() === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
            >
              {{ tab.label }}
            </button>
          }
        </nav>
      </div>

      @if (mainTab() === 'calendario') {
      <!-- Stats for Today -->
      @if (citasHoy()) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Citas Hoy</p>
            <p class="text-2xl font-semibold text-gray-900">{{ citasHoy()!.total }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Pendientes</p>
            <p class="text-2xl font-semibold text-yellow-600">{{ citasHoy()!.pendientes }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Atendidas</p>
            <p class="text-2xl font-semibold text-green-600">{{ citasHoy()!.atendidas }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Próxima Cita</p>
            <p class="text-lg font-semibold text-primary-600">
              {{ getProximaCita() || 'Sin citas pendientes' }}
            </p>
          </div>
        </div>
      }

      <!-- Calendar Navigation -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <button (click)="previousWeek()" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button (click)="goToToday()" class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Hoy</button>
            <button (click)="nextWeek()" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <h2 class="ml-2 text-lg font-semibold text-gray-900">{{ getWeekRangeText() }}</h2>
          </div>
          <div class="flex gap-3">
            <button (click)="openConfigModal()" class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Configuracion
            </button>
            <button (click)="openCitaModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nueva Cita
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      }

      <!-- Weekly Calendar View -->
      @if (!loading()) {
        <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
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
          <div class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500">
            No hay citas para este día
          </div>
        } @else {
          <div class="space-y-3">
            @for (cita of citasDelDia(); track cita.id) {
              <div class="rounded-2xl border border-gray-200 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow" (click)="openCitaDetail(cita)">
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
      } <!-- end calendario -->

      <!-- Tab: Bloqueos -->
      @if (mainTab() === 'bloqueos') {
        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Bloqueos de Agenda</h2>
              <p class="text-sm text-gray-500">Configura horarios bloqueados (trabajo, personal, vacaciones)</p>
            </div>
            <button (click)="openBloqueoModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nuevo Bloqueo
            </button>
          </div>
        </div>

        @if (loadingBloqueos()) {
          <div class="flex justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        }

        @if (!loadingBloqueos()) {
          @if (bloqueos().length === 0) {
            <div class="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p class="text-sm text-gray-500">No hay bloqueos configurados</p>
            </div>
          } @else {
            <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Título</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Tipo</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Fecha</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Horario</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Recurrente</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (bloqueo of bloqueos(); track bloqueo.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-5 py-3">
                          <div class="flex items-center gap-2">
                            <span class="h-3 w-3 rounded-full" [style.background-color]="bloqueo.color"></span>
                            <span class="text-sm font-medium text-gray-900">{{ bloqueo.titulo || bloqueo.motivo || '-' }}</span>
                          </div>
                        </td>
                        <td class="px-5 py-3">
                          <span [class]="getTipoBloqueoClass(bloqueo.tipo)">{{ bloqueo.tipo_display || bloqueo.tipo }}</span>
                        </td>
                        <td class="px-5 py-3 text-sm text-gray-700">
                          {{ bloqueo.fecha_inicio | date:'dd/MM/yy' }}
                          @if (bloqueo.fecha_fin !== bloqueo.fecha_inicio) {
                            - {{ bloqueo.fecha_fin | date:'dd/MM/yy' }}
                          }
                        </td>
                        <td class="px-5 py-3 text-sm text-gray-700">
                          @if (bloqueo.hora_inicio && bloqueo.hora_fin) {
                            {{ bloqueo.hora_inicio.slice(0,5) }} - {{ bloqueo.hora_fin.slice(0,5) }}
                          } @else {
                            Todo el día
                          }
                        </td>
                        <td class="px-5 py-3">
                          @if (bloqueo.es_recurrente) {
                            <span class="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Sí</span>
                          } @else {
                            <span class="text-sm text-gray-400">No</span>
                          }
                        </td>
                        <td class="px-5 py-3">
                          <div class="flex items-center gap-1">
                            <button (click)="editBloqueo(bloqueo)" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Editar">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button (click)="deleteBloqueoConfirm(bloqueo)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        }
      }

      <!-- Tab: Lista de Espera -->
      @if (mainTab() === 'espera') {
        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Lista de Espera</h2>
              <p class="text-sm text-gray-500">Pacientes en espera de disponibilidad</p>
            </div>
            <div class="flex items-center gap-3">
              <select [(ngModel)]="filtroEstadoEspera" (ngModelChange)="loadListaEspera()" class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
                <option value="">Todos</option>
                <option value="esperando">Esperando</option>
                <option value="notificado">Notificado</option>
                <option value="agendado">Agendado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <button (click)="openEsperaModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Agregar
              </button>
            </div>
          </div>
        </div>

        @if (loadingEspera()) {
          <div class="flex justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        }

        @if (!loadingEspera()) {
          @if (listaEspera().length === 0) {
            <div class="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p class="text-sm text-gray-500">No hay pacientes en lista de espera</p>
            </div>
          } @else {
            <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Paciente</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Servicio</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Fecha deseada</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Atención</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Estado</th>
                      <th class="px-5 py-3 text-sm font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (item of listaEspera(); track item.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-5 py-3 text-sm font-medium text-gray-900">{{ item.paciente_nombre }}</td>
                        <td class="px-5 py-3 text-sm text-gray-700">{{ item.servicio_nombre }}</td>
                        <td class="px-5 py-3 text-sm text-gray-700">{{ item.fecha_deseada | date:'dd/MM/yyyy' }}</td>
                        <td class="px-5 py-3 text-sm text-gray-700">{{ item.tipo_atencion_display || item.tipo_atencion }}</td>
                        <td class="px-5 py-3">
                          <span [class]="getEstadoEsperaClass(item.estado)">{{ item.estado_display || item.estado }}</span>
                        </td>
                        <td class="px-5 py-3">
                          <div class="flex items-center gap-1">
                            @if (item.estado === 'esperando') {
                              <button (click)="updateEsperaEstado(item, 'notificado')" class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">Notificar</button>
                              <button (click)="updateEsperaEstado(item, 'cancelado')" class="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">Cancelar</button>
                            }
                            @if (item.estado === 'notificado') {
                              <button (click)="updateEsperaEstado(item, 'agendado')" class="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">Agendar</button>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        }
      }

      <!-- Tab: Planes de Tratamiento -->
      @if (mainTab() === 'planes') {
        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Planes de Tratamiento</h2>
              <p class="text-sm text-gray-500">Gestiona tratamientos recurrentes (inyectables, curaciones, etc.)</p>
            </div>
            <div class="flex items-center gap-3">
              <select [(ngModel)]="filtroEstadoPlan" (ngModelChange)="loadPlanes()" class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700">
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="completado">Completado</option>
                <option value="suspendido">Suspendido</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <button (click)="openPlanModal()" class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nuevo Plan
              </button>
            </div>
          </div>
        </div>

        @if (loadingPlanes()) {
          <div class="flex justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        }

        @if (!loadingPlanes()) {
          @if (planes().length === 0) {
            <div class="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p class="text-sm text-gray-500">No hay planes de tratamiento</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (plan of planes(); track plan.id) {
                <div class="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 truncate">{{ plan.nombre }}</h3>
                      <p class="text-sm text-gray-500">{{ plan.paciente_nombre }}</p>
                      <p class="text-xs text-gray-400">{{ plan.servicio_nombre }}</p>
                    </div>
                    <span [class]="getEstadoPlanClass(plan.estado)">{{ plan.estado_display || plan.estado }}</span>
                  </div>

                  <div class="mt-4">
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span class="text-gray-500">Progreso</span>
                      <span class="font-medium text-gray-900">{{ plan.sesiones_completadas }}/{{ plan.total_sesiones }}</span>
                    </div>
                    <div class="h-2 w-full rounded-full bg-gray-200">
                      <div class="h-2 rounded-full bg-blue-500 transition-all" [style.width.%]="plan.progreso"></div>
                    </div>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span class="text-gray-500">Frecuencia:</span>
                      <span class="ml-1 font-medium text-gray-700">{{ plan.frecuencia_display || plan.frecuencia }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Inicio:</span>
                      <span class="ml-1 font-medium text-gray-700">{{ plan.fecha_inicio | date:'dd/MM/yy' }}</span>
                    </div>
                    @if (plan.requiere_orden_medica) {
                      <div class="col-span-2">
                        <span class="inline-flex items-center gap-1 text-xs text-amber-600">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          Requiere orden médica
                          @if (plan.orden_medica) {
                            <a [href]="plan.orden_medica" target="_blank" class="underline">Ver</a>
                          }
                        </span>
                      </div>
                    }
                  </div>

                  @if (plan.estado === 'activo' && plan.sesiones_restantes > 0) {
                    <div class="mt-4">
                      <button (click)="completarSesion(plan)" class="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Completar Sesión ({{ plan.sesiones_restantes }} restantes)
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }
      }
    </div>

    <!-- Nueva/Editar Cita Modal -->
    @if (showCitaModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeCitaModal()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeCitaModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">
            {{ editingCita() ? 'Editar Cita' : 'Nueva Cita' }}
          </h4>
          <form [formGroup]="citaForm" (ngSubmit)="saveCita()" class="space-y-5">
            <!-- Paciente Search -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="pacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onPacienteSearch($event)"
                    (focus)="showPacienteDropdown.set(true)"
                    placeholder="Buscar paciente por nombre o documento..."
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                  >
                  @if (searchingPacientes()) {
                    <div class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                    </div>
                  }
                  @if (pacienteResults().length > 0 && showPacienteDropdown()) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      @for (p of pacienteResults(); track p.id) {
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
                            <p class="text-sm text-gray-500 truncate">{{ p.tipo_documento | uppercase }} {{ p.numero_documento }} · {{ p.edad_texto }}</p>
                          </div>
                        </button>
                      }
                    </div>
                  }
                  @if (pacienteSearch.length >= 2 && pacienteResults().length === 0 && !searchingPacientes() && showPacienteDropdown()) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                      <p class="text-sm text-gray-500">No se encontraron pacientes</p>
                    </div>
                  }
                </div>
                @if (pacienteSearch.length < 2) {
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
                      <p class="text-sm text-gray-500">{{ selectedPaciente()!.tipo_documento | uppercase }} {{ selectedPaciente()!.numero_documento }} · {{ selectedPaciente()!.edad_texto }}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="clearPaciente()"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <!-- Tipo de Servicio -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Servicio *</label>
              <select formControlName="tipo_servicio" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden" (change)="onServicioChange()">
                <option value="">Seleccionar servicio...</option>
                @for (s of servicios(); track s.id) {
                  <option [value]="s.id">{{ s.nombre }} ({{ s.duracion_minutos }} min) - S/ {{ s.precio }}</option>
                }
              </select>
            </div>

            <!-- Tipo de Atención -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Atención</label>
              <select formControlName="tipo_atencion" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                <option value="consultorio">Consultorio</option>
                <option value="domicilio">Domicilio</option>
                <option value="teleconsulta">Teleconsulta</option>
              </select>
            </div>

            <!-- Fecha -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha *</label>
              <input
                type="date"
                formControlName="fecha"
                class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"
                [min]="getMinDate()"
                (change)="loadDisponibilidad()"
              >
            </div>

            <!-- Hora -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Hora *</label>
              @if (loadingDisponibilidad()) {
                <div class="flex items-center gap-2 text-gray-500">
                  <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
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
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Notas</label>
              <textarea formControlName="notas" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Notas adicionales..."></textarea>
            </div>

            @if (citaError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ citaError() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeCitaModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="citaForm.invalid || !selectedPaciente() || savingCita()"
                class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingCita()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeCitaDetail()"></div>
        <div class="relative w-full max-w-[450px] rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeCitaDetail()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Detalle de Cita</h4>
          @if (selectedCita()) {
            <div class="space-y-4">
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

              <div>
                <p class="text-sm text-gray-500">Tipo de Atención</p>
                <p class="font-medium text-gray-900">{{ selectedCita()!.tipo_atencion_display || selectedCita()!.tipo_atencion }}</p>
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
                <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                  <strong>Motivo de cancelación:</strong> {{ selectedCita()!.motivo_cancelacion }}
                </div>
              }

              <!-- Actions -->
              <div class="flex flex-wrap gap-2 mt-6">
                @if (selectedCita()!.estado === 'programada') {
                  <button (click)="confirmarCita(selectedCita()!)" class="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition">
                    Confirmar
                  </button>
                }
                @if (selectedCita()!.estado === 'confirmada') {
                  <button (click)="atenderCita(selectedCita()!)" class="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition">
                    Iniciar Atención
                  </button>
                }
                @if (selectedCita()!.estado === 'en_atencion') {
                  <button (click)="finalizarCita(selectedCita()!)" class="flex-1 inline-flex items-center justify-center rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-green-600 transition">
                    Finalizar
                  </button>
                }
                @if (selectedCita()!.puede_cancelarse) {
                  <button (click)="cancelarCitaConfirm(selectedCita()!)" class="flex-1 inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-red-600 transition">
                    Cancelar Cita
                  </button>
                }
                @if (selectedCita()!.estado === 'confirmada' || selectedCita()!.estado === 'programada') {
                  <button (click)="marcarNoAsistio(selectedCita()!)" class="flex-1 inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
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
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeConfigModal()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeConfigModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Configuración de Agenda</h4>
          <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Hora de Inicio</label>
                <input type="time" formControlName="hora_inicio" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Hora de Fin</label>
                <input type="time" formControlName="hora_fin" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Intervalo (minutos)</label>
                <input type="number" formControlName="intervalo_minutos" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" min="15" step="15">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Tiempo entre citas (min)</label>
                <input type="number" formControlName="tiempo_entre_citas" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" min="0">
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Días anticipación máxima</label>
              <input type="number" formControlName="dias_anticipacion_maxima" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" min="1">
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Días Laborables</label>
              <div class="flex flex-wrap gap-2 mt-2">
                @for (dia of diasSemana; track dia.value) {
                  <label class="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      [checked]="isDiaSeleccionado(dia.value)"
                      (change)="toggleDia(dia.value)"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600"
                    >
                    <span class="text-sm text-gray-700">{{ dia.label }}</span>
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

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeConfigModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="savingConfig()" class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingConfig()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Bloqueo Modal -->
    @if (showBloqueoModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeBloqueoModal()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeBloqueoModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/></svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">{{ editingBloqueo() ? 'Editar Bloqueo' : 'Nuevo Bloqueo' }}</h4>
          <form [formGroup]="bloqueoForm" (ngSubmit)="saveBloqueo()" class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Título *</label>
              <input type="text" formControlName="titulo" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Ej: Guardia Hospital">
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo</label>
              <select formControlName="tipo" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                <option value="personal">Personal</option>
                <option value="trabajo_principal">Trabajo Principal</option>
                <option value="trabajo_secundario">Trabajo Secundario</option>
                <option value="vacaciones">Vacaciones</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha inicio *</label>
                <input type="date" formControlName="fecha_inicio" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha fin *</label>
                <input type="date" formControlName="fecha_fin" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Hora inicio</label>
                <input type="time" formControlName="hora_inicio" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Hora fin</label>
                <input type="time" formControlName="hora_fin" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Motivo</label>
              <textarea formControlName="motivo" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Motivo del bloqueo..."></textarea>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Color</label>
              <input type="color" formControlName="color" class="h-11 w-14 rounded-lg border border-gray-300 cursor-pointer">
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" formControlName="es_recurrente" id="es_recurrente_bloqueo" class="h-4 w-4 rounded border-gray-300 text-primary-600">
              <label for="es_recurrente_bloqueo" class="text-sm text-gray-700">Es recurrente</label>
            </div>

            @if (bloqueoForm.get('es_recurrente')?.value) {
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                <h5 class="text-sm font-medium text-gray-700">Configuración de Recurrencia</h5>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de recurrencia</label>
                  <select [(ngModel)]="tipoRecurrencia" [ngModelOptions]="{standalone: true}" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800">
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="patron">Patrón cíclico</option>
                  </select>
                </div>
                @if (tipoRecurrencia === 'diario') {
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Cada N días</label>
                    <input type="number" [(ngModel)]="intervaloDias" [ngModelOptions]="{standalone: true}" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800" min="1">
                  </div>
                }
                @if (tipoRecurrencia === 'semanal') {
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Días de la semana</label>
                    <div class="flex flex-wrap gap-2 mt-2">
                      @for (dia of diasSemana; track dia.value) {
                        <label class="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-white transition-colors">
                          <input type="checkbox" [checked]="recurrenciaDias.includes(dia.value)" (change)="toggleRecurrenciaDia(dia.value)" class="h-4 w-4 rounded border-gray-300 text-primary-600">
                          <span class="text-sm text-gray-700">{{ dia.label }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }
                @if (tipoRecurrencia === 'patron') {
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Patrón cíclico (separar con comas)</label>
                    <input type="text" [(ngModel)]="patronCicloText" [ngModelOptions]="{standalone: true}" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800" placeholder="DIURNA,NOCTURNA,DESCANSO,DESCANSO">
                    <p class="mt-1 text-xs text-gray-500">Ej: DIURNA,NOCTURNA,DESCANSO,DESCANSO</p>
                  </div>
                }
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Desde</label>
                    <input type="date" [(ngModel)]="recurrenciaInicio" [ngModelOptions]="{standalone: true}" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800">
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700">Hasta (opcional)</label>
                    <input type="date" [(ngModel)]="recurrenciaFin" [ngModelOptions]="{standalone: true}" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800">
                  </div>
                </div>
              </div>
            }

            @if (bloqueoError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ bloqueoError() }}</div>
            }
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeBloqueoModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">Cancelar</button>
              <button type="submit" [disabled]="bloqueoForm.invalid || savingBloqueo()" class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingBloqueo()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                {{ editingBloqueo() ? 'Guardar Cambios' : 'Crear Bloqueo' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Lista Espera Modal -->
    @if (showEsperaModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeEsperaModal()"></div>
        <div class="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeEsperaModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/></svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Agregar a Lista de Espera</h4>
          <form [formGroup]="esperaForm" (ngSubmit)="saveEspera()" class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input type="text" [(ngModel)]="pacienteSearch" [ngModelOptions]="{standalone: true}" (ngModelChange)="onPacienteSearch($event)" (focus)="showPacienteDropdown.set(true)" placeholder="Buscar paciente..." class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                  @if (pacienteResults().length > 0 && showPacienteDropdown()) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      @for (p of pacienteResults(); track p.id) {
                        <button type="button" (click)="selectPaciente(p)" class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <p class="font-medium text-gray-900 text-sm">{{ p.nombre_completo }}</p>
                          <p class="text-xs text-gray-500">{{ p.tipo_documento | uppercase }} {{ p.numero_documento }}</p>
                        </button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ selectedPaciente()!.nombre_completo }}</p>
                    <p class="text-xs text-gray-500">{{ selectedPaciente()!.tipo_documento | uppercase }} {{ selectedPaciente()!.numero_documento }}</p>
                  </div>
                  <button type="button" (click)="clearPaciente()" class="p-1 text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              }
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Servicio *</label>
              <select formControlName="tipo_servicio" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800">
                <option value="">Seleccionar servicio...</option>
                @for (s of servicios(); track s.id) {
                  <option [value]="s.id">{{ s.nombre }}</option>
                }
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha deseada *</label>
              <input type="date" formControlName="fecha_deseada" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Atención</label>
              <select formControlName="tipo_atencion" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800">
                <option value="consultorio">Consultorio</option>
                <option value="domicilio">Domicilio</option>
                <option value="teleconsulta">Teleconsulta</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Notas</label>
              <textarea formControlName="notas" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Notas adicionales..."></textarea>
            </div>
            @if (esperaError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ esperaError() }}</div>
            }
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeEsperaModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">Cancelar</button>
              <button type="submit" [disabled]="esperaForm.invalid || !selectedPaciente() || savingEspera()" class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingEspera()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Agregar a Lista
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Plan de Tratamiento Modal -->
    @if (showPlanModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closePlanModal()"></div>
        <div class="relative w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closePlanModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/></svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">Nuevo Plan de Tratamiento</h4>
          <form [formGroup]="planForm" (ngSubmit)="savePlan()" class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Paciente *</label>
              @if (!selectedPaciente()) {
                <div class="relative">
                  <input type="text" [(ngModel)]="pacienteSearch" [ngModelOptions]="{standalone: true}" (ngModelChange)="onPacienteSearch($event)" (focus)="showPacienteDropdown.set(true)" placeholder="Buscar paciente..." class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                  @if (pacienteResults().length > 0 && showPacienteDropdown()) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      @for (p of pacienteResults(); track p.id) {
                        <button type="button" (click)="selectPaciente(p)" class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <p class="font-medium text-gray-900 text-sm">{{ p.nombre_completo }}</p>
                          <p class="text-xs text-gray-500">{{ p.tipo_documento | uppercase }} {{ p.numero_documento }}</p>
                        </button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ selectedPaciente()!.nombre_completo }}</p>
                    <p class="text-xs text-gray-500">{{ selectedPaciente()!.tipo_documento | uppercase }} {{ selectedPaciente()!.numero_documento }}</p>
                  </div>
                  <button type="button" (click)="clearPaciente()" class="p-1 text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              }
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Nombre del plan *</label>
              <input type="text" formControlName="nombre" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Ej: Tratamiento de 5 inyectables - Penicilina">
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Servicio *</label>
              <select formControlName="tipo_servicio" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800">
                <option value="">Seleccionar servicio...</option>
                @for (s of servicios(); track s.id) {
                  <option [value]="s.id">{{ s.nombre }}</option>
                }
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Total sesiones *</label>
                <input type="number" formControlName="total_sesiones" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800" min="1">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Frecuencia *</label>
                <select formControlName="frecuencia" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800">
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                  <option value="personalizada">Personalizada</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha inicio *</label>
                <input type="date" formControlName="fecha_inicio" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha fin estimada</label>
                <input type="date" formControlName="fecha_fin_estimada" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Descripción</label>
              <textarea formControlName="descripcion" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Descripción del tratamiento..."></textarea>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" formControlName="requiere_orden_medica" id="requiere_orden" class="h-4 w-4 rounded border-gray-300 text-primary-600">
              <label for="requiere_orden" class="text-sm text-gray-700">Requiere orden médica</label>
            </div>
            @if (planForm.get('requiere_orden_medica')?.value) {
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Orden médica (PDF/imagen)</label>
                <input type="file" accept=".pdf,image/*" (change)="onOrdenMedicaChange($event)" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200">
              </div>
            }
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Notas</label>
              <textarea formControlName="notas" rows="2" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20" placeholder="Notas adicionales..."></textarea>
            </div>
            @if (planError()) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ planError() }}</div>
            }
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closePlanModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">Cancelar</button>
              <button type="submit" [disabled]="planForm.invalid || !selectedPaciente() || savingPlan()" class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (savingPlan()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Crear Plan
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
  showPacienteDropdown = signal(false);
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
    tipo_atencion: ['consultorio' as TipoAtencion],
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

  // Main Tab
  mainTab = signal<'calendario' | 'bloqueos' | 'espera' | 'planes'>('calendario');
  mainTabs = [
    { key: 'calendario' as const, label: 'Calendario' },
    { key: 'bloqueos' as const, label: 'Bloqueos' },
    { key: 'espera' as const, label: 'Lista de Espera' },
    { key: 'planes' as const, label: 'Planes' }
  ];

  // Bloqueos
  bloqueos = signal<BloqueoAgenda[]>([]);
  loadingBloqueos = signal(false);
  showBloqueoModal = signal(false);
  editingBloqueo = signal<BloqueoAgenda | null>(null);
  savingBloqueo = signal(false);
  bloqueoError = signal<string | null>(null);

  // Recurrencia state
  tipoRecurrencia = 'semanal';
  intervaloDias = 1;
  recurrenciaDias: number[] = [];
  patronCicloText = '';
  recurrenciaInicio = '';
  recurrenciaFin = '';

  bloqueoForm = this.fb.group({
    titulo: ['', Validators.required],
    tipo: ['personal'],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    hora_inicio: [''],
    hora_fin: [''],
    motivo: [''],
    color: ['#EF4444'],
    es_recurrente: [false]
  });

  // Lista de Espera
  listaEspera = signal<ListaEspera[]>([]);
  loadingEspera = signal(false);
  showEsperaModal = signal(false);
  savingEspera = signal(false);
  esperaError = signal<string | null>(null);
  filtroEstadoEspera = '';

  esperaForm = this.fb.group({
    tipo_servicio: ['', Validators.required],
    fecha_deseada: ['', Validators.required],
    tipo_atencion: ['consultorio'],
    notas: ['']
  });

  // Planes de Tratamiento
  planes = signal<PlanTratamiento[]>([]);
  loadingPlanes = signal(false);
  showPlanModal = signal(false);
  savingPlan = signal(false);
  planError = signal<string | null>(null);
  filtroEstadoPlan = '';
  ordenMedicaFile = signal<File | null>(null);

  planForm = this.fb.group({
    nombre: ['', Validators.required],
    tipo_servicio: ['', Validators.required],
    total_sesiones: [1, [Validators.required, Validators.min(1)]],
    frecuencia: ['diaria', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin_estimada: [''],
    descripcion: [''],
    requiere_orden_medica: [false],
    notas: ['']
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
      next: (response: any) => {
        const servicios = Array.isArray(response) ? response : (response?.results || []);
        this.servicios.set(servicios.filter((s: any) => s.is_active));
      },
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

  // Helpers
  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
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
      programada: 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800',
      confirmada: 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800',
      en_atencion: 'inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800',
      atendida: 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800',
      cancelada: 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800',
      no_asistio: 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800'
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
    this.showPacienteDropdown.set(false);
  }

  onPacienteSearch(term: string): void {
    this.pacienteSearchSubject.next(term);
  }

  searchPacientes(term: string): void {
    if (!term || term.length < 2) {
      this.pacienteResults.set([]);
      this.showPacienteDropdown.set(false);
      return;
    }

    this.searchingPacientes.set(true);
    this.showPacienteDropdown.set(true);
    this.pacientesService.getAll({ search: term, page_size: 10 }).subscribe({
      next: (response: any) => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          this.pacienteResults.set(response);
        } else if (response && Array.isArray(response.results)) {
          this.pacienteResults.set(response.results);
        } else {
          this.pacienteResults.set([]);
        }
        this.searchingPacientes.set(false);
      },
      error: () => {
        this.searchingPacientes.set(false);
        this.pacienteResults.set([]);
      }
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
    this.showPacienteDropdown.set(false);
  }

  clearPaciente(): void {
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.pacienteResults.set([]);
    this.showPacienteDropdown.set(false);
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

    // Asegurar formato HH:MM:SS para la hora
    let horaInicio = this.citaForm.value.hora_inicio!;
    if (horaInicio && horaInicio.length === 5) {
      horaInicio = horaInicio + ':00';
    }

    const data: CitaCreate = {
      paciente: this.selectedPaciente()!.id,
      tipo_servicio: +this.citaForm.value.tipo_servicio!,
      fecha: this.citaForm.value.fecha!,
      hora_inicio: horaInicio,
      tipo_atencion: (this.citaForm.value.tipo_atencion as TipoAtencion) || undefined,
      notas: this.citaForm.value.notas || undefined
    };

    console.log('Enviando cita:', data); // Debug

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
        console.error('Error creando cita:', err.error); // Debug
        const errorMsg = err.error?.detail
          || err.error?.non_field_errors?.[0]
          || (typeof err.error === 'object' ? JSON.stringify(err.error) : 'Error al guardar la cita');
        this.citaError.set(errorMsg);
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

  // --- Tab Change ---
  onTabChange(tab: 'calendario' | 'bloqueos' | 'espera' | 'planes'): void {
    this.mainTab.set(tab);
    switch (tab) {
      case 'bloqueos':
        this.loadBloqueos();
        break;
      case 'espera':
        this.loadListaEspera();
        break;
      case 'planes':
        this.loadPlanes();
        break;
    }
  }

  // --- Bloqueos ---
  loadBloqueos(): void {
    this.loadingBloqueos.set(true);
    this.agendaService.getBloqueos().subscribe({
      next: (response: any) => {
        const items = Array.isArray(response) ? response : (response?.results || []);
        this.bloqueos.set(items);
        this.loadingBloqueos.set(false);
      },
      error: () => this.loadingBloqueos.set(false)
    });
  }

  openBloqueoModal(): void {
    this.editingBloqueo.set(null);
    this.bloqueoForm.reset({ titulo: '', tipo: 'personal', color: '#EF4444', es_recurrente: false });
    this.tipoRecurrencia = 'semanal';
    this.intervaloDias = 1;
    this.recurrenciaDias = [];
    this.patronCicloText = '';
    this.recurrenciaInicio = '';
    this.recurrenciaFin = '';
    this.bloqueoError.set(null);
    this.showBloqueoModal.set(true);
  }

  editBloqueo(bloqueo: BloqueoAgenda): void {
    this.editingBloqueo.set(bloqueo);
    this.bloqueoForm.patchValue({
      titulo: bloqueo.titulo || '',
      tipo: bloqueo.tipo,
      fecha_inicio: bloqueo.fecha_inicio,
      fecha_fin: bloqueo.fecha_fin,
      hora_inicio: bloqueo.hora_inicio?.slice(0, 5) || '',
      hora_fin: bloqueo.hora_fin?.slice(0, 5) || '',
      motivo: bloqueo.motivo || '',
      color: bloqueo.color,
      es_recurrente: bloqueo.es_recurrente
    });
    this.bloqueoError.set(null);
    this.showBloqueoModal.set(true);
  }

  closeBloqueoModal(): void {
    this.showBloqueoModal.set(false);
    this.editingBloqueo.set(null);
  }

  saveBloqueo(): void {
    if (this.bloqueoForm.invalid) return;
    this.savingBloqueo.set(true);
    this.bloqueoError.set(null);

    const val = this.bloqueoForm.value;
    const data: BloqueoAgendaCreate = {
      titulo: val.titulo!,
      tipo: (val.tipo as TipoBloqueo) || 'personal',
      fecha_inicio: val.fecha_inicio!,
      fecha_fin: val.fecha_fin!,
      hora_inicio: val.hora_inicio || undefined,
      hora_fin: val.hora_fin || undefined,
      motivo: val.motivo || undefined,
      es_recurrente: val.es_recurrente || false,
      color: val.color || undefined
    };

    const request = this.editingBloqueo()
      ? this.agendaService.updateBloqueo(this.editingBloqueo()!.id, data)
      : this.agendaService.createBloqueo(data);

    request.subscribe({
      next: (bloqueo) => {
        if (val.es_recurrente && !this.editingBloqueo()) {
          this.createRecurrencia(bloqueo.id);
        }
        this.closeBloqueoModal();
        this.loadBloqueos();
        this.savingBloqueo.set(false);
      },
      error: (err) => {
        const msg = err.error?.detail || (typeof err.error === 'object' ? JSON.stringify(err.error) : 'Error al guardar');
        this.bloqueoError.set(msg);
        this.savingBloqueo.set(false);
      }
    });
  }

  private createRecurrencia(bloqueoId: number): void {
    const data: PatronRecurrenciaCreate = {
      bloqueo: bloqueoId,
      tipo_recurrencia: this.tipoRecurrencia as 'diario' | 'semanal' | 'patron',
      fecha_inicio_recurrencia: this.recurrenciaInicio || this.bloqueoForm.value.fecha_inicio!,
      fecha_fin_recurrencia: this.recurrenciaFin || undefined
    };

    if (this.tipoRecurrencia === 'diario') {
      data.intervalo_dias = this.intervaloDias;
    } else if (this.tipoRecurrencia === 'semanal') {
      data.dias_semana = this.recurrenciaDias;
    } else if (this.tipoRecurrencia === 'patron') {
      data.patron_ciclo = this.patronCicloText.split(',').map(s => s.trim()).filter(s => s);
    }

    this.agendaService.createPatron(data).subscribe({
      error: (err) => console.error('Error creating pattern:', err)
    });
  }

  deleteBloqueoConfirm(bloqueo: BloqueoAgenda): void {
    if (confirm(`¿Eliminar el bloqueo "${bloqueo.titulo || bloqueo.motivo || ''}"?`)) {
      this.agendaService.deleteBloqueo(bloqueo.id).subscribe({
        next: () => this.loadBloqueos(),
        error: (err) => console.error('Error deleting bloqueo:', err)
      });
    }
  }

  toggleRecurrenciaDia(dia: number): void {
    const idx = this.recurrenciaDias.indexOf(dia);
    if (idx >= 0) {
      this.recurrenciaDias = this.recurrenciaDias.filter(d => d !== dia);
    } else {
      this.recurrenciaDias = [...this.recurrenciaDias, dia].sort();
    }
  }

  getTipoBloqueoClass(tipo: TipoBloqueo): string {
    const classes: Record<TipoBloqueo, string> = {
      'trabajo_principal': 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700',
      'trabajo_secundario': 'inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700',
      'personal': 'inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700',
      'vacaciones': 'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
    };
    return classes[tipo] || 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700';
  }

  // --- Lista de Espera ---
  loadListaEspera(): void {
    this.loadingEspera.set(true);
    this.agendaService.getListaEspera(this.filtroEstadoEspera || undefined).subscribe({
      next: (response: any) => {
        const items = Array.isArray(response) ? response : (response?.results || []);
        this.listaEspera.set(items);
        this.loadingEspera.set(false);
      },
      error: () => this.loadingEspera.set(false)
    });
  }

  openEsperaModal(): void {
    this.esperaForm.reset({ tipo_atencion: 'consultorio' });
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.pacienteResults.set([]);
    this.esperaError.set(null);
    this.showEsperaModal.set(true);
  }

  closeEsperaModal(): void {
    this.showEsperaModal.set(false);
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.pacienteResults.set([]);
  }

  saveEspera(): void {
    if (this.esperaForm.invalid || !this.selectedPaciente()) return;
    this.savingEspera.set(true);
    this.esperaError.set(null);

    const val = this.esperaForm.value;
    const data: ListaEsperaCreate = {
      paciente: this.selectedPaciente()!.id,
      tipo_servicio: +val.tipo_servicio!,
      fecha_deseada: val.fecha_deseada!,
      tipo_atencion: (val.tipo_atencion as TipoAtencion) || undefined,
      notas: val.notas || undefined
    };

    this.agendaService.createListaEspera(data).subscribe({
      next: () => {
        this.closeEsperaModal();
        this.loadListaEspera();
        this.savingEspera.set(false);
      },
      error: (err) => {
        const msg = err.error?.detail || (typeof err.error === 'object' ? JSON.stringify(err.error) : 'Error al guardar');
        this.esperaError.set(msg);
        this.savingEspera.set(false);
      }
    });
  }

  updateEsperaEstado(item: ListaEspera, estado: string): void {
    this.agendaService.updateListaEspera(item.id, { estado } as any).subscribe({
      next: () => this.loadListaEspera(),
      error: (err) => console.error('Error updating estado:', err)
    });
  }

  getEstadoEsperaClass(estado: string): string {
    const classes: Record<string, string> = {
      'esperando': 'inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700',
      'notificado': 'inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700',
      'agendado': 'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700',
      'cancelado': 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'
    };
    return classes[estado] || 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700';
  }

  // --- Planes de Tratamiento ---
  loadPlanes(): void {
    this.loadingPlanes.set(true);
    const params: { estado?: string; paciente?: number } = {};
    if (this.filtroEstadoPlan) params.estado = this.filtroEstadoPlan;
    this.agendaService.getPlanesTratamiento(params).subscribe({
      next: (response: any) => {
        const items = Array.isArray(response) ? response : (response?.results || []);
        this.planes.set(items);
        this.loadingPlanes.set(false);
      },
      error: () => this.loadingPlanes.set(false)
    });
  }

  openPlanModal(): void {
    this.planForm.reset({ total_sesiones: 1, frecuencia: 'diaria', requiere_orden_medica: false });
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.pacienteResults.set([]);
    this.ordenMedicaFile.set(null);
    this.planError.set(null);
    this.showPlanModal.set(true);
  }

  closePlanModal(): void {
    this.showPlanModal.set(false);
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.pacienteResults.set([]);
    this.ordenMedicaFile.set(null);
  }

  onOrdenMedicaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.ordenMedicaFile.set(input.files?.[0] || null);
  }

  savePlan(): void {
    if (this.planForm.invalid || !this.selectedPaciente()) return;
    this.savingPlan.set(true);
    this.planError.set(null);

    const val = this.planForm.value;

    if (this.ordenMedicaFile()) {
      const formData = new FormData();
      formData.append('paciente', this.selectedPaciente()!.id.toString());
      formData.append('tipo_servicio', val.tipo_servicio!);
      formData.append('nombre', val.nombre!);
      formData.append('total_sesiones', val.total_sesiones!.toString());
      formData.append('frecuencia', val.frecuencia!);
      formData.append('fecha_inicio', val.fecha_inicio!);
      if (val.fecha_fin_estimada) formData.append('fecha_fin_estimada', val.fecha_fin_estimada);
      if (val.descripcion) formData.append('descripcion', val.descripcion);
      formData.append('requiere_orden_medica', (val.requiere_orden_medica || false).toString());
      if (val.notas) formData.append('notas', val.notas);
      formData.append('orden_medica', this.ordenMedicaFile()!);

      this.agendaService.createPlanTratamiento(formData).subscribe({
        next: () => this.onPlanSuccess(),
        error: (err) => this.onPlanError(err)
      });
    } else {
      const data: PlanTratamientoCreate = {
        paciente: this.selectedPaciente()!.id,
        tipo_servicio: +val.tipo_servicio!,
        nombre: val.nombre!,
        total_sesiones: val.total_sesiones!,
        frecuencia: val.frecuencia!,
        fecha_inicio: val.fecha_inicio!,
        fecha_fin_estimada: val.fecha_fin_estimada || undefined,
        descripcion: val.descripcion || undefined,
        requiere_orden_medica: val.requiere_orden_medica || false,
        notas: val.notas || undefined
      };

      this.agendaService.createPlanTratamiento(data).subscribe({
        next: () => this.onPlanSuccess(),
        error: (err) => this.onPlanError(err)
      });
    }
  }

  private onPlanSuccess(): void {
    this.closePlanModal();
    this.loadPlanes();
    this.savingPlan.set(false);
  }

  private onPlanError(err: any): void {
    const msg = err.error?.detail || (typeof err.error === 'object' ? JSON.stringify(err.error) : 'Error al guardar');
    this.planError.set(msg);
    this.savingPlan.set(false);
  }

  completarSesion(plan: PlanTratamiento): void {
    this.agendaService.completarSesion(plan.id).subscribe({
      next: () => this.loadPlanes(),
      error: (err) => console.error('Error completing sesion:', err)
    });
  }

  getEstadoPlanClass(estado: string): string {
    const classes: Record<string, string> = {
      'activo': 'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700',
      'completado': 'inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700',
      'suspendido': 'inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700',
      'cancelado': 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'
    };
    return classes[estado] || 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700';
  }
}
