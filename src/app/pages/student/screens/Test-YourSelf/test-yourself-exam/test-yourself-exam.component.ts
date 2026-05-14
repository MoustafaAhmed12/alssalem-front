import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
import { FormatTimePipe } from '../../../../../shared/Pipes/format-time.pipe';
import { NavbarComponent } from '../../../../../shared/components/navbar/navbar.component';
import { TestYourselfService } from '../../../services/test-yourself.service';
import { CorrectionExamTestYourselfComponent } from '../correction-exam-test-yourself/correction-exam-test-yourself.component';
export type Form = FormGroup<{
  examId: FormControl;
  durationInMinutes: FormControl;
  answers: FormArray<FormQuestion>;
}>;
export type FormQuestion = FormGroup<{
  questionId: FormControl;
  studentChoice: FormControl;
}>;
@Component({
  selector: 'app-test-yourself-exam',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CdTimerModule,
    CorrectionExamTestYourselfComponent,
    NavbarComponent,
  ],
  templateUrl: './test-yourself-exam.component.html',
  styleUrl: './test-yourself-exam.component.scss',
  animations: [
    trigger('tabAnimation', [
      state(
        'tab1',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      state(
        'tab2',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      state(
        'tab3',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      transition('* => *', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('250ms ease-out'),
      ]),
    ]),
  ],
})
export class TestYourselfExamComponent {
  testYourselfService = inject(TestYourselfService);
  fb = inject(NonNullableFormBuilder);
  correctionForm!: Form;
  cdr = inject(ChangeDetectorRef);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  isAuth: boolean = false;
  currentUser: any;
  isLoading = signal<boolean>(false);
  correctionLoading = signal<boolean>(false);
  time: number = 0;
  examId: number = 0;
  examDetails: any;
  correctionExamDetails: any;
  currentPage: number = 0;
  questionsPerPage: number = 1;
  takeTime: number = 0;
  selectedTab: number = 0;
  totalQuestions: number = 0;
  lastQuestionOrder: number = 0;
  resetId: number = 0;
  @ViewChild('basicTimer', { static: false }) basicTimer!: CdTimerComponent;
  startTime: number = 0;
  isCountdown: boolean = false;
  tabs = [
    { label: 'قبل الاختبار' },
    { label: 'ابدأ الاختبار' },
    { label: 'إنهاء الاختبار' },
  ];
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.examId = parseInt(params['id']);
      this.getExamByUser(this.examId);
    });
    this.correctionForm = this.fb.group({
      examId: [this.examId],
      durationInMinutes: [0],
      answers: this.fb.array<FormQuestion>([]),
    });
  }
  get getQuestions() {
    return this.correctionForm.get('answers') as FormArray;
  }
  onAnswerSelected(questionIndex: number, answerNumber: number) {
    this.getQuestions
      .at(questionIndex)
      .get('studentChoice')
      ?.setValue(answerNumber);
    const formData = {
      id: this.getQuestions.at(questionIndex).get('id')?.value,
      studentChoice: answerNumber,
      questionOrder: questionIndex,
    };
    this.testYourselfService.trackingSolve(formData).subscribe({
      error: (err) => {
        console.log(err);
      },
    });
  }
  resetQuestions(): void {
    while (this.getQuestions.length !== 0) {
      this.getQuestions.removeAt(0);
    }
  }
  getExamByUser(examId: any): void {
    this.isLoading.set(true);
    this.testYourselfService.getExamByUser(examId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.selectedTab = 0;
          this.resetQuestions();
          this.correctionForm.get('answers')?.reset();
          this.examDetails = result;
          this.totalQuestions = this.examDetails.details.length;
          this.lastQuestionOrder = this.examDetails.lastQuestionOrder;
          this.resetId = this.examDetails.id;
          result.details.forEach((question: any) => {
            this.getQuestions.push(
              this.fb.group({
                id: [question.id],
                questionId: [question.questionId],
                image1Url: [question.image1Url],
                image2Url: [question.image2Url],
                studentChoice: [question.studentChoice],
              })
            );
          });
          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }
  startTimer() {
    if (this.time === 0) {
      this.isCountdown = false;
      this.startTime = 0;
      this.basicTimer?.reset();
      this.basicTimer?.start();
    } else {
      this.isCountdown = true;
      this.startTime = this.time * 60;
      this.basicTimer?.reset();
      this.basicTimer?.start();
    }
  }
  onComplete() {
    this.toastr.info('تم إنتهاء الوقت المحدد');
    this.onSubmit();
    this.selectedTab = 2;
    this.cdr.detectChanges();
  }
  selectTab(index: number) {
    this.selectedTab = index;
    if (index === 1) {
      this.currentPage = this.lastQuestionOrder;
      this.testYourselfService.clearTrailSolutions(this.resetId).subscribe({
        error: (err) => {
          console.log(err);
        },
      });
      this.startTimer();
    }
    if (index === 2) {
      this.correctionForm.get('answers')?.reset();
      this.onSubmit();
      this.getQuestions.reset();
    }
  }
  onSubmit(): void {
    if (this.time === 0) {
      this.takeTime = this.basicTimer?.get()?.tick_count;
    } else {
      const newTime = this.time * 60;
      this.takeTime = newTime - this.basicTimer?.get().tick_count;
    }
    this.correctionForm.get('durationInMinutes')?.setValue(this.takeTime);
    const formData = {
      examId: this.correctionForm.value.examId,
      durationInMinutes: this.correctionForm.value.durationInMinutes,
      answers: this.correctionForm.value.answers?.map(
        ({ questionId, studentChoice }) => ({
          questionId,
          studentChoice,
        })
      ),
    };
    this.correctionLoading.set(true);
    this.testYourselfService.correctExam(formData).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.correctionLoading.update((v) => (v = false));
          this.correctionExamDetails = result;
        } else {
          this.toastr.error(msg);
          this.correctionLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.correctionLoading.update((v) => (v = false));
      },
    });
  }
  // Navigation
  nextQuestion(): void {
    if (this.currentPage < this.totalQuestions) {
      this.currentPage++;
    }
  }
  prevQuestion(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  get totalPages(): number {
    return Math.ceil(this.totalQuestions / this.questionsPerPage);
  }
  getPageRange(): number[] {
    const rangeSize = 6;
    const start = Math.max(0, this.currentPage - Math.floor(rangeSize / 2));
    const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }
  gotoPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.currentPage = pageNum - 1;
    }
  }
  navigateToTutorial() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
