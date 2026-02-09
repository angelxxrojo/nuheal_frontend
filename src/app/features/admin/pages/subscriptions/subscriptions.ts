import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageBreadcrumbComponent } from '../../components/admin-page-breadcrumb/admin-page-breadcrumb.component';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, AdminPageBreadcrumbComponent],
  template: `
    <div>
      <app-admin-page-breadcrumb pageTitle="Suscripciones" />
      <div class="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <p class="text-gray-400">Gestiona las suscripciones de los usuarios</p>
        <!-- TODO: Implement subscriptions management -->
      </div>
    </div>
  `
})
export class SubscriptionsComponent {}
