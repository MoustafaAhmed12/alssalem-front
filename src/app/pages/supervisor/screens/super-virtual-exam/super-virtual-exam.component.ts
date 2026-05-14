import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { SupervisorService } from '../../services/supervisor.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import {
  Student,
  VirtualExamAnalysis,
} from '../../model/school.SchoolStudents';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-super-virtual-exam',
  standalone: true,
  imports: [NgSelectModule, FormsModule],
  templateUrl: './super-virtual-exam.component.html',
})
export class SuperVirtualExamComponent implements OnInit {
  super = inject(SupervisorService);
  allData = signal<VirtualExamAnalysis | null>(null);
  students = signal<Student[]>([]);
  isLoading = signal<boolean>(false);
  totalVirtualExams = signal<number>(0);
  mainSections = signal<{ id: number; name: string }[]>([
    { id: 1, name: 'قدرات' },
    { id: 2, name: 'تحصيلي' },
  ]);
  allSchools = signal<{ id: number; name: string }[]>([]);
  filters = signal<{
    schoolIds: number[];
    categoriesIds: number[];
    studentName: string;
    state: string | null;
    calssNumber: string | null;
    minScorePercent: number | null;
    maxScorePercent: number | null;
    pageIndex: number;
    pageSize: number;
    virtualExamIds: number[];
  }>({
    schoolIds: [],
    categoriesIds: [1, 2],
    studentName: '',
    state: null,
    calssNumber: null,
    minScorePercent: null,
    maxScorePercent: null,
    pageIndex: 1,
    pageSize: 20,
    virtualExamIds: [],
  });
  Math = Math;
  allExams = signal<any[]>([]);
  examsByCategory = computed(() => {
    const selectedCats = this.filters().categoriesIds;
    return this.allExams().filter((exam) =>
      selectedCats.includes(exam.categoryId),
    );
  });

  ngOnInit(): void {
    this.getVirtualExams(this.filters());
    this.fetchAllSchools();
    this.fetchExams();
  }

  fetchExams() {
    forkJoin({
      cat1: this.super.getStudentVirtualExams(1),
      cat2: this.super.getStudentVirtualExams(2),
    }).subscribe({
      next: (res: any) => {
        const exams1 = (res.cat1.result || res.cat1.data || []).map(
          (e: any) => ({ ...e, categoryId: 1 }),
        );
        const exams2 = (res.cat2.result || res.cat2.data || []).map(
          (e: any) => ({ ...e, categoryId: 2 }),
        );
        this.allExams.set([...exams1, ...exams2]);
      },
      error: (err) => {
        console.error('Error fetching exams:', err);
      },
    });
  }

  private normalizeFilters(data: any) {
    const payload: any = {};
    for (const key of Object.keys(data || {})) {
      const val = data[key];
      if (Array.isArray(val)) {
        payload[key] = val.length ? val : null;
        continue;
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        payload[key] = trimmed === '' ? null : trimmed;
        continue;
      }
      // leave numbers, booleans, objects as-is (but treat undefined as null)
      payload[key] = val === undefined ? null : val;
    }
    return payload;
  }

