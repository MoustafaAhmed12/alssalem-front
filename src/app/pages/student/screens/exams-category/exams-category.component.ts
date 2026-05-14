import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamsMockService } from '../../services/exams-mock.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '@ngx-translate/core';

interface Exam {
  id: number;
  number: number;
  name: string;
  isLocked: boolean;
  isSuccess: boolean | null;
}

interface Section {
  id: number;
  title: string;
  description: string;
  exams: Exam[];
}

@Component({
  selector: 'app-exams-category',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './exams-category.component.html',
})
export class ExamsCategoryComponent implements OnInit {
  examsMock = inject(ExamsMockService);
  route = inject(ActivatedRoute);
  toastr = inject(ToastrService);
  expandedSections = signal<number[]>([1]);
  sections = signal<Section>({} as Section);
  categoryId = signal<number>(1);

  ngOnInit() {
    this.route.params.subscribe((p) => {
      this.categoryId.set(Number(p['id']));
      this.getAllVirtualExam(this.categoryId());
    });
  }

  getAllVirtualExam(id: number): void {
    this.examsMock.getAllVirtualExam(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          const section = {
            id: 1,
            title: `الاختبارات المحاكية ${id === 1 ? 'قدرات' : 'تحصيلي'}`,
            description: `اختبارات تأسيسية لبناء قاعدة قوية في ${
              id === 1 ? 'القدرات الكمي واللفظي' : 'التحصيلي'
            }`,
            exams: result,
          };
          this.sections.set(section);
        } else {
          this.toastr.error('حدث خطأ أثناء جلب الدورات');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  toggleSection(sectionId: number): void {
    const current = this.expandedSections();
    if (current.includes(sectionId)) {
      this.expandedSections.set(current.filter((id) => id !== sectionId));
    } else {
      this.expandedSections.set([...current, sectionId]);
    }
  }

  getTotalExams(): number {
    if (Object.keys(this.sections()).length !== 0) {
      return this.sections().exams?.length || 0;
    }
    return 0;
  }

  getCompletedExams(): number {
    if (Object.keys(this.sections()).length !== 0) {
      return (
        this.sections().exams?.filter((exam) => exam.isSuccess === true)
          .length || 0
      );
    }
    return 0;
  }

  getProgress(): number {
    const total = this.getTotalExams();
    const completed = this.getCompletedExams();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
}
