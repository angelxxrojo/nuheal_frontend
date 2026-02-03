import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-white">Gestión de Planes</h1>
      <p class="mt-1 text-sm text-gray-400">Configura los planes y sus características</p>
      <!-- TODO: Implement plans management -->
    </div>
  `
})
export class PlansComponent {}
