import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'hotels',
    loadComponent: () => import('./features/auth/pages/hotel-list/hotel-list.component').then(m => m.HotelListComponent)
  },
  {
    path: 'hotels/:id',
    loadComponent: () => import('./features/auth/pages/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent)
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./features/auth/pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/auth/pages/dashboard/dashboard.component').then(m => m.UserDashboardComponent),
    canActivate: [authGuard]
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
    path: 'admin/users',
    loadComponent: () => import('./features/admin/pages/users/users.component').then(m => m.AdminUsersComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'admin/bookings',
    loadComponent: () => import('./features/admin/pages/bookings/bookings.component').then(m => m.AdminBookingsComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./features/admin/pages/settings/settings.component').then(m => m.AdminSettingsComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'admin/reports',
    loadComponent: () => import('./features/admin/pages/reports/reports.component').then(m => m.AdminReportsComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'manager/dashboard',
    loadComponent: () => import('./features/manager/dashboard/dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard, roleGuard(['MANAGER'])]
  },
  {
    path: 'manager/hotel-info',
    loadComponent: () => import('./features/manager/pages/hotel-info/hotel-info.component').then(m => m.ManagerHotelInfoComponent),
    canActivate: [authGuard, roleGuard(['MANAGER'])]
  },
  {
    path: 'manager/rooms',
    loadComponent: () => import('./features/manager/pages/rooms/rooms.component').then(m => m.ManagerRoomsComponent),
    canActivate: [authGuard, roleGuard(['MANAGER'])]
  },
  {
    path: 'manager/bookings',
    loadComponent: () => import('./features/manager/pages/bookings/bookings.component').then(m => m.ManagerBookingsComponent),
    canActivate: [authGuard, roleGuard(['MANAGER'])]
  },
  {
    path: 'manager/availability',
    loadComponent: () => import('./features/manager/pages/availability/availability.component').then(m => m.ManagerAvailabilityComponent),
    canActivate: [authGuard, roleGuard(['MANAGER'])]
  },
  {
    path: 'manager/settings',
    loadComponent: () => import('./features/manager/pages/settings/settings.component').then(m => m.ManagerSettingsComponent),
    canActivate: [authGuard, roleGuard(['MANAGER'])]
  },
  {
    path: 'receptionist/dashboard',
    loadComponent: () => import('./features/receptionist/dashboard/dashboard.component').then(m => m.ReceptionistDashboardComponent),
    canActivate: [authGuard, roleGuard(['RECEPTIONIST'])]
  },
  {
    path: 'receptionist/bookings',
    loadComponent: () => import('./features/receptionist/pages/bookings/bookings.component').then(m => m.ReceptionistBookingsComponent),
    canActivate: [authGuard, roleGuard(['RECEPTIONIST'])]
  },
  {
    path: 'receptionist/hotel-info',
    loadComponent: () => import('./features/receptionist/pages/hotel-info/hotel-info.component').then(m => m.ReceptionistHotelInfoComponent),
    canActivate: [authGuard, roleGuard(['RECEPTIONIST'])]
  },
  {
    path: 'receptionist/settings',
    loadComponent: () => import('./features/receptionist/pages/settings/settings.component').then(m => m.ReceptionistSettingsComponent),
    canActivate: [authGuard, roleGuard(['RECEPTIONIST'])]
  }
];
