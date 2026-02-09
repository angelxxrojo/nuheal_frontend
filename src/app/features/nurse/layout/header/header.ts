import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarService } from '../../../../core/services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white">
      <div class="flex grow items-center justify-between px-4 py-4 shadow-sm md:px-6 2xl:px-10">
        <!-- Left Section -->
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Hamburger Toggle BTN (Desktop) -->
          <button
            (click)="sidebarService.toggleExpanded()"
            class="z-50 hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:flex"
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

          <!-- Hamburger Toggle BTN (Mobile) -->
          <button
            (click)="sidebarService.toggleMobileOpen()"
            class="z-50 flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24" fill="none">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3.25 6C3.25 5.586 3.586 5.25 4 5.25L20 5.25C20.414 5.25 20.75 5.586 20.75 6C20.75 6.414 20.414 6.75 20 6.75L4 6.75C3.586 6.75 3.25 6.414 3.25 6ZM3.25 18C3.25 17.586 3.586 17.25 4 17.25L20 17.25C20.414 17.25 20.75 17.586 20.75 18C20.75 18.414 20.414 18.75 20 18.75L4 18.75C3.586 18.75 3.25 18.414 3.25 18ZM4 11.25C3.586 11.25 3.25 11.586 3.25 12C3.25 12.414 3.586 12.75 4 12.75L12 12.75C12.414 12.75 12.75 12.414 12.75 12C12.75 11.586 12.414 11.25 12 11.25L4 11.25Z"
              />
            </svg>
          </button>

          <!-- Search Box -->
          <div class="hidden sm:block">
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2">
                <svg class="h-5 w-5 fill-gray-500" viewBox="0 0 20 20" fill="none">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.042 9.374C3.042 5.877 5.877 3.042 9.375 3.042C12.873 3.042 15.708 5.877 15.708 9.374C15.708 12.87 12.873 15.705 9.375 15.705C5.877 15.705 3.042 12.87 3.042 9.374ZM9.375 1.542C5.049 1.542 1.542 5.048 1.542 9.374C1.542 13.699 5.049 17.205 9.375 17.205C11.267 17.205 13.003 16.534 14.357 15.418L17.177 18.238C17.47 18.531 17.945 18.531 18.238 18.238C18.531 17.945 18.531 17.47 18.238 17.177L15.418 14.357C16.537 13.003 17.208 11.267 17.208 9.374C17.208 5.048 13.701 1.542 9.375 1.542Z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar pacientes..."
                class="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 xl:w-[300px]"
              />
            </div>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-3 2xl:gap-4">
          <!-- Notification Menu -->
          <div class="relative">
            <button
              (click)="toggleNotifications()"
              class="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              @if (notificationCount > 0) {
                <span class="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {{ notificationCount > 9 ? '9+' : notificationCount }}
                </span>
              }
              <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20" fill="none">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.75 2.292C10.75 1.878 10.414 1.542 10 1.542C9.586 1.542 9.25 1.878 9.25 2.292V2.836C6.083 3.207 3.625 5.9 3.625 9.167V14.459H3.333C2.919 14.459 2.583 14.795 2.583 15.209C2.583 15.623 2.919 15.959 3.333 15.959H4.375H15.625H16.667C17.081 15.959 17.417 15.623 17.417 15.209C17.417 14.795 17.081 14.459 16.667 14.459H16.375V9.167C16.375 5.9 13.917 3.207 10.75 2.836V2.292ZM14.875 14.459V9.167C14.875 6.475 12.692 4.292 10 4.292C7.308 4.292 5.125 6.475 5.125 9.167V14.459H14.875ZM8 17.708C8 18.123 8.336 18.458 8.75 18.458H11.25C11.664 18.458 12 18.123 12 17.708C12 17.294 11.664 16.958 11.25 16.958H8.75C8.336 16.958 8 17.294 8 17.708Z"
                />
              </svg>
            </button>

            <!-- Notifications Dropdown -->
            @if (notificationsOpen) {
              <div class="absolute right-0 mt-4 flex h-[400px] w-[300px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg sm:w-[350px]">
                <div class="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                  <h5 class="text-lg font-semibold text-gray-800">Notificaciones</h5>
                  <button (click)="notificationsOpen = false" class="text-gray-500 hover:text-gray-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <ul class="flex flex-1 flex-col gap-1 overflow-y-auto">
                  @for (notification of notifications; track notification.id) {
                    <li>
                      <a
                        href="#"
                        class="flex gap-3 rounded-lg p-3 hover:bg-gray-50"
                      >
                        <span class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                          </svg>
                        </span>
                        <span class="flex-1">
                          <span class="mb-1 block text-sm text-gray-600">
                            <span class="font-medium text-gray-800">{{ notification.title }}</span>
                          </span>
                          <span class="text-xs text-gray-400">{{ notification.time }}</span>
                        </span>
                      </a>
                    </li>
                  }
                </ul>

                <a
                  href="#"
                  class="mt-3 flex justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Ver todas
                </a>
              </div>
            }
          </div>

          <!-- User Dropdown -->
          <div class="relative">
            <button
              (click)="toggleDropdown()"
              class="flex items-center gap-3 text-gray-700 hover:text-gray-900"
            >
              <span class="h-10 w-10 overflow-hidden rounded-full">
                <span class="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-semibold text-gray-700">
                  {{ userInitials }}
                </span>
              </span>
              <span class="hidden text-left lg:block">
                <span class="block text-sm font-medium text-gray-800">{{ userName }}</span>
                <span class="block text-xs text-gray-500">{{ userRole }}</span>
              </span>
              <svg
                class="hidden h-4 w-4 text-gray-500 transition-transform duration-200 lg:block"
                [class.rotate-180]="dropdownOpen"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- User Dropdown Menu -->
            @if (dropdownOpen) {
              <div class="absolute right-0 mt-4 flex w-[240px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
                <div class="mb-3 border-b border-gray-100 pb-3">
                  <span class="block text-sm font-medium text-gray-700">{{ userName }}</span>
                  <span class="block text-xs text-gray-400">{{ userEmail }}</span>
                </div>

                <ul class="flex flex-col gap-1">
                  <li>
                    <a
                      routerLink="/nurse/configuracion"
                      class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      (click)="dropdownOpen = false"
                    >
                      <svg class="h-5 w-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Mi Perfil
                    </a>
                  </li>
                  <li>
                    <a
                      routerLink="/nurse/configuracion"
                      class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      (click)="dropdownOpen = false"
                    >
                      <svg class="h-5 w-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Configuracion
                    </a>
                  </li>
                </ul>

                <div class="mt-3 border-t border-gray-100 pt-3">
                  <button
                    (click)="logout()"
                    class="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Cerrar sesion
                  </button>
                </div>
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
  sidebarService = inject(SidebarService);

  dropdownOpen = false;
  notificationsOpen = false;
  notificationCount = 3;

  notifications = [
    { id: 1, title: 'Cita programada para hoy a las 10:00 AM', time: 'Hace 5 min' },
    { id: 2, title: 'Nuevo paciente registrado', time: 'Hace 15 min' },
    { id: 3, title: 'Recordatorio: Vacuna pendiente', time: 'Hace 1 hora' }
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.dropdownOpen = false;
      this.notificationsOpen = false;
    }
  }

  get userName(): string {
    const user = this.authService.currentUserValue;
    if (user?.usuario) {
      return `${user.usuario.first_name} ${user.usuario.last_name}`;
    }
    return 'Usuario';
  }

  get userEmail(): string {
    const user = this.authService.currentUserValue;
    return user?.usuario?.email || 'usuario@nuheal.com';
  }

  get userInitials(): string {
    const user = this.authService.currentUserValue;
    if (user?.usuario) {
      return `${user.usuario.first_name.charAt(0)}${user.usuario.last_name.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  get userRole(): string {
    return this.authService.userRole;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.notificationsOpen = false;
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.dropdownOpen = false;
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
