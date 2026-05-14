import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // استثناءات (بدون توكن)
  if (
    req.url.includes('/api/Authentication/Login') ||
    req.url.includes('/api/Parent/RegisterParent') ||
    req.url.includes('/create-subdomain.php') ||
    req.url.includes('/get-data-all.php') ||
    req.url.includes('/set-data.php') ||
    req.url.includes('/get-data.php') ||
    req.url.includes('/api/PartnerUsers/sso/userInfo') ||
    req.url.includes('googleapis.com')
  ) {
    return next(req);
  }

  const authService = inject(AuthService);
  const toastr = inject(ToastrService);
  const JWT_TOKEN = authService.getToken();

  const clonedReq = req.clone({
    setHeaders: {
      Authorization: JWT_TOKEN ? `Bearer ${JWT_TOKEN}` : '',
    },
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        toastr.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.', '', {
          timeOut: 20000,
        });
      } else if (error.status === 403) {
        toastr.error('غير مصرح لك بالوصول إلى هذه الصفحة.', '', {
          timeOut: 20000,
        });
      }
      return throwError(() => error);
    }),
  );
};
