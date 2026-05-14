import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CorrectionExamService } from '../../services/correction-exam.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SafeUrlPipe } from '../../../../shared/Pipes/safe-url.pipe';
import { ExamService } from '../../services/exam.service';
@Component({
  selector: 'app-redirect-to-question',
  standalone: true,
  imports: [NavbarComponent, SafeUrlPipe, RouterLink],
  templateUrl: './redirect-to-question.component.html',
  styleUrl: './redirect-to-question.component.scss',
})
export class RedirectToQuestionComponent implements OnInit, AfterViewChecked {
  examService = inject(ExamService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
  isLoading = signal<boolean>(false);
  qId: number = 0;
  examId: number = 0;
  tutorialId: number = 0;
  isEnglish: boolean = false;
  openVideo: boolean = false;
  isSuccess: boolean = false;
  videoURL: string = '';
  examAnswers: any;
  allData: any;
  @ViewChild('videoSection') videoSectionRef?: ElementRef;
  shouldScroll: boolean = false;
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.examId = parseInt(params['examId']);
      this.qId = parseInt(params['qId']);
      const info = {
        examId: this.examId,
        questionId: this.qId,
      };
      this.rediectToQuestion(info);
    });
  }
  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.videoSectionRef) {
      this.videoSectionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }
  rediectToQuestion(info: any): void {
    this.isLoading.set(true);
    this.examService.rediectToQuestion(info).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.isLoading.update((v) => (v = false));
          this.toastr.success('يتم التحويل الي السؤال');
          this.router.navigate([
            `/tutorial/${result.tutorialId}/exam/${this.examId}/result-answers/${result.trailId}/page/${result.pageNumber}`,
          ]);
        } else if (statusCode === 401) {
          this.isLoading.update((v) => (v = false));
        } else if (statusCode === 405) {
          this.isLoading.update((v) => (v = false));
          this.toastr.warning('يرجى شراء الدورة.');
          this.router.navigate([`/tutorial/`, result.tutorialId]);
        } else {
          this.tutorialId = result.tutorialId;
          this.isLoading.update((v) => (v = false));
          this.isSuccess = true;
          this.getQuestion(this.examId, this.qId);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getQuestion(examId: number, qId: number): void {
    this.isLoading.set(true);
    this.examService.getQuestionAnswer(examId, qId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.examAnswers = result;
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
}
