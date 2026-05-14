import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminExamService } from '../../admin-exam.service';
import { ActivatedRoute } from '@angular/router';

interface Question {
  id: number;
  image1Url: string | null;
  image2Url: string | null;
  answerUrl: string | null;
  text: string | null;
  answer1: string | null;
  answer2: string | null;
  answer3: string | null;
  answer4: string | null;
  answer5: string | null;
  correctChoice: number;
  difficulty: number;
  questionType: string;
  skill: string | null;
}

interface PaginationData {
  totalPages: number;
  pageSize: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ApiResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string | null;
  data: Question[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Component({
  selector: 'app-exam-questions-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-questions-viewer.component.html',
})
export class ExamQuestionsViewerComponent implements OnInit {
  admin = inject(AdminExamService);
  route = inject(ActivatedRoute);
  questions = signal<Question[]>([]);
  pagination = signal<PaginationData>({
    totalPages: 0,
    pageSize: 10,
    currentPage: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  isLoading = signal(false);
  isEditMode = signal(false);
  selectedImage = signal<string | null>(null);

  examId = signal<number>(0); // يتم تمريره من الـ route
  pageSize = 10;
  Math = Math;

  visiblePages = computed(() => {
    const current = this.pagination().currentPage;
    const total = this.pagination().totalPages;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
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

  constructor() {
    this.route.params.subscribe((params) => {
      this.examId.set(+params['id']);
    });
  }

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.isLoading.set(true);

    this.admin
      .getAllVirtualExamQty(
        this.examId(),
        this.pagination().currentPage,
        this.pagination().pageSize
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.questions.set(res.data);
            console.log(this.questions);
            this.pagination.set({
              totalPages: res.totalPages,
              pageSize: res.pageSize,
              currentPage: res.currentPage,
              totalCount: res.totalCount,
              hasPreviousPage: res.hasPreviousPage,
              hasNextPage: res.hasNextPage,
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

    // setTimeout(() => {
    //   const mockResponse: ApiResponse = {
    //     statusCode: 200,
    //     isSuccess: true,
    //     message: null,
    //     data: [
    //       {
    //         id: 11,
    //         image1Url:
    //           'https://backend.alssalem.com/Attachments/examsImgs/d79da79b-8bc5-4421-b317-45b84cd46f5e.jpg',
    //         image2Url: null,
    //         answerUrl: 'https://www.youtube.com/watch?v=ZObTQS3UolY',
    //         text: null,
    //         answer1: null,
    //         answer2: null,
    //         answer3: null,
    //         answer4: null,
    //         answer5: null,
    //         correctChoice: 4,
    //         difficulty: 1,
    //         questionType: 'هندسه',
    //         skill: 'زوايا المثلث',
    //       },
    //       {
    //         id: 13,
    //         image1Url:
    //           'https://backend.alssalem.com/Attachments/examsImgs/39756609-b50d-414c-bf56-a5e3957682aa.jpg',
    //         image2Url: null,
    //         answerUrl: 'https://youtu.be/0F2dho5tFis',
    //         text: null,
    //         answer1: null,
    //         answer2: null,
    //         answer3: null,
    //         answer4: null,
    //         answer5: null,
    //         correctChoice: 1,
    //         difficulty: 2,
    //         questionType: 'تحليل وإحصاء',
    //         skill: null,
    //       },
    //       {
    //         id: 14,
    //         image1Url:
    //           'https://backend.alssalem.com/Attachments/examsImgs/4122bc8f-3213-4648-b843-25bb8f4cae86.jpg',
    //         image2Url: null,
    //         answerUrl:
    //           'https://drive.google.com/file/d/1MKSzRimk1lkH3o01L9mtP8roWMypFiHm/view',
    //         text: null,
    //         answer1: null,
    //         answer2: null,
    //         answer3: null,
    //         answer4: null,
    //         answer5: null,
    //         correctChoice: 1,
    //         difficulty: 2,
    //         questionType: 'تحليل وإحصاء',
    //         skill: null,
    //       },
    //     ],
    //     totalPages: 3,
    //     pageSize: this.pageSize,
    //     pageCount: 0,
    //     currentPage: this.pagination().currentPage,
    //     totalCount: 29,
    //     hasPreviousPage: this.pagination().currentPage > 1,
    //     hasNextPage: this.pagination().currentPage < 3,
    //   };

    //   this.questions.set(mockResponse.data);
    //   this.pagination.set({
    //     totalPages: mockResponse.totalPages,
    //     pageSize: mockResponse.pageSize,
    //     currentPage: mockResponse.currentPage,
    //     totalCount: mockResponse.totalCount,
    //     hasPreviousPage: mockResponse.hasPreviousPage,
    //     hasNextPage: mockResponse.hasNextPage,
    //   });

    //   this.isLoading.set(false);
    // }, 600);

    // Replace with actual API call:
    // this.http.get<ApiResponse>(`/api/exams/${this.examId}/questions?page=${this.pagination().currentPage}&pageSize=${this.pageSize}`)
    //   .subscribe(response => { ... });
  }

  toggleEditMode() {
    this.isEditMode.update((mode) => !mode);
  }

  saveChanges() {
    console.log('Saving changes:', this.questions());
    // Call API to save changes
    // this.http.put(`/api/exams/${this.examId}/questions`, this.questions()).subscribe(...)
    this.isEditMode.set(false);
    alert('تم حفظ التعديلات بنجاح! ✅');
  }

  goToPage(page: number) {
    if (page < 1 || page > this.pagination().totalPages) return;
    this.pagination.update((p) => ({ ...p, currentPage: page }));
    this.loadQuestions();
  }

  onPageSizeChange() {
    this.pagination.update((p) => ({
      ...p,
      currentPage: 1,
      pageSize: this.pageSize,
    }));
    this.loadQuestions();
  }

  getDifficultyText(difficulty: number): string {
    switch (difficulty) {
      case 1:
        return 'سهل';
      case 2:
        return 'متوسط';
      case 3:
        return 'صعب';
      default:
        return 'غير محدد';
    }
  }

  openImageModal(imageUrl: string | null) {
    if (imageUrl) {
      this.selectedImage.set(imageUrl);
    }
  }

  closeImageModal() {
    this.selectedImage.set(null);
  }

  deleteQuestion(question: Question) {
    if (confirm(`هل أنت متأكد من حذف السؤال #${question.id}؟`)) {
      console.log('Delete question:', question);
      // Call API to delete
      // this.http.delete(`/api/questions/${question.id}`).subscribe(() => {
      //   this.loadQuestions();
      // });
    }
  }
}
