import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

export default [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./layout/admin-layout').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/users/user-detail').then(m => m.UserDetailComponent)
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./pages/subscriptions/subscriptions').then(m => m.SubscriptionsComponent)
      },
      {
        path: 'plans',
        loadComponent: () => import('./pages/plans/plans').then(m => m.PlansComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics').then(m => m.AnalyticsComponent)
      }
    ]
  }
] as Routes;
