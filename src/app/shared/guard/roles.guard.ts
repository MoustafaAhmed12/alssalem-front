import { inject } from '@angular/core';
import { CanActivateFn, Route, Router } from '@angular/router';
import { AuthService } from '../../authentication/services/auth.service';
export const rolesGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const { roleDto } = JSON.parse(localStorage.getItem('CURRENT_USER') || '{}');
  const { routeConfig } = route;
  const authService = inject(AuthService);
  /// اللي رايحله
  const { path } = routeConfig as Route;
  if (path === '' && !authService.isAuth()) {
    return true;
  }
  if (path === '' && roleDto.roleName === 'طالب') {
    return true;
  }
  if (path === 'admin' && roleDto.roleName === 'أدمن') {
    return true;
  }
  if (path === 'admin-exam' && roleDto.roleName === 'أدمن الإختبارات') {
    return true;
  }
  if (
    (path === 'super' ||
      path === 'roadmaps' ||
      path === 'roadmaps/create') &&
    roleDto.roleName === 'مشرف مدرسة'
  ) {
    return true;
  }
  if (path === 'school-accountant' && roleDto.roleName === 'محاسب المدرسة') {
    return true;
  }
  if (path === 'parent' && roleDto.roleName === 'ولي أمر') {
    return true;
  }
  if (path === 'instructor' && roleDto.roleName === 'مدرس') {
    return true;
  }
  if (path === 'school-admin' && roleDto.roleName === 'أدمن المدرسة') {
    return true;
  }
  if (path === 'manager-accountant' && roleDto.roleName === 'المدير المالى') {
    return true;
  }
  router.navigateByUrl(
    roleDto.roleName === 'أدمن'
      ? '/admin'
      : roleDto.roleName === 'أدمن الإختبارات'
        ? '/admin-exam'
        : roleDto.roleName === 'ولي أمر'
          ? '/parent'
          : roleDto.roleName === 'مشرف مدرسة'
            ? '/super'
            : roleDto.roleName === 'محاسب المدرسة'
              ? '/school-accountant'
              : roleDto.roleName === 'مدرس'
                ? '/instructor'
                : roleDto.roleName === 'أدمن المدرسة'
                  ? '/school-admin'
                  : roleDto.roleName === 'المدير المالى'
                    ? '/manager-accountant'
                    : roleDto.roleName === 'طالب'
                      ? ''
                      : '/',
  );
  return false;
};
