import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-white">Detalle del Usuario</h1>
      <!-- TODO: Implement user detail -->
    </div>
  `
})
export class UserDetailComponent {}
