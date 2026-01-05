import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const user = authService.getCurrentUser();

  if (token) {
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`
    };

    // Add user headers if user is authenticated
    if (user) {
      if (user.id) {
        headers['X-User-Id'] = user.id.toString();
      }
      if (user.role) {
        headers['X-User-Role'] = user.role;
      }
      if (user.email) {
        headers['X-User-Email'] = user.email;
      }
      if (user.username) {
        headers['X-User-Username'] = user.username;
      }
    }

    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid - logout user
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};

