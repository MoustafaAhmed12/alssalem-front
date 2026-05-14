import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import {
  AllRegisterAnalyasis,
  ExamAnalyasis,
  RegisterAnalyasis,
} from '../../model/admin-model';
import { ExportService } from '../../../../shared/services/export.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent implements OnInit {
  adminService = inject(AdminService);
  exportService = inject(ExportService);
  isLoading = signal<boolean>(false);
  isLoadingExam = signal<boolean>(false);
  allStatisticsSchool: RegisterAnalyasis[] = [];
  allData: AllRegisterAnalyasis = {} as AllRegisterAnalyasis;
  examResult: ExamAnalyasis = {} as ExamAnalyasis;
  pageNumber: number = 1;
  pageSize: number = 10;
  startDate: string = '';
  endDate: string = '';
  keyword: string = '';
  isExporting: boolean = false;

  ngOnInit(): void {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.endDate = `${year}-${month}-${day}`;
    this.getRegisterAnalyasis(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword
    );
    this.studentExamResult(this.startDate, this.endDate);
  }
  getRegisterAnalyasis(
    pageNumber: number,
    pageSize: number,
    startDate: string,
    endDate: string,
    keyWord: string
  ): void {
    this.isLoading.set(true);
    this.adminService
      .getRegisterAnalyasis(pageNumber, pageSize, startDate, endDate, keyWord)
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allData = res;
            this.allStatisticsSchool = [...this.allData.data];
            this.isLoading.update((v) => (v = false));
            if (this.isExporting) {
              this.exportService.exportTableToExcelSchools(
                this.allStatisticsSchool,
                this.startDate,
                this.endDate
              );
              this.isExporting = false;
            }
          } else {
            this.isLoading.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
  }

  exportTable(): void {
    this.isExporting = true;
    this.getRegisterAnalyasis(
      1,
      this.allData.totalCount,
      this.startDate,
      this.endDate,
      this.keyword
    );
  }

  get totalPages(): number {
    return Math.ceil(this.allData.totalCount / this.pageSize);
  }
  getPageRange(): number[] {
    const rangeSize = 6;
    const start = Math.max(0, this.pageNumber - Math.floor(rangeSize / 2));
    const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.getRegisterAnalyasis(
        this.pageNumber,
        this.pageSize,
        this.startDate,
        this.endDate,
        this.keyword
      );
    }
  }

  studentExamResult(startDate: string, endDate: string): void {
    this.isLoadingExam.set(true);
    this.adminService.studentExamResult(startDate, endDate).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.examResult = result;
          this.isLoadingExam.set(false);
        } else {
          this.isLoadingExam.set(false);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingExam.set(false);
      },
    });
  }

  selectEnd(end: string): void {
    this.endDate = end;
    this.pageNumber = 1;
    this.getRegisterAnalyasis(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword
    );
    this.studentExamResult(this.startDate, this.endDate);
  }
  selectStart(start: string): void {
    this.startDate = start;
    this.pageNumber = 1;
    this.getRegisterAnalyasis(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword
    );
    this.studentExamResult(this.startDate, this.endDate);
  }

  search(): void {
    this.pageNumber = 1;
    this.getRegisterAnalyasis(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword
    );
  }
}
