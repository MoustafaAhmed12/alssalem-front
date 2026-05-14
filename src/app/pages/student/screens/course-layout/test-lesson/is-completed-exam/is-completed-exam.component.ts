import {
  Component,
  inject,
  input,
  Input,
  OnChanges,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormatTimePipe } from '../../../../../../shared/Pipes/format-time.pipe';
import { ExamService } from '../../../../services/exam.service';
import {
  DataResult,
  StudentExamResults,
} from '../../../../model/question-student';
@Component({
  selector: 'app-is-completed-exam',
  standalone: true,
  imports: [NgClass, FormatTimePipe, RouterLink],
  templateUrl: './is-completed-exam.component.html',
  styleUrl: './is-completed-exam.component.scss',
})
export class IsCompletedExamComponent implements OnChanges {
  examService = inject(ExamService);
  route = inject(ActivatedRoute);
  examId = input<number>(0);
  router = inject(Router);
  isLoading = signal<boolean>(false);
  examResults: StudentExamResults = {} as StudentExamResults;
  allExamResults: DataResult[] = [];
  tutorialId = signal<number>(0);
  pageNumber: number = 1;

  constructor() {
    const url = this.router.url;
    const tutorialIdMatch = /\/tutorial\/(\d+)\//.exec(url);
    if (tutorialIdMatch) {
      this.tutorialId.set(+tutorialIdMatch[1]);
    }
  }
  ngOnChanges() {
    this.getAllStudentExamResults(this.examId(), this.pageNumber, 5);
  }
  roundedNumber(num: number): number {
    return Math.round(num);
  }
  getAllStudentExamResults(
    examId: number,
    pageNumber: number,
    pageSize: number
  ): void {
    const info = {
      pageNumber,
      pageSize,
      examId,
    };
    this.isLoading.set(true);
    this.examService.getAllStudentExamResults(info).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.examResults = res;
          this.allExamResults = [
            ...this.allExamResults,
            ...this.examResults.data,
          ];
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

  getMoreData(): void {
    if (this.examResults?.hasNextPage) {
      ++this.pageNumber;
      this.getAllStudentExamResults(this.examId(), this.pageNumber, 5);
    }
  }
}
