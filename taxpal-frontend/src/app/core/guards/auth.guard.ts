import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isSessionChecked()) {
    if (auth.isLoggedIn()) {
      return true;
    }
    return router.createUrlTree(['/login']);
  }

  return auth.validateToken().pipe(
    map((isValid) => (isValid ? true : router.createUrlTree(['/login'])))
  );
};
