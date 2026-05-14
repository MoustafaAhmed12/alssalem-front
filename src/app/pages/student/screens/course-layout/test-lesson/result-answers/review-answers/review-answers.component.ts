import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
  OnDestroy,
} from '@angular/core';
// @ts-ignore
import Plyr from 'plyr';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { SafeUrlPipe } from '../../../../../../../shared/Pipes/safe-url.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { ExamService } from '../../../../../services/exam.service';
@Component({
  selector: 'app-review-answers',
  standalone: true,
  imports: [SafeUrlPipe, NgSelectModule, NgClass],
  templateUrl: './review-answers.component.html',
  styleUrl: './review-answers.component.scss',
})
export class ReviewAnswersComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
  player: Plyr | undefined;
  @Output() pageNum = new EventEmitter<number>();
  @Output() totalQuestions = new EventEmitter<number>();
  @Input() choicesCount: number = 0;
  @Input() tutorialId: number = 0;
  @Input() examId: number = 0;
  @Input() examName: string = '';
  @Input() isEnglish: boolean = false;
  examService = inject(ExamService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  titleService = inject(Title);
  metaService = inject(Meta);
  isLoading = signal<boolean>(false);
  isLoadingF = signal<boolean>(false);
  examAnswers!: {
    id: number;
    questionImage: string;
    questionImage2: any;
    text: any;
    questionTypeName: string;
    skillName: string;
    questionType: string;

    difficulty: number;
    answer: number;
    answerUrl: string;
    isFavourite: boolean;
  };
  allData: any;
  trailId: number = 0;
  openVideo: boolean = false;
  isfavouriteQuestion: boolean = false;
  pageNumber: number = 1;
  filter!: any;
  videoURL: string = '';
  shouldScroll: boolean = false;
  isYoutube = signal<boolean>(false);
  useRawYoutube = signal<boolean>(false);
  videoEnded = signal<boolean>(false);
  videoId: string = '';

  @ViewChild('videoSection') videoSectionRef?: ElementRef;
  ngOnInit() {
    this.titleService.setTitle('مراجعة إجابات الاختبار | منصة السالم');
    // Important SEO Rule: Prevent indexing of private exam results to protect content and SEO crawl budget
    this.metaService.updateTag({
      name: 'robots',
      content: 'noindex, nofollow, noarchive',
    });

    this.route.params.subscribe((params) => {
      this.trailId = parseInt(params['trailId']);
    });
    this.pageNumber = Number(this.route.snapshot.firstChild?.params['pageNum']);
    this.pageNum.emit(this.pageNumber);
    this.getStudentTrailDetails(this.trailId, this.pageNumber, this.examId);
  }
  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.videoSectionRef) {
      this.videoSectionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }
  getStudentTrailDetails(
    trailId: number,
    pageNumber: number,
    examId: number,
    filter?: 0 | 1 | 2,
  ): void {
    this.isLoading.set(true);
    this.examService
      .getStudentTrailDetails(trailId, pageNumber, examId, filter)
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.allData = result;
            this.examAnswers = result.question;
            this.isfavouriteQuestion = this.examAnswers.isFavourite;
            this.totalQuestions.emit(this.allData.totalPages);
            if (
              this.examAnswers.answerUrl.includes('youtube.com') ||
              this.examAnswers.answerUrl.includes('youtu.be')
            ) {
              this.isYoutube.set(true);
              this.videoId = this.extractYouTubeId(this.examAnswers.answerUrl);
              this.updateYoutubeSource();
            } else {
              this.isYoutube.set(false);
              if (
                this.examAnswers.answerUrl.includes(
                  'https://drive.google.com/file/d',
                )
              ) {
                const videoId = this.getVideoIdFromUrlGoogle(
                  this.examAnswers.answerUrl,
                );
                this.videoURL = btoa(
                  `https://drive.google.com/file/d/${videoId}/preview`,
                );
              } else {
                const videoId = this.extractDriveFileId(
                  this.examAnswers.answerUrl,
                );
                this.videoURL = btoa(
                  `https://drive.google.com/file/d/${videoId}/preview`,
                );
              }
            }
            this.router.navigate([
              `/tutorial/${this.tutorialId}/exam/${this.examId}/result-answers/${this.trailId}/page/`,
              this.pageNumber,
            ]);
            this.setQuestionSeo(this.examAnswers);
            this.isLoading.update((v) => (v = false));
          } else if (statusCode === 404) {
            this.toastr.error('لا يوجد اسئلة');
            this.allData = result;
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
  filterQuestions(q: number): void {
    this.filter = q;
    this.pageNumber = 1;
    this.pageNum.emit(this.pageNumber);
    this.getStudentTrailDetails(
      this.trailId,
      this.pageNumber,
      this.examId,
      this.filter,
    );
  }
  getDecodedUrl(): string {
    if (
      this.videoURL.includes('youtube.com') ||
      this.videoURL.includes('youtu.be')
    ) {
      return this.videoURL;
    } else {
      return atob(this.videoURL);
    }
  }

  extractYouTubeId(url: string): string {
    const regExp = /(?:youtube\.com.*(?:v=|\/embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  }
  getVideoIdFromUrlGoogle(url: string): string {
    let match = /\/file\/d\/([a-zA-Z0-9_-]+)\//.exec(url);
    return match ? match[1] : '';
  }
  extractDriveFileId(driveLink: string): string {
    const regex = /[-\w]{25,}/;
    const matches = driveLink.match(regex);
    return matches ? matches[0] : '';
  }
  openVideoSection() {
    this.openVideo = !this.openVideo;
    this.shouldScroll = true;
    if (this.openVideo) {
      setTimeout(() => {
        this.initPlyr();
      }, 100);
    } else {
      if (this.player) {
        this.player.destroy();
        this.player = undefined;
      }
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
    const videoId = this.videoId;
    if (this.useRawYoutube()) {
      this.videoURL = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&autoplay=1&fs=0`;
    } else {
      this.videoURL = `https://www.youtube.com/embed/${videoId}?origin=https://plyrio.com&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1&fs=0`;
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

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
    }
  }
  nextQuestion(): void {
    this.getStudentTrailDetails(
      this.trailId,
      ++this.pageNumber,
      this.examId,
      this.filter,
    );
  }
  prevQuestion(): void {
    this.getStudentTrailDetails(
      this.trailId,
      --this.pageNumber,
      this.examId,
      this.filter,
    );
  }
  getPageRange(): number[] {
    const rangeSize = 12;
    const currentPage = this.allData?.pageNumber;
    const totalPages = this.allData?.totalPages;
    let start = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    let end = Math.min(totalPages, start + rangeSize - 1);
    if (end - start + 1 < rangeSize) {
      start = Math.max(1, end - rangeSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  gotoPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.allData?.totalPages) {
      this.openVideo = false;
      this.pageNumber = pageNum;
      this.pageNum.emit(this.pageNumber);
      this.getStudentTrailDetails(
        this.trailId,
        this.pageNumber,
        this.examId,
        this.filter,
      );
    }
  }

  addtofavouriteQuestions(id: number | undefined): void {
    if (!id) return;
    this.isLoadingF.set(true);
    this.examService.favouriteQuestion(id, this.tutorialId).subscribe({
      next: ({ statusCode }) => {
        if (statusCode === 200) {
          this.isLoadingF.update((v) => (v = false));
          this.isfavouriteQuestion = !this.isfavouriteQuestion;
        } else {
          this.isfavouriteQuestion = false;
          this.isLoadingF.update((v) => (v = false));
        }
      },
    });
  }

  setQuestionSeo(question: any): void {
    console.log(question);
    // Map Difficulty
    let diffLabel = 'غير محدد';
    if (question.difficulty === 1) diffLabel = 'سهل';
    if (question.difficulty === 2) diffLabel = 'متوسط';
    if (question.difficulty === 3) diffLabel = 'صعب';

    // Map Answer
    let answerLabel = '';
    if (question.answer === 1) answerLabel = 'أ';
    if (question.answer === 2) answerLabel = 'ب';
    if (question.answer === 3) answerLabel = 'ج';
    if (question.answer === 4) answerLabel = 'د';

    const title = `سؤال: ${question.questionTypeName || question.questionType} | مستوى ${diffLabel}`;

    // Construct a clever description
    let desc = question.text
      ? question.text.substring(0, 150)
      : `تدرب على أسئلة القسم: ${question.questionType} - مهارة: ${question.skillName}`;
    desc += ` | الإجابة الصحيحة هي: (${answerLabel})`;

    const imageUrl = question.questionImage || '';

    // Update Title and browser tab
    this.titleService.setTitle(title + ' | منصة السالم');

    // Keep noindex to protect test content from Google indexing, but allow nice metadata for tab and sharing
    this.metaService.updateTag({
      name: 'robots',
      content: 'noindex, nofollow, noarchive',
    });

    // Open Graph for sharing link
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    if (imageUrl) {
      this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    }
  }
}
