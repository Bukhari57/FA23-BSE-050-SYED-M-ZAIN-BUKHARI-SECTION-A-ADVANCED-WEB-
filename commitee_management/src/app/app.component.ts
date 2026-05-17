import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Event as RouterEvent } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  template: `
    <main class="shell">
      <header class="topbar">
        <a class="brand" routerLink="/dashboard">
          <span class="brand-mark">C</span>
          <span>Committee Manager</span>
        </a>
        <nav class="nav" *ngIf="auth.user$ | async as user; else guest">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/committees" routerLinkActive="active">Committees</a>
          <a routerLink="/committees/new" routerLinkActive="active">Create</a>
          <a routerLink="/admin" routerLinkActive="active" *ngIf="(auth.profile$ | async)?.is_admin">Admin</a>
          <button class="link-button" type="button" (click)="logout()">Logout</button>
        </nav>
        <ng-template #guest>
          <nav class="nav">
            <a routerLink="/auth">Login</a>
          </nav>
        </ng-template>
      </header>
      <router-outlet />
    </main>
  `
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  navigating = false;

  constructor() {
    this.router.events.subscribe((e: RouterEvent) => {
      if (e instanceof NavigationStart) this.navigating = true;
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) this.navigating = false;
    });
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/auth');
  }
}
