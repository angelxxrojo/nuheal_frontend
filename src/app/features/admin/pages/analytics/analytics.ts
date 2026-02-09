import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageBreadcrumbComponent } from '../../components/admin-page-breadcrumb/admin-page-breadcrumb.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, AdminPageBreadcrumbComponent],
  template: `
    <div>
      <app-admin-page-breadcrumb pageTitle="Analíticas" />
      <div class="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <p class="text-gray-400">Métricas y estadísticas del sistema</p>
        <!-- TODO: Implement analytics dashboard -->
      </div>
    </div>
  `
})
export class AnalyticsComponent {}
