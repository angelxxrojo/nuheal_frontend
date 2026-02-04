import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: { label: string; route: string }[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Sidebar - Same structure as TailAdmin -->
    <aside
      [class]="sidebarClasses()"
      class="sidebar fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden border-r border-gray-200 bg-white px-5 duration-300 ease-linear lg:static lg:translate-x-0"
    >
      <!-- SIDEBAR HEADER -->
      <div
        class="flex items-center gap-2 pb-7 pt-8"
        [class.justify-center]="collapsed()"
        [class.justify-between]="!collapsed()"
      >
        <a routerLink="/nurse/dashboard">
          @if (!collapsed()) {
            <span class="text-2xl font-bold text-gray-900">NuHeal</span>
          } @else {
            <span class="text-2xl font-bold text-gray-900">N</span>
          }
        </a>
      </div>

      <!-- Sidebar Content with scroll -->
      <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <!-- Sidebar Menu -->
        <nav>
          @for (group of menuGroups; track group.title) {
            <!-- Menu Group -->
            <div>
              <h3 class="mb-4 text-xs uppercase leading-5 text-gray-400">
                @if (!collapsed()) {
                  <span class="menu-group-title">{{ group.title }}</span>
                } @else {
                  <svg class="mx-auto h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <circle cx="6" cy="12" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="18" cy="12" r="1.5"/>
                  </svg>
                }
              </h3>

              <ul class="mb-6 flex flex-col gap-4">
                @for (item of group.items; track item.label) {
                  <li>
                    @if (item.children && item.children.length > 0) {
                      <!-- Menu Item with Dropdown -->
                      <button
                        (click)="toggleSubmenu(item.label)"
                        class="menu-item group relative flex w-full items-center gap-2.5 rounded-lg px-4 py-2 font-medium text-gray-700 duration-300 ease-in-out hover:bg-gray-100"
                        [class.bg-gray-100]="isSubmenuOpen(item.label)"
                        [class.justify-center]="collapsed()"
                      >
                        <span [innerHTML]="item.icon" class="h-6 w-6 flex-shrink-0"></span>
                        @if (!collapsed()) {
                          <span class="menu-item-text flex-1 text-left">{{ item.label }}</span>
                          <svg
                            class="menu-item-arrow h-5 w-5 transition-transform duration-200"
                            [class.rotate-180]="isSubmenuOpen(item.label)"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        }
                      </button>

                      <!-- Dropdown Menu -->
                      @if (isSubmenuOpen(item.label) && !collapsed()) {
                        <div class="translate transform overflow-hidden">
                          <ul class="menu-dropdown mt-2 flex flex-col gap-1 pl-9">
                            @for (child of item.children; track child.route) {
                              <li>
                                <a
                                  [routerLink]="child.route"
                                  routerLinkActive="text-gray-900 font-semibold"
                                  class="menu-dropdown-item group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-500 duration-300 ease-in-out hover:text-gray-900"
                                  (click)="closeMobile.emit()"
                                >
                                  {{ child.label }}
                                </a>
                              </li>
                            }
                          </ul>
                        </div>
                      }
                    } @else {
                      <!-- Regular Menu Item -->
                      <a
                        [routerLink]="item.route"
                        routerLinkActive="bg-gray-100 text-gray-900 font-semibold"
                        [routerLinkActiveOptions]="{ exact: item.route === '/nurse/dashboard' }"
                        class="menu-item group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium text-gray-600 duration-300 ease-in-out hover:bg-gray-50 hover:text-gray-900"
                        [class.justify-center]="collapsed()"
                        (click)="closeMobile.emit()"
                      >
                        <span [innerHTML]="item.icon" class="h-6 w-6 flex-shrink-0"></span>
                        @if (!collapsed()) {
                          <span class="menu-item-text">{{ item.label }}</span>
                        }
                      </a>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </nav>
      </div>

      <!-- Sidebar Footer - Configuración -->
      <div class="mt-auto border-t border-gray-200 pt-4 pb-6">
        <a
          routerLink="/nurse/configuracion"
          routerLinkActive="bg-gray-100 text-gray-900 font-semibold"
          class="menu-item group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium text-gray-600 duration-300 ease-in-out hover:bg-gray-50 hover:text-gray-900"
          [class.justify-center]="collapsed()"
          (click)="closeMobile.emit()"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          @if (!collapsed()) {
            <span class="menu-item-text">Configuración</span>
          }
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class SidebarComponent {
  collapsed = input(false);
  mobileOpen = input(false);

  toggleCollapse = output<void>();
  closeMobile = output<void>();

  openSubmenus = signal<Set<string>>(new Set());

  menuGroups: MenuGroup[] = [
    {
      title: 'Menu',
      items: [
        {
          label: 'Dashboard',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
          route: '/nurse/dashboard'
        },
        {
          label: 'Pacientes',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
          route: '/nurse/pacientes'
        },
        {
          label: 'Agenda',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
          route: '/nurse/agenda'
        }
      ]
    },
    {
      title: 'Atención Clínica',
      items: [
        {
          label: 'CRED',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
          route: '/nurse/cred'
        },
        {
          label: 'Vacunas',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>',
          route: '/nurse/vacunas'
        },
        {
          label: 'Historia Clínica',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
          route: '/nurse/historia-clinica'
        }
      ]
    },
    {
      title: 'Gestión',
      items: [
        {
          label: 'Facturación',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
          route: '/nurse/facturacion'
        },
        {
          label: 'Reportes',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
          route: '/nurse/reportes'
        },
        {
          label: 'Documentos',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>',
          route: '/nurse/documentos'
        }
      ]
    }
  ];

  sidebarClasses(): string {
    // TailAdmin: w-[290px] when expanded, w-[90px] when collapsed
    const width = this.collapsed() ? 'w-[90px]' : 'w-[290px]';
    // In mobile: translate-x-0 when open, -translate-x-full when closed
    const mobile = this.mobileOpen() ? 'translate-x-0' : '-translate-x-full';
    return `${width} ${mobile}`;
  }

  toggleSubmenu(label: string): void {
    this.openSubmenus.update(set => {
      const newSet = new Set(set);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }

  isSubmenuOpen(label: string): boolean {
    return this.openSubmenus().has(label);
  }
}
