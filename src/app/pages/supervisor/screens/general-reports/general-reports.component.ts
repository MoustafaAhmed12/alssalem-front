import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { SupervisorService } from '../../services/supervisor.service';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExportService } from '../../../../shared/services/export.service';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { StudentData } from '../../model/school.SchoolStudents';

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

@Component({
  selector: 'app-general-reports',
  standalone: true,
  imports: [FormsModule, RouterLink, NgSelectModule, DatePipe],
  templateUrl: './general-reports.component.html',
  styleUrl: './general-reports.component.scss',
})
export class GeneralReportsComponent implements OnInit {
  supervisorService = inject(SupervisorService);
  exportService = inject(ExportService);
  toastr = inject(ToastrService);

  // ─── Data ───────────────────────────────────────────────────────────────
  allSchools = signal<{ id: number; name: string }[]>([]);
  allStudents = signal<StudentData[]>([]);
  allTutorials = signal<any[]>([]);
  isLoading = signal(false);
  currentDate = new Date();

  // ─── Filters ────────────────────────────────────────────────────────────
  selectedSchoolId = signal<number | null>(null);
  selectedSchoolName = signal<string>('');
  selectedState = signal<string | null>(null);
  selectedClassNo = signal<string | null>(null);
  tutorialsIds: number[] | null = null;

  // ─── Level ──────────────────────────────────────────────────────────────
  currentLevel = signal<'grade' | 'class' | 'student'>('grade');

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
  isExportingAll = false;
  totalItems = signal(0);

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

  pagedStudentRows = computed<StudentData[]>(() => {
    return this.studentRows();
  });

  totalStudentPages = computed(() => Math.ceil(this.totalItems() / this.pageSize));

  // ─── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.fetchAllSchools();
    this.fetchAllTutorials();
  }

  // ─── Navigation ─────────────────────────────────────────────────────────
  drillToClass(grade: GradeRow): void {
    this.selectedState.set(grade.state);
    this.currentLevel.set('class');
    this.pageNumber = 1;
    this.clearStudentSelection();
    this.fetchAllStudents();
  }

  drillToStudent(cls: ClassRow): void {
    this.selectedClassNo.set(cls.classNo);
    this.currentLevel.set('student');
    this.pageNumber = 1;
    this.clearStudentSelection();
    this.fetchAllStudents();
  }

  navToGrade(): void {
    this.selectedState.set(null);
    this.selectedClassNo.set(null);
    this.currentLevel.set('grade');
    this.clearStudentSelection();
    this.fetchAllStudents();
  }

  navToClass(): void {
    this.selectedClassNo.set(null);
    this.currentLevel.set('class');
    this.clearStudentSelection();
    this.fetchAllStudents();
  }

  // ─── School Filter ───────────────────────────────────────────────────────
  onSelectSchool(school: { id: number; name: string } | null): void {
    if (!school) {
      this.selectedSchoolId.set(null);
      this.selectedSchoolName.set('');
      this.allStudents.set([]);
      this.currentLevel.set('grade');
      return;
    }
    this.selectedSchoolId.set(school.id);
    this.selectedSchoolName.set(school.name);
    this.navToGrade();
  }

  onSelectTutorials(tutorials: any[]): void {
    if (!tutorials || tutorials.length === 0) {
      this.tutorialsIds = null;
    } else {
      this.tutorialsIds = tutorials.map((t) => t.id);
    }
    if (this.selectedSchoolId()) {
      this.fetchAllStudents();
    }
  }

  // ─── Data Fetch (load ALL students once for client-side grouping) ────────
  fetchAllStudents(): void {
    const schoolId = this.selectedSchoolId();
    if (!schoolId) return;
    const isStudentLevel = this.currentLevel() === 'student';
    const page = isStudentLevel ? this.pageNumber : 1;
    const size = isStudentLevel ? this.pageSize : 1000;

    this.isLoading.set(true);
    this.supervisorService
      .getSchoolStudents(
        page,
        size,
        null,
        this.selectedState(),
        this.selectedClassNo(),
        schoolId,
        this.tutorialsIds,
        true,
        0,
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allStudents.set(res.data || []);
            this.totalItems.set(res.totalCount || res.total || 0);
          } else {
            this.allStudents.set([]);
            this.totalItems.set(0);
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
    if (page >= 1 && page <= total) {
      this.pageNumber = page;
      this.fetchAllStudents();
    }
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
  openAchievementPopup(
    advance: number,
    success: number,
    result?: number,
  ): void {
    this.achievementData = {
      advance,
      success,
      result:
        result !== undefined ? result : this.round((advance * success) / 100),
    };
    this.isOpenAchievement = true;
  }

  closeAchievementPopup(): void {
    this.isOpenAchievement = false;
    this.achievementData = null;
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
        total += this.round((t.advancePercentage * t.successPrecentage) / 100);
        count++;
      });
    });
    return count > 0 ? this.round(total / count) : 0;
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
        data.totalAchievement += this.round(
          (t.advancePercentage * t.successPrecentage) / 100,
        );
        data.totalAdvance += t.advancePercentage;
        data.totalSuccess += t.successPrecentage;
        data.count++;
      });
    });

    return Array.from(tutorialMap.entries()).map(([name, data]) => ({
      tutorialName: name,
      avgAchievement: this.round(data.totalAchievement / data.count),
      advancePercentage: this.round(data.totalAdvance / data.count),
      successPrecentage: this.round(data.totalSuccess / data.count),
    }));
  }

  // ─── Export ──────────────────────────────────────────────────────────────
  exportCurrentLevel(): void {
    const level = this.currentLevel();
    const schoolName = this.selectedSchoolName();
    if (level === 'grade') {
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
