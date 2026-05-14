import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupervisorService } from '../../services/supervisor.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-review-exam-answers',
  standalone: true,
  imports: [CommonModule, RouterLink, NgSelectModule],
  templateUrl: './review-exam-answers.component.html',
  styleUrl: './review-exam-answers.component.scss',
})
export class ReviewExamAnswersComponent implements OnInit {
  private supervisorService = inject(SupervisorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  userId: number = 0;
  examId: number = 0;
  userName: string = ''; // Added this
  pageNumber = signal<number>(1);
  pageSize: number = 20;
  currentApiPage: number = 0;

  questions = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  totalPages = signal<number>(1); // API total pages
  totalCount = signal<number>(0);

  correctAnswersCount = signal<number>(0);
  wrongAnswersCount = signal<number>(0);
  unansweredCount = signal<number>(0);
  selectedStatus = signal<number | null>(null);

  get studentPercentage(): number {
    const total = this.totalCount();
    return total > 0
      ? Math.round((this.correctAnswersCount() / total) * 100)
      : 0;
  }

  get currentQuestion() {
    const qs = this.questions();
    if (!qs || !Array.isArray(qs)) return null;
    const index = (this.pageNumber() - 1) % this.pageSize;
    return qs[index];
  }

  choiceMapping: { [key: number]: string } = {
    1: 'أ',
    2: 'ب',
    3: 'ج',
    4: 'د',
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userId = +params['userId'];
      this.examId = +params['examId'];
      this.userName = params['userName'] || ''; // Added this
      this.pageNumber.set(+params['pageNumber'] || 1);

      if (this.userId && this.examId) {
        this.loadDetails();
      } else {
        this.toastr.error('بيانات الطالب أو الاختبار غير مكتملة');
      }
    });
  }

  loadDetails(): void {
    const apiPage = Math.ceil(this.pageNumber() / this.pageSize);

    // If we already have the chunk, don't fetch from API
    if (apiPage === this.currentApiPage) {
      return;
    }

    this.isLoading.set(true);
    this.supervisorService
      .getStudentBestTryDetails(
        this.userId,
        this.examId,
        apiPage,
        this.pageSize,
        this.selectedStatus()
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode == 200 || res.isSuccess) {
            // The data is inside the first element of the data array
            const payload = Array.isArray(res.data) ? res.data[0] : res.data;

            if (payload) {
              this.questions.set(payload.questions || []);
              this.correctAnswersCount.set(payload.correctAnswersCount || 0);
              this.wrongAnswersCount.set(payload.wrongAnswersCount || 0);
              this.unansweredCount.set(payload.unansweredCount || 0);
            }

            this.totalPages.set(res.totalPages || 1);
            this.totalCount.set(res.totalCount || 0);
            this.currentApiPage = apiPage;
          } else {
            this.toastr.error(res.message || 'فشل تحميل البيانات');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('حدث خطأ أثناء تحميل البيانات');
          this.isLoading.set(false);
        },
      });
  }

  onStatusChange(status: any): void {
    this.selectedStatus.set(status === undefined ? null : status);
    this.pageNumber.set(1);
    this.currentApiPage = 0; // Reset cache
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageNumber: 1 },
      queryParamsHandling: 'merge',
    });
    this.loadDetails();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalCount() && page !== this.pageNumber()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { pageNumber: page },
        queryParamsHandling: 'merge',
      });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getChoiceLabel(choice: number): string {
    return this.choiceMapping[choice] || choice?.toString();
  }

  Math = Math;

  choiceIds = [1, 2, 3, 4];

  getChoiceClass(choiceId: number, question: any): string {
    const studentChoice = question.studentChoice;
    const correctChoice = question.correctChoice;

    if (studentChoice === correctChoice) {
      if (choiceId === studentChoice)
        return ' border-green-500 text-green-700  ';
    } else {
      if (choiceId === correctChoice)
        return ' border-green-500 text-green-700  ';
      if (choiceId === studentChoice) return ' border-red-500 text-red-700  ';
    }
    return ' border-gray-200 text-gray-500';
  }

  getRadioClass(choiceId: number, question: any): string {
    const studentChoice = question.studentChoice;
    const correctChoice = question.correctChoice;

    if (studentChoice === correctChoice) {
      if (choiceId === studentChoice) return 'bg-green-500 border-green-600';
    } else {
      if (choiceId === correctChoice) return 'bg-green-500 border-green-600';
      if (choiceId === studentChoice) return 'bg-red-500 border-red-600';
    }
    return 'bg-gray-100 border-gray-300';
  }

  getPageNumbers(): number[] {
    const total = this.totalCount();
    const current = this.pageNumber();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(total);
      }
    }

    return pages;
  }
}