  getVirtualExams(data: any) {
    this.isLoading.set(true);
    const payload = this.normalizeFilters(data);
    this.super.getVirtualExams(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.allData.set(res);
        // API returns a paginated result with `data: Student[]`
        this.students.set(Array.isArray(res?.data) ? res.data : []);
        this.totalVirtualExams.set(res.totalCount ?? 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  getTrail(student: any) {
    if (!student?.examsResults?.length) return null;

    const examIds = this.filters().virtualExamIds;
    let result = student.examsResults[0];

    if (examIds.length > 0) {
      const filtered = student.examsResults.find((r: any) =>
        examIds.includes(r.virtualExamId),
      );
      if (filtered) result = filtered;
    }

    return this.showBestTrail() ? result.bestTrail : result.firstTrail;
  }

  getExamResult(student: any) {
    if (!student?.examsResults?.length) return null;
    const examIds = this.filters().virtualExamIds;
    if (examIds.length > 0) {
      return (
        student.examsResults.find((r: any) =>
          examIds.includes(r.virtualExamId),
        ) || student.examsResults[0]
      );
    }
    return student.examsResults[0];
  }

  getFirstTrail(student: any) {
    return this.getExamResult(student)?.firstTrail;
  }

  getBestTrail(student: any) {
    return this.getExamResult(student)?.bestTrail;
  }

  getImprovement(student: any) {
    const best = this.getBestTrail(student);
    const first = this.getFirstTrail(student);
    if (!best || !first) return 0;
    return best.scorePercent - first.scorePercent;
  }

  showBestTrail = signal(true);
  currentPage = signal(1);
  pageSize = signal(20);

  // Computed signals
  totalStudents = computed(() => this.totalVirtualExams());
  totalPages = computed(() =>
    Math.ceil(this.totalVirtualExams() / this.pageSize()),
  );

  paginatedStudents = computed(() => {
    return this.students();
  });

  showStudentDetails = signal(false);
  selectedStudent = signal<any>(null);

  toggleStudentDetails(student: any) {
    this.selectedStudent.set(student);
    this.showStudentDetails.set(true);
  }

  closeDetails() {
    this.showStudentDetails.set(false);
    this.selectedStudent.set(null);
  }

  round(num: number) {
    return Math.round(num);
  }

  getScoreClass(score: number, passingScore: number = 50): string {
    if (score >= passingScore) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  }

  stats = computed(() => {
    const students = this.students();
    const scores = students.map((s) =>
      s.examsResults.length > 0 ? s.examsResults[0].bestTrail.scorePercent : 0,
    );
    const firstScores = students.map((s) =>
      s.examsResults.length > 0 ? s.examsResults[0].firstTrail.scorePercent : 0,
    );

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highScore = Math.max(...scores);
    const avgFirstScore =
      firstScores.reduce((a, b) => a + b, 0) / firstScores.length;
    const improvement = avgScore - avgFirstScore;

    return {
      totalStudents: students.length,
      averageScore: Math.round(avgScore),
      highestScore: highScore,
      improvementRate: Math.round(improvement),
    };
  });

  // Methods
  toggleTrailType() {
    this.showBestTrail.update((value) => !value);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.filters.update((f) => ({ ...f, pageIndex: this.currentPage() }));
      this.getVirtualExams(this.filters());
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.filters.update((f) => ({ ...f, pageIndex: this.currentPage() }));
      this.getVirtualExams(this.filters());
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.filters.update((f) => ({ ...f, pageIndex: page }));
    this.getVirtualExams(this.filters());
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        for (let i = current - 2; i <= current + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  getInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Called when categories (mainSections) selection changes
  filterCate(event: any) {
    const ids = Array.isArray(event) ? event : [];
    this.filters.update((f: any) => ({
      ...f,
      categoriesIds: ids,
      virtualExamIds: [], // Clear exam selection when category changes
      pageIndex: 1,
    }));
    this.getVirtualExams(this.filters());
  }

  filterExams(event: any) {
    const ids = Array.isArray(event) ? event : [];
    this.filters.update((f: any) => ({
      ...f,
      virtualExamIds: ids,
      pageIndex: 1,
    }));
    this.getVirtualExams(this.filters());
  }

  // Called when school selection changes
  filterSchool(event: any) {
    const ids = Array.isArray(event) ? event : [];
    this.filters.update((f: any) => ({ ...f, schoolIds: ids, pageIndex: 1 }));
    this.getVirtualExams(this.filters());
  }

  // Called when grade/state changes (template uses the name `fliterState`)
  fliterState(event: any) {
    const state = event ?? '';
    this.filters.update((f: any) => ({ ...f, state, pageIndex: 1 }));
    this.getVirtualExams(this.filters());
  }

  // Called when class number changes
  filterClassNo(event: any) {
    const calssNumber = event ?? '';
    this.filters.update((f: any) => ({ ...f, calssNumber, pageIndex: 1 }));
    this.getVirtualExams(this.filters());
  }

  // Called when the student name input value changes
  onStudentNameChange(value: string) {
    this.filters.update((f: any) => ({
      ...f,
      studentName: value,
      pageIndex: 1,
    }));
    this.getVirtualExams(this.filters());
  }

  // Called when min score input changes
  onMinScoreChange(value: any) {
    const num = value === null || value === '' ? null : Number(value);
    const safe = num === null ? null : Number.isNaN(num) ? null : num;
    const next: any = Object.assign({}, this.filters());
    (next as any).minScorePercent = safe;
    (next as any).pageIndex = 1;
    this.filters.set(next);
    this.getVirtualExams(this.filters());
  }

  // Called when max score input changes
  onMaxScoreChange(value: any) {
    const num = value === null || value === '' ? null : Number(value);
    const safe2 = num === null ? null : Number.isNaN(num) ? null : num;
    const next2: any = Object.assign({}, this.filters());
    (next2 as any).maxScorePercent = safe2;
    (next2 as any).pageIndex = 1;
    this.filters.set(next2);
    this.getVirtualExams(this.filters());
  }

  fetchAllSchools(): void {
    this.super.getAllShools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSchools.set(result);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  exportToExcel() {
    this.isLoading.set(true);
    // Fetch all data by setting a very large page size
    const exportFilters = {
      ...this.filters(),
      pageSize: this.totalVirtualExams() || 1000,
      pageIndex: 1,
    };
    const payload = this.normalizeFilters(exportFilters);

    this.super.getVirtualExams(payload).subscribe({
      next: (res) => {
        const allStudents = res.data || [];
        this.generateExcel(allStudents);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  async generateExcel(data: any[]) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('نتائج الاختبارات المحاكية');

    // Add Right-to-Left support
    worksheet.views = [{ rightToLeft: true }];

    // Define Columns
    worksheet.columns = [
      { header: 'اسم الطالب', key: 'name', width: 30 },
      { header: 'ID', key: 'id', width: 10 },
      { header: 'الصف', key: 'state', width: 20 },
      { header: 'الفصل', key: 'classNumber', width: 10 },
      { header: 'اسم الاختبار', key: 'examName', width: 30 },
      { header: 'درجة النجاح %', key: 'passing', width: 15 },
      { header: 'المحاولة الأولى %', key: 'first', width: 15 },
      { header: 'أعلى درجة %', key: 'best', width: 15 },
      { header: 'التحسن %', key: 'improvement', width: 15 },
      { header: 'الحالة', key: 'status', width: 15 },
      { header: 'التاريخ', key: 'date', width: 20 },
    ];

    // Style Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '3b82f6' }, // Blue-500
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Data
    data.forEach((student) => {
      const examRes = this.getExamResult(student);
      const first = this.getFirstTrail(student);
      const best = this.getBestTrail(student);
      const improvement = this.getImprovement(student);

      worksheet.addRow({
        name: student.name,
        id: student.id,
        state: student.state,
        classNumber: student.classNumber,
        examName: examRes?.virtualExamName || '-',
        passing: examRes?.successPercent || 0,
        first: first?.scorePercent || 0,
        best: best?.scorePercent || 0,
        improvement: improvement,
        status: best
          ? best.scorePercent >= examRes.successPercent
            ? 'ناجح'
            : 'لم ينجح'
          : '-',
        date: best ? this.formatDate(best.creationDate) : '-',
      });
    });

    // Style Rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'center' };
        // Alternate row colors
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f3f4f6' }, // Gray-100
          };
        }
      }
    });

    // Write to Buffer and Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(
      blob,
      `نتائج الاختبارات المحاكية_${new Date().toLocaleDateString()}.xlsx`,
    );
  }
}
