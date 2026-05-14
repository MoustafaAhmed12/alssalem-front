import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../../../authentication/services/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  email: string;
  phone: string;
  state: string;
  schoolId: number;
  schoolName: string;
  classNo: number;
  referenceKey: string;
  isGoogleSign: boolean;
  nationalId: string | null;
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-profile.component.html',
})
export class StudentProfileComponent implements OnInit {
  profileService = inject(ProfileService);

  route = inject(ActivatedRoute);
  clipboard = inject(Clipboard);
  toastr = inject(ToastrService);
  auth = inject(AuthService);
  student: Student = {} as Student;
  id = signal<number>(0);
  isLoading = signal<boolean>(false);
  role = signal<string>('');
  constructor() {
    this.role.set(this.auth.currentUser().roleDto.roleName);
    this.route.params.subscribe((p) => {
      this.id.set(+p['id']);
    });
  }
  ngOnInit() {
    const sId = this.auth.currentUser().userDto.id;
    if (this.id()) {
      this.getProfileInfo(this.id());
    } else {
      this.getProfileInfo(sId);
    }
  }

  getProfileInfo(id: number): void {
    this.isLoading.set(true);
    this.profileService.getStudentInfo(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.student = result;
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);

        console.log(err);
      },
    });
  }

  copyText(text: string) {
    this.clipboard.copy(text);
    this.toastr.success('تم نسخ الرقم التعريفي');
  }
}
