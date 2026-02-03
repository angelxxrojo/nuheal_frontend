import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-white">Analíticas</h1>
      <p class="mt-1 text-sm text-gray-400">Métricas y estadísticas del sistema</p>
      <!-- TODO: Implement analytics dashboard -->
    </div>
  `
})
export class AnalyticsComponent {}
