import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../../authentication/services/auth.service';
import { SuperNavbarComponent } from '../../../parent/components/super-navbar/super-navbar.component';
import { CardStudentComponent } from '../../../parent/components/card-student/card-student.component';
import { AttachParentToStudentComponent } from '../../components/attach-parent-to-student/attach-parent-to-student.component';
import { ParentService } from '../../services/parent.service';
import { StudentDetailsParent } from '../../models/parentModels';
import { SafeUrlPipe } from '../../../../shared/Pipes/safe-url.pipe';
@Component({
  selector: 'app-home-parent',
  standalone: true,
  imports: [
    SuperNavbarComponent,
    CardStudentComponent,
    AttachParentToStudentComponent,
    SafeUrlPipe,
  ],
  templateUrl: './home-parent.component.html',
  styleUrl: './home-parent.component.scss',
})
export class HomeParentComponent implements OnInit {
  authService = inject(AuthService);
  parentService = inject(ParentService);
  studentsParent: StudentDetailsParent[] = [];
  studentsTutorials: any;
  currentUser: any;
  isLoading: boolean = false;
  isVideoOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser().userDto;
    this.fetchAllParentStudents({ parentId: this.currentUser.id });
  }
  fetchAllParentStudents(parentId: any): void {
    this.isLoading = true;
    this.parentService.getAllParentStudents(parentId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.studentsParent = result;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
  video: string = '';

  constructor() {
    this.video =
      'https://drive.google.com/file/d/1xGnbmNU_0fh7KUMfvi113RWuAgvc7JCQ/view?usp=sharing';
  }

  getDecodedUrl(): string {
    const videoId = this.getVideoIdFromUrlGoogle(this.video);
    const videoURL = btoa(`https://drive.google.com/file/d/${videoId}/preview`);
    return atob(videoURL);
  }

  getVideoIdFromUrlGoogle(url: string): string {
    let match = /\/file\/d\/([a-zA-Z0-9_-]+)\//.exec(url);
    return match ? match[1] : '';
  }
}
