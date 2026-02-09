import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { combineLatest, Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  isNew?: boolean;
  children?: { label: string; route: string; isNew?: boolean; isPro?: boolean }[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeHtmlPipe],
  template: `
    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden border-r border-gray-200 bg-white px-5 transition-all duration-300 ease-in-out lg:static"
      [ngClass]="{
        'w-[290px]': (isExpanded$ | async) || (isMobileOpen$ | async) || (isHovered$ | async),
        'w-[90px]': !((isExpanded$ | async) || (isMobileOpen$ | async) || (isHovered$ | async)),
        'translate-x-0': (isMobileOpen$ | async),
        '-translate-x-full': !(isMobileOpen$ | async),
        'lg:translate-x-0': true
      }"
      (mouseenter)="onSidebarMouseEnter()"
      (mouseleave)="sidebarService.setHovered(false)"
    >
      <!-- SIDEBAR HEADER -->
      <div
        class="flex items-center gap-2 pb-7 pt-8"
        [ngClass]="{
          'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
          'justify-start': (isExpanded$ | async) || (isHovered$ | async)
        }"
      >
        <a routerLink="/nurse/dashboard">
          @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
            <span class="text-2xl font-bold text-gray-900">NuHeal</span>
          } @else {
            <span class="text-2xl font-bold text-gray-900">N</span>
          }
        </a>
      </div>

      <!-- Sidebar Content with scroll -->
      <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <!-- Sidebar Menu -->
        <nav class="mb-6">
          <div class="flex flex-col gap-4">
            @for (group of menuGroups; track group.title; let groupIdx = $index) {
              <!-- Menu Group -->
              <div>
                <h3
                  class="mb-4 text-xs uppercase flex leading-5 text-gray-400"
                  [ngClass]="{
                    'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
                    'justify-start': (isExpanded$ | async) || (isHovered$ | async)
                  }"
                >
                  @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
                    <span>{{ group.title }}</span>
                  } @else {
                    <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
                      <circle cx="6" cy="12" r="1.5"/>
                      <circle cx="12" cy="12" r="1.5"/>
                      <circle cx="18" cy="12" r="1.5"/>
                    </svg>
                  }
                </h3>

                <ul class="flex flex-col gap-1">
                  @for (item of group.items; track item.label; let itemIdx = $index) {
                    <li>
                      @if (item.children && item.children.length > 0) {
                        <!-- Menu Item with Dropdown -->
                        <button
                          (click)="toggleSubmenu(groupIdx, itemIdx)"
                          class="menu-item group relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-4 py-2 font-medium duration-300 ease-in-out"
                          [ngClass]="{
                            'menu-item-active': openSubmenu === groupIdx + '-' + itemIdx,
                            'menu-item-inactive text-gray-600 hover:bg-gray-50': openSubmenu !== groupIdx + '-' + itemIdx,
                            'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
                            'lg:justify-start': (isExpanded$ | async) || (isHovered$ | async)
                          }"
                        >
                          <span
                            class="menu-item-icon h-6 w-6 flex-shrink-0"
       
                            [innerHTML]="item.icon | safeHtml"
                          ></span>

                          @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
                            <span class="menu-item-text flex-1 text-left">{{ item.label }}</span>

                            @if (item.isNew) {
                              <span
                                class="ml-auto mr-2 rounded-full px-2 py-0.5 text-xs font-medium"
                                [ngClass]="{
                                  'bg-brand-100 text-brand-600': openSubmenu === groupIdx + '-' + itemIdx,
                                  'bg-gray-100 text-gray-600': openSubmenu !== groupIdx + '-' + itemIdx
                                }"
                              >
                                nuevo
                              </span>
                            }

                            <svg
                              class="h-5 w-5 transition-transform duration-200"
                              [ngClass]="{ 'rotate-180 text-brand-500': openSubmenu === groupIdx + '-' + itemIdx }"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          }
                        </button>

                        <!-- Dropdown Menu with animated height -->
                        <div
                          class="overflow-hidden transition-all duration-300"
                          [id]="'submenu-' + groupIdx + '-' + itemIdx"
                          [style.display]="((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) ? 'block' : 'none'"
                          [ngStyle]="{
                            height: openSubmenu === groupIdx + '-' + itemIdx
                              ? (subMenuHeights['submenu-' + groupIdx + '-' + itemIdx] || 0) + 'px'
                              : '0px'
                          }"
                        >
                          <ul class="menu-dropdown mt-2 flex flex-col gap-1 pl-9">
                            @for (child of item.children; track child.route) {
                              <li>
                                <a
                                  [routerLink]="child.route"
                                  (click)="onSubmenuClick()"
                                  class="menu-dropdown-item group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm duration-300 ease-in-out"
                                  [ngClass]="{
                                    'menu-dropdown-item-active text-gray-900 font-semibold': isActive(child.route),
                                    'menu-dropdown-item-inactive text-gray-500 hover:text-gray-900': !isActive(child.route)
                                  }"
                                >
                                  {{ child.label }}
                                  <span class="flex items-center gap-1 ml-auto">
                                    @if (child.isNew) {
                                      <span
                                        class="rounded-full px-2 py-0.5 text-xs font-medium"
                                        [ngClass]="{
                                          'bg-brand-100 text-brand-600': isActive(child.route),
                                          'bg-gray-100 text-gray-600': !isActive(child.route)
                                        }"
                                      >
                                        nuevo
                                      </span>
                                    }
                                    @if (child.isPro) {
                                      <span
                                        class="rounded-full px-2 py-0.5 text-xs font-medium"
                                        [ngClass]="{
                                          'bg-orange-100 text-orange-600': isActive(child.route),
                                          'bg-orange-50 text-orange-500': !isActive(child.route)
                                        }"
                                      >
                                        pro
                                      </span>
                                    }
                                  </span>
                                </a>
                              </li>
                            }
                          </ul>
                        </div>
                      } @else {
                        <!-- Regular Menu Item -->
                        @if (item.route) {
                          <a
                            [routerLink]="item.route"
                            class="menu-item group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium duration-300 ease-in-out"
                            [ngClass]="{
                              'menu-item-active': isActive(item.route),
                              'menu-item-inactive text-gray-600 hover:bg-gray-50': !isActive(item.route),
                              'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
                              'lg:justify-start': (isExpanded$ | async) || (isHovered$ | async)
                            }"
                            (click)="onSubmenuClick()"
                          >
                            <span
                              class=" menu-item-icon-size"
                              [ngClass]="{
                                'menu-item-icon-active ease-in-out': isActive(item.route),
                                'text-gray-500': !isActive(item.route)
                              }"
                              
                              [innerHTML]="item.icon | safeHtml"
                            ></span>

                            @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
                              <span class="menu-item-text">{{ item.label }}</span>
                              @if (item.isNew) {
                                <span
                                  class="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                                  [ngClass]="{
                                    'bg-brand-100 text-brand-600': isActive(item.route),
                                    'bg-gray-100 text-gray-600': !isActive(item.route)
                                  }"
                                >
                                  nuevo
                                </span>
                              }
                            }
                          </a>
                        }
                      }
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </nav>
      </div>

      <!-- Sidebar Footer - Configuracion -->
      <div class="mt-auto border-t border-gray-200 pt-4 pb-6">
        <a
          routerLink="/nurse/configuracion"
          class="menu-item group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium duration-300 ease-in-out"
          [ngClass]="{
            'menu-item-active': isActive('/nurse/configuracion'),
            'menu-item-inactive text-gray-600 hover:bg-gray-50': !isActive('/nurse/configuracion'),
            'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
            'lg:justify-start': (isExpanded$ | async) || (isHovered$ | async)
          }"
          (click)="onSubmenuClick()"
        >
          <svg
            class="h-6 w-6 flex-shrink-0"
            [ngClass]="{
              'text-gray-900': isActive('/nurse/configuracion'),
              'text-gray-500': !isActive('/nurse/configuracion')
            }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
            <span class="menu-item-text">Configuracion</span>
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
export class SidebarComponent implements OnInit, OnDestroy {
  openSubmenu: string | null = null;
  subMenuHeights: { [key: string]: number } = {};

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

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
        },
        {
          label: 'Servicios',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
          route: '/nurse/servicios'
        }
      ]
    },
    {
      title: 'Atencion Clinica',
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
          label: 'Historia Clinica',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
          route: '/nurse/historia-clinica'
        }
      ]
    },
    {
      title: 'Gestion',
      items: [
        {
          label: 'Facturacion',
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

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            this.cdr.detectChanges();
          }
        }
      )
    );

    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleSubmenu(groupIdx: number, itemIdx: number): void {
    const key = `submenu-${groupIdx}-${itemIdx}`;

    if (this.openSubmenu === `${groupIdx}-${itemIdx}`) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = `${groupIdx}-${itemIdx}`;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSidebarMouseEnter(): void {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string): void {
    this.menuGroups.forEach((group, groupIdx) => {
      group.items.forEach((item, itemIdx) => {
        if (item.children) {
          item.children.forEach(child => {
            if (currentUrl === child.route) {
              const key = `submenu-${groupIdx}-${itemIdx}`;
              this.openSubmenu = `${groupIdx}-${itemIdx}`;

              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges();
                }
              });
            }
          });
        }
      });
    });
  }

  onSubmenuClick(): void {
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }
}
