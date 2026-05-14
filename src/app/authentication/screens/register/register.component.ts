import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { confirmPasswordValidator } from '../../../shared/utils/confirmPasswordValidator';
import { SchoolService } from '../../../pages/dashboard/services/school.service';
import { ID_Name } from '../../../pages/dashboard/model/admin-model';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEnvelope,
  faLock,
  faLockOpen,
  faKey,
  faUser,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { SignWithGoogleComponent } from '../sign-with-google/sign-with-google.component';
import { AppConfigService } from '../../../shared/services/app-config.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    RouterLink,
    NgSelectModule,
    FontAwesomeModule,
    SignWithGoogleComponent,
    FormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  appConfigService = inject(AppConfigService);
  authService = inject(AuthService);
  schoolService = inject(SchoolService);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  router = inject(Router);
  allSchools: ID_Name[] = [];
  registerForm!: FormGroup;
  submitted = false;
  isLoading = signal<boolean>(false);
  isResend = signal<boolean>(false);
  isSchoolSelected = signal<boolean>(false);
  email = signal<string>('');
  otp!: number;
  classNumbers: { id: number; name: string }[] = [
    {
      id: 1,
      name: '1',
    },
    {
      id: 2,
      name: '2',
    },
    {
      id: 3,
      name: '3',
    },
    {
      id: 4,
      name: '4',
    },
    {
      id: 5,
      name: '5',
    },
    {
      id: 6,
      name: '6',
    },
    {
      id: 7,
      name: '7',
    },
    {
      id: 8,
      name: '8',
    },
    {
      id: 9,
      name: '9',
    },
    {
      id: 10,
      name: '10',
    },
  ];
  tabs: number[] = [1, 2];
  activeTab = signal<number>(1);
  userIcon = faUser;
  emailIcon = faEnvelope;
  kayIcon = faKey;
  eyeIcon = faLock;
  eyeSlashIcon = faLockOpen;
  phoneIcon = faPhone;
  passwordFieldType: string = 'password';
  password: string = '';
  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: [''],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]+$/), // أرقام إنجليزية فقط
            Validators.pattern(/^5\d{8}$/), // رقم سعودي يبدأ بـ5 وطوله 9
          ],
        ],
        schoolId: [null, [Validators.required]],
        state: [null, [Validators.required]],
        classNumber: [null, [Validators.required]],
        name: [null],
        gender: [null],
        schoolType: [null],
        city: [null],
      },
      { validator: confirmPasswordValidator }
    );
    this.fetchAllSchools();
  }
  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onRegister() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.isLoading.set(true);
    const { confirmPassword, name, gender, schoolType, city, phone, ...rest } =
      this.registerForm.value;
    // إضافة 966 قبل رقم الهاتف
    const formattedPhone = `+966${phone}`;

    // إنشاء كائن جديد يحتوي على البيانات المعدلة
    const formData = {
      ...rest,
      phone: formattedPhone,
    };
    this.authService.createUser(formData).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.router.navigate(['/login']);
          if (this.isSchoolSelected()) {
            this.suggestSchool(name, schoolType, city, gender);
          }
        } else {
          this.toastr.error(msg);
          this.isLoading.update((v) => (v = false));
          return;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
        this.toastr.error(err);
        return;
      },
    });
  }
  suggestSchool(
    name: string,
    schoolType: number,
    city: string,
    gender: number
  ): void {
    this.schoolService
      .suggestSchool({ name, schoolType, city, gender })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            console.log(msg);
          } else {
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  handleSchoolChange(item: ID_Name): void {
    if (item?.id === 5) {
      this.isSchoolSelected.set(true);
    } else {
      this.isSchoolSelected.set(false);
    }
  }
  fetchAllSchools(): void {
    this.schoolService.getSystemSchools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSchools = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
