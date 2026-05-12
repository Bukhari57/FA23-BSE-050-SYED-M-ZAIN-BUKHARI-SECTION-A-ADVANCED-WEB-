import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth-page.component').then((m) => m.AuthPageComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: 'committees',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/committee-list-page.component').then((m) => m.CommitteeListPageComponent)
  },
  {
    path: 'committees/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/committee-create-page.component').then((m) => m.CommitteeCreatePageComponent)
  },
  {
    path: 'committees/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/committee-detail-page.component').then((m) => m.CommitteeDetailPageComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin-page.component').then((m) => m.AdminPageComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
