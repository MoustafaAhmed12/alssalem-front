import { Component, OnInit, inject } from '@angular/core';
import { CardTutorialComponent } from '../../../../shared/components/card-tutorial/card-tutorial.component';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { TutorialTeacher } from '../../model/teacher';
import { TeacherService } from '../../services/teacher.service';
import { AuthService } from '../../../../authentication/services/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-tutorial-teacher',
  standalone: true,
  imports: [TitleScreenComponent, CardTutorialComponent],
  templateUrl: './tutorial-teacher.component.html',
  styleUrl: './tutorial-teacher.component.scss',
})
export class TutorialTeacherComponent implements OnInit {
  teacherService = inject(TeacherService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  tutorialsTeacher: TutorialTeacher[] = [];
  isLoading: boolean = false;
  currentUser: any;
  ngOnInit() {
    this.currentUser = this.authService.currentUser().userDto;
    this.fetchTeacherTutorials({ teacherId: this.currentUser.id });
  }
  fetchTeacherTutorials(teacherId: { teacherId: number }): void {
    this.isLoading = true;
    this.teacherService.getTeacherTutorials(teacherId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.tutorialsTeacher = result;
          this.isLoading = false;
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
}
