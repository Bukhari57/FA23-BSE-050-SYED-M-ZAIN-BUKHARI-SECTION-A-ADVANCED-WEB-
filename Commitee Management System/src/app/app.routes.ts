import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { LandingComponent } from './features/landing/landing.component';
import { AdminPageComponent } from './features/admin/admin-page.component';
import { CommitteesPageComponent } from './features/committees/committees-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { MembersPageComponent } from './features/members/members-page.component';
import { NotificationsPageComponent } from './features/notifications/notifications-page.component';
import { PaymentsPageComponent } from './features/payments/payments-page.component';
import { ReportsPageComponent } from './features/reports/reports-page.component';
import { SettingsPageComponent } from './features/settings/settings-page.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'auth',
    component: AuthPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'committees', component: CommitteesPageComponent },
      { path: 'members', component: MembersPageComponent },
      { path: 'payments', component: PaymentsPageComponent },
      { path: 'reports', component: ReportsPageComponent },
      { path: 'notifications', component: NotificationsPageComponent },
      { path: 'settings', component: SettingsPageComponent },
      {
        path: 'admin',
        component: AdminPageComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'super_admin'] },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
