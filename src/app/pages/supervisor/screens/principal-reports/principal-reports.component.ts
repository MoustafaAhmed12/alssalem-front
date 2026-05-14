import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { SupervisorService } from '../../services/supervisor.service';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExportService } from '../../../../shared/services/export.service';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { StudentData } from '../../model/school.SchoolStudents';
import { SchoolPopupComponent } from '../../components/school-popup/school-popup.component';
import { trigger, style, animate, transition } from '@angular/animations';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface CourseSummary {
  tutorialName: string;
  avgAchievement: number;
  advancePercentage: number;
  successPrecentage: number;
}

export interface GradeRow {
  state: string;
  studentCount: number;
  avgAchievement: number;
  students: StudentData[];
  courseSummaries: CourseSummary[];
}

export interface ClassRow {
  classNo: string;
  studentCount: number;
  avgAchievement: number;
  students: StudentData[];
  courseSummaries: CourseSummary[];
}

export interface SchoolTutorialSummary {
  id: number;
  tutorialName: string;
  advancePercentage: number;
  successPrecentage: number;
  avgAchievement: number;
  categoryName: string;
}

export interface SchoolTotalSummary {
  totalStudentsCount: number;
  tutotrials: SchoolTutorialSummary[];
}

@Component({
  selector: 'app-principal-reports',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    NgSelectModule,
    DatePipe,
    SchoolPopupComponent,
  ],
  templateUrl: './principal-reports.component.html',
  styleUrl: './principal-reports.component.scss',
  animations: [
    trigger('fadeInUpDelay', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(80px)' }),
        animate(
          '0.7s 0.3s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class PrincipalReportsComponent implements OnInit {
  supervisorService = inject(SupervisorService);
  exportService = inject(ExportService);
  toastr = inject(ToastrService);

  // ─── Data ───────────────────────────────────────────────────────────────
  allSchools = signal<{ id: number; name: string }[]>([]);
  allStudents = signal<StudentData[]>([]);
  allTutorials = signal<any[]>([]);
  schoolSummary = signal<SchoolTotalSummary | null>(null);
  isLoading = signal(false);
  isLoadingSummary = signal(false);
  currentDate = new Date();

  // ─── Filters ────────────────────────────────────────────────────────────
  selectedSchoolId = signal<number | null>(null);
  selectedSchoolName = signal<string>('جميع المدارس');
  selectedState = signal<string | null>(null);
  selectedClassNo = signal<string | null>(null);
  tutorialsIds: number[] | null = null;

  // ─── Level ──────────────────────────────────────────────────────────────
  currentLevel = signal<'summary' | 'grade' | 'class' | 'student'>('summary');

  // ─── Student Level State ─────────────────────────────────────────────────
  selectedStudents: { [email: string]: boolean } = {};
  selectedEmails: string[] = [];
  selectAll = false;
  showEmail = false;
  showNum = false;
  showSchool = false;
  pageNumber = 1;
  pageSize = 20;
  isOpenAchievement = false;
  achievementData: { advance: number; success: number; result: number } | null =
    null;

  // ─── School Popup State ──────────────────────────────────────────────────
  schoolsData: any = [];
  isPopupVisible = signal<boolean>(false);
  isLoadingSchool = signal<boolean>(false);
  isExporting = signal<boolean>(false);
  selectedTutorialName = signal<string>('');

  // ─── Computed Tables ────────────────────────────────────────────────────
  gradeRows = computed<GradeRow[]>(() => {
    const students = this.allStudents();
    if (!students.length) return [];

    const map = new Map<string, StudentData[]>();
    students.forEach((s) => {
      const key = s.state || 'غير محدد';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });

    return Array.from(map.entries()).map(([state, list]) => ({
      state,
      studentCount: list.length,
      avgAchievement: this.calcAvgAchievement(list),
      students: list,
      courseSummaries: this.calcCourseSummaries(list),
    }));
  });

  classRows = computed<ClassRow[]>(() => {
    const state = this.selectedState();
    if (!state) return [];
    const students = this.allStudents().filter((s) => s.state === state);
    const map = new Map<string, StudentData[]>();
    students.forEach((s) => {
      const key = s.classNo || 'غير محدد';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries()).map(([classNo, list]) => ({
      classNo,
      studentCount: list.length,
      avgAchievement: this.calcAvgAchievement(list),
      students: list,
      courseSummaries: this.calcCourseSummaries(list),
    }));
  });

  studentRows = computed<StudentData[]>(() => {
    const state = this.selectedState();
    const classNo = this.selectedClassNo();
    let students = this.allStudents();
    if (state) students = students.filter((s) => s.state === state);
    if (classNo) students = students.filter((s) => s.classNo === classNo);
    return students.filter((s) => s.tutorials && s.tutorials.length > 0);
  });

  groupedTutorials = computed(() => {
    const summary = this.schoolSummary();
    if (!summary || !summary.tutotrials) return [];

    const groups: { [key: string]: SchoolTutorialSummary[] } = {};
    summary.tutotrials.forEach((item) => {
      const cat = item.categoryName || 'غير مصنف';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  });

  pagedStudentRows = computed<StudentData[]>(() => {
    const all = this.studentRows();
    const start = (this.pageNumber - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  totalStudentPages = computed(() =>
    Math.ceil(this.studentRows().length / this.pageSize),
  );

  // ─── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.fetchAllSchools();
    this.fetchAllTutorials();
    // Initial data fetch removed to prevent heavy loading. 
    // Data will be fetched upon school selection.
  }

  // ─── Navigation ─────────────────────────────────────────────────────────
  drillToGrade(): void {
    this.currentLevel.set('grade');
  }

  drillToClass(grade: GradeRow): void {
    this.selectedState.set(grade.state);
    this.currentLevel.set('class');
    this.pageNumber = 1;
    this.clearStudentSelection();
  }

  drillToStudent(cls: ClassRow): void {
    this.selectedClassNo.set(cls.classNo);
    this.currentLevel.set('student');
    this.pageNumber = 1;
    this.clearStudentSelection();
  }

  navToSummary(): void {
    this.selectedState.set(null);
    this.selectedClassNo.set(null);
    this.currentLevel.set('summary');
    this.clearStudentSelection();
  }

  navToGrade(): void {
    this.selectedState.set(null);
    this.selectedClassNo.set(null);
    this.currentLevel.set('grade');
    this.clearStudentSelection();
  }

  navToClass(): void {
    this.selectedClassNo.set(null);
    this.currentLevel.set('class');
    this.clearStudentSelection();
  }

  // ─── School Filter ───────────────────────────────────────────────────────
  onSelectSchool(school: { id: number; name: string } | null | number): void {
    // Handle school being just the ID or the object depending on ng-select binding
    const schoolId = typeof school === 'object' ? school?.id : school;

    if (!schoolId) {
      this.selectedSchoolId.set(null);
      this.selectedSchoolName.set('جميع المدارس');
    } else {
      this.selectedSchoolId.set(schoolId);
      // If we only have ID, we might want to find the name in allSchools()
      const found = this.allSchools().find((s) => s.id === schoolId);
      this.selectedSchoolName.set(found?.name || '');
    }

    this.navToSummary();
    this.fetchSchoolSummary();
    this.fetchAllStudents();
  }

  onSelectTutorials(tutorials: any[]): void {
    if (!tutorials || tutorials.length === 0) {
      this.tutorialsIds = null;
    } else {
      this.tutorialsIds = tutorials.map((t) => t.id);
    }
    this.fetchSchoolSummary();
    this.fetchAllStudents();
  }

  // ─── Data Fetch ──────────────────────────────────────────────────────────
  fetchSchoolSummary(): void {
    const schoolId = this.selectedSchoolId();
    this.isLoadingSummary.set(true);
    // Note: Typo 'tutotrials' handled
    this.supervisorService
      .getTotalSchoolStudents('', '', '', schoolId, null, this.tutorialsIds)
      .subscribe({
        next: (res: any) => {
          if (res.statusCode === 200) {
            const data = res.result;
            if (data && data.tutotrials) {
              data.tutotrials = data.tutotrials.map((t: any) => ({
                ...t,
                avgAchievement: Math.round(
                  (t.advancePercentage * t.successPrecentage) / 100,
                ),
              }));
            }
            this.schoolSummary.set(data);
          }
          this.isLoadingSummary.set(false);
        },
        error: () => this.isLoadingSummary.set(false),
      });
  }

  fetchAllStudents(): void {
    const schoolId = this.selectedSchoolId();
    this.isLoading.set(true);
    this.supervisorService
      .getSchoolStudents(
        1,
        1000,
        null,
        null,
        null,
        schoolId,
        this.tutorialsIds,
        true,
        0,
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allStudents.set(res.data || []);
          } else {
            this.allStudents.set([]);
          }
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  fetchAllSchools(): void {
    this.supervisorService.getAllShools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) this.allSchools.set(result);
      },
      error: (err) => console.log(err),
    });
  }

  fetchAllTutorials(): void {
    this.supervisorService.getAllTutorials().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) this.allTutorials.set(res.result);
      },
      error: (err) => console.log(err),
    });
  }

  // ─── Selection ───────────────────────────────────────────────────────────
  clearStudentSelection(): void {
    this.selectedStudents = {};
    this.selectedEmails = [];
    this.selectAll = false;
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedEmails = this.pagedStudentRows().map((s) => s.email);
      this.pagedStudentRows().forEach(
        (s) => (this.selectedStudents[s.email] = true),
      );
    } else {
      this.clearStudentSelection();
    }
  }

  updateSelection(email: string): void {
    if (this.selectedStudents[email]) {
      if (!this.selectedEmails.includes(email)) this.selectedEmails.push(email);
    } else {
      this.selectedEmails = this.selectedEmails.filter((e) => e !== email);
    }
    this.selectAll = this.pagedStudentRows().every(
      (s) => this.selectedStudents[s.email],
    );
  }

  changePage(page: number): void {
    const total = this.totalStudentPages();
    if (page >= 1 && page <= total) this.pageNumber = page;
  }

  getVisiblePages(): (number | null)[] {
    const total = this.totalStudentPages();
    const current = this.pageNumber;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | null)[] = [];
    const left = Math.max(2, current - 2);
    const right = Math.min(total - 1, current + 2);
    pages.push(1);
    if (left > 2) pages.push(null);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push(null);
    pages.push(total);
    return pages;
  }

  // ─── Achievement Popup ───────────────────────────────────────────────────
  openAchievementPopup(advance: number, success: number): void {
    this.achievementData = {
      advance,
      success,
      result: Math.round((advance * success) / 100),
    };
    this.isOpenAchievement = true;
  }

  closeAchievementPopup(): void {
    this.isOpenAchievement = false;
    this.achievementData = null;
  }

  // ─── School Popup Helpers ────────────────────────────────────────────────
  getSchoolDetails(item: SchoolTutorialSummary): void {
    this.selectedTutorialName.set(item.tutorialName);
    this.isPopupVisible.set(true);
    this.schoolsProgressAnalysis(item.id);
  }

  hidePopup() {
    this.isPopupVisible.set(false);
  }

  schoolsProgressAnalysis(tutorailId: number): void {
    this.isLoadingSchool.set(true);
    const schoolId = this.selectedSchoolId();
    this.supervisorService.schoolsProgressAnalysis(tutorailId, schoolId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.schoolsData = result;
          this.isLoadingSchool.set(false);
        } else {
          this.isLoadingSchool.set(false);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSchool.set(false);
      },
    });
  }

  getCategoryTheme(index: number) {
    const themes = [
      {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        icon: 'bg-emerald-600',
        border: 'border-emerald-100',
        gradient: 'from-emerald-600 to-emerald-500',
      },
      {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        icon: 'bg-amber-600',
        border: 'border-amber-100',
        gradient: 'from-amber-600 to-amber-500',
      },
      {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-600',
        border: 'border-blue-100',
        gradient: 'from-blue-600 to-blue-500',
      },
      {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-600',
        border: 'border-purple-100',
        gradient: 'from-purple-600 to-purple-500',
      },
      {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        icon: 'bg-rose-600',
        border: 'border-rose-100',
        gradient: 'from-rose-600 to-rose-500',
      },
    ];
    return themes[index % themes.length];
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  round(n: number): number {
    return Math.round(n);
  }

  calcAvgAchievement(students: StudentData[]): number {
    let total = 0;
    let count = 0;
    students.forEach((s) => {
      (s.tutorials || []).forEach((t: any) => {
        total += Math.round((t.advancePercentage * t.successPrecentage) / 100);
        count++;
      });
    });
    return count > 0 ? Math.round(total / count) : 0;
  }

  calcCourseSummaries(students: StudentData[]): CourseSummary[] {
    const tutorialMap = new Map<
      string,
      {
        totalAchievement: number;
        totalAdvance: number;
        totalSuccess: number;
        count: number;
      }
    >();
    students.forEach((s) => {
      (s.tutorials || []).forEach((t: any) => {
        const key = t.tutorialName;
        if (!tutorialMap.has(key)) {
          tutorialMap.set(key, {
            totalAchievement: 0,
            totalAdvance: 0,
            totalSuccess: 0,
            count: 0,
          });
        }
        const data = tutorialMap.get(key)!;
        data.totalAchievement += Math.round(
          (t.advancePercentage * t.successPrecentage) / 100,
        );
        data.totalAdvance += t.advancePercentage;
        data.totalSuccess += t.successPrecentage;
        data.count++;
      });
    });

    return Array.from(tutorialMap.entries()).map(([name, data]) => ({
      tutorialName: name,
      avgAchievement: Math.round(data.totalAchievement / data.count),
      advancePercentage: Math.round(data.totalAdvance / data.count),
      successPrecentage: Math.round(data.totalSuccess / data.count),
    }));
  }

  // ─── Export ──────────────────────────────────────────────────────────────
  async exportComprehensiveReport(): Promise<void> {
    if (this.isExporting()) return;
    const schoolName = this.selectedSchoolName();
    if (!schoolName) {
      this.toastr.warning('الرجاء اختيار مدرسة أولاً');
      return;
    }

    this.isExporting.set(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const primaryColor = '36b290';
      const secondaryColor = 'e5a53f';

      // 1. Summary Sheet
      const summarySheet = workbook.addWorksheet('المؤشرات العامة');
      summarySheet.views = [{ rightToLeft: true }];
      summarySheet.addRow(['تقرير منصة السالم التعليمية - الملخص العام']).font = {
        bold: true,
        size: 16,
      };
      summarySheet.addRow([`المدرسة: ${schoolName}`]);
      summarySheet.addRow([`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`]);
      summarySheet.addRow([]);

      const summaryHeader = summarySheet.addRow([
        'التصنيف',
        'اسم الدورة',
        'نسبة الإنجاز',
      ]);
      summaryHeader.eachCell((c) => {
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + primaryColor },
        };
        c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      });

      this.groupedTutorials().forEach((group) => {
        group.items.forEach((item) => {
          summarySheet.addRow([
            group.category,
            item.tutorialName,
            item.avgAchievement + '%',
          ]);
        });
      });
      summarySheet.getColumn(1).width = 25;
      summarySheet.getColumn(2).width = 40;
      summarySheet.getColumn(3).width = 15;

      // 2. Grades Sheet
      const gradesSheet = workbook.addWorksheet('أداء الصفوف');
      gradesSheet.views = [{ rightToLeft: true }];
      const gradesHeader = gradesSheet.addRow([
        'الصف الدراسي',
        'عدد الطلاب',
        'متوسط الإنجاز',
      ]);
      gradesHeader.eachCell((c) => {
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + secondaryColor },
        };
        c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      });
      this.gradeRows().forEach((row) => {
        gradesSheet.addRow([row.state, row.studentCount, row.avgAchievement + '%']);
      });
      gradesSheet.getColumn(1).width = 30;
      gradesSheet.getColumn(2).width = 15;
      gradesSheet.getColumn(3).width = 15;

      // 3. Classes Sheet
      const classesSheet = workbook.addWorksheet('أداء الفصول');
      classesSheet.views = [{ rightToLeft: true }];
      const classesHeader = classesSheet.addRow([
        'الصف',
        'الفصل',
        'عدد الطلاب',
        'متوسط الإنجاز',
      ]);
      classesHeader.eachCell((c) => {
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + primaryColor },
        };
        c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      });
      this.gradeRows().forEach((g) => {
        const studentsInGrade = this.allStudents().filter(
          (s) => s.state === g.state,
        );
        const classMap = new Map<string, any[]>();
        studentsInGrade.forEach((s) => {
          const key = s.classNo || 'غير محدد';
          if (!classMap.has(key)) classMap.set(key, []);
          classMap.get(key)!.push(s);
        });
        classMap.forEach((list, classNo) => {
          classesSheet.addRow([
            g.state,
            `فصل ${classNo}`,
            list.length,
            this.calcAvgAchievement(list) + '%',
          ]);
        });
      });
      classesSheet.getColumn(1).width = 25;
      classesSheet.getColumn(2).width = 15;
      classesSheet.getColumn(3).width = 15;
      classesSheet.getColumn(4).width = 15;

      // 4. Students Sheet
      const studentsSheet = workbook.addWorksheet('تفاصيل الطلاب');
      studentsSheet.views = [{ rightToLeft: true }];
      const studentsHeader = studentsSheet.addRow([
        'اسم الطالب',
        'الصف',
        'الفصل',
        'الدورة',
        'نسبة الإنجاز',
      ]);
      studentsHeader.eachCell((c) => {
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF333333' },
        };
        c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      });
      this.allStudents().forEach((s) => {
        (s.tutorials || []).forEach((t: any) => {
          studentsSheet.addRow([
            s.name,
            s.state,
            s.classNo,
            t.tutorialName,
            this.round((t.advancePercentage * t.successPrecentage) / 100) + '%',
          ]);
        });
      });
      studentsSheet.getColumn(1).width = 35;
      studentsSheet.getColumn(2).width = 20;
      studentsSheet.getColumn(3).width = 15;
      studentsSheet.getColumn(4).width = 35;
      studentsSheet.getColumn(5).width = 15;

      // Save File
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `تقرير_شامل_${schoolName}_${new Date().toLocaleDateString('ar-EG')}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (error) {
      console.error(error);
      this.toastr.error('حدث خطأ أثناء تصدير الملف');
    } finally {
      this.isExporting.set(false);
    }
  }

  exportCurrentLevel(): void {
    const level = this.currentLevel();
    const schoolName = this.selectedSchoolName();
    if (level === 'summary') {
      this.exportComprehensiveReport();
    } else if (level === 'grade') {
      this.exportService.exportGradeReport(this.gradeRows(), schoolName);
    } else if (level === 'class') {
      this.exportService.exportClassReport(
        this.classRows(),
        schoolName,
        this.selectedState() || '',
      );
    } else {
      this.exportService.exportTableToExcel(
        this.studentRows(),
        this.selectedState() ?? undefined,
        this.selectedClassNo() ?? undefined,
        schoolName,
      );
    }
  }

  exportSelected(): void {
    const selected = this.pagedStudentRows().filter(
      (s) => this.selectedStudents[s.email],
    );
    if (!selected.length) {
      this.toastr.error('يجب تحديد طلاب أولاً');
      return;
    }
    this.exportService.exportTableToExcel(
      selected,
      this.selectedState() ?? undefined,
      this.selectedClassNo() ?? undefined,
      this.selectedSchoolName(),
    );
  }
}
