import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../pages/student/services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface Exam {
  examId: number;
  categoryId: number;
  examName: string;
}

interface Day {
  date: string;
  details: Exam[] | null;
  dayName?: string;
  dayNumber?: number;
  isHoliday?: boolean;
}

@Component({
  selector: 'app-exam-calendar-enhanced',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './exam-calendar-enhanced.component.html',
})
export class ExamCalendarEnhancedComponent implements OnChanges {
  profileService = inject(ProfileService);
  toastr = inject(ToastrService);
  router = inject(Router);
  days: Day[] = [];
  @Input() name?: string = '';
  @Input() allData: {
    categories: { id: number; name: string }[];
    days: {
      date: string;
      details: { examId: number; categoryId: number; examName: string }[];
    }[];
  } = {} as {
    categories: { id: number; name: string }[];
    days: {
      date: string;
      details: { examId: number; categoryId: number; examName: string }[];
    }[];
  };
  private arabicDays = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];
  private arabicMonths = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  ngOnChanges(): void {
    console.log(this.allData);
    this.initializeData();
  }

  private initializeData() {
    this.days = this.allData.days.map((day) => {
      const date = new Date(day.date);
      return {
        ...day,
        details: day.details || [],
        dayName: this.arabicDays[date.getDay()],
        dayNumber: date.getDate(),
        isHoliday: !day.details || day.details.length === 0,
      };
    });
  }

  drop(event: CdkDragDrop<Exam[]>, targetDay: Day) {
    if (event.previousContainer === event.container) {
      // Moving within the same day
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Moving between different days
      if (!targetDay.details) {
        targetDay.details = [];
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update holiday status
      this.updateHolidayStatus();
    }
  }

  private updateHolidayStatus() {
    this.days.forEach((day) => {
      day.isHoliday = !day.details || day.details.length === 0;
    });
  }

  getMonthName(dateString: string): string {
    const date = new Date(dateString);
    return this.arabicMonths[date.getMonth()];
  }

  getTotalExams(): number {
    return this.days.reduce((total, day) => {
      return total + (day.details ? day.details.length : 0);
    }, 0);
  }

  getHolidayDays(): number {
    return this.days.filter((day) => day.isHoliday).length;
  }

  getActiveDays(): number {
    return this.days.filter((day) => !day.isHoliday).length;
  }
  isLoading = signal<boolean>(false);
  savePlan() {
    console.log(this.name)
    console.log(this.allData.categories);
    const exportData = {
      name:
         this.name
          ? this.name
          : this.allData.categories.map((cat) => cat.name).join('- '),
      categoriesIds: this.allData.categories.map((cat) => cat.id),
      days: this.days
        .filter((day) => day.details && day.details.length > 0) // Only include days with exams
        .map((day) => ({
          date: day.date,
          examsIds: day.details!.map((exam) => exam.examId),
        })),
    };
    if (exportData.days.length === 0) {
      this.toastr.error('لا يوجد امتحانات لحفظ الخطة');
      return;
    }
    this.isLoading.set(true);
    this.profileService.saveRoadMap(exportData).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.router.navigate(['/profile/plan']);
          this.toastr.success('تم حفظ الخطة بنجاح');
        } else {
          this.toastr.error(
            'لقد قمت بعمل خطة في هذا القسم من قبل, يمكنك حذف الخطة السابقة او التعديل عليها',
            '',
            {
              timeOut: 8000,
            }
          );
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('حدث خطأ أثناء حفظ الخطة');
        this.isLoading.set(false);
      },
    });
  }
}
