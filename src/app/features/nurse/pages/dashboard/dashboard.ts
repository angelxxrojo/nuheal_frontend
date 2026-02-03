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
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">
          Resumen de tu consultorio
        </p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Total Pacientes -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Pacientes
                    </dt>
                    <dd class="text-2xl font-semibold text-gray-900">
                      {{ dashboard()?.total_pacientes ?? 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <a routerLink="/nurse/pacientes" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                Ver todos
              </a>
            </div>
          </div>

          <!-- Citas Hoy -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Citas Hoy
                    </dt>
                    <dd class="text-2xl font-semibold text-gray-900">
                      {{ dashboard()?.citas_hoy?.total ?? 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <span class="text-sm text-gray-500">
                {{ dashboard()?.citas_hoy?.atendidas ?? 0 }} atendidas, {{ dashboard()?.citas_hoy?.pendientes ?? 0 }} pendientes
              </span>
            </div>
          </div>

          <!-- Alertas Nutricionales -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Alertas Nutricionales
                    </dt>
                    <dd class="text-2xl font-semibold text-gray-900">
                      {{ dashboard()?.alertas_nutricionales ?? 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <a routerLink="/nurse/cred" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                Ver alertas
              </a>
            </div>
          </div>

          <!-- Vacunas Pendientes -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Vacunas Pendientes
                    </dt>
                    <dd class="text-2xl font-semibold text-gray-900">
                      {{ dashboard()?.pacientes_vacunas_pendientes ?? 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <a routerLink="/nurse/vacunas" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                Ver pacientes
              </a>
            </div>
          </div>
        </div>

        <!-- Citas de Hoy -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                Citas de Hoy
              </h3>
              <a routerLink="/nurse/agenda" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                Ver agenda completa
              </a>
            </div>
          </div>
          <div class="divide-y divide-gray-200">
            @if (citasHoy().length === 0) {
              <div class="px-4 py-12 text-center text-gray-500">
                No hay citas programadas para hoy
              </div>
            } @else {
              @for (cita of citasHoy(); track cita.id) {
                <div class="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                  <div class="flex items-center space-x-4">
                    <div
                      class="w-2 h-10 rounded-full"
                      [style.background-color]="cita.servicio_color || '#6366f1'"
                    ></div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {{ cita.paciente_nombre }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ cita.servicio_nombre }} - {{ cita.hora_inicio }}
                      </p>
                    </div>
                  </div>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': cita.estado === 'programada',
                      'bg-blue-100 text-blue-800': cita.estado === 'confirmada',
                      'bg-green-100 text-green-800': cita.estado === 'atendida',
                      'bg-red-100 text-red-800': cita.estado === 'cancelada' || cita.estado === 'no_asistio'
                    }"
                  >
                    {{ cita.estado_display || cita.estado }}
                  </span>
                </div>
              }
            }
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
}
