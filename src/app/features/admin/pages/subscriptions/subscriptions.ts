import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-white">Suscripciones</h1>
      <p class="mt-1 text-sm text-gray-400">Gestiona las suscripciones de los usuarios</p>
      <!-- TODO: Implement subscriptions management -->
    </div>
  `
})
export class SubscriptionsComponent {}
