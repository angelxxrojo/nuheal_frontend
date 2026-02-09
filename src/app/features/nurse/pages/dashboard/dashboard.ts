import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportesService, Dashboard } from '../../services/reportes.service';
import { AgendaService } from '../../services/agenda.service';
import { Cita } from '../../../../models/cita.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      @if (loading()) {
        <div class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      } @else {
        <div class="grid grid-cols-12 gap-4 md:gap-6">
          <!-- Metrics Row -->
          <div class="col-span-12 xl:col-span-8">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              <!-- Total Pacientes -->
              <div class="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <svg class="text-gray-800 size-6 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div class="flex items-end justify-between mt-5">
                  <div>
                    <span class="text-sm text-gray-500">Total Pacientes</span>
                    <h4 class="mt-2 text-2xl font-bold text-gray-800">
                      {{ dashboard()?.total_pacientes ?? 0 }}
                    </h4>
                  </div>
                  <a routerLink="/nurse/pacientes" class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors">
                    Ver todos
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>

              <!-- Citas Hoy -->
              <div class="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <svg class="text-gray-800 size-6 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex items-end justify-between mt-5">
                  <div>
                    <span class="text-sm text-gray-500">Citas Hoy</span>
                    <h4 class="mt-2 text-2xl font-bold text-gray-800">
                      {{ dashboard()?.citas_hoy?.total ?? 0 }}
                    </h4>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      {{ dashboard()?.citas_hoy?.atendidas ?? 0 }} atendidas
                    </span>
                  </div>
                </div>
              </div>

              <!-- Alertas Nutricionales -->
              <div class="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <svg class="text-gray-800 size-6 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div class="flex items-end justify-between mt-5">
                  <div>
                    <span class="text-sm text-gray-500">Alertas Nutricionales</span>
                    <h4 class="mt-2 text-2xl font-bold text-gray-800">
                      {{ dashboard()?.alertas_nutricionales ?? 0 }}
                    </h4>
                  </div>
                  <a routerLink="/nurse/cred" class="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors">
                    Ver alertas
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>

              <!-- Vacunas Pendientes -->
              <div class="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  <svg class="text-gray-800 size-6 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>
                <div class="flex items-end justify-between mt-5">
                  <div>
                    <span class="text-sm text-gray-500">Vacunas Pendientes</span>
                    <h4 class="mt-2 text-2xl font-bold text-gray-800">
                      {{ dashboard()?.pacientes_vacunas_pendientes ?? 0 }}
                    </h4>
                  </div>
                  <a routerLink="/nurse/vacunas" class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                    Ver pacientes
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen del Dia -->
          <div class="col-span-12 xl:col-span-4">
            <div class="rounded-2xl border border-gray-200 bg-gray-100">
              <div class="px-5 pt-5 bg-white shadow-sm rounded-2xl pb-8 sm:px-6 sm:pt-6">
                <div class="flex justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">
                      Resumen del Dia
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Estado de tus citas de hoy
                    </p>
                  </div>
                  <a routerLink="/nurse/agenda" class="text-sm font-medium text-primary-600 hover:text-primary-700">
                    Ver agenda
                  </a>
                </div>

                <!-- Progress Ring -->
                <div class="relative flex justify-center mt-6">
                  <div class="relative w-40 h-40">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <!-- Background circle -->
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#E5E7EB"
                        stroke-width="12"
                        fill="none"
                      />
                      <!-- Progress circle -->
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#10B981"
                        stroke-width="12"
                        fill="none"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="251.2"
                        [attr.stroke-dashoffset]="251.2 - (251.2 * getProgressPercentage() / 100)"
                      />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-3xl font-bold text-gray-800">{{ getProgressPercentage() }}%</span>
                      <span class="text-xs text-gray-500">Completado</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-center gap-5 px-6 py-4 sm:gap-8">
                <div class="text-center">
                  <p class="mb-1 text-xs text-gray-500 sm:text-sm">Total</p>
                  <p class="text-base font-semibold text-gray-800 sm:text-lg">
                    {{ dashboard()?.citas_hoy?.total ?? 0 }}
                  </p>
                </div>
                <div class="w-px bg-gray-200 h-7"></div>
                <div class="text-center">
                  <p class="mb-1 text-xs text-gray-500 sm:text-sm">Atendidas</p>
                  <p class="flex items-center justify-center gap-1 text-base font-semibold text-green-600 sm:text-lg">
                    {{ dashboard()?.citas_hoy?.atendidas ?? 0 }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </p>
                </div>
                <div class="w-px bg-gray-200 h-7"></div>
                <div class="text-center">
                  <p class="mb-1 text-xs text-gray-500 sm:text-sm">Pendientes</p>
                  <p class="flex items-center justify-center gap-1 text-base font-semibold text-yellow-600 sm:text-lg">
                    {{ dashboard()?.citas_hoy?.pendientes ?? 0 }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Citas de Hoy Table -->
          <div class="col-span-12">
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
              <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">
                    Citas de Hoy
                  </h3>
                </div>
                <div class="flex items-center gap-3">
                  <a
                    routerLink="/nurse/agenda"
                    class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                    Ver agenda completa
                  </a>
                </div>
              </div>

              <div class="max-w-full overflow-x-auto">
                @if (citasHoy().length === 0) {
                  <div class="py-12 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <p class="mt-4 text-sm text-gray-500">No hay citas programadas para hoy</p>
                    <a routerLink="/nurse/agenda" class="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary-600 hover:text-primary-700">
                      Programar cita
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    </a>
                  </div>
                } @else {
                  <table class="w-full text-left">
                    <thead class="border-y border-gray-100">
                      <tr>
                        <th class="py-3 text-xs font-medium text-gray-500">Paciente</th>
                        <th class="py-3 text-xs font-medium text-gray-500">Servicio</th>
                        <th class="py-3 text-xs font-medium text-gray-500">Hora</th>
                        <th class="py-3 text-xs font-medium text-gray-500">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (cita of citasHoy(); track cita.id) {
                        <tr class="hover:bg-gray-50 transition-colors">
                          <td class="py-3">
                            <div class="flex items-center gap-3">
                              <div
                                class="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium text-white"
                                [style.background-color]="cita.servicio_color || '#6366f1'"
                              >
                                {{ getInitials(cita.paciente_nombre) }}
                              </div>
                              <div>
                                <p class="text-sm font-medium text-gray-800">
                                  {{ cita.paciente_nombre }}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td class="py-3 text-sm text-gray-500">
                            {{ cita.servicio_nombre }}
                          </td>
                          <td class="py-3 text-sm text-gray-500">
                            {{ cita.hora_inicio }}
                          </td>
                          <td class="py-3">
                            <span
                              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                              [ngClass]="{
                                'bg-yellow-50 text-yellow-700': cita.estado === 'programada',
                                'bg-blue-50 text-blue-700': cita.estado === 'confirmada',
                                'bg-green-50 text-green-700': cita.estado === 'atendida',
                                'bg-red-50 text-red-700': cita.estado === 'cancelada' || cita.estado === 'no_asistio'
                              }"
                            >
                              {{ cita.estado_display || cita.estado }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private agendaService = inject(AgendaService);

  loading = signal(true);
  dashboard = signal<Dashboard | null>(null);
  citasHoy = signal<Cita[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.reportesService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
      }
    });

    this.agendaService.getCitasHoy().subscribe({
      next: (data) => {
        this.citasHoy.set(data.citas);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading citas:', err);
        this.loading.set(false);
      }
    });
  }

  getProgressPercentage(): number {
    const data = this.dashboard();
    if (!data?.citas_hoy?.total) return 0;
    return Math.round((data.citas_hoy.atendidas / data.citas_hoy.total) * 100);
  }

  getInitials(name: string | undefined): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
