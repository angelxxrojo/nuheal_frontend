import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile backdrop -->
    @if (mobileOpen()) {
      <div
        class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
        (click)="closeMobile.emit()"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      [class]="sidebarClasses()"
      class="fixed inset-y-0 left-0 z-30 flex flex-col bg-gray-950 transition-all duration-300 lg:relative lg:translate-x-0"
    >
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-4 bg-gray-900">
        <a routerLink="/admin/dashboard" class="flex items-center space-x-2">
          <span class="text-xl font-bold text-white">
            @if (!collapsed()) {
              NuHeal Admin
            } @else {
              NA
            }
          </span>
        </a>
        <button
          (click)="toggleCollapse.emit()"
          class="hidden lg:block text-gray-400 hover:text-white"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (collapsed()) {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            }
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-2">
          @for (item of menuItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-primary-600 text-white"
                class="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                [class.justify-center]="collapsed()"
                (click)="closeMobile.emit()"
              >
                <span [innerHTML]="item.icon" class="w-5 h-5 flex-shrink-0"></span>
                @if (!collapsed()) {
                  <span class="ml-3">{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Back to Nurse Panel -->
      <div class="border-t border-gray-800 p-4">
        <a
          routerLink="/nurse/dashboard"
          class="flex items-center text-gray-400 hover:text-white"
          [class.justify-center]="collapsed()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          @if (!collapsed()) {
            <span class="ml-3">Panel Enfermera</span>
          }
        </a>
      </div>
    </aside>
  `
})
export class AdminSidebarComponent {
  collapsed = input(false);
  mobileOpen = input(false);

  toggleCollapse = output<void>();
  closeMobile = output<void>();

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      route: '/admin/dashboard'
    },
    {
      label: 'Usuarios',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
      route: '/admin/users'
    },
    {
      label: 'Suscripciones',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
      route: '/admin/subscriptions'
    },
    {
      label: 'Planes',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      route: '/admin/plans'
    },
    {
      label: 'Analíticas',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
      route: '/admin/analytics'
    }
  ];

  sidebarClasses(): string {
    const base = this.collapsed() ? 'w-16' : 'w-64';
    const mobile = this.mobileOpen() ? 'translate-x-0' : '-translate-x-full';
    return `${base} ${mobile}`;
  }
}
