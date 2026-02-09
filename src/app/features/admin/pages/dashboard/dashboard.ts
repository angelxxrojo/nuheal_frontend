import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, SystemMetrics } from '../../services/admin.service';
import { AdminPageBreadcrumbComponent } from '../../components/admin-page-breadcrumb/admin-page-breadcrumb.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminPageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-admin-page-breadcrumb pageTitle="Dashboard Administrativo" />

      @if (loading()) {
        <div class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Total Usuarios -->
          <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-400 truncate">
                      Total Enfermeras
                    </dt>
                    <dd class="text-2xl font-semibold text-white">
                      {{ metrics()?.total_users ?? 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-900 px-5 py-3">
              <a routerLink="/admin/users" class="text-sm font-medium text-primary-400 hover:text-primary-300">
                Ver todos
              </a>
            </div>
          </div>

          <!-- Usuarios Activos -->
          <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-400 truncate">
                      Usuarios Activos
                    </dt>
                    <dd class="text-2xl font-semibold text-white">
                      {{ metrics()?.active_users ?? 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-900 px-5 py-3">
              <span class="text-sm text-gray-400">
                {{ getActivePercentage() }}% del total
              </span>
            </div>
          </div>

          <!-- Suscripciones Pagas -->
          <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-yellow-900 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-400 truncate">
                      Suscripciones Pagas
                    </dt>
                    <dd class="text-2xl font-semibold text-white">
                      {{ metrics()?.paid_subscriptions ?? 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-900 px-5 py-3">
              <a routerLink="/admin/subscriptions" class="text-sm font-medium text-primary-400 hover:text-primary-300">
                Ver suscripciones
              </a>
            </div>
          </div>

          <!-- Ingresos Mensuales -->
          <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-400 truncate">
                      MRR (Estimado)
                    </dt>
                    <dd class="text-2xl font-semibold text-white">
                      S/. {{ metrics()?.mrr ?? '0.00' }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-900 px-5 py-3">
              <a routerLink="/admin/analytics" class="text-sm font-medium text-primary-400 hover:text-primary-300">
                Ver analíticas
              </a>
            </div>
          </div>
        </div>

        <!-- Recent Users & Activity -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Recent Users -->
          <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-700">
              <h3 class="text-lg font-medium text-white">
                Usuarios Recientes
              </h3>
            </div>
            <div class="divide-y divide-gray-700">
              @if (!metrics()?.recent_users?.length) {
                <div class="px-4 py-8 text-center text-gray-400">
                  No hay usuarios recientes
                </div>
              } @else {
                @for (user of metrics()?.recent_users; track user.id) {
                  <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <span class="text-gray-300 font-medium">
                          {{ user.initials }}
                        </span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-white">
                          {{ user.name }}
                        </p>
                        <p class="text-sm text-gray-400">
                          {{ user.email }}
                        </p>
                      </div>
                    </div>
                    <span class="text-xs text-gray-500">
                      {{ user.created_at }}
                    </span>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Plans Distribution -->
          <div class="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-700">
              <h3 class="text-lg font-medium text-white">
                Distribución por Plan
              </h3>
            </div>
            <div class="p-6">
              @if (!metrics()?.plans_distribution?.length) {
                <div class="text-center text-gray-400">
                  No hay datos disponibles
                </div>
              } @else {
                <div class="space-y-4">
                  @for (plan of metrics()?.plans_distribution; track plan.name) {
                    <div>
                      <div class="flex items-center justify-between text-sm mb-1">
                        <span class="text-gray-300">{{ plan.name }}</span>
                        <span class="text-gray-400">{{ plan.count }} usuarios</span>
                      </div>
                      <div class="w-full bg-gray-700 rounded-full h-2">
                        <div
                          class="bg-primary-500 h-2 rounded-full"
                          [style.width.%]="plan.percentage"
                        ></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  metrics = signal<SystemMetrics | null>(null);

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading.set(true);

    this.adminService.getSystemMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading metrics:', err);
        this.loading.set(false);
      }
    });
  }

  getActivePercentage(): string {
    const m = this.metrics();
    if (!m || !m.total_users) return '0';
    return ((m.active_users / m.total_users) * 100).toFixed(1);
  }
}
