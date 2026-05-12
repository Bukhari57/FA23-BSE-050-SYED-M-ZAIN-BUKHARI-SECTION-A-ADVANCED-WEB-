import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { LoginPayload, RegisterPayload, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly hydratedSignal = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly hydrated = this.hydratedSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.userSignal()));

  constructor(
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router,
  ) {}

  hydrate() {
    if (this.hydratedSignal()) {
      return;
    }

    if (!this.tokenStorage.accessToken) {
      this.hydratedSignal.set(true);
      return;
    }

    this.loadingSignal.set(true);
    this.authService
      .me()
      .pipe(
        tap((user) => this.userSignal.set(user)),
        catchError(() => {
          this.tokenStorage.clearTokens();
          this.userSignal.set(null);
          return of(null);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
          this.hydratedSignal.set(true);
        }),
      )
      .subscribe();
  }

  register(payload: RegisterPayload) {
    return this.authService.register(payload);
  }

  verifyEmail(token: string) {
    return this.authService.verifyEmail(token);
  }

  login(payload: LoginPayload) {
    this.loadingSignal.set(true);
    return this.authService.login(payload).pipe(
      tap(({ user, accessToken, refreshToken }) => {
        this.tokenStorage.setTokens(accessToken, refreshToken);
        this.userSignal.set(user);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  forgotPassword(email: string) {
    return this.authService.forgotPassword(email);
  }

  resetPassword(token: string, password: string) {
    return this.authService.resetPassword(token, password);
  }

  logout() {
    const refreshToken = this.tokenStorage.refreshToken;
    this.loadingSignal.set(true);

    if (!refreshToken) {
      this.tokenStorage.clearTokens();
      this.userSignal.set(null);
      this.loadingSignal.set(false);
      this.router.navigateByUrl('/auth');
      return;
    }

    this.authService
      .logout(refreshToken)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: () => {
          this.tokenStorage.clearTokens();
          this.userSignal.set(null);
          this.router.navigateByUrl('/auth');
        },
        error: () => {
          this.tokenStorage.clearTokens();
          this.userSignal.set(null);
          this.router.navigateByUrl('/auth');
        },
      });
  }
}
