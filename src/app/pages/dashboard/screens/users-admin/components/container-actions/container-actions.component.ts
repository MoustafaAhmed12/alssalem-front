import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../../services/admin.service';
import {
  FollowingStudents,
  GetUser,
  ID_Name,
} from '../../../../model/admin-model';
import { ToastrService } from 'ngx-toastr';
import { SchoolService } from '../../../../services/school.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { PackageTutorialService } from '../../../../services/package-tutorial.service';
@Component({
  selector: 'app-container-actions',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgSelectModule, FontAwesomeModule],
  templateUrl: './container-actions.component.html',
  styleUrl: './container-actions.component.scss',
})
export class ContainerActionsComponent implements OnInit {
  adminService = inject(AdminService);
  packageTutorialService = inject(PackageTutorialService);
  schoolService = inject(SchoolService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  userId: number = 0;
  allRoles: ID_Name[] = [];
  allSchools: ID_Name[] = [];
  followingStudents: FollowingStudents[] = [];
  allTutorials: ID_Name[] = [];
  formData!: FormGroup;
  submitted = false;
  isLoading: boolean = false;
  eyeIcon = faLock;
  eyeSlashIcon = faLockOpen;
  passwordFieldType: string = 'password';
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = parseInt(params['id']);
      if (this.userId > 0) {
        this.fetchUser({
          userId: this.userId,
        });
      }
    });
    this.formData = this.fb.group({
      id: [this.userId === 0 ? 0 : this.userId],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      expireDate: [null],
      role_ID: [null, [Validators.required]],
      tutorialsIds: [null],
      studentSerialNumber: [''],
      studentsCount: [0],
      school_ID: [
        {
          value: null,
          disabled: true,
        },
      ],
    });
    this.fetchAllRoles();
    this.fetchAllSchools();
    this.fetchAllTutorials();
  }
  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
  selectionChangedForRole(event: any) {
    this.checkRole(event.id);
  }
  onSubmit() {
    this.submitted = true;
    if (this.formData.invalid) {
      return;
    }
    if (
      this.formData.value.role_ID === 2 ||
      this.formData.value.role_ID === 3 ||
      this.formData.value.role_ID === 4 ||
      this.formData.value.role_ID === 5
    ) {
      this.formData.value.school_ID = [];
    }
    if (
      this.formData.value.role_ID === 2 ||
      this.formData.value.role_ID === 3 ||
      this.formData.value.role_ID === 4 ||
      this.formData.value.role_ID === 5
    ) {
      this.formData.get('expireDate')?.setValue(null);
    }
    if (this.formData.get('expireDate')?.value === '') {
      this.formData.get('expireDate')?.setValue(null);
    }
    this.isLoading = true;
    this.adminService.SaveSystemUsers(this.formData.value).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.router.navigateByUrl('/admin/users');
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
  fetchUser(userId: { userId: number }): void {
    this.isLoading = true;
    this.adminService.getUserById(userId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          const user = result as GetUser;
          this.followingStudents = result.followingStudents;
          this.isLoading = false;
          this.formData.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            phone: user.phone,
            role_ID: user.roleId,
            school_ID: user.schoolId,
            expireDate: user.expireDate,
            studentsCount: user.studentsCount,
            tutorialsIds: user.tutorialsIds,
          });
          this.checkRole(user.roleId);
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
    });
  }
  // get All Roles
  fetchAllRoles(): void {
    this.adminService.getSystemRoles().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allRoles = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  // get All Schools
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
  remove(studentId: number): void {
    this.isLoading = true;
    this.adminService.deleteParentStudentSubscribe(studentId).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.fetchUser({
            userId: this.userId,
          });
          this.isLoading = false;
          this.toastr.success(msg);
        } else {
          this.isLoading = false;
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
  checkRole(roleId: number): void {
    if (roleId == 6 || roleId === 8 || roleId === 10) {
      this.formData.get('school_ID')?.enable();
    } else {
      this.formData.get('school_ID')?.disable();
      this.formData.get('school_ID')?.setValue(null);
    }
  }

  fetchAllTutorials(): void {
    this.packageTutorialService.getAllSystemTutorials().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allTutorials = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
