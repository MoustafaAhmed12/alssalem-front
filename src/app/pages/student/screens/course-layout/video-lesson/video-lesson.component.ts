import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  inject,
  signal,
  OnDestroy,
} from '@angular/core';
import { TutorilsStudentsService } from '../../../services/tutorils-students.service';
import { AuthService } from '../../../../../authentication/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrlPipe } from '../../../../../shared/Pipes/safe-url.pipe';
// @ts-ignore
import Plyr from 'plyr';
import '@mux/mux-player';

export interface VideoDetails {
  chapterName: string;
  videUrl: string;
  attachmentLink: string;
  attachmentName: string;
  isOpen: boolean;
}
@Component({
  selector: 'app-video-lesson',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './video-lesson.component.html',
  styleUrl: './video-lesson.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VideoLessonComponent implements OnInit, OnDestroy {
  tutorilsStudentsService = inject(TutorilsStudentsService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isAuth: boolean = false;
  userId: number = 0;
  videoDetails!: VideoDetails;
  isLoading = signal<boolean>(false);
  videoId: string = '';
  // videoURL is only used for non-Plyr videos (like Google Drive)
  videoURL: string = '';
  chapterId: number = 0;

  // Plyr Setup
  player: Plyr | undefined;
  isYoutube = signal<boolean>(false);
  youtubeSource = signal<string>('');
  useRawYoutube = signal<boolean>(false);
  videoEnded = signal<boolean>(false);
  isMux = signal<boolean>(false);

  ngOnInit(): void {
    this.isAuth = this.authService.isAuth();
    this.userId = this.authService.currentUser()?.userDto.id;
    this.route.params.subscribe((params) => {
      this.chapterId = parseInt(params['id']);
      // Cleanup previous player if exists before loading new one
      if (this.player) {
        this.player.destroy();
        this.player = undefined;
      }

      if (this.chapterId && this.isAuth === true) {
        this.fetchStudentVideo({
          chapterId: this.chapterId,
          userId: this.userId,
        });
      }
      if (this.isAuth === false) {
        this.fetchStudentVideo({
          chapterId: this.chapterId,
          userId: 0,
        });
      }
    });
  }

  fetchStudentVideo(chapterIdAndUserId: any): void {
    this.isLoading.set(true);
    this.isMux.set(false);
    this.tutorilsStudentsService.getStudentVideo(chapterIdAndUserId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.videoDetails = result as VideoDetails;

          if (
            this.videoDetails.videUrl.includes('youtube.com') ||
            this.videoDetails.videUrl.includes('youtu.be')
          ) {
            this.isYoutube.set(true);
            const videoId = this.extractYouTubeId(this.videoDetails.videUrl);
            this.videoId = videoId;
            this.updateYoutubeSource();

            // Initialize Plyr after view updates
            setTimeout(() => {
              this.initPlyr();
            }, 100);
          } else {
            this.isYoutube.set(false);
            if (
              this.videoDetails.videUrl.includes('mux.com') ||
              this.videoDetails.videUrl.includes('stream.mux.com')
            ) {
              this.isMux.set(true);
              this.videoURL = this.videoDetails.videUrl;
            } else if (
              this.videoDetails.videUrl.includes(
                'https://drive.google.com/file/d'
              )
            ) {
              const videoId = this.getVideoIdFromUrlGoogle(
                this.videoDetails.videUrl
              );
              this.videoURL = btoa(
                `https://drive.google.com/file/d/${videoId}/preview`
              );
            } else {
              const videoId = this.extractDriveFileId(
                this.videoDetails.videUrl
              );
              this.videoURL = btoa(
                `https://drive.google.com/file/d/${videoId}/preview`
              );
            }
          }
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
          'play-large', // The large play button in the center
          'restart', // Restart playback
          'rewind', // Rewind by the seek time (default 10 seconds)
          'play', // Play/pause playback
          'fast-forward', // Fast forward by the seek time (default 10 seconds)
          'progress', // The progress bar and scrubber for playback and buffering
          'current-time', // The current time of playback
          'duration', // The full duration of the media
          'mute', // Toggle mute
          'volume', // Volume control
          'captions', // Toggle captions
          'settings', // Settings menu
          'pip', // Picture-in-picture (currently Safari only)
          'airplay', // Airplay (currently Safari only)
          'fullscreen', // Toggle fullscreen
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
      // Raw YouTube embed URL with common privacy/anti-distraction params
      this.youtubeSource.set(
        `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&autoplay=1&fs=0`
      );
    } else {
      // Plyr YouTube embed URL
      this.youtubeSource.set(
        `https://www.youtube.com/embed/${videoId}?origin=https://plyrio.com&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1&fs=0`
      );
    }
  }

  toggleFullscreen(element: HTMLElement) {
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
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

  public getDecodedUrl(): string {
    if (
      this.videoURL.includes('youtube.com') ||
      this.videoURL.includes('youtu.be') ||
      this.isMux()
    ) {
      return this.videoURL;
    } else {
      return atob(this.videoURL);
    }
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

  extractYouTubeId(url: string): string {
    const regExp = /(?:youtube\.com.*(?:v=|\/embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  }

  navigateToTutorial() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
