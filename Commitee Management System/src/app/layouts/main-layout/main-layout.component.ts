import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthStore } from '../../core/state/auth.store';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly themeService = inject(ThemeService);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileMenuOpen = signal(false);

  protected readonly navItems = computed(() => {
    const role = this.authStore.user()?.role;
    const baseItems = [
      { label: 'Dashboard', icon: 'dashboard', path: '/app/dashboard' },
      { label: 'Committees', icon: 'groups', path: '/app/committees' },
      { label: 'Members', icon: 'badge', path: '/app/members' },
      { label: 'Payments', icon: 'payments', path: '/app/payments' },
      { label: 'Reports', icon: 'analytics', path: '/app/reports' },
      { label: 'Notifications', icon: 'notifications', path: '/app/notifications' },
      { label: 'Settings', icon: 'settings', path: '/app/settings' },
    ];

    if (role === 'admin' || role === 'super_admin') {
      baseItems.splice(5, 0, { label: 'Admin Panel', icon: 'shield', path: '/app/admin' });
    }

    return baseItems;
  });

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((state) => !state);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((state) => !state);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected logout() {
    this.authStore.logout();
  }
}
