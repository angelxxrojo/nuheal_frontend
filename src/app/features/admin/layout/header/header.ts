import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-gray-900 border-b border-gray-800">
      <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <!-- Mobile menu button -->
        <button
          (click)="toggleMobileSidebar.emit()"
          class="lg:hidden text-gray-400 hover:text-white focus:outline-none"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Title -->
        <div class="flex-1">
          <h1 class="text-lg font-semibold text-white">Panel de Administración</h1>
        </div>

        <!-- Right section -->
        <div class="flex items-center space-x-4">
          <!-- User dropdown -->
          <div class="relative">
            <button
              (click)="toggleDropdown()"
              class="flex items-center space-x-3 text-gray-300 hover:text-white"
            >
              <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span class="text-white font-medium text-sm">
                  {{ userInitials }}
                </span>
              </div>
              <span class="hidden md:block text-sm font-medium">
                Admin
              </span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (dropdownOpen) {
              <div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-700">
                <button
                  (click)="logout()"
                  class="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
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
export class AdminHeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  toggleMobileSidebar = output<void>();

  dropdownOpen = false;

  get userInitials(): string {
    const user = this.authService.currentUserValue;
    if (user?.usuario) {
      return `${user.usuario.first_name.charAt(0)}${user.usuario.last_name.charAt(0)}`.toUpperCase();
    }
    return 'A';
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
