import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageBreadcrumbComponent } from '../../components/admin-page-breadcrumb/admin-page-breadcrumb.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, AdminPageBreadcrumbComponent],
  template: `
    <div>
      <app-admin-page-breadcrumb pageTitle="Gestión de Planes" />
      <div class="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <p class="text-gray-400">Configura los planes y sus características</p>
        <!-- TODO: Implement plans management -->
      </div>
    </div>
  `
})
export class PlansComponent {}
