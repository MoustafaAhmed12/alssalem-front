import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CorrectionExam,
  Question,
  Root,
} from '../../../../model/question-student';
import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
import { ToastrService } from 'ngx-toastr';
import { ExamService } from '../../../../services/exam.service';

@Component({
  selector: 'app-during-exam',
  standalone: true,
  imports: [CdTimerModule, FormsModule],
  templateUrl: './during-exam.component.html',
  styleUrl: './during-exam.component.scss',
})
export class DuringExamComponent implements OnChanges {
  examService = inject(ExamService);
  toastr = inject(ToastrService);
  @Input() examId: number = 0;
  @Input() tutorialId: number = 0;
  @Input() examName: string = '';
  @Input() durationInMinutes: number = 0;
  @Input() choicesCount: number = 0;
  @Input() isEnglish: boolean = false;
  @Output() sentTabNum: EventEmitter<number> = new EventEmitter<number>();
  @Output() sentTakeTime: EventEmitter<number> = new EventEmitter<number>();
  @Output() sentCorrectionIfo: EventEmitter<CorrectionExam> =
    new EventEmitter<CorrectionExam>();
  allQuestions: Question[] = [];
  question: Root = {} as Root;
  isLoading = signal<boolean>(false);
  isCorrecting = signal<boolean>(false);
  currentPage: number = 1;
  pageNumber: number = 1;
  questionsPerPage: number = 1;
  isPaused: boolean = false;
  startTime: number = 0;
  isCountdown: boolean = false;
  isLoadingF = signal<boolean>(false);
  answers: { questionId: number; choice: number | null }[] = [];
  emptyAnswers = signal<{ questionId: number; choice: number | null }[]>([]);
  @ViewChild('basicTimer', { static: false }) basicTimer!: CdTimerComponent;
  isOpen = signal<boolean>(false);

  ngOnChanges(): void {
    this.getExamQuestions(this.examId, this.pageNumber, 15);
    this.startTimer();
  }

  preloadImages() {
    this.allQuestions.forEach((q) => {
      if (q.image1Url) {
        const img1 = new Image();
        img1.src = q.image1Url;
      }
      if (q.image2Url) {
        const img2 = new Image();
        img2.src = q.image2Url;
      }
    });
  }

  getExamQuestions(examId: number, pageNumber: number, pageSize: number): void {
    this.isLoading.set(true);
    this.examService.getExamQuestions(examId, pageNumber, 15).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.question = result;
          this.allQuestions = [
            ...this.allQuestions,
            ...this.question.questions,
          ];
          this.preloadImages();
          this.allQuestions.forEach((question) => {
            const existingAnswer = this.answers.find(
              (answer) => answer.questionId === question.id
            );
            if (!existingAnswer) {
              this.answers.push({ questionId: question.id, choice: null });
            }
          });
          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }

  toggleTimer(): void {
    if (this.isPaused) {
      this.basicTimer.resume();
    } else {
      this.basicTimer.stop();
    }
    this.isPaused = !this.isPaused;
  }
  startTimer() {
    if (this.durationInMinutes === 0) {
      this.isCountdown = false;
      this.startTime = 0;
      this.basicTimer?.reset();
      this.basicTimer?.start();
    } else {
      this.isCountdown = true;
      this.startTime = this.durationInMinutes * 60;
      this.basicTimer?.reset();
      this.basicTimer?.start();
    }
  }
  onComplete() {
    this.toastr.info('تم إنتهاء الوقت المحدد');
    this.onSubmit();
  }

  updateAnswer(questionId: number, choice: number): void {
    this.isPaused = false;
    this.basicTimer.resume();

    const existingAnswer = this.answers.find(
      (answer) => answer.questionId === questionId
    );
    if (existingAnswer) {
      existingAnswer.choice = choice;
    }
  }
  isChecked(questionId: number, choice: number): boolean {
    const answer = this.answers.find((a) => a.questionId === questionId);
    return answer ? answer.choice === choice : false;
  }

  openPopup(): void {
    this.emptyAnswers.set(this.answers.filter((a) => a.choice === null));
    console.log(this.emptyAnswers());
    this.isOpen.set(true);
  }

