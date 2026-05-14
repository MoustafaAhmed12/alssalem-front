import { NgClass } from '@angular/common';
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
  selector: 'app-home-supervisor',
  standalone: true,
  imports: [FormsModule, NgClass, RouterLink, NgSelectModule],
  templateUrl: './home-supervisor.component.html',
  styleUrl: './home-supervisor.component.scss',
})
export class HomeSupervisorComponent implements OnInit {
  supervisorService = inject(SupervisorService);
  exportService = inject(ExportService);
  toastr = inject(ToastrService);
  allData: SchoolSchoolStudents = {} as SchoolSchoolStudents;
  allStudents: StudentData[] = [];
  allSchools: { id: number; name: string }[] = [];
  allTutorials: any[] = [];
  isLoading = signal<boolean>(false);
  selectedEmails: string[] = [];
  isOpenEmail: boolean = false;
  isLoadingEmail: boolean = false;
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
  content: string = '';
  subject: string = '';
  schoolName: string = '';
  isExporting: boolean = false;
  showSchool: boolean = false;
  showEmail: boolean = false;
  showNum: boolean = false;
  tutorialsIds: number[] | null = null;
  descending: boolean = true;
  orderBy: number | null = 3;

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedEmails = this.allStudents.map((student) => student.email);
      this.allStudents.forEach(
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
    this.selectAll = this.allStudents.every(
      (s) => this.selectedStudents[s.email],
    );
  }

  ngOnInit(): void {
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
    this.fetchAllTutorials();
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
    console.log(this.schoolId);
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
            this.allData = res;
            this.totalPages = this.allData.totalPages;
            this.allStudents = (this.allData.data || [])
              .map((student) => ({
                ...student,
                tutorials: student.tutorials
                  ? Array.from(
                      new Map(student.tutorials.map((t) => [t.id, t])).values(),
                    ).sort(
                      (a, b) => this.getOrderValue(b) - this.getOrderValue(a),
                    )
                  : [],
              }))
              .filter(
                (student) => student.tutorials && student.tutorials.length > 0,
              );
            this.isLoading.set(false);
            this.totalCount = this.allData.totalCount;
            this.calculateTotalPages();
            if (this.isExporting) {
              this.exportService.exportTableToExcel(
                this.allStudents,
                this.state ?? undefined,
                this.classNo ?? undefined,
                this.schoolName,
              );
              this.isExporting = false;
            }
            this.fetchAllSchools();
          } else {
            this.toastr.error('لا يوجد طلاب حالياً');
            this.allStudents = [];
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

  // Returns page numbers to display; null means show '...' ellipsis
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
      this.allData.totalCount,
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.tutorialsIds,
      this.descending,
      this.orderBy,
    );
  }

  fetchAllSchools(): void {
    this.supervisorService.getAllShools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSchools = result;
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
          this.allTutorials = Array.from(
            new Map(res.result.map((t: any) => [t.id, t])).values(),
          );
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  hideEmail(): void {
    this.isOpenEmail = false;
  }
  openEmail(): void {
    if (this.selectedEmails.length === 0) {
      this.toastr.error('يجب تحدد طلاب');
    } else {
      this.subject = '';
      this.content = '';
      this.isOpenEmail = true;
    }
  }
  sendEmail(): void {
    if (!this.subject || !this.content) {
      this.toastr.error('يجب ادخال البيانات');
      return;
    }
    this.isLoadingEmail = true;
    this.content
      .split('\n')
      .filter((line: any) => line.trim() !== '')
      .map((line: any) => `<p dir="rtl">${line}</p>`)
      .join('');
    const info = {
      subject: this.subject,
      content: this.content,
      studentsEmails: this.selectedEmails,
    };
    this.supervisorService.sendStudentsEmail(info).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.toastr.success(result);
          this.isOpenEmail = false;
          this.isLoadingEmail = false;
        } else {
          this.isLoadingEmail = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingEmail = false;
      },
    });
  }

  round(num: number): number {
    return Math.round(num);
  }

  getOrderColumnName(): string {
    switch (this.orderBy) {
      case 1:
        return 'نسبة التقدم';
      case 2:
        return 'نسبة النجاح';
      default:
        return 'نسبة الإنجاز';
    }
  }

  getOrderValue(tutorial: any): number {
    switch (this.orderBy) {
      case 1:
        return tutorial.advancePercentage;
      case 2:
        return tutorial.successPrecentage;
      default:
        return tutorial.score;
    }
  }

  openAchievementPopup(advance: number, success: number, result: number): void {
    this.achievementData = {
      advance,
      success,
      result,
    };
    this.isOpenAchievement = true;
  }

  closeAchievementPopup(): void {
    this.isOpenAchievement = false;
    this.achievementData = null;
  }
}
