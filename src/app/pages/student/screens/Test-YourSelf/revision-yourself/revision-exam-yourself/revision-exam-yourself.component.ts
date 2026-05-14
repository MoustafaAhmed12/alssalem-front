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
} from '@angular/core';
import { TestYourselfService } from '../../../../services/test-yourself.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrlPipe } from '../../../../../../shared/Pipes/safe-url.pipe';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-revision-exam-yourself',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './revision-exam-yourself.component.html',
  styleUrl: './revision-exam-yourself.component.scss',
})
export class RevisionExamYourselfComponent implements OnInit, AfterViewChecked {
  @Output() pageNum = new EventEmitter<number>();
  @Input() choicesCount: number = 0;
  @Input() examId: number = 0;
  @Input() isEnglish: boolean = false;
  testYourselfService = inject(TestYourselfService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  isLoading = signal<boolean>(false);
  examAnswers: any;
  allData: any;
  openVideo: boolean = false;
  pageNumber: number = 1;
  videoURL: string = '';
  shouldScroll: boolean = false;
  @ViewChild('videoSection') videoSectionRef?: ElementRef;
  ngOnInit() {
    this.pageNumber = Number(this.route.snapshot.firstChild?.params['pageNum']);
    this.pageNum.emit(this.pageNumber);
    this.getStudentTrailDetails(this.examId, this.pageNumber);
  }
  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.videoSectionRef) {
      this.videoSectionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }
  getStudentTrailDetails(examId: number, pageNumber: number): void {
    this.isLoading.set(true);
    this.testYourselfService
      .getExamQuestionReview(examId, pageNumber)
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.allData = result;
            this.examAnswers = result.question;
            if (
              this.examAnswers.answerUrl.includes('youtube.com') ||
              this.examAnswers.answerUrl.includes('youtu.be')
            ) {
              const videoId = this.extractYouTubeId(this.examAnswers.answerUrl);
              this.videoURL = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&modestbranding=1&autoplay=1`;
            } else {
              if (
                this.examAnswers.answerUrl.includes(
                  'https://drive.google.com/file/d'
                )
              ) {
                const videoId = this.getVideoIdFromUrlGoogle(
                  this.examAnswers.answerUrl
                );
                this.videoURL = btoa(
                  `https://drive.google.com/file/d/${videoId}/preview`
                );
              } else {
                const videoId = this.extractDriveFileId(
                  this.examAnswers.answerUrl
                );
                this.videoURL = btoa(
                  `https://drive.google.com/file/d/${videoId}/preview`
                );
              }
            }
            this.router.navigate([
              `/test-yourself/exam/${this.examId}/page/`,
              this.pageNumber,
            ]);
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
  }
  nextQuestion(): void {
    this.getStudentTrailDetails(this.examId, ++this.pageNumber);
  }
  prevQuestion(): void {
    this.getStudentTrailDetails(this.examId, --this.pageNumber);
  }
  getPageRange(): number[] {
    const rangeSize = 6;
    const currentPage = this.allData.pageNumber;
    const totalPages = this.allData.totalPages;
    let start = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    let end = Math.min(totalPages, start + rangeSize - 1);
    if (end - start + 1 < rangeSize) {
      start = Math.max(1, end - rangeSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  gotoPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.allData.totalPages) {
      this.openVideo = false;
      this.pageNumber = pageNum;
      this.pageNum.emit(this.pageNumber);
      this.getStudentTrailDetails(this.examId, this.pageNumber);
    }
  }
}
