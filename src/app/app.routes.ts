import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'admin/hotels',
    loadComponent: () => import('./features/admin/pages/hotels/hotels.component').then(m => m.AdminHotelsComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'manager/dashboard',
    loadComponent: () => import('./features/manager/dashboard/dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard, roleGuard(['MANAGER'])]
  },
  {
    path: 'receptionist/dashboard',
    loadComponent: () => import('./features/receptionist/dashboard/dashboard.component').then(m => m.ReceptionistDashboardComponent),
    canActivate: [authGuard, roleGuard(['RECEPTIONIST'])]
  }
];
