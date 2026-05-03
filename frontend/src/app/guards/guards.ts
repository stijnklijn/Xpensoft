import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const dashboardGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (localStorage.getItem('jwt')) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (!localStorage.getItem('jwt')) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
