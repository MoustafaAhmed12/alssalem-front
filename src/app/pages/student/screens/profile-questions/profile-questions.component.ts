import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { FavouriteQuestion } from '../../model/profile';
import { ToastrService } from 'ngx-toastr';
import { ExamService } from '../../services/exam.service';
import { SafeUrlPipe } from '../../../../shared/Pipes/safe-url.pipe';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-questions',
  standalone: true,
  imports: [SafeUrlPipe, TranslatePipe],
  templateUrl: './profile-questions.component.html',
  styleUrl: './profile-questions.component.scss',
})
export class ProfileQuestionsComponent implements OnInit {
  profileService = inject(ProfileService);
  examService = inject(ExamService);
  toastr = inject(ToastrService);
  examTutorialF: any = [];
  tutorialId = signal<number>(0);
  pageNumber: number = 1;
  openVideo: boolean = false;
  isDelete: boolean = false;
  videoURL: string = '';
  allFavouriteQuestions: FavouriteQuestion = {} as FavouriteQuestion;
  tutorialsOfFav: { id: number; name: string }[] = [];
  isLoadingQ = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.tutorialsOfFavourite();
  }

  tutorialsOfFavourite(): void {
    this.isLoading.set(true);
    this.profileService.tutorialsOfFavourite().subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.tutorialsOfFav = result;
          if (this.tutorialsOfFav.length > 0) {
            this.getfavouriteQuestions(1, 1, this.tutorialsOfFav[0].id);
            this.tutorialId.set(this.tutorialsOfFav[0].id);
          }
        } else {
          this.toastr.error(msg);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  changeTutorial(id: number) {
    this.tutorialId.set(id);
    this.getfavouriteQuestions(1, 1, id);
  }

  getfavouriteQuestions(
    pageNumber: number,
    pageSize: number,
    tutorialId: number
  ): void {
    this.isLoadingQ.set(true);
    this.profileService
      .getfavouriteQuestions(pageNumber, pageSize, tutorialId)
      .subscribe({
        next: ({ statusCode, result, msg }) => {
          if (statusCode === 200) {
            this.allFavouriteQuestions = result;
            this.isLoadingQ.set(false);
          } else {
            this.toastr.error(msg);
            this.isLoadingQ.set(false);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoadingQ.set(false);
        },
      });
  }

  deleteFormFav(id: number): void {
    this.isDelete = true;
    this.examService.favouriteQuestion(id, this.tutorialId()).subscribe({
      next: ({ statusCode }) => {
        if (statusCode === 200) {
          this.isDelete = false;
          this.pageNumber = 1;
          this.getfavouriteQuestions(this.pageNumber, 1, this.tutorialId());
        } else {
          this.isDelete = false;
        }
      },
      error: (err) => {
        this.isDelete = false;
        console.log(err);
      },
    });
  }

  openVideoSection(answerUrl: string) {
    this.openVideo = !this.openVideo;
    if (answerUrl.includes('youtube.com') || answerUrl.includes('youtu.be')) {
      const videoId = this.extractYouTubeId(answerUrl);
      this.videoURL = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&modestbranding=1&autoplay=1`;
    } else {
      if (answerUrl.includes('https://drive.google.com/file/d')) {
        const videoId = this.getVideoIdFromUrlGoogle(answerUrl);
        this.videoURL = btoa(
          `https://drive.google.com/file/d/${videoId}/preview`
        );
      } else {
        const videoId = this.extractDriveFileId(answerUrl);
        this.videoURL = btoa(
          `https://drive.google.com/file/d/${videoId}/preview`
        );
      }
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
    this.pageNumber++;
    this.getfavouriteQuestions(this.pageNumber, 1, this.tutorialId());
  }
  prevQuestion(): void {
    this.pageNumber--;
    this.getfavouriteQuestions(this.pageNumber, 1, this.tutorialId());
  }
  getPageRange(): number[] {
    const rangeSize = 12;
    const start = Math.max(0, this.pageNumber - Math.floor(rangeSize / 2));
    const end = Math.min(
      this.allFavouriteQuestions.totalCount - 1,
      start + rangeSize - 1
    );
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }
  gotoPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.allFavouriteQuestions.totalCount) {
      this.pageNumber = pageNum;
      this.getfavouriteQuestions(this.pageNumber, 1, this.tutorialId());
    }
  }
}
