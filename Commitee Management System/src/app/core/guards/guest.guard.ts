import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';
import { TokenStorageService } from '../services/token-storage.service';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  authStore.hydrate();

  if (!authStore.isAuthenticated() && !tokenStorage.accessToken) {
    return true;
  }

  router.navigateByUrl('/app/dashboard');
  return false;
};
