import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageBreadcrumbComponent } from '../../components/admin-page-breadcrumb/admin-page-breadcrumb.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, AdminPageBreadcrumbComponent],
  template: `
    <div>
      <app-admin-page-breadcrumb pageTitle="Gestión de Usuarios" />
      <div class="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <p class="text-gray-400">Administra las enfermeras registradas en el sistema</p>
        <!-- TODO: Implement users management -->
      </div>
    </div>
  `
})
export class UsersComponent {}
