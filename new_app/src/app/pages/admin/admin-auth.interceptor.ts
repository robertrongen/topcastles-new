import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export const adminUnauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        req.url.startsWith('/api/admin/') &&
        auth.handleUnauthorized(err.status)
      ) {
        if (router.url.startsWith('/admin') && router.url !== '/admin/login') {
          void router.navigate(['/admin/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
