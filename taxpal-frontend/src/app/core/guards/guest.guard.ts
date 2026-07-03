import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isSessionChecked()) {
    if (auth.isLoggedIn()) {
      return router.createUrlTree(['/dashboard']);
    }
    return true;
  }

  return auth.validateToken().pipe(
    map((isValid) => (isValid ? router.createUrlTree(['/dashboard']) : true))
  );
};
