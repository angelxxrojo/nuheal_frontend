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
  children?: { label: string; route: string; isNew?: boolean }[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeHtmlPipe],
  template: `
    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden border-r border-gray-800 bg-gray-900 px-5 transition-all duration-300 ease-in-out lg:static"
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
        <a routerLink="/admin/dashboard">
          @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
            <span class="text-xl font-bold text-white">NuHeal Admin</span>
          } @else {
            <span class="text-xl font-bold text-white">NA</span>
          }
        </a>
      </div>

      <!-- Sidebar Content with scroll -->
      <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <!-- Sidebar Menu -->
        <nav class="mb-6">
          <div class="flex flex-col gap-4">
            <!-- Menu Group -->
            <div>
              <h3
                class="mb-4 text-xs uppercase flex leading-5 text-gray-500"
                [ngClass]="{
                  'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
                  'justify-start': (isExpanded$ | async) || (isHovered$ | async)
                }"
              >
                @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
                  <span>Menu</span>
                } @else {
                  <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <circle cx="6" cy="12" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="18" cy="12" r="1.5"/>
                  </svg>
                }
              </h3>

              <ul class="flex flex-col gap-1">
                @for (item of menuItems; track item.label; let itemIdx = $index) {
                  <li>
                    @if (item.children && item.children.length > 0) {
                      <!-- Menu Item with Dropdown -->
                      <button
                        (click)="toggleSubmenu(itemIdx)"
                        class="menu-item group relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-4 py-2 font-medium duration-300 ease-in-out"
                        [ngClass]="{
                          'bg-gray-800 text-white': openSubmenu === itemIdx,
                          'text-gray-400 hover:bg-gray-800 hover:text-white': openSubmenu !== itemIdx,
                          'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
                          'lg:justify-start': (isExpanded$ | async) || (isHovered$ | async)
                        }"
                      >
                        <span
                          class="menu-item-icon h-5 w-5 flex-shrink-0"
                          [ngClass]="{
                            'text-white': openSubmenu === itemIdx,
                            'text-gray-500': openSubmenu !== itemIdx
                          }"
                          [innerHTML]="item.icon | safeHtml"
                        ></span>

                        @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
                          <span class="menu-item-text flex-1 text-left">{{ item.label }}</span>

                          <svg
                            class="h-5 w-5 transition-transform duration-200"
                            [ngClass]="{ 'rotate-180 text-primary-500': openSubmenu === itemIdx }"
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
                        [id]="'admin-submenu-' + itemIdx"
                        [style.display]="((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) ? 'block' : 'none'"
                        [ngStyle]="{
                          height: openSubmenu === itemIdx
                            ? (subMenuHeights['admin-submenu-' + itemIdx] || 0) + 'px'
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
                                  'text-white font-semibold': isActive(child.route),
                                  'text-gray-500 hover:text-white': !isActive(child.route)
                                }"
                              >
                                {{ child.label }}
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
                          class="menu-item group relative flex items-center gap-2.5 rounded-lg px-4 py-2.5 font-medium duration-300 ease-in-out"
                          [ngClass]="{
                            'bg-primary-600 text-white': isActive(item.route),
                            'text-gray-400 hover:bg-gray-800 hover:text-white': !isActive(item.route),
                            'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
                            'lg:justify-start': (isExpanded$ | async) || (isHovered$ | async)
                          }"
                          (click)="onSubmenuClick()"
                        >
                          <span
                            class="menu-item-icon h-5 w-5 flex-shrink-0"
                            [innerHTML]="item.icon | safeHtml"
                          ></span>

                          @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
                            <span class="menu-item-text">{{ item.label }}</span>
                          }
                        </a>
                      }
                    }
                  </li>
                }
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <!-- Sidebar Footer - Back to Nurse Panel -->
      <div class="mt-auto border-t border-gray-800 pt-4 pb-6">
        <a
          routerLink="/nurse/dashboard"
          class="menu-item group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium text-gray-400 hover:bg-gray-800 hover:text-white duration-300 ease-in-out"
          [ngClass]="{
            'lg:justify-center': !((isExpanded$ | async) || (isHovered$ | async)),
            'lg:justify-start': (isExpanded$ | async) || (isHovered$ | async)
          }"
          (click)="onSubmenuClick()"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          @if ((isExpanded$ | async) || (isHovered$ | async) || (isMobileOpen$ | async)) {
            <span class="menu-item-text">Panel Enfermera</span>
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
export class AdminSidebarComponent implements OnInit, OnDestroy {
  openSubmenu: number | null = null;
  subMenuHeights: { [key: string]: number } = {};

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

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
      label: 'Analiticas',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
      route: '/admin/analytics'
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

  toggleSubmenu(itemIdx: number): void {
    const key = `admin-submenu-${itemIdx}`;

    if (this.openSubmenu === itemIdx) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = itemIdx;

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
    this.menuItems.forEach((item, itemIdx) => {
      if (item.children) {
        item.children.forEach(child => {
          if (currentUrl === child.route) {
            const key = `admin-submenu-${itemIdx}`;
            this.openSubmenu = itemIdx;

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
  }

  onSubmenuClick(): void {
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }
}
