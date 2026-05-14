import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { ReviewAnswersComponent } from '../../course-layout/test-lesson/result-answers/review-answers/review-answers.component';
import { SafeUrlPipe } from '../../../../../shared/Pipes/safe-url.pipe';
import { CorrectionExamService } from '../../../services/correction-exam.service';
import { TestYourselfService } from '../../../services/test-yourself.service';
import { RevisionExamYourselfComponent } from './revision-exam-yourself/revision-exam-yourself.component';
import { NavbarComponent } from '../../../../../shared/components/navbar/navbar.component';
@Component({
  selector: 'app-revision-yourself',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    RevisionExamYourselfComponent,
    NavbarComponent,
  ],
  templateUrl: './revision-yourself.component.html',
  styleUrl: './revision-yourself.component.scss',
})
export class RevisionYourselfComponent implements OnInit {
  testYourselfService = inject(TestYourselfService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  isLoading = signal<boolean>(false);
  examResults: any;
  examId: number = 0;
  currentIndex: number = 1;
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.examId = parseInt(params['examId']);
      this.getExamDetails(this.examId);
    });
  }
  receiveData(data: number) {
    this.currentIndex = data;
  }
  getExamDetails(examId: number): void {
    this.isLoading.set(true);
    this.testYourselfService.getExamDetails(examId).subscribe({
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
