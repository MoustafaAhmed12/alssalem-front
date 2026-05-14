import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { TeacherService } from '../../../services/exams.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../../authentication/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-copy-exam',
  standalone: true,
  imports: [NgSelectModule, ReactiveFormsModule],
  templateUrl: './copy-exam.component.html',
  styleUrl: './copy-exam.component.scss',
})
export class CopyExamComponent implements OnInit {
  @Input() allTeacherExamToChoose: { id: number; name: string }[] = [];
  @Output() allExams: EventEmitter<any> = new EventEmitter<any>();
  teacherService = inject(TeacherService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  copyForm!: FormGroup;
  examsTutorials: { id: number; name: string }[] = [];
  isLoading: boolean = false;
  copyExamId: number = 0;
  currentUserId: number = 0;
  ngOnInit() {
    this.currentUserId = this.authService.currentUser().userDto.id;
    this.copyForm = this.fb.group({
      sourceId: [0, Validators.required],
      examName: [null, Validators.required],
      tutoiralId: [0, Validators.required],
    });
    this.fetchAllExamsTutorials({ teacherId: this.currentUserId });
  }
  fetchAllExamsTutorials(teacherId: any): void {
    this.teacherService.getExamsTutorials(teacherId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.examsTutorials = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getExamId(item: any): void {
    this.copyForm.get('sourceId')?.setValue(item.id);
  }
  getTutorialId(item: any): void {
    this.copyForm.get('tutoiralId')?.setValue(item.id);
  }
  onSubmit() {
    if (this.copyForm.invalid) {
      this.toastr.error('تأكد من إدخال البيانات');
      return;
    }
    this.isLoading = true;
    this.teacherService.copyExam(this.copyForm.value).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.allExams.emit({ teacherId: this.currentUserId });
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
}
