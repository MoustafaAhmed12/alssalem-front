import {
  Component,
  OnChanges,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { AuthService } from '../../../../../authentication/services/auth.service';
interface Comment {
  id: number;
  comment: string;
  userId: number;
  userName: string;
  createdAt: string;
  rate: number | null;
}

interface CommentsResponse {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  comments: Comment[];
}
@Component({
  selector: 'app-comments-student',
  standalone: true,
  imports: [AddCommentComponent],
  templateUrl: './comments-student.component.html',
  styleUrl: './comments-student.component.scss',
})
export class CommentsStudentComponent implements OnChanges {
  authService = inject(AuthService);
  isAuth = signal<boolean>(false);

  ngOnChanges() {
    this.isAuth.set(this.authService.isAuth());
  }

  // Input Signal
  commentsData = input.required<CommentsResponse>();

  // Output للـ parent component لطلب صفحة جديدة
  onPageChangeRequest = output<number>();

  // Computed signals
  currentPage = computed(() => this.commentsData()?.pageNumber || 1);

  totalPages = computed(() => {
    const data = this.commentsData();
    if (!data) return 0;
    return Math.ceil(data.totalCount / data.pageSize);
  });

  // Reverse comments to show newest first
  sortedComments = computed(() => {
    const data = this.commentsData();
    if (!data || !data.comments) return [];
    return [...data.comments].reverse();
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  });

  // Methods
  onPageChange(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.onPageChangeRequest.emit(page);
      this.scrollToSection();
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`;

    return date.toLocaleDateString('ar-EG');
  }

  scrollToSection() {
    const section = document.getElementById('mySection');
    section?.scrollIntoView({ behavior: 'smooth' });
  }
}
