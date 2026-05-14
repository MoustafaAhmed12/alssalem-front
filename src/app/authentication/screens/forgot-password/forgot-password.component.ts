import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { AppConfigService } from '../../../shared/services/app-config.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  appConfigService = inject(AppConfigService);
  auth = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);
  currentStep = signal(1);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isLogoWhite = signal<boolean>(false);
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  constructor() {
    let isWhite = this.appConfigService.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);
  }

  sendOTP() {
    this.errorMessage.set('');

    if (!this.email || !this.email.includes('@')) {
      this.errorMessage.set('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }
    this.loading.set(true);
    this.auth.sendConfirmationEmail(this.email).subscribe({
      next: (res) => {
        if (res === true) {
          this.loading.set(false);
          this.currentStep.set(2);
        } else {
          console.log('first');
        }
      },
    });
  }

  verifyOTP() {
    this.errorMessage.set('');

    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage.set('الرجاء إدخال رمز مكون من 6 أرقام');
      return;
    }

    this.loading.set(true);

    this.auth.checkEmailConfirmOtp(this.email, this.otp).subscribe({
      next: ({ statusCode }) => {
        if (statusCode === 200) {
          this.toastr.success('رقم التحقق صحيح');
          this.currentStep.set(3);
        } else {
          this.toastr.error('رقم التحقق غير صحيح');
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toastr.error('حدث خطأً ما');
      },
    });
  }

  resetPassword() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage.set('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('كلمات المرور غير متطابقة');
      return;
    }

    this.loading.set(true);

    const data = {
      email: this.email,
      otp: this.otp,
      password: this.newPassword,
    };
    this.auth.forgetPassword(data).subscribe({
      next: (res) => {
        if (res) {
          this.toastr.success(
            'تم تغيير كلمة المرور بنجاح! سيتم تحويلك لصفحة تسجيل الدخول...'
          );
          setTimeout(() => {
            console.log('إعادة التوجيه لصفحة تسجيل الدخول');
            this.router.navigate(['/login']);
            // window.location.href = '/login';
          }, 2000);
          this.currentStep.set(3);
        } else {
          this.toastr.error('حدث خطأً');
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toastr.error('حدث خطأً ما');
      },
    });

    // // محاكاة تغيير كلمة المرور
    // setTimeout(() => {
    //   this.loading.set(false);
    //   this.successMessage.set(
    //     'تم تغيير كلمة المرور بنجاح! سيتم تحويلك لصفحة تسجيل الدخول...'
    //   );

    //   // إعادة توجيه بعد 2 ثانية
    //   setTimeout(() => {
    //     console.log('إعادة التوجيه لصفحة تسجيل الدخول');
    //     // window.location.href = '/login';
    //   }, 2000);
    // }, 1500);
  }

  resendOTP() {
    this.errorMessage.set('');
    console.log('إعادة إرسال OTP');
    // محاكاة إعادة الإرسال
    alert('تم إعادة إرسال رمز التحقق!');
  }

  goBack() {
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => step - 1);
      this.errorMessage.set('');
    }
  }
}