  confirm(): void {
    this.isOpen.set(false);
    this.onSubmit();
  }

  closePopup(): void {
    this.isOpen.set(false);
    console.log(this.emptyAnswers());
    if (this.emptyAnswers().length > 0) {
      // أولاً: رتّب الإجابات
      const answered = this.answers.filter((a) => a.choice !== null);
      this.answers = [...answered, ...this.emptyAnswers()];

      // ثانيًا: رتّب الأسئلة في allQuestions بناءً على الإجابات
      const answeredQuestions = this.allQuestions.filter((q) =>
        answered.some((a) => a.questionId === q.id)
      );
      const unansweredQuestions = this.allQuestions.filter((q) =>
        this.emptyAnswers().some((a) => a.questionId === q.id)
      );
      this.allQuestions = [...answeredQuestions, ...unansweredQuestions];

      // ثالثًا: أظهر تنبيه
      this.toastr.info(
        'تم نقل الأسئلة غير المجابة إلى النهاية، راجعها قبل الإنهاء.',
        '',
        { timeOut: 15000 }
      );

      // رابعًا: روح لأول سؤال فاضي
      const firstUnanswered = this.emptyAnswers()[1];
      if (firstUnanswered) {
        this.goToQuestion(firstUnanswered.questionId);
      }
    }
  }

  goToQuestion(questionId: number): void {
    const index = this.allQuestions.findIndex((q) => q.id === questionId);
    if (index === -1) return;

    const questionsPerPage = 15;
    const targetPage = Math.floor(index / questionsPerPage) + 1;

    if (targetPage <= this.pageNumber) {
      this.currentPage = index;
    } else {
      this.pageNumber = targetPage;
      this.getExamQuestions(this.examId, this.pageNumber, questionsPerPage);
      setTimeout(() => {
        const newIndex = this.allQuestions.findIndex(
          (q) => q.id === questionId
        );
        if (newIndex !== -1) this.currentPage = newIndex;
      }, 300);
    }
  }

  onSubmit(): void {
    let takenTimeInSec;
    if (this.durationInMinutes === 0) {
      takenTimeInSec = this.basicTimer?.get()?.tick_count;
    } else {
      const newTime = this.durationInMinutes * 60;
      takenTimeInSec = newTime - this.basicTimer?.get().tick_count;
    }
    this.sentTakeTime.emit(takenTimeInSec);
    const creationDate = new Date();
    const info = {
      examId: this.examId,
      takenTimeInSec,
      creationDate,
      answsers: this.answers,
    };
    this.isCorrecting.set(true);
    this.examService.correctExam(info).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.isCorrecting.update((v) => (v = false));
          this.sentTabNum.emit(3);
          this.sentCorrectionIfo.emit(result);
        } else {
          this.toastr.error(msg);
          this.isCorrecting.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isCorrecting.update((v) => (v = false));
      },
    });
  }

  addtofavouriteQuestions(q: any): void {
    this.isLoadingF.set(true);
    this.examService.favouriteQuestion(q.id, this.tutorialId).subscribe({
      next: ({ statusCode }) => {
        if (statusCode === 200) {
          q.isFavourite = !q.isFavourite;
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

  nextQuestion(): void {
    if (this.currentPage + 1 <= this.allQuestions.length) {
      this.currentPage++;
    } else {
      this.currentPage++;
      ++this.pageNumber;
      this.getExamQuestions(this.examId, this.pageNumber, 15);
    }
  }
  prevQuestion(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  get totalPages(): number {
    return Math.ceil(this.question.totalCount / this.questionsPerPage);
  }
  getPageRange(): number[] {
    const rangeSize = 12;
    const start = Math.max(0, this.currentPage - Math.floor(rangeSize / 2));
    const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }
  gotoPage(pageNum: number): void {
    if (pageNum <= this.allQuestions.length) {
      this.currentPage = pageNum;
    } else {
      this.currentPage = pageNum;
      ++this.pageNumber;
      this.getExamQuestions(this.examId, this.pageNumber, 15);
    }
  }
}
