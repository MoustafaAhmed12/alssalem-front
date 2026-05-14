import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { AdminService } from '../../../dashboard/services/admin.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TeacherService } from '../../services/teacher.service';
import { TutorilsStudentsService } from '../../../student/services/tutorils-students.service';

@Component({
  selector: 'app-cateogry-exams',
  standalone: true,
  imports: [TitleScreenComponent, NgClass, NgSelectModule, FormsModule],
  templateUrl: './cateogry-exams.component.html',
  styleUrl: './cateogry-exams.component.scss',
})
export class CateogryExamsComponent implements OnInit {
  teacherService = inject(TeacherService);
  tutorilsStudentsService = inject(TutorilsStudentsService);
  toastr = inject(ToastrService);
  isLoading: boolean = false;
  isLoadingExams: boolean = false;
  isLoadingSave: boolean = false;
  isLoadingTutorials: boolean = false;
  allCategory: { id: number; name: string }[] = [];
  allCategoryExams: { id: number; name: string }[] = [];
  categoryId: number | null = null;
  examIds: number[] = [];
  tutorialIds: number[] = [];
  tutorials: any[] = [];
  ngOnInit() {
    this.fetchAllCategories();
  }

  onCategoryChange(): void {
    if (this.categoryId) {
      this.getAllCategoryExams(this.categoryId);
      this.fetchCustomCategoryTutorials({ id: this.categoryId });
    }
  }
  onSubmit(): void {
    if (this.categoryId === null) {
      this.toastr.error('الرجاء اختيار التصنيف');
      return;
    }

    if (this.examIds.length === 0) {
      this.toastr.error('الرجاء اختيار الامتحانات');
      return;
    }
    if (this.tutorialIds.length === 0) {
      this.toastr.error('الرجاء اختيار الترتيب');
      return;
    }

    this.isLoadingSave = true;
    const info = {
      categoryId: this.categoryId,
      examIds: this.examIds,
      tutorialId: this.tutorialIds,
    };
    this.teacherService.saveCategoryExams(info).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.toastr.success('تم حفظ الامتحانات بنجاح');
          this.examIds = [];
          this.tutorialIds = [];
          this.categoryId = null;
        }
        this.isLoadingSave = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSave = false;
      },
    });
  }

  fetchCustomCategoryTutorials(id: { id: number }): void {
    this.isLoadingTutorials = true;
    this.tutorilsStudentsService.getCustomCategoryTutorials(id).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.tutorials = result?.sort((a: any, b: any) =>
            a.id < b.id ? 1 : -1
          );
        } else {
          this.toastr.error(msg);
        }
        this.isLoadingTutorials = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoadingTutorials = false;
      },
    });
  }

  fetchAllCategories(): void {
    this.isLoading = true;
    this.teacherService.getCategories().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allCategory = result;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
  getAllCategoryExams(categoryId: number): void {
    this.isLoadingExams = true;
    this.teacherService.getAllCategoryExams(categoryId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allCategoryExams = result;
        }
        this.isLoadingExams = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoadingExams = false;
      },
    });
  }
}
