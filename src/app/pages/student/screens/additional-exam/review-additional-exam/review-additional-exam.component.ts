import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ReviewExam } from '../../../model/additional-exam';
import { SafeUrlPipe } from '../../../../../shared/Pipes/safe-url.pipe';
import { ExamService } from '../../../services/exam.service';
// @ts-ignore
import Plyr from 'plyr';

@Component({
  selector: 'app-review-additional-exam',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './review-additional-exam.component.html',
  styleUrl: './review-additional-exam.component.scss',
})
export class ReviewAdditionalExamComponent
  implements AfterViewChecked, OnDestroy
{
  examService = inject(ExamService);
  @Input() reviewExamInfo: ReviewExam = {} as ReviewExam;
  isLoadingF = signal<boolean>(false);
  currentPage: number = 0;
  @Input() tutorialId: number = 0;
  questionsPerPage: number = 1;

  player: Plyr | undefined;
  openVideo: boolean = false;
  videoURL: string = '';
  shouldScroll: boolean = false;
  isYoutube = signal<boolean>(false);
  useRawYoutube = signal<boolean>(false);
  videoEnded = signal<boolean>(false);
  videoId: string = '';

  @ViewChild('videoSection') videoSectionRef?: ElementRef;

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.videoSectionRef) {
      this.videoSectionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
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

  openVideoSection(answerUrl: string) {
    this.openVideo = !this.openVideo;
    this.shouldScroll = true;

    if (this.openVideo) {
      if (answerUrl.includes('youtube.com') || answerUrl.includes('youtu.be')) {
        this.isYoutube.set(true);
        this.videoId = this.extractYouTubeId(answerUrl);
        this.updateYoutubeSource();
      } else {
        this.isYoutube.set(false);
        if (answerUrl.includes('https://drive.google.com/file/d')) {
          const videoId = this.getVideoIdFromUrlGoogle(answerUrl);
          this.videoURL = btoa(
            `https://drive.google.com/file/d/${videoId}/preview`,
          );
        } else {
          const videoId = this.extractDriveFileId(answerUrl);
          this.videoURL = btoa(
            `https://drive.google.com/file/d/${videoId}/preview`,
          );
        }
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

  nextQuestion(): void {
    if (this.currentPage < this.reviewExamInfo.questions.length) {
      this.currentPage++;
    }
  }
  prevQuestion(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  get totalPages(): number {
    return Math.ceil(
      this.reviewExamInfo.questions.length / this.questionsPerPage
    );
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
