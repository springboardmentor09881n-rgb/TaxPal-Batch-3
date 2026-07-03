import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export function provideAuthInitializer() {
  return provideAppInitializer(() => {
    const auth = inject(AuthService);
    return firstValueFrom(auth.validateToken());
  });
}
