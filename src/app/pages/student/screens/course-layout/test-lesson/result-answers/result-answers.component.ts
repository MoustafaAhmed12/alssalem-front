import { Component, inject, OnInit, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CorrectionExamService } from '../../../../services/correction-exam.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReviewAnswersComponent } from './review-answers/review-answers.component';
import { ExamService } from '../../../../services/exam.service';
@Component({
  selector: 'app-result-answers',
  standalone: true,
  imports: [RouterLink, ReviewAnswersComponent],
  templateUrl: './result-answers.component.html',
  styleUrl: './result-answers.component.scss',
})
export class ResultAnswersComponent implements OnInit {
  examService = inject(ExamService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  titleService = inject(Title);
  metaService = inject(Meta);
  isLoading = signal<boolean>(false);
  examResults: any;
  examId: number = 0;
  tutorialId: number = 0;
  trailId: number = 0;
  currentIndex: number = 1;
  totalQuestions: number = 0;

  ngOnInit() {
    this.titleService.setTitle('نتيجة الاختبار | منصة السالم');
    // Important SEO Rule: Prevent indexing of private exam results to protect content and SEO crawl budget
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow, noarchive' });

    this.route.url.subscribe(() => {
      const url = this.router.url;
      const tutorialIdMatch = /\/tutorial\/(\d+)\//.exec(url);
      if (tutorialIdMatch) {
        this.tutorialId = +tutorialIdMatch[1];
      }
    });
    this.route.params.subscribe((params) => {
      this.examId = parseInt(params['examId']);
      this.trailId = parseInt(params['trailId']);
      this.getTrailDetailById(this.trailId);
    });
  }
  receiveData(data: number) {
    this.currentIndex = data;
  }
  receiveDataTotal(data: number) {
    this.totalQuestions = data;
  }
  getTrailDetailById(trailId: number): void {
    this.isLoading.set(true);
    this.examService.getTrailDetailById(trailId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.examResults = result;
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
}
