import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { HeaderComponent } from './header/header';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-nurse-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <!-- Page Wrapper - Same as TailAdmin -->
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Content Area -->
      <div class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <!-- Small Device Overlay -->
        @if (sidebarService.isMobileOpen$ | async) {
          <div
            class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
            (click)="sidebarService.setMobileOpen(false)"
          ></div>
        }

        <!-- Header -->
        <app-header />

        <!-- Main Content -->
        <main>
          <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NurseLayoutComponent {
  sidebarService = inject(SidebarService);
}
