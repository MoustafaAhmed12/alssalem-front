import {
  Component,
  signal,
  computed,
  inject,
  OnChanges,
  SimpleChanges,
  input,
  ViewChild,
  ElementRef,
  effect,
  OnDestroy,
} from '@angular/core';
// @ts-ignore
import Plyr from 'plyr';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ExamsMockService } from '../../services/exams-mock.service';
import { ToastrService } from 'ngx-toastr';

interface ExamQuestion {
  id: number;
  image1Url: string;
  image2Url: string | null;
  answer1: string | null;
  text: string | null;
  answer2: string | null;
  answer3: string | null;
  answer4: string | null;
  answer5: string | null;
  choice: number | null;
  answer: number;
  answerUrl: string;
  isEnglish: boolean;
}

interface ExamResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string | null;
  data: ExamQuestion[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Component({
  selector: 'app-exam-mock-revision',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-mock-revision.component.html',
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    `,
  ],
})
export class ExamMockRevisionComponent implements OnChanges, OnDestroy {
  player: Plyr | undefined;
  id = input.required<number>();
  examsMock = inject(ExamsMockService);
  toastr = inject(ToastrService);
  isLoadingRevision = signal<boolean>(false);
  private sanitizer = inject(DomSanitizer);

  // Signals
  questions = signal<ExamQuestion[]>([]);
  currentIndex = signal<number>(1);
  showExplanation = signal<boolean>(false);
  totalCount = signal<number>(0);
  allData = signal<ExamResponse>({} as ExamResponse);
  selectedFilter = signal<number | null>(null); // New signal for filter
  @ViewChild('videoSection') videoSectionRef?: ElementRef;
  shouldScroll: boolean = false;
  isYoutube = signal<boolean>(false);
  useRawYoutube = signal<boolean>(false);
  videoEnded = signal<boolean>(false);
  videoId = signal<string>('');
  videoURL = signal<SafeResourceUrl>(
    this.sanitizer.bypassSecurityTrustResourceUrl(''),
  );

  filterOptions = [
    { value: null, label: 'الكل' },
    { value: 0, label: 'الإجابات الصحيحة' },
    { value: 1, label: 'الإجابات الخاطئة ' },
    { value: 2, label: 'الأسئلة الغير محلولة' },
  ];

  constructor() {
    effect(
      () => {
        if (this.showExplanation() && this.currentQuestion()?.answerUrl) {
          const url = this.currentQuestion()?.answerUrl;
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            this.isYoutube.set(true);
            const vId = this.extractYouTubeId(url);
            this.videoId.set(vId);
            this.updateYoutubeSource();
          } else {
            this.isYoutube.set(false);
            this.videoURL.set(
              this.sanitizer.bypassSecurityTrustResourceUrl(url),
            );
          }

          setTimeout(() => {
            this.initPlyr();
          }, 100);
        } else {
          if (this.player) {
            this.player.destroy();
            this.player = undefined;
          }
        }
      },
      { allowSignalWrites: true },
    );
  }

  extractYouTubeId(url: string): string {
    const regExp = /(?:youtube\.com.*(?:v=|\/embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.videoSectionRef) {
      this.videoSectionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getVirtualExamRevision(1);
  }

  preloadImages() {
    this.questions().forEach((q) => {
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

  onFilterChange(filterValue: number | null) {
    this.selectedFilter.set(filterValue);
    this.questions.set([]);
    this.currentIndex.set(1);
    this.getVirtualExamRevision(1);
  }

  getVirtualExamRevision(pageNumber: number): void {
    this.isLoadingRevision.set(true);
    const pageSize = 20;
    const data = {
      trailId: this.id(),
      pageNumber,
      pageSize,
      filter: this.selectedFilter(),
    };

    this.examsMock.getVirtualExamRevision(data).subscribe({
      next: (res) => {
        this.isLoadingRevision.set(false);
        if (res.statusCode === 200) {
          // append new questions
          const old = this.questions();
          const appended = [...old, ...res.data];
          this.questions.set(appended);

          // set overall meta
          this.allData.set(res);
          this.totalCount.set(this.allData().totalCount); // افتراض: totalCount هو عدد الصفحات/الأسئلة حسب سيرفرك

          // حدد بداية الصفحة اللي رجعت للتو داخل المصفوفة الكلية
          const startIndex = (pageNumber - 1) * pageSize;
          // تأكد إن العنصر موجود قبل التعيين
          if (appended.length > startIndex) {
            this.currentQuestion.set(appended[startIndex]);
          } else {
            // fallback to first available
            this.currentQuestion.set(appended[0] ?? ({} as ExamQuestion));
          }

          this.preloadImages();
        } else {
          this.toastr.error('حدث خطأ أثناء جلب الدورات');
        }
      },
      error: (err) => {
        this.isLoadingRevision.set(false);
        if (err.status === 401 || err.status === 403) {
          // handle auth error
        }
      },
    });
  }

  currentQuestion = signal<ExamQuestion>({} as ExamQuestion);

  answerOptions = computed(() => {
    const question = this.currentQuestion();
    if (!question) return [];

    return !question.isEnglish
      ? [
          { value: 1, label: 'أ', text: question.answer1 },
          { value: 2, label: 'ب', text: question.answer2 },
          { value: 3, label: 'ج', text: question.answer3 },
          { value: 4, label: 'د', text: question.answer4 },
        ]
      : [
          { value: 1, label: 'A', text: question.answer1 },
          { value: 2, label: 'B', text: question.answer2 },
          { value: 3, label: 'C', text: question.answer3 },
          { value: 4, label: 'D', text: question.answer4 },
        ];
  });

  getAnswerLabel(answerNum: number): string {
    const labels: { [key: number]: string } = {
      1: 'أ',
      2: 'ب',
      3: 'ج',
      4: 'د',
      5: 'هـ',
    };
    return labels[answerNum] || '';
  }

  getQuestionStatus(): string {
    if (this.currentQuestion().choice === null) {
      return 'لم يتم الحل';
    }
    return this.currentQuestion().choice ===
      Number(this.currentQuestion().answer)
      ? 'إجابة صحيحة ✓'
      : 'إجابة خاطئة ✗';
  }

  getQuestionHeaderClass(): string {
    if (this.currentQuestion().choice === null) {
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
    return this.currentQuestion().choice ===
      Number(this.currentQuestion().answer)
      ? 'bg-gradient-to-r from-green-500 to-green-600'
      : 'bg-gradient-to-r from-red-500 to-red-600';
  }
  getNavigatorButtonClass(index: number): string {
    // افتراض: currentIndex() و index كلاهما 1-based (صفحة/سؤال تبدأ من 1)
    const isActive = index === this.currentIndex();

    // إذا الزر هو الزر النشط خذ السؤال من currentQuestion()
    // وإلا خذ السؤال من questions() لو متوفر
    const question: ExamQuestion | null = isActive
      ? this.currentQuestion()
      : this.questions() && this.questions().length >= index
        ? this.questions()[index - 1]
        : null;

    // حالة افتراضية
    let baseClass = 'bg-gray-300 text-gray-700';

    if (question) {
      if (question.choice === null) {
        baseClass = 'bg-gray-300 text-gray-700';
      } else if (question.choice === Number(question.answer)) {
        baseClass = 'bg-green-500 text-white';
      } else {
        baseClass = 'bg-red-500 text-white';
      }
    }

    const activeClass = isActive ? 'ring-4 ring-indigo-400 scale-110' : '';
    return `${baseClass} ${activeClass}`;
  }

  isCorrectAnswer(optionValue: number): boolean {
    const question = this.currentQuestion();
    return question ? Number(question.answer) === optionValue : false;
  }

  isOptionSelected(optionValue: number): boolean {
    const question = this.currentQuestion();
    return question?.choice === optionValue;
  }

  isWrongChoice(optionValue: number): boolean {
    const question = this.currentQuestion();
    if (!question || question.choice === null) return false;
    return (
      question.choice === optionValue &&
      question.choice !== Number(question.answer)
    );
  }

  getOptionClass(optionValue: number): string {
    if (this.isCorrectAnswer(optionValue)) {
      return 'bg-green-50 border-green-400';
    }
    if (this.isWrongChoice(optionValue)) {
      return 'bg-red-50 border-red-400';
    }
    return 'bg-gray-50 border-gray-200';
  }

  getRadioClass(optionValue: number): string {
    if (this.isCorrectAnswer(optionValue)) {
      return 'border-green-500 text-green-500';
    }
    if (this.isWrongChoice(optionValue)) {
      return 'border-red-500 text-red-500';
    }
    return 'border-gray-300 text-gray-300';
  }

  getPageRange(): (number | string)[] {
    const total = this.totalCount();
    const current = this.currentIndex();
    const delta = 3;

    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let left = current - delta;
    let right = current + delta;

    if (left < 1) left = 1;
    if (right > total) right = total;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= left && i <= right)) {
        range.push(i);
      }
    }

    let last: number | undefined;
    for (let i of range) {
      if (last) {
        if (Number(i) - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (Number(i) - last > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      last = Number(i);
    }

    return rangeWithDots;
  }

  nextQuestion() {
    const pageSize = 20;
    const totalCount = this.allData().totalCount;
    const nextIndex = this.currentIndex() + 1;

    if (nextIndex > totalCount) return;

    const nextPage = Math.ceil(nextIndex / pageSize);
    this.currentIndex.set(nextIndex);

    const loadedPages = Math.ceil(this.questions().length / pageSize);
    if (nextPage > loadedPages) {
      // نطلب الصفحة الجديدة — currentQuestion سيُعيّن في subscribe
      this.getVirtualExamRevision(nextPage);
    } else {
      const q = this.questions()[nextIndex - 1];
      if (q) this.currentQuestion.set(q);
    }

    this.showExplanation.set(false);
  }

  previousQuestion() {
    const prevIndex = this.currentIndex() - 1;
    if (prevIndex < 1) return;

    this.currentIndex.set(prevIndex);

    // الصفحة السابقة غالباً محملة — نعيّن مباشرة
    const q = this.questions()[prevIndex - 1];
    if (q) this.currentQuestion.set(q);

    this.showExplanation.set(false);
  }

  goToQuestion(pageNum: number) {
    const pageSize = 20;
    const totalCount = this.allData().totalCount;
    if (pageNum < 1 || pageNum > totalCount) return;

    const targetPage = Math.ceil(pageNum / pageSize);
    this.currentIndex.set(pageNum);
    const loadedPages = Math.ceil(this.questions().length / pageSize);

    if (targetPage > loadedPages) {
      // الصفحة مش محمّلة — نطلبها ومن الsubscribe هنعيّن currentQuestion
      this.getVirtualExamRevision(targetPage);
    } else {
      // الصفحة موجودة — نعيّن السؤال مباشرة من المصفوفة (index - 1)
      const q = this.questions()[pageNum - 1];
      if (q) this.currentQuestion.set(q);
    }

    this.showExplanation.set(false);
    this.videoEnded.set(false);
  }

  toggleExplanation() {
    this.showExplanation.set(!this.showExplanation());
    this.videoEnded.set(false);
    this.shouldScroll = true;
  }

  togglePlayer() {
    this.useRawYoutube.update((v) => !v);
    this.videoEnded.set(false);
    this.updateYoutubeSource();
    if (!this.useRawYoutube()) {
      setTimeout(() => this.initPlyr(), 100);
    } else {
      if (this.player) {
        this.player.destroy();
        this.player = undefined;
      }
    }
  }

  updateYoutubeSource() {
    const vId = this.videoId();
    if (this.useRawYoutube()) {
      this.videoURL.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${vId}?rel=0&modestbranding=1&iv_load_policy=3&autoplay=1&fs=0`
        )
      );
    } else {
      this.videoURL.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${vId}?origin=https://plyrio.com&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1&fs=0`
        )
      );
    }
  }

  toggleFullscreen(element: HTMLElement) {
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  }

  initPlyr() {
    if (this.useRawYoutube()) {
      if (this.player) {
        this.player.destroy();
        this.player = undefined;
      }
      return;
    }
    const element = document.getElementById('plyr-player') as HTMLElement;
    if (element) {
      this.player = new Plyr(element, {
        controls: [
          'play-large',
          'restart',
          'rewind',
          'play',
          'fast-forward',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        settings: ['captions', 'quality', 'speed', 'loop'],
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          fs: 0,
        },
      });

      this.player.on('ended', () => {
        this.videoEnded.set(true);
      });

      this.player.on('play', () => {
        this.videoEnded.set(false);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
    }
  }
}
