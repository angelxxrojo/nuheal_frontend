import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Default redirect to auth
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
  },

  // Nurse dashboard (protected)
  {
    path: 'nurse',
    loadChildren: () => import('./features/nurse/nurse.routes'),
    canActivate: [authGuard]
  },

  // Admin panel (protected + admin role)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes'),
    canActivate: [authGuard, adminGuard]
  },

  // Wildcard redirect to auth
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
