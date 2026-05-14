import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { confirmPasswordValidator } from '../../../shared/utils/confirmPasswordValidator';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEnvelope,
  faLock,
  faLockOpen,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { SignWithGoogleComponent } from '../sign-with-google/sign-with-google.component';
import { AppConfigService } from '../../../shared/services/app-config.service';
@Component({
  selector: 'app-parent-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    RouterLink,
    FontAwesomeModule,
    SignWithGoogleComponent,
  ],
  templateUrl: './parent-register.component.html',
  styleUrl: './parent-register.component.scss',
})
export class ParentRegisterComponent implements OnInit {
  appConfigService = inject(AppConfigService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  router = inject(Router);
  parentForm!: FormGroup;
  submitted = false;
  isLoading = signal<boolean>(false);
  userIcon = faUser;
  emailIcon = faEnvelope;
  phoneIcon = faPhone;
  eyeIcon = faLock;
  eyeSlashIcon = faLockOpen;
  passwordFieldType: string = 'password';
  password: string = '';
  isLogoWhite = signal<boolean>(false);

  constructor() {
    let isWhite = this.appConfigService.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);
  }
  ngOnInit(): void {
    this.parentForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: [''],
      },
      { validator: confirmPasswordValidator }
    );
  }
  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
  onRegister() {
    this.submitted = true;

    if (this.parentForm.invalid) {
      this.toastr.error('تأكد من إدخال البيانات');
      return;
    }
    this.isLoading.set(true);
    this.authService.registerParent(this.parentForm.value).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.router.navigate(['/login']);
        } else {
          this.toastr.error(msg);
          this.isLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
        this.toastr.error(err);
      },
    });
  }
}
