import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminExamService } from '../../admin-exam.service';
import { RouterLink, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface MockExam {
  id: number;
  name: string;
  durationInMinutes: number;
  successPercent: number;
  isRevisionAvailable: boolean;
  questionsCount: number;
}

interface PaginationData {
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ApiResponse {
  statusCode: number;
  isSuccess: boolean;
  result: {
    statusCode: number;
    isSuccess: boolean;
    message: string | null;
    data: MockExam[];
    totalPages: number;
    pageSize: number;
    pageCount: number;
    currentPage: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  msg: string | null;
}

@Component({
  selector: 'app-all-category-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './all-category-exams.component.html',
})
export class AllCategoryExamsComponent implements OnInit {
  adminExamService = inject(AdminExamService);
  toastr = inject(ToastrService);
  router = inject(Router);
  // Signals
  exams = signal<MockExam[]>([]);
  pagination = signal<PaginationData>({
    totalPages: 0,
    pageSize: 10,
    pageCount: 0,
    currentPage: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  isLoading = signal(false);

  // Form controls
  searchTerm = '';
  pageSize = 10;
  pageNumber: number = 1;
  Math = Math;

  // Computed signal for visible page numbers
  visiblePages = computed(() => {
    const current = this.pagination().currentPage;
    const total = this.pagination().totalPages;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  });

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.isLoading.set(true);

    this.adminExamService
      .getAllVirtualExam(
        this.pagination().currentPage,
        this.pagination().pageSize,
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.exams.set(res.result.data);
            this.pagination.set({
              totalPages: res.result.totalPages,
              pageSize: res.result.pageSize,
              pageCount: res.result.pageCount,
              currentPage: res.result.currentPage,
              totalCount: res.result.totalCount,
              hasPreviousPage: res.result.hasPreviousPage,
              hasNextPage: res.result.hasNextPage,
            });
          } else {
            console.log('first');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
        },
      });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.pagination().totalPages) return;

    this.pagination.update((p) => ({ ...p, currentPage: page }));
    this.loadExams();
  }

  onPageSizeChange() {
    this.pagination.update((p) => ({
      ...p,
      currentPage: 1,
      pageSize: this.pageSize,
    }));
    this.loadExams();
  }

  onSearch() {
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.loadExams();
  }

  viewExam(exam: MockExam) {
    console.log('View exam:', exam);
    // Navigate to exam details or open modal
  }

  editExam(exam: MockExam) {
    this.router.navigate(['/admin-exam/edit', exam.id]);
  }

  deleteExam(exam: MockExam) {
    if (confirm(`هل أنت متأكد من حذف الاختبار "${exam.name}"؟`)) {
      console.log('Delete exam:', exam);
      this.adminExamService.deleteVirtualExam(exam.id).subscribe({
        next: ({ statusCode }) => {
          if (statusCode === 200) {
            this.toastr.success('تم حذف الاختبار بنجاح');
            this.pagination().currentPage = 1;
            this.loadExams();
          } else {
            console.log('first');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
        },
      });
    }
  }
}
