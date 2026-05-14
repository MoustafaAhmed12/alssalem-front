import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { AdditonalExamService } from '../../../services/additonal-exam.service';
import { ToastrService } from 'ngx-toastr';
import {
  Exam,
  Form,
  FormQuestion,
  ResultExam,
} from '../../../model/additional-exam';
import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
import {
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-additional-exam',
  standalone: true,
  imports: [CdTimerModule, ReactiveFormsModule],
  templateUrl: './additional-exam.component.html',
  styleUrl: './additional-exam.component.scss',
})
export class AdditionalExamComponent implements OnChanges {
  additonalExamService = inject(AdditonalExamService);
  examService = inject(ExamService);
  toastr = inject(ToastrService);
  @Input('exam') examDetails: Exam = {} as Exam;
  @Input() tutorialId: number = 0;
  @Output() sendTab: EventEmitter<number> = new EventEmitter<number>();
  @Output() sentResultExam: EventEmitter<ResultExam> =
    new EventEmitter<ResultExam>();
  @Output() sentResultInfo: EventEmitter<
    { questionId: number; choice: number }[]
  > = new EventEmitter<{ questionId: number; choice: number }[]>();
  currentPage: number = 0;
  questionsPerPage: number = 1;
  correctionLoading = signal<boolean>(false);
  time: number = 0;
  isPaused: boolean = false;
  fb = inject(NonNullableFormBuilder);
  correctionForm!: Form;
  isLoadingF = signal<boolean>(false);

  @ViewChild('basicTimer', { static: false }) basicTimer!: CdTimerComponent;
  constructor() {
    this.correctionForm = this.fb.group({
      questions: this.fb.array<FormQuestion>([]),
    });
  }
  ngOnChanges(): void {
    if (Object.keys(this.examDetails).length !== 0) {
      this.fetchStudentExam();
    }
  }
  get getQuestions() {
    return this.correctionForm.get('questions') as FormArray;
  }

  fetchStudentExam(): void {
    this.correctionForm.get('questions')?.reset();
    this.examDetails.questions.forEach((question: any) => {
      this.getQuestions.push(
        this.fb.group({
          id: [question.id],
          image1Url: [question.image1Url],
          image2Url: [question.image2Url],
          answer: [question.answer],
          answer1: [question.answer1],
          answer2: [question.answer2],
          answer3: [question.answer3],
          answer4: [question.answer4],
          isFavourite: [question.isFavourite],
        })
      );
    });
  }

  toCorrectExam(): void {
    this.correctionLoading.set(true);
    const examInfo = this.correctionForm.value.questions?.map((e) => ({
      questionId: e.id,
      choice: e.answer,
    }));
    this.additonalExamService.correctQuickExam(examInfo).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.correctionLoading.update((v) => (v = false));
          this.time = this.basicTimer?.get()?.tick_count;
          const examResult = {
            ...result,
            takenTime: this.time,
            questionsLength: this.correctionForm.value.questions?.length,
          };
          this.sendTab.emit(2);
          this.sentResultExam.emit(examResult);
          this.sentResultInfo.emit(examInfo);
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

  onAnswerSelected(questionIndex: number, answerNumber: number) {
    this.isPaused = false;
    this.basicTimer.resume();
    this.getQuestions.at(questionIndex).get('answer')?.setValue(answerNumber);
  }

  startTimer() {
    this.basicTimer?.reset();
    this.basicTimer?.start();
  }

  toggleTimer(): void {
    if (this.isPaused) {
      this.basicTimer.resume();
    } else {
      this.basicTimer.stop();
    }
    this.isPaused = !this.isPaused;
  }

  addtofavouriteQuestions(q: any): void {
    this.isLoadingF.set(true);
    this.examService
      .favouriteQuestion(q.get('id')?.value, this.tutorialId)
      .subscribe({
        next: ({ statusCode }) => {
          if (statusCode === 200) {
            q.get('isFavourite')?.setValue(!q.get('isFavourite')?.value);
            this.isLoadingF.update((v) => (v = false));
          } else {
            this.isLoadingF.update((v) => (v = false));
          }
        },
        error(err) {
          console.log(err);
        },
      });
  }

  // Navigation
  nextQuestion(): void {
    if (this.currentPage < this.examDetails.questions.length) {
      this.currentPage++;
    }
  }
  prevQuestion(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  get totalPages(): number {
    return Math.ceil(this.examDetails.questions.length / this.questionsPerPage);
  }
  getPageRange(): number[] {
    const rangeSize = 12;
    const start = Math.max(0, this.currentPage - Math.floor(rangeSize / 2));
    const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }
  gotoPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.currentPage = pageNum - 1;
    }
  }
}
