import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './sidebar/sidebar';
import { AdminHeaderComponent } from './header/header';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-900 overflow-hidden">
      <!-- Sidebar -->
      <app-admin-sidebar />

      <!-- Content Area -->
      <div class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <!-- Small Device Overlay -->
        @if (sidebarService.isMobileOpen$ | async) {
          <div
            class="fixed inset-0 z-40 bg-black/50 lg:hidden"
            (click)="sidebarService.setMobileOpen(false)"
          ></div>
        }

        <!-- Header -->
        <app-admin-header />

        <!-- Page Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  sidebarService = inject(SidebarService);
}
