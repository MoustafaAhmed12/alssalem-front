import {
  Component,
  signal,
  inject,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamsMockService } from '../../services/exams-mock.service';
import { ToastrService } from 'ngx-toastr';
import { Question, Root } from '../../model/question-student';
import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
import { ExamService } from '../../services/exam.service';
import { NavBarCourseComponent } from '../course-layout/nav-bar-course/nav-bar-course.component';
import { NavberServiceService } from '../../../../shared/services/navber-service.service';
import { take } from 'rxjs';
import { ExamMockRevisionComponent } from '../exam-mock-revision/exam-mock-revision.component';
import { FormatTimePipe } from '../../../../shared/Pipes/format-time.pipe';
interface SkillStatistic {
  id: number;
  name: string;
  percent: number;
}

interface QuestionTypeStatistic {
  id: number;
  name: string;
  percent: number;
  skillsStatistics: SkillStatistic[];
}

interface Tutorial {
  id: number;
  percent: number;
  name: string;
  questionTypeStatistics: QuestionTypeStatistic[];
}

interface ExamResult {
  id: number;
  totalCount: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  emptyQuestionsCount: number;
  isSuccess: boolean;
  percent: number;
  tutorials: Tutorial[];
}
interface ExamInSidebar {
  id: number;
  name: string;
  isSuccess: boolean | null;
}

interface ExamDetails {
  id: number;
  name: string;
  durationInMinutes: number;
  questionsCount: number;
  successPercent: number;
  isRevisionAvailable: boolean;
  trails: Trails[];
}

export interface Trails {
  id: number;
  creationDate: string;
  percentage: number;
  timeTakenInMin: number;
  isPassed: boolean;
  successPercent: number;
  totalQuestions: number;
  wrongAnswersCount: number;
  correctAnswersCount: number;
  emptyAnswersCount: number;
}

type TabType = 'overview' | 'exam' | 'result' | 'revision';

