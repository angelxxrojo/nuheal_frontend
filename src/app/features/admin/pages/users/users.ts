import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-white">Gestión de Usuarios</h1>
      <p class="mt-1 text-sm text-gray-400">Administra las enfermeras registradas en el sistema</p>
      <!-- TODO: Implement users management -->
    </div>
  `
})
export class UsersComponent {}
