import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../../services/profile.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../../authentication/services/auth.service';
import { Title, Meta } from '@angular/platform-browser';
import { SupervisorService } from '../../../../../supervisor/services/supervisor.service';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Task {
  id: number;
  tutorialId: number;
  unitId: number;
  order: number;
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
  selector: 'app-study-plan',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './study-plan.component.html',
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
export class StudyPlanComponent implements OnInit {
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  supervisorService = inject(SupervisorService);
  router = inject(Router);
  toastr = inject(ToastrService);
  titleService = inject(Title);
  metaService = inject(Meta);
  selectedPlan = signal<Day[]>([]);
  categories = signal<Categories[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingP = signal<boolean>(false);
  plans: { id: number; name: string }[] = [];
  planName: string = '';
  planId = signal<number>(0);
  isMobileMenuOpen = signal<boolean>(true);
  id = signal<number>(0);
  route = inject(ActivatedRoute);
  role = signal<string>('');
  isOpen = signal<boolean>(false);
  planStartDate = computed(() => {
    const plan = this.selectedPlan();
    if (!plan || plan.length === 0) return null;
    const sortedDates = [...plan]
      .map((day) => new Date(day.date))
      .sort((a, b) => a.getTime() - b.getTime());
    return sortedDates[0];
  });

  planEndDate = computed(() => {
    const plan = this.selectedPlan();
    if (!plan || plan.length === 0) return null;
    const sortedDates = [...plan]
      .map((day) => new Date(day.date))
      .sort((a, b) => a.getTime() - b.getTime());
    return sortedDates[sortedDates.length - 1];
  });
  constructor() {
    this.role.set(this.authService.currentUser().roleDto.roleName);
    this.route.params.subscribe((p) => {
      this.id.set(+p['id']);
    });
  }
  ngOnInit() {
    this.titleService.setTitle('خطة الطالب الدراسية | منصة السالم');
    
    if (this.id()) {
      this.getMyPlansSuper(this.id());
    } else {
      this.getMyPlans();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(true);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  getMyPlansSuper(userId: number) {
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
  getPlanSuper(userId: number, item: { id: number; name: string }) {
    this.isLoadingP.set(true);
    this.planId.set(item.id);
    this.planName = item.name;
    this.supervisorService.oneRoadMaps(userId, item.id).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.categories.set(result[0].categories);
          this.selectedPlan.set(result[0].days);
          this.setSeoTags();
        }
        this.isLoadingP.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoadingP.set(false);
      },
    });
  }

  getMyPlans() {
    this.isLoading.set(true);
    this.profileService.myRoadMaps().subscribe({
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

  getOnePlan(item: { id: number; name: string }): void {
    if (this.id()) {
      this.getPlanSuper(this.id(), item);
    } else this.getPlan(item);
  }
  getPlan(item: { id: number; name: string }) {
    this.planId.set(item.id);
    this.planName = item.name;
    this.isLoadingP.set(true);

    this.profileService.oneRoadMaps(this.planId()).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.categories.set(result[0].categories);

          // 🔹 ترتيب الـ tasks داخل كل يوم حسب order
          const sortedDays = result[0].days.map((day: any) => ({
            ...day,
            tasks: day.tasks.sort((a: any, b: any) => a.order - b.order),
          }));

          this.selectedPlan.set(sortedDays);
          this.setSeoTags();
        }
        this.isLoadingP.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoadingP.set(false);
      },
    });
  }

  idDelete = signal<number>(0);
  confirm(id: number): void {
    this.isOpen.set(true);
    this.idDelete.set(id);
  }

  deleteMap() {
    this.isLoadingP.set(true);
    this.profileService.deleteRoadMap(this.idDelete()).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.toastr.success('تم حذف الخطة بنجاح');
          this.getMyPlans();
          this.selectedPlan.set([]);
          this.isOpen.set(false);
        }
        this.isLoadingP.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoadingP.set(false);
      },
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  isTodayHoliday(): boolean {
    const day = this.getCurrentDay();
    return !day || day.tasks.length === 0;
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
      const dateStr = this.formatDate(new Date(day.date));
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
      const dateStr = this.formatDate(current);

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
      return a.order - b.order;
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
        : tutorialId === 5 || tutorialId === 13
          ? 'تحصيلي رياضيات'
          : tutorialId === 6 || tutorialId === 15
            ? 'تحصيلي كيمياء'
            : tutorialId === 7 || tutorialId === 14
              ? 'تحصيلي فيزياء'
              : tutorialId === 8 || tutorialId === 16
                ? 'تحصيلي أحياء'
                : '';
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
    if (!this.selectedPlan()) return 0;
    return this.selectedPlan().filter((day) => day.tasks.length === 0).length;
  }

  getOverdueDays(): number {
    return this.getOverdueDaysDetails().length;
  }

  isDayOverdue(day: Day): boolean {
    if (day.tasks.length === 0) return false;

    const todayStr = this.formatDate(new Date());
    const dayStr = this.formatDate(new Date(day.date));

    return dayStr < todayStr && !this.isDayCompleted(day);
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

    const todayStr = this.formatDate(new Date());
    const currentDay = this.selectedPlan().find((day) => {
      return this.formatDate(new Date(day.date)) === todayStr;
    });

    return currentDay || null;
  }

  getCurrentDayTasks(): Task[] {
    const day = this.getCurrentDay();
    return day ? day.tasks : [];
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = [
      'الأحد',
      'الاثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ];
    return days[date.getDay()];
  }

  toggleTask(task: Task) {
    this.router.navigate([`/tutorial/${task.tutorialId}/exam/${task.id}`], {
      queryParams: { unitId: task.unitId },
    });
  }

  // ─── Export to Excel ──────────────────────────────────────────────────
  async exportToExcel(): Promise<void> {
    const days = this.getSortedDaysWithHolidays();
    if (!days.length) {
      this.toastr.error('لا توجد بيانات للتصدير');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('الخطة الدراسية');

    // Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };
    const subTitleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FF333333' }, size: 13 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '30244a' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 13 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    // Title
    const titleRow = worksheet.addRow([this.planName]);
    titleRow.height = 55;
    titleRow.eachCell((cell) => (cell.style = titleStyle));
    worksheet.mergeCells('A1:E1');

    // Description
    const descRow = worksheet.addRow([
      'خطتك الدراسية المخصصة لمساعدتك على تنظيم وقتك وتحقيق أهدافك الأكاديمية بكفاءة',
    ]);
    descRow.height = 35;
    descRow.eachCell((cell) => {
      cell.style = {
        ...subTitleStyle,
        font: { ...subTitleStyle.font!, italic: true, size: 12 },
      };
    });
    worksheet.mergeCells('A2:E2');

    // Plan dates
    const startDate = this.planStartDate();
    const endDate = this.planEndDate();
    const dateStr =
      startDate && endDate
        ? `من: ${this.formatDateArabic(startDate)} — إلى: ${this.formatDateArabic(endDate)}`
        : 'غير محدد';
    const dateRow = worksheet.addRow([dateStr]);
    dateRow.height = 32;
    dateRow.eachCell((cell) => (cell.style = subTitleStyle));
    worksheet.mergeCells('A3:E3');

    // Stats
    const statsRow = worksheet.addRow([
      `إجمالي الأيام: ${this.selectedPlan().length}`,
      `أيام مكتملة: ${this.getCompletedDays()}`,
      `أيام متأخرة: ${this.getOverdueDays()}`,
      `أيام إجازة: ${this.getHolidayDays()}`,
      '',
    ]);
    statsRow.height = 35;
    statsRow.eachCell((cell) => (cell.style = subTitleStyle));

    // Categories (level detection scores)
    const cats = this.categories();
    if (cats.length > 0) {
      const catTexts = cats
        .filter((c) => c.percent)
        .map((c) => `${c.name}: ${c.percent}%`);
      if (catTexts.length > 0) {
        const catRow = worksheet.addRow([
          `درجات تحديد المستوى — ${catTexts.join('  |  ')}`,
        ]);
        catRow.height = 32;
        catRow.eachCell((cell) => (cell.style = subTitleStyle));
        worksheet.mergeCells(`A${catRow.number}:E${catRow.number}`);
      }
    }

    // Empty spacer
    worksheet.addRow([]);

    // Header
    const hRow = worksheet.addRow([
      'اليوم',
      'التاريخ',
      'المهمة',
      'القسم',
      'الحالة',
    ]);
    hRow.height = 40;
    hRow.eachCell({ includeEmpty: true }, (cell) => (cell.style = headerStyle));

    // Data rows
    days.forEach((day) => {
      const dayName = this.getDayName(day.date);
      const dayDate = this.formatDateArabic(new Date(day.date));

      if (day.tasks.length === 0) {
        const row = worksheet.addRow([
          dayName,
          dayDate,
          'إجازة',
          '—',
          '🎉 يوم إجازة',
        ]);
        row.height = 30;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.style = {
            ...cellStyle,
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'DBEAFE' },
            },
          };
        });
      } else {
        const sortedTasks = this.getSortedTasks(day.tasks);
        sortedTasks.forEach((task, i) => {
          const status = task.isSuccess
            ? '✅ مكتمل'
            : this.isDayOverdue(day)
              ? '❌ متأخر'
              : '⏳ لم يُكتمل';
          const bgColor = task.isSuccess
            ? 'DCFCE7'
            : this.isDayOverdue(day)
              ? 'FEE2E2'
              : 'FEF9C3';
          const rowValues =
            i === 0
              ? [
                  dayName,
                  dayDate,
                  task.examName,
                  this.getTaskTutorialId(task.tutorialId),
                  status,
                ]
              : [
                  '',
                  '',
                  task.examName,
                  this.getTaskTutorialId(task.tutorialId),
                  status,
                ];
          const row = worksheet.addRow(rowValues);
          row.height = 32;
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.style = {
              ...cellStyle,
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: bgColor },
              },
            };
          });
        });
        // Merge day name and date cells if multiple tasks
        if (sortedTasks.length > 1) {
          const lastDataRow = worksheet.rowCount;
          const firstDataRow = lastDataRow - sortedTasks.length + 1;
          worksheet.mergeCells(firstDataRow, 1, lastDataRow, 1);
          worksheet.mergeCells(firstDataRow, 2, lastDataRow, 2);
        }
      }
    });

    // Column widths
    worksheet.columns = [
      { width: 18 },
      { width: 18 },
      { width: 45 },
      { width: 22 },
      { width: 18 },
    ];

    // RTL
    worksheet.views = [{ rightToLeft: true }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, `${this.planName}.xlsx`);
    this.toastr.success('تم تصدير الخطة بنجاح');
  }

  // ─── Export to PDF ────────────────────────────────────────────────────
  async exportToPDF(): Promise<void> {
    const days = this.getSortedDaysWithHolidays();
    if (!days.length) {
      this.toastr.error('لا توجد بيانات للتصدير');
      return;
    }

    this.toastr.info('جاري تجهيز ملف PDF...');

    const startDate = this.planStartDate();
    const endDate = this.planEndDate();
    const dateStr =
      startDate && endDate
        ? `من: ${this.formatDateArabic(startDate)} — إلى: ${this.formatDateArabic(endDate)}`
        : '';

    // Categories HTML
    const cats = this.categories().filter((c) => c.percent);
    const catsHtml =
      cats.length > 0
        ? `<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:20px;">${cats.map((c) => `<span style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;">${c.name}: ${c.percent}%</span>`).join('')}</div>`
        : '';

    // Build day cards HTML
    let daysHtml = '';
    days.forEach((day) => {
      const dayName = this.getDayName(day.date);
      const dayDate = this.formatDateArabic(new Date(day.date));
      const isCompleted = this.isDayCompleted(day);
      const isOverdue = this.isDayOverdue(day);
      const isHoliday = day.tasks.length === 0;

      let statusLabel = '';
      let headerBg = '';
      let statusBg = '';
      let statusColor = '';
      if (isHoliday) {
        statusLabel = '🎉 إجازة';
        headerBg = '#eff6ff';
        statusBg = '#dbeafe';
        statusColor = '#1e40af';
      } else if (isCompleted) {
        statusLabel = '✅ مكتمل';
        headerBg = '#f0fdf4';
        statusBg = '#dcfce7';
        statusColor = '#166534';
      } else if (isOverdue) {
        statusLabel = '⚠️ متأخر';
        headerBg = '#fef2f2';
        statusBg = '#fee2e2';
        statusColor = '#991b1b';
      } else {
        statusLabel = '⏳ جاري';
        headerBg = '#fefce8';
        statusBg = '#fef9c3';
        statusColor = '#854d0e';
      }

      daysHtml += `<div style="border:1px solid #e2e8f0;border-radius:12px;margin-bottom:14px;overflow:hidden;">`;
      daysHtml += `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid #e2e8f0;background:${headerBg};">`;
      daysHtml += `<div style="display:flex;gap:12px;align-items:center;"><span style="font-weight:700;font-size:15px;">${dayName}</span><span style="font-size:13px;color:#64748b;">${dayDate}</span></div>`;
      daysHtml += `<span style="font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;background:${statusBg};color:${statusColor};">${statusLabel}</span>`;
      daysHtml += `</div>`;

      if (isHoliday) {
        daysHtml += `<div style="padding:16px;text-align:center;color:#3b82f6;font-weight:600;font-size:14px;">يوم إجازة — استمتع بوقتك!</div>`;
      } else {
        daysHtml += `<div style="padding:10px 16px;">`;
        this.getSortedTasks(day.tasks).forEach((task) => {
          const taskStatus = task.isSuccess ? '✅' : '⬜';
          const taskBg = task.isSuccess ? '#f0fdf4' : '#f8fafc';
          const taskBorder = task.isSuccess ? 'none' : '1px solid #e2e8f0';
          const nameStyle = task.isSuccess
            ? 'text-decoration:line-through;color:#16a34a;'
            : '';
          daysHtml += `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;margin-bottom:6px;font-size:13px;background:${taskBg};border:${taskBorder};">`;
          daysHtml += `<span style="font-size:16px;flex-shrink:0;">${taskStatus}</span>`;
          daysHtml += `<span style="font-weight:700;color:#6366f1;white-space:nowrap;">(${this.getTaskTutorialId(task.tutorialId)})</span>`;
          daysHtml += `<span style="flex:1;font-weight:500;${nameStyle}">${task.examName}</span>`;
          daysHtml += `</div>`;
        });
        daysHtml += `</div>`;
      }
      daysHtml += `</div>`;
    });

    // Create hidden container
    const container = document.createElement('div');
    container.style.cssText =
      'position:absolute;left:-9999px;top:0;width:800px;background:white;direction:rtl;font-family:Cairo,Segoe UI,Tahoma,sans-serif;color:#1e293b;padding:20px;';
    container.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:white;padding:35px 30px;border-radius:16px;text-align:center;margin-bottom:24px;">
        <h1 style="font-size:28px;font-weight:800;margin:0 0 8px 0;font-family:Cairo,sans-serif;">${this.planName}</h1>
        <p style="font-size:14px;opacity:0.85;margin:0 0 12px 0;line-height:1.7;font-family:Cairo,sans-serif;">خطتك الدراسية المخصصة لمساعدتك على تنظيم وقتك وتحقيق أهدافك الأكاديمية بكفاءة.<br/>يوضح هذا التقرير جميع المهام اليومية وحالة إنجازها.</p>
        ${dateStr ? `<p style="font-size:13px;opacity:0.75;margin:0;font-family:Cairo,sans-serif;">${dateStr}</p>` : ''}
      </div>
      ${catsHtml}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
        <div style="text-align:center;padding:16px 10px;border-radius:12px;border:1px solid #e2e8f0;background:#f1f5f9;"><div style="font-size:26px;font-weight:800;color:#475569;">${this.selectedPlan().length}</div><div style="font-size:12px;font-weight:600;margin-top:4px;color:#64748b;">إجمالي الأيام</div></div>
        <div style="text-align:center;padding:16px 10px;border-radius:12px;border:1px solid #e2e8f0;background:#dcfce7;"><div style="font-size:26px;font-weight:800;color:#16a34a;">${this.getCompletedDays()}</div><div style="font-size:12px;font-weight:600;margin-top:4px;color:#15803d;">أيام مكتملة</div></div>
        <div style="text-align:center;padding:16px 10px;border-radius:12px;border:1px solid #e2e8f0;background:#fee2e2;"><div style="font-size:26px;font-weight:800;color:#dc2626;">${this.getOverdueDays()}</div><div style="font-size:12px;font-weight:600;margin-top:4px;color:#b91c1c;">أيام متأخرة</div></div>
        <div style="text-align:center;padding:16px 10px;border-radius:12px;border:1px solid #e2e8f0;background:#dbeafe;"><div style="font-size:26px;font-weight:800;color:#2563eb;">${this.getHolidayDays()}</div><div style="font-size:12px;font-weight:600;margin-top:4px;color:#1d4ed8;">أيام إجازة</div></div>
      </div>
      ${daysHtml}
      <div style="margin-top:30px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;padding-top:16px;">
        تم إنشاء هذا التقرير بواسطة منصة السالم التعليمية — ${this.formatDateArabic(new Date())}
      </div>
    `;
    document.body.appendChild(container);

    // Wait for font to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${this.planName}.pdf`);
      this.toastr.success('تم تصدير الخطة كـ PDF بنجاح');
    } catch (err) {
      console.error(err);
      this.toastr.error('حدث خطأ أثناء تصدير PDF');
    } finally {
      document.body.removeChild(container);
    }
  }

  // ─── Helper ───────────────────────────────────────────────────────────
  private formatDateArabic(date: Date): string {
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  setSeoTags() {
    const title = `خطة: ${this.planName || 'مخصصة'} | منصة السالم`;
    const description = `استعراض الخطة الدراسية (${this.planName}). خطة ذكية مبنية بناءً على مستوى الطالب واختباراته في منصة السالم للقدرات والتحصيلي.`;
    const keywords = 'خطة المذاكرة, جدول دراسي, خطة طالب, متابعة دراسية, قدرات وتحصيلي, منصة السالم';
    
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });

    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://alssalem.com/assets/images/plan-banner.jpg' });

    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
  }
}
