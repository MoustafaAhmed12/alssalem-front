import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../../../services/profile.service';
import { SchoolService } from '../../../../../dashboard/services/school.service';
import { AuthService } from '../../../../../../authentication/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SuperNavbarComponent } from '../../../../../parent/components/super-navbar/super-navbar.component';

interface StudentData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  schoolId: number;
  schoolName: string;
  classNo: number;
  isGoogleSign: boolean;
  nationalId: string | null;
}

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SuperNavbarComponent,
    RouterLink,
  ],
  templateUrl: './settings-profile.component.html',
})
export class SettingsProfileComponent implements OnInit {
  profileService = inject(ProfileService);
  schoolService = inject(SchoolService);
  authService = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);
  location = inject(Location);
  private fb = inject(FormBuilder);
  allSchools: { id: number; name: string }[] = [];
  classNumbers: any = [
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
  studentData = signal<StudentData>({} as StudentData);
  showcurpassword = signal(false);
  showpassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  grades = signal([
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثالث الثانوي',
  ]);

  // Computed signal to check if user signed in with Google
  isGoogleSignIn = computed(() => this.studentData().isGoogleSign);

  // Computed signal to check if passwords match
  passwordsDoNotMatch = computed(() => {
    const password = this.studentForm.get('password')?.value;
    const confirmPassword = this.studentForm.get('confirmPassword')?.value;
    return (
      password &&
      confirmPassword &&
      password !== confirmPassword &&
      this.studentForm.get('confirmPassword')?.touched
    );
  });
  studentForm!: FormGroup;
  id = signal<number>(0);
  idFromSuper = signal<number>(0);
  showAlert = signal<boolean>(false);
  role = signal<string>('');
  isAdminView = signal<boolean>(false);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  canExit(): boolean {
    const formValue = this.studentForm.value;

    if (!formValue.phone || !formValue.email) {
      this.showAlert.set(true);
      setTimeout(() => this.showAlert.set(false), 10000);
      return false;
    }

    return true;
  }
  constructor() {
    this.role.set(this.auth.currentUser().roleDto.roleName);
    this.route.params.subscribe((p) => {
      if (+p['id']) {
        this.id.set(+p['id']);
        this.isAdminView.set(true);
      } else {
        this.id.set(this.authService.currentUser().userDto.id);
        this.isAdminView.set(false);
      }
    });

    this.studentForm = this.fb.group({
      userid: [this.id()],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      state: [''],
      schoolId: [''],
      classNumber: [''],
      nationalId: [''],
      curpassword: [''],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
    });
  }

  ngOnInit() {
    this.fetchAllSchools();
    this.getProfileInfo(this.id());
  }

  getProfileInfo(id: number): void {
    this.isLoading.set(true);
    this.profileService.getStudentInfo(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.studentData.set(result);
          this.studentForm.patchValue({
            userid: this.id(),
            firstName: this.studentData().firstName,
            lastName: this.studentData().lastName,
            email: this.studentData().email,
            phone: this.studentData().phone,
            state: this.studentData().state,
            schoolId: this.studentData().schoolId,
            classNumber: this.studentData().classNo,
            nationalId: this.studentData().nationalId,
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);

        console.log(err);
      },
    });
  }

  togglecurpasswordVisibility(): void {
    this.showcurpassword.update((show) => !show);
  }

  togglepasswordVisibility(): void {
    this.showpassword.update((show) => !show);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((show) => !show);
  }

  onSubmit(): void {
    if (this.studentForm.valid && !this.passwordsDoNotMatch()) {
      const payload = {
        ...this.studentForm.value,
        schoolId: Number(this.studentForm.value.schoolId),
        classNumber: Number(this.studentForm.value.classNumber),
      };
      this.isLoading.set(true);
      this.profileService.updateProfile(payload).subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.toastr.success('تم تحديث البيانات بنجاح.');
            this.isLoading.update((v) => (v = false));
            if (this.isAdminView()) {
              this.back();
            } else {
              this.router.navigate(['/']);
            }
          } else {
            this.toastr.error(msg);
            this.isLoading.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
          this.toastr.success(err);
        },
      });

      // // Simulate API call
      // setTimeout(() => {
      //   console.log('Form submitted:', this.studentForm.value);
      //   this.isLoading.set(false);

      //   // Update student data signal with new values
      //   this.studentData.update((current) => ({
      //     ...current,
      //     ...this.studentForm.value,
      //   }));

      //   // Show success message (you can implement a toast service)
      //   alert('تم حفظ البيانات بنجاح!');
      // }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.studentForm.controls).forEach((key) => {
        this.studentForm.get(key)?.markAsTouched();
      });
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
  back(): void {
    this.location.back();
  }
}
