import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import {
  API,
  APIDefinition,
  Columns,
  Config,
  DefaultConfig,
  TableModule,
} from 'ngx-easy-table';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { ExamTable } from '../../model/teacher';
import { TeacherService } from '../../services/exams.service';
import { AuthService } from '../../../../authentication/services/auth.service';
import { CopyExamComponent } from './copy-exam/copy-exam.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    TitleScreenComponent,
    CopyExamComponent,
    FormsModule,
  ],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.scss',
})
export class ExamsComponent implements OnInit {
  teacherService = inject(TeacherService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);
  toastr = inject(ToastrService);
  router = inject(Router);
  examId: number = 0;
  ageSummary: number = 0;
  currentUser: any;
  isLoading: boolean = false;
  isLoadingSave = signal<boolean>(false);
  allTeacherExamToChoose: { id: number; name: string }[] = [];
  // table
  @ViewChild('table') table: APIDefinition | any;
  // edit
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: ExamTable[] = [];
  dataCopy: ExamTable[] = [];
  isOpen = signal<boolean>(false);
  examIdToDelete: number = 0;
  password: string = '';
  currentUserId: number = 0;
  /// loading
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor() {
    this.currentUserId = this.authService.currentUser().userDto.id;
  }
  ngOnInit(): void {
    this.columns = [
      { key: 'examName', title: 'أسم الأمتحان' },
      { key: 'tutorialName', title: 'اسم الدورة' },
      { key: 'questionsNumber', title: 'عدد الأسئلة' },
      { key: 'examId', title: ' تعديل أو حذف ', cellTemplate: this.actionTpl },
    ];
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationMaxSize = 7;
    this.configuration.rows = 20;
    this.configuration.tableLayout = {
      striped: true,
      hover: true,
      theme: 'light',
    };
    this.configuration.horizontalScroll = true;
    this.ageSummary = this.data
      .map((_) => _.examId)
      .reduce((acc, cur) => cur + acc, 0);
    this.currentUser = this.authService.currentUser().userDto;
    this.fetchAllExams({ teacherId: this.currentUser.id });
    this.fetchAllExamsTutorials({ teacherId: this.currentUserId });
  }

  isPopupOpen = signal<boolean>(false);

  // بيانات الفورم
  formData = {
    name: '',
    passingPrecent: 0,
    tutorialId: '',
    isDetectLevelExam: false,
    durationInMinutes: 0,
  };

  startQuestion = 0;
  endQuestion = 0;
  courses = signal<
    {
      id: number;
      name: string;
    }[]
  >([]);

  fetchAllExamsTutorials(teacherId: any): void {
    this.teacherService.getExamsTutorials(teacherId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.courses.set(result);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  onEvent($event: { event: string; value: { key: string; value: string }[] }) {
    if ($event.event !== 'onSearch') {
      return;
    }
    const filterKey = $event.value[0].key;
    const filterVal = $event.value[0].value;
    this.ageSummary = this.data
      .filter((item: any) => `${item[filterKey]}`.includes(filterVal))
      .map((_) => _.examId)
      .reduce((acc, cur) => cur + acc, 0);
  }
  // Search
  onChange(event: Event): void {
    this.table.apiEvent({
      type: API.onGlobalSearch,
      value: (event.target as HTMLInputElement).value,
    });
  }
  // edit fun
  edit(examId: number): void {
    this.router.navigate(['/instructor/exams/', examId]);
  }

  handleOpen(id: number): void {
    this.isOpen.set(true);
    this.examIdToDelete = id;
  }
  removeExam(): void {
    if (this.password === '000000') {
      this.remove(this.examIdToDelete);
    } else {
      this.toastr.error('كلمة المرور غير صحيحة');
    }
  }
  remove(examId: number): void {
    this.isLoading = true;
    this.teacherService.deleteExam({ examId: examId }).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.fetchAllExams({ teacherId: this.currentUser.id });
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
  // goTo Add User
  goToAddExam(): void {
    this.router.navigate(['/instructor/exams/', 0]);
  }
  fetchAllExams(teacherId: any): void {
    this.configuration.isLoading = true;
    this.teacherService
      .getAllExamsPerTeacherTutorials(teacherId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ({ result, statusCode, msg }) => {
          if (statusCode === 200) {
            this.data = result;
            this.dataCopy = result;
            this.allTeacherExamToChoose = result.map((exam: any) => ({
              id: exam.examId,
              name: exam.examName,
            }));
            this.pagination.count =
              this.pagination.count === -1
                ? result
                  ? result.length
                  : 0
                : this.pagination.count;
            this.pagination = { ...this.pagination };
            this.configuration.isLoading = false;
            this.cdr.detectChanges();
          } else {
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  openPopup() {
    this.isPopupOpen.set(true);
  }

  closePopup() {
    this.isPopupOpen.set(false);
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      passingPrecent: 0,
      tutorialId: '',
      isDetectLevelExam: false,
      durationInMinutes: 0,
    };
    this.startQuestion = 0;
    this.endQuestion = 0;
  }

  generateQuestions(
    start: number,
    end: number
  ): { questionId: number; order: number }[] {
    if (start > end) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => ({
      questionId: start + i,
      order: i + 1,
    }));
  }

  onSubmit() {
    const questions = this.generateQuestions(
      this.startQuestion,
      this.endQuestion
    );

    const payload = {
      name: this.formData.name,
      passingPrecent: this.formData.passingPrecent,
      tutorialId: Number(this.formData.tutorialId),
      isDetectLevelExam: this.formData.isDetectLevelExam,
      durationInMinutes: this.formData.durationInMinutes,
      questionsIds: questions,
    };

    this.isLoadingSave.set(true);

    this.teacherService.SaveExam(payload).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.fetchAllExams({ teacherId: this.currentUser.id });
          this.closePopup();
        } else {
          this.toastr.error(msg);
        }
        this.isLoadingSave.set(false);
      },
      error: (err) => {
        this.isLoadingSave.set(false);
        console.log(err);
      },
    });
  }
}
