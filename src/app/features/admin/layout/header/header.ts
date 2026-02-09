import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarService } from '../../../../core/services/sidebar.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
      <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <!-- Left Section -->
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Hamburger Toggle BTN (Desktop) -->
          <button
            (click)="sidebarService.toggleExpanded()"
            class="z-50 hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white lg:flex"
          >
            <svg
              class="h-4 w-4 fill-current transition-transform duration-200"
              [class.rotate-180]="!(sidebarService.isExpanded$ | async)"
              viewBox="0 0 16 12"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.583 1C0.583 0.586 0.919 0.25 1.333 0.25H14.667C15.081 0.25 15.417 0.586 15.417 1C15.417 1.414 15.081 1.75 14.667 1.75L1.333 1.75C0.919 1.75 0.583 1.414 0.583 1ZM0.583 11C0.583 10.586 0.919 10.25 1.333 10.25L14.667 10.25C15.081 10.25 15.417 10.586 15.417 11C15.417 11.414 15.081 11.75 14.667 11.75L1.333 11.75C0.919 11.75 0.583 11.414 0.583 11ZM1.333 5.25C0.919 5.25 0.583 5.586 0.583 6C0.583 6.414 0.919 6.75 1.333 6.75L8 6.75C8.414 6.75 8.75 6.414 8.75 6C8.75 5.586 8.414 5.25 8 5.25L1.333 5.25Z"
              />
            </svg>
          </button>

          <!-- Mobile menu button -->
          <button
            (click)="sidebarService.toggleMobileOpen()"
            class="lg:hidden text-gray-400 hover:text-white focus:outline-none"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Title -->
          <h1 class="text-lg font-semibold text-white">Panel de Administracion</h1>
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
              <svg
                class="w-4 h-4 transition-transform duration-200"
                [class.rotate-180]="dropdownOpen"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (dropdownOpen) {
              <div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-700">
                <button
                  (click)="logout()"
                  class="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  Cerrar sesion
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
  sidebarService = inject(SidebarService);

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
