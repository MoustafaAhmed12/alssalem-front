import { DatePipe, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { SupervisorService } from '../../services/supervisor.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExportService } from '../../../../shared/services/export.service';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  SchoolSchoolStudents,
  StudentData,
} from '../../model/school.SchoolStudents';

@Component({
  selector: 'app-teacher-reports',
  standalone: true,
  imports: [FormsModule, RouterLink, NgSelectModule, DatePipe, NgClass],
  templateUrl: './teacher-reports.component.html',
})
export class TeacherReportsComponent implements OnInit {
  supervisorService = inject(SupervisorService);
  exportService = inject(ExportService);
  toastr = inject(ToastrService);
  allData = signal<SchoolSchoolStudents>({} as SchoolSchoolStudents);
  allStudents = signal<StudentData[]>([]);
  allSchools = signal<{ id: number; name: string }[]>([]);
  allTutorials = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  selectedEmails: string[] = [];
  isOpenAchievement: boolean = false;
  achievementData: { advance: number; success: number; result: number } | null =
    null;
  selectedStudents: { [email: string]: boolean } = {};
  classNumbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  selectAll: boolean = false;
  classNo: string | null = null;
  state: string | null = null;
  schoolId: number | null = null;
  pageNumber: number = 1;
  pageSize: number = 20;
  keywork: string | null = null;
  totalPages: number = 1;
  totalCount: number = 0;
  totalPagesArray: number[] = [];
  schoolName: string = '';
  isExporting: boolean = false;
  showSchool: boolean = false;
  showEmail: boolean = false;
  showNum: boolean = false;
  tutorialsIds: number[] | null = null;
  descending: boolean = true;
  orderBy: number | null = 1;
  currentDate = new Date();

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedEmails = this.allStudents().map((student) => student.email);
      this.allStudents().forEach(
        (student) => (this.selectedStudents[student.email] = true),
      );
    } else {
      this.selectedEmails = [];
      this.selectedStudents = {};
    }
  }

  updateSelection(studentEmail: string) {
    if (this.selectedStudents[studentEmail]) {
      if (!this.selectedEmails.includes(studentEmail)) {
        this.selectedEmails.push(studentEmail);
      }
    } else {
      this.selectedEmails = this.selectedEmails.filter(
        (email) => email !== studentEmail,
      );
    }
    this.selectAll = this.allStudents().every(
      (s) => this.selectedStudents[s.email],
    );
  }

  ngOnInit(): void {
    this.fetchAllSchools();
    this.fetchAllTutorials();
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }

  searchName() {
    this.pageNumber = 1;
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }

  filterTutorials() {
    this.pageNumber = 1;
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }
  fliterState(item: string) {
    this.state = item;
    this.pageNumber = 1;
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }
  filterClassNo(item: string) {
    this.classNo = item;
    this.pageNumber = 1;
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }
  filterSchool(item: { id: number; name: string }) {
    this.schoolId = item?.id;
    this.schoolName = item?.name;
    this.pageNumber = 1;
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }

  filterOrderBy(value: number) {
    this.orderBy = value;
    this.pageNumber = 1;
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }

  filterDescending() {
    this.pageNumber = 1;
    this.getSchoolStudents(
      this.pageNumber,
      this.pageSize,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }

  getSchoolStudents(
    pageNumber: number,
    pageSize: number,
    keywork: string | null,
    state: string | null,
    classNo: string | null,
    schoolId: number | null,
    tutorialsIds: number[] | null = null,
    descending: boolean = true,
    orderBy: number | null = 0,
  ): void {
    this.isLoading.set(true);
    this.supervisorService
      .getSchoolStudents(
        pageNumber,
        pageSize,
        keywork || null,
        state || null,
        classNo || null,
        schoolId || null,
        tutorialsIds,
        descending,
        orderBy,
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allData.set(res);
            this.totalPages = this.allData().totalPages;
            this.allStudents.set(
              (this.allData().data || []).filter(
                (student) => student.tutorials && student.tutorials.length > 0,
              ),
            );
            this.isLoading.set(false);
            this.totalCount = this.allData().totalCount;
            this.calculateTotalPages();
            if (this.isExporting) {
              this.exportService.exportTableToExcel(
                this.allStudents(),
                this.state ?? undefined,
                this.classNo ?? undefined,
                this.schoolName,
              );
              this.isExporting = false;
            }
          } else {
            this.toastr.error('لا يوجد طلاب حالياً');
            this.allStudents.set([]);
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.set(false);
        },
      });
  }

  calculateTotalPages() {
    this.totalPagesArray = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1,
    );
  }

  getVisiblePages(): (number | null)[] {
    const total = this.totalPages;
    const current = this.pageNumber;
    if (total <= 7) {
      return this.totalPagesArray;
    }
    const pages: (number | null)[] = [];
    const delta = 2; // neighbors around current page

    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    pages.push(1);

    if (left > 2) pages.push(null); // left ellipsis

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < total - 1) pages.push(null); // right ellipsis

    pages.push(total);

    return pages;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.getSchoolStudents(
        this.pageNumber,
        this.pageSize,
        this.keywork,
        this.state,
        this.classNo,
        this.schoolId,
        this.tutorialsIds,
        this.descending,
        this.orderBy,
      );
    }
  }
  exportTable(): void {
    this.isExporting = true;
    this.getSchoolStudents(
      1,
      this.allData().totalCount,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }
  exportSelected(): void {
    const selected = this.allStudents().filter(
      (student) => this.selectedStudents[student.email],
    );
    if (selected.length === 0) {
      this.toastr.error('يجب تحديد طلاب أولاً');
      return;
    }
    this.exportService.exportTableToExcel(
      selected,
      this.state ?? undefined,
      this.classNo ?? undefined,
      this.schoolName,
    );
  }

  fetchAllSchools(): void {
    this.supervisorService.getAllShools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSchools.set(result);
          if (this.allSchools().length === 1 && !this.schoolId) {
            this.filterSchool(this.allSchools()[0]);
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  fetchAllTutorials(): void {
    this.supervisorService.getAllTutorials().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.allTutorials.set(res.result);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  round(num: number): number {
    return Math.round(num);
  }

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
}
