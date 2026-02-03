import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './sidebar/sidebar';
import { AdminHeaderComponent } from './header/header';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-900">
      <!-- Sidebar -->
      <app-admin-sidebar
        [collapsed]="sidebarCollapsed()"
        [mobileOpen]="mobileSidebarOpen()"
        (toggleCollapse)="toggleSidebar()"
        (closeMobile)="closeMobileSidebar()"
      />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <app-admin-header
          (toggleMobileSidebar)="toggleMobileSidebar()"
        />

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
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
