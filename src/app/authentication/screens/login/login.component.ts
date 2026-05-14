import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLock,
  faLockOpen,
  faKey,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { SignWithGoogleComponent } from '../sign-with-google/sign-with-google.component';
import { NavigationService } from '../../../shared/services/navigation.service';
import { MultiLangService } from '../../../shared/services/multi-lang.service';
import { CurrentUser } from '../../../shared/shared-model/model';
import { AppConfigService } from '../../../shared/services/app-config.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    RouterLink,
    FontAwesomeModule,
    SignWithGoogleComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  appConfigService = inject(AppConfigService);
  authService = inject(AuthService);
  multiLangService = inject(MultiLangService);
  toastr = inject(ToastrService);
  router = inject(Router);
  formBuilder = inject(FormBuilder);
  navigationService = inject(NavigationService);
  loginForm!: FormGroup;
  submitted = false;
  isLoading: boolean = false;
  previousUrl: string = '';
  currentUrl: string = '';
  userIcon = faUser;
  kayIcon = faKey;
  eyeIcon = faLock;
  eyeSlashIcon = faLockOpen;
  passwordFieldType: string = 'password';
  password: string = '';
  isMain = signal<boolean>(false);
  isLogoWhite = signal<boolean>(false);

  constructor() {
    this.isMain.set(this.appConfigService.isMainDomain());

    let isWhite = this.appConfigService.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);

    this.currentUrl = this.router.url;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
  }
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email_phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
  onLogin() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.toastr.error('تأكد من إدخال البيانات');
      return;
    }
    this.isLoading = true;
    const loginData = { ...this.loginForm.value };
    if (loginData.email_phone) {
      loginData.email_phone = loginData.email_phone.replace(/\s/g, '');
    }
    if (loginData.password) {
      loginData.password = loginData.password.replace(/\s/g, '');
    }
    debugger;
    this.authService.loginUser(loginData).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          const user = result as CurrentUser;
          const roleDto = user.roleDto;
          if (roleDto.roleName === 'أدمن') {
            this.router.navigate(['/admin']);
          } else if (roleDto.roleName === 'المدير المالى') {
            this.router.navigateByUrl('/admin');
          } else if (roleDto.roleName === 'مشرف مدرسة') {
            this.router.navigateByUrl('/super');
          } else if (roleDto.roleName === 'ولي أمر') {
            this.router.navigateByUrl('/parent');
            window.location.reload();
          } else if (roleDto.roleName === 'محاسب المدرسة') {
            this.router.navigateByUrl('/school-accountant');
          } else if (roleDto.roleName === 'مدرس') {
            this.router.navigateByUrl('/instructor');
          } else if (roleDto.roleName === 'المدير المالى') {
            this.router.navigateByUrl('/manager-accountant');
          } else if (roleDto.roleName === 'أدمن المدرسة') {
            this.router.navigateByUrl('/school-admin');
          } else if (roleDto.roleName === 'أدمن الإختبارات') {
            this.router.navigateByUrl('/admin-exam');
          } else {
            const previousUrl = this.navigationService.getPreviousUrl();
            if (!user.userDto.email) {
              this.router.navigate(['/profile/settings']);
            } else {
              if (previousUrl) {
                this.router.navigateByUrl(previousUrl);
              } else {
                this.router.navigate(['/']);
              }
            }
          }
          this.isLoading = false;
          this.authService.setIsAuth(true);
        } else {
          this.isLoading = false;
          this.authService.setIsAuth(false);
          this.toastr.error(msg, '', { timeOut: 5000 });
        }
      },
      error: (err) => {
        this.toastr.error('حدث خطأً ما');
        this.isLoading = false;
      },
    });
  }
}