@Component({
  selector: 'app-exam-mock',
  standalone: true,
  imports: [
    CommonModule,
    CdTimerModule,
    // CorrectionExamComponent,
    NavBarCourseComponent,
    ExamMockRevisionComponent,
    FormatTimePipe,
  ],
  templateUrl: './exam-mock.component.html',
  styleUrl: './exam-mock.component.scss',
})
export class ExamMockComponent implements OnInit, OnDestroy {
  navberService = inject(NavberServiceService);
  examsMock = inject(ExamsMockService);
  examService = inject(ExamService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
  isLoading = signal<boolean>(false);
  isLoadingRevision = signal<boolean>(false);
  activeTab = signal<TabType>('overview');
  sidebarOpen = signal(false);
  selectedExamId = signal<number>(0);
  isLargeScreen = window.innerWidth >= 1024;
  remainingTime = '00:00';
  examsInSidebar = signal<ExamInSidebar[]>([]);
  currentExamDetails = signal<ExamDetails>({} as ExamDetails);
  categoryId = signal<number>(1);
  ////////////////
  allQuestions: Question[] = [];
  question: Root = {} as Root;
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
  examResult = signal<ExamResult>({} as ExamResult);
  takeTime = signal<number>(0);
  isLoadingExam = signal<boolean>(false);
  errorMessage = signal<string>('');
  percentTutorials = signal<{ name: string; percent: number }[]>([]);
  constructor() {
    window.addEventListener('resize', () => {
      this.isLargeScreen = window.innerWidth >= 1024;
    });
  }

  ngOnInit() {
    this.navberService.hide();
    this.route.params.pipe(take(1)).subscribe((p) => {
      this.categoryId.set(Number(p['id']));
      this.getAllVirtualExam(this.categoryId());
    });

    // دي تتابع أي تغيير في examId فقط
    this.route.params.subscribe((p) => {
      this.selectedExamId.set(Number(p['examId']));
      this.getVirtualExam(this.selectedExamId());
    });
  }
  roundedNumber(num: number): number {
    return Math.round(num);
  }

  ngOnDestroy() {
    this.navberService.display();
  }

  getAllVirtualExam(id: number): void {
    this.isLoading.set(true);
    this.examsMock.getAllVirtualExam(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.examsInSidebar.set(result);
        } else {
          this.toastr.error('حدث خطأ أثناء جلب الدورات');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);

        console.log(err);
      },
    });
  }
  getVirtualExam(id: number): void {
    this.isLoadingExam.set(true);
    this.examsMock.getVirtualExam(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.currentExamDetails.set(result);
        } else {
          this.toastr.error('حدث خطأ أثناء جلب الدورات');
        }
        this.isLoadingExam.set(false);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('يرجى تسجيل الدخول للوصول إلى هذا المحتوى.');
        }
        this.isLoadingExam.set(false);
      },
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((val) => !val);
  }

  selectExam(examId: number): void {
    this.router.navigate(
      ['../', examId], // هنا غيّرت الـ id مثلاً من 11 إلى 22
      { relativeTo: this.route }
    );

    this.activeTab.set('overview');
    this.allQuestions = [];
    this.answers = [];
    this.currentPage = 1;
    this.pageNumber = 1;
    this.selectedExamId.set(examId);
    this.getVirtualExam(examId);
    if (!this.isLargeScreen) {
      this.sidebarOpen.set(false);
    }
  }

  changeTab(tab: TabType): void {
    this.activeTab.set(tab);
    if (tab === 'overview') {
      this.getVirtualExam(this.selectedExamId());
    }
    if (tab === 'exam') {
      this.currentPage = 1;
      this.answers = [];
      this.getExamQuestions(this.selectedExamId(), this.pageNumber);
      this.startTimer();
    }
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

  getExamQuestions(examId: number, pageNumber: number): void {
    this.isLoadingExam.set(true);
    this.examsMock.getAllVirtualExamQty(examId, pageNumber, 20).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.question = res;

          // خلط الصفحة الجديدة فقط (مش الأسئلة القديمة)
          const randomizedNewQuestions = res.data.sort(
            () => Math.random() - 0.5
          );

          // ضم الأسئلة القديمة + الجديدة العشوائية
          this.allQuestions = [...this.allQuestions, ...randomizedNewQuestions];

          this.preloadImages();

          // تأكد أن كل سؤال له إجابة
          this.allQuestions.forEach((question) => {
            const existingAnswer = this.answers.find(
              (answer) => answer.questionId === question.id
            );
            if (!existingAnswer) {
              this.answers.push({ questionId: question.id, choice: null });
            }
          });

          this.isLoadingExam.update((v) => (v = false));
        } else {
          this.isLoadingExam.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingExam.update((v) => (v = false));
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
    if (this.currentExamDetails().durationInMinutes === 0) {
      this.isCountdown = false;
      this.startTime = 0;
      this.basicTimer?.reset();
      this.basicTimer?.start();
    } else {
      this.isCountdown = true;
      this.startTime = this.currentExamDetails().durationInMinutes * 60;
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
    if (this.emptyAnswers().length > 0) {
      const answered = this.answers.filter((a) => a.choice !== null);
      this.answers = [...answered, ...this.emptyAnswers()];
      const answeredQuestions = this.allQuestions.filter((q) =>
        answered.some((a) => a.questionId === q.id)
      );
      const unansweredQuestions = this.allQuestions.filter((q) =>
        this.emptyAnswers().some((a) => a.questionId === q.id)
      );
      this.allQuestions = [...answeredQuestions, ...unansweredQuestions];
      this.toastr.info(
        'تم نقل الأسئلة غير المجابة إلى النهاية، راجعها قبل الإنهاء.',
        '',
        { timeOut: 15000 }
      );
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
      this.getExamQuestions(this.selectedExamId(), this.pageNumber);
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
    if (this.currentExamDetails().durationInMinutes === 0) {
      takenTimeInSec = this.basicTimer?.get()?.tick_count;
    } else {
      const newTime = this.currentExamDetails().durationInMinutes * 60;
      takenTimeInSec = newTime - this.basicTimer?.get().tick_count;
    }
    this.takeTime.set(takenTimeInSec);
    // this.sentTakeTime.emit(takenTimeInSec);
    const creationDate = new Date();
    const info = {
      examId: this.selectedExamId(),
      takenTimeInSec,
      creationDate,
      answers: this.answers,
    };
    this.isCorrecting.set(true);
    this.examsMock.correctExam(info).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.examResult.set(result);
          this.isCorrecting.update((v) => (v = false));
          this.activeTab.set('result');
          // const tutorialsWithPercent = this.examResult().tutorials.map(
          //   (tut) => {
          //     const questionPercents = tut.questionTypeStatistics.map(
          //       (q) => q.percent
          //     );
          //     const average =
          //       questionPercents.reduce((sum, p) => sum + p, 0) /
          //       questionPercents.length;
          //     return {
          //       name: tut.name,
          //       percent: average,
          //     };
          //   }
          // );
          const tutorialsWithPercent = this.examResult().tutorials.map(
            (tut) => {
              return {
                name: tut.name,
                percent: tut.percent,
              };
            }
          );
          this.percentTutorials.set(tutorialsWithPercent);
          //
          // this.sentCorrectionIfo.emit(result);
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

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  nextQuestion(): void {
    if (this.currentPage + 1 <= this.allQuestions.length) {
      this.currentPage++;
    } else {
      this.currentPage++;
      ++this.pageNumber;
      this.getExamQuestions(this.selectedExamId(), this.pageNumber);
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
      this.getExamQuestions(this.selectedExamId(), this.pageNumber);
    }
  }

  trailId = signal<number>(0);
  toRevision(id: number) {
    this.trailId.set(id);
    this.activeTab.set('revision');
    // let data = {
    //   trailId: id,
    //   pageNumber: 1,
    //   pageSize: 50,
    // };
    // this.getVirtualExamRevision(data);
  }

  // getVirtualExamRevision(data: any): void {
  //   this.isLoadingRevision.set(true);
  //   this.examsMock.getVirtualExamRevision(data).subscribe({
  //     next: ({ result, statusCode }) => {
  //       if (statusCode === 200) {
  //         console.log(result);
  //         // this.currentExamDetails.set(result);
  //       } else {
  //         this.toastr.error('حدث خطأ أثناء جلب الدورات');
  //       }
  //       this.isLoadingRevision.set(false);
  //     },
  //     error: (err) => {
  //       if (err.status === 401 || err.status === 403) {
  //         // this.errorMessage.set('يرجى تسجيل الدخول للوصول إلى هذا المحتوى.');
  //       }
  //       this.isLoadingRevision.set(false);
  //     },
  //   });
  // }
}
