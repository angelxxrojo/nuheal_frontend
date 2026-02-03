import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <!-- Mobile menu button -->
        <button
          (click)="toggleMobileSidebar.emit()"
          class="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Search (optional) -->
        <div class="hidden sm:block flex-1 max-w-md mx-4">
          <div class="relative">
            <input
              type="text"
              placeholder="Buscar pacientes..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button class="relative text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <!-- User dropdown -->
          <div class="relative">
            <button
              (click)="toggleDropdown()"
              class="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
            >
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-medium text-sm">
                  {{ userInitials }}
                </span>
              </div>
              <span class="hidden md:block text-sm font-medium">
                {{ userName }}
              </span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (dropdownOpen) {
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                <a
                  routerLink="/nurse/configuracion"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  (click)="dropdownOpen = false"
                >
                  Mi Perfil
                </a>
                <a
                  routerLink="/nurse/configuracion"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  (click)="dropdownOpen = false"
                >
                  Configuración
                </a>
                <hr class="my-1 border-gray-200">
                <button
                  (click)="logout()"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  toggleMobileSidebar = output<void>();

  dropdownOpen = false;

  get userName(): string {
    const user = this.authService.currentUserValue;
    if (user?.usuario) {
      return `${user.usuario.first_name} ${user.usuario.last_name}`;
    }
    return 'Usuario';
  }

  get userInitials(): string {
    const user = this.authService.currentUserValue;
    if (user?.usuario) {
      return `${user.usuario.first_name.charAt(0)}${user.usuario.last_name.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
