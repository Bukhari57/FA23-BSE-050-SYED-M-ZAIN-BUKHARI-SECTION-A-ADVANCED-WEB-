import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.currentUser();

  if (!user) {
    return router.createUrlTree(['/auth']);
  }

  const profile = await auth.ensureProfile();
  if (profile?.is_banned) {
    await auth.logout();
    return router.createUrlTree(['/auth'], { queryParams: { banned: 'true' } });
  }

  return true;
};
