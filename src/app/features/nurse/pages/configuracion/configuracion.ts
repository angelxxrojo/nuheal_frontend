import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Configuración</h1>
      <p class="mt-1 text-sm text-gray-500">Perfil, plan y configuración del consultorio</p>
      <!-- TODO: Implement settings -->
    </div>
  `
})
export class ConfiguracionComponent {}
