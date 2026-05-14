import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../authentication/services/auth.service';
import { SupervisorService } from '../../services/supervisor.service';
import { SuperNavbarComponent } from '../../../parent/components/super-navbar/super-navbar.component';

interface Task {
  id: number;
  tutorialId: number;
  examName: string;
  isSuccess: boolean;
  isOpen: boolean;
}

interface Day {
  date: string;
  tasks: Task[];
  isHoliday?: boolean;
}
interface Categories {
  id: number;
  name: string;
  percent: number;
}

@Component({
  selector: 'app-student-plan',
  standalone: true,
  imports: [DatePipe, SuperNavbarComponent],
  templateUrl: './student-plan.component.html',
  styles: [
    `
      @keyframes slideIn {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }

      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
    `,
  ],
})
export class StudentPlanComponent implements OnInit {
  authService = inject(AuthService);
  supervisorService = inject(SupervisorService);
  router = inject(Router);
  toastr = inject(ToastrService);
  selectedPlan = signal<Day[]>([]);
  categories = signal<Categories[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingP = signal<boolean>(false);
  plans: { id: number; name: string }[] = [];
  planName: string = '';
  planId: number = 0;
  isMobileMenuOpen = signal<boolean>(true);
  role: string = '';
  route = inject(ActivatedRoute);
  userId = signal<number>(0);

  ngOnInit() {
    this.role = this.authService.currentUser().roleDto.roleName;
    this.route.params.subscribe((params) => {
      this.userId.set(parseInt(params['id']));
    });
    this.getMyPlans(this.userId());
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(true);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  getMyPlans(userId: number) {
    this.isLoading.set(true);
    this.supervisorService.myRoadMaps(userId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.plans = result;
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }
  getPlan(userId: number, id: number) {
    this.isLoadingP.set(true);
    this.supervisorService.oneRoadMaps(userId, id).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.categories.set(result[0].categories);
          this.selectedPlan.set(result[0].days);
        }
        this.isLoadingP.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoadingP.set(false);
      },
    });
  }

  selectPlan(plan: { id: number; name: string }) {
    this.planName = plan.name;
    this.planId = plan.id;
    this.getPlan(this.userId(), plan.id);
  }

  isTodayHoliday(): boolean {
    const plan = this.selectedPlan();
    if (!plan || plan.length === 0) return true;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const existingDates = new Set(
      plan.map((day) => {
        const d = new Date(day.date);
        return d.toISOString().split('T')[0];
      })
    );

    return !existingDates.has(todayStr);
  }

  isDayCompleted(day: Day): boolean {
    if (day.tasks.length === 0) return false;
    return day.tasks.every((task) => task.isSuccess);
  }

  getSortedDaysWithHolidays(): Day[] {
    const plan = this.selectedPlan();
    if (!plan || plan.length === 0) return [];

    // 1. نجيب كل التواريخ الموجودة بصيغة YYYY-MM-DD
    const existingMap = new Map<string, Day>();
    plan.forEach((day) => {
      const dateStr = new Date(day.date).toISOString().split('T')[0];
      existingMap.set(dateStr, day);
    });

    // 2. نحدد أول وآخر يوم
    const sortedDates = [...plan]
      .map((day) => new Date(day.date))
      .sort((a, b) => a.getTime() - b.getTime());

    const start = new Date(sortedDates[0]);
    const end = new Date(sortedDates[sortedDates.length - 1]);

    // 3. نولّد كل الأيام ونبني القائمة
    const allDays: Day[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];

      if (existingMap.has(dateStr)) {
        allDays.push(existingMap.get(dateStr)!);
      } else {
        allDays.push({
          date: new Date(current).toISOString(),
          tasks: [],
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return allDays;
  }

  getSortedTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // المهام المكتملة أولاً، ثم المهام حسب الترتيب
      if (a.isSuccess && !b.isSuccess) return -1;
      if (!a.isSuccess && b.isSuccess) return 1;
      return a.id - b.id;
    });
  }

  getDayCardClass(day: Day): string {
    if (this.isDayCompleted(day)) {
      return 'border-green-200 bg-green-50 animate-fade-in';
    } else if (day.tasks.length === 0) {
      return 'border-blue-200 bg-blue-50 animate-fade-in';
    } else if (this.isDayOverdue(day)) {
      return 'border-red-200 bg-red-50 animate-fade-in';
    }
    return 'border-yellow-200 bg-yellow-50 animate-fade-in';
  }

  getDayHeaderClass(day: Day): string {
    if (this.isDayCompleted(day)) {
      return 'bg-green-100 border-green-200';
    } else if (day.tasks.length === 0) {
      return 'bg-blue-100 border-blue-200';
    } else if (this.isDayOverdue(day)) {
      return 'bg-red-100 border-red-200';
    }
    return 'bg-logoColor1 text-white   border-gray-200';
  }

  getTaskTutorialId(tutorialId: number): string {
    return tutorialId === 1 || tutorialId === 4
      ? 'دورة كمي'
      : tutorialId === 2 || tutorialId === 3
      ? 'دورة لفظي'
      : tutorialId === 5
      ? 'تحصيلي رياضيات'
      : tutorialId === 6
      ? 'تحصيلي كيمياء'
      : tutorialId === 7
      ? 'تحصيلي فيزياء'
      : 'تحصيلي أحياء';
  }
  getTaskClass(task: Task): string {
    return task.isSuccess
      ? 'bg-green-50 border border-green-200'
      : 'bg-white border border-gray-200 hover:bg-gray-50';
  }

  getCompletedDays(): number {
    if (!this.selectedPlan()) return 0;
    return this.selectedPlan().filter((day) => this.isDayCompleted(day)).length;
  }

  getHolidayDays(): number {
    const plan = this.selectedPlan();
    if (!plan || plan.length === 0) return 0;

    // 1. استخراج كل التواريخ الحالية بدون وقت
    const existingDates = new Set(
      plan.map((day) => {
        const d = new Date(day.date);
        return d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      })
    );

    // 2. تحديد أول وآخر يوم
    const sortedDates = plan
      .map((day) => new Date(day.date))
      .sort((a, b) => a.getTime() - b.getTime());
    const start = sortedDates[0];
    const end = sortedDates[sortedDates.length - 1];

    // 3. عد الأيام الناقصة
    let missingDaysCount = 0;
    let current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (!existingDates.has(dateStr)) {
        missingDaysCount++;
      }

      // زيادة يوم واحد
      current.setDate(current.getDate() + 1);
    }

    return missingDaysCount;
  }

  // getHolidayDays(): number {
  //   if (!this.selectedPlan()) return 0;
  //   return this.selectedPlan().filter((day) => day.tasks.length === 0).length;
  // }

  getOverdueDays(): number {
    return this.getOverdueDaysDetails().length;
  }

  isDayOverdue(day: Day): boolean {
    const today = new Date();
    const dayDate = new Date(day.date);

    // نحذف التوقيت من المقارنة ونقارن فقط التاريخ
    const isBeforeToday =
      dayDate.getFullYear() < today.getFullYear() ||
      (dayDate.getFullYear() === today.getFullYear() &&
        dayDate.getMonth() < today.getMonth()) ||
      (dayDate.getFullYear() === today.getFullYear() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getDate() < today.getDate());

    return isBeforeToday && !this.isDayCompleted(day);
  }

  getOverdueDaysDetails(): Day[] {
    if (!this.selectedPlan()) return [];
    return this.selectedPlan().filter((day) => this.isDayOverdue(day));
  }

  getIncompleteTasks(day: Day): Task[] {
    return day.tasks
      .filter((task) => !task.isSuccess)
      .sort((a, b) => a.id - b.id);
  }

  getCurrentDay(): Day | null {
    if (!this.selectedPlan()) return null;

    const today = new Date();
    const currentDay = this.selectedPlan().find((day) => {
      const dayDate = new Date(day.date);
      return (
        dayDate.getFullYear() === today.getFullYear() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getDate() === today.getDate()
      );
    });

    return currentDay || null;
  }

  getCurrentDayTasks(): Task[] {
    const day = this.getCurrentDay();
    return day ? day.tasks : [];
  }

  toggleTask(task: Task) {
    this.router.navigate([`/tutorial/${task.tutorialId}/exam/${task.id}`]);
  }
}
