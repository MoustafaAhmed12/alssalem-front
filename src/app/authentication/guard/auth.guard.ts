import { inject } from '@angular/core';
import { CanActivateFn, Route, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
// to don't forwerd to any thing i went only if he logged in
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const toastr = inject(ToastrService);
  const router = inject(Router);
  if (!authService.isAuth()) {
    toastr.warning('برجاء تسجيل الدخول أولاً');
    router.navigate(['/login']);
  }
  return true;
};
// to don't back to /login or /register when logged in
export const authGuardLoggdIn: CanActivateFn = (route, state) => {
  const currentUser = JSON.parse(localStorage.getItem('CURRENT_USER') || '{}');
  const authService = inject(AuthService);
  const router = inject(Router);
  if (
    authService.isAuth() &&
    (currentUser.roleDto.roleName === 'أدمن' ||
      currentUser.roleDto.roleName === 'المدير المالى')
  ) {
    return router.navigate(['/admin']);
  }
  if (authService.isAuth() && currentUser.roleDto.roleName === 'ولي أمر') {
    return router.navigate(['/parent']);
  }
  if (authService.isAuth() && currentUser.roleDto.roleName === 'مدخل بيانات') {
    return router.navigate(['/instructor']);
  }
  if (
    authService.isAuth() &&
    currentUser.roleDto.roleName === 'أدمن الإختبارات'
  ) {
    return router.navigate(['/admin-exam']);
  }
  if (authService.isAuth() && currentUser.roleDto.roleName === 'مدرس') {
    return router.navigate(['/instructor']);
  }
  if (authService.isAuth() && currentUser.roleDto.roleName === 'مشرف مدرسة') {
    return router.navigate(['/super']);
  }
  if (authService.isAuth() && currentUser.roleDto.roleName === 'أدمن المدرسة') {
    return router.navigate(['/school-admin']);
  }

  if (
    authService.isAuth() &&
    currentUser.roleDto.roleName === 'محاسب المدرسة'
  ) {
    return router.navigate(['/school-accountant']);
  }
  if (authService.isAuth()) {
    return router.navigate(['/']);
  }
  return true;
};
