import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdminService } from '../../../services/admin.service';
import { SchoolService } from '../../../services/school.service';
import {
  AllFreeSubscriptionStudents,
  FreeSubscriptionStudent,
} from '../../../model/admin-model';

@Component({
  selector: 'app-student-free-subscription',
  standalone: true,
  imports: [FormsModule, NgSelectModule],
  templateUrl: './student-free-subscription.component.html',
  styleUrl: './student-free-subscription.component.scss',
})
export class StudentFreeSubscriptionComponent implements OnInit {
  adminService = inject(AdminService);
  schoolService = inject(SchoolService);

  isLoading: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 10;
  schoolIds: number[] = [];
  keyword: string = '';
  allSchools: any[] = [];

  allData: AllFreeSubscriptionStudents = {} as AllFreeSubscriptionStudents;
  students: FreeSubscriptionStudent[] = [];

  @Output() totalCount: EventEmitter<number> = new EventEmitter<number>();

  ngOnInit(): void {
    this.getStudents();
    this.fetchAllSchools();
  }

  getStudents(): void {
    this.isLoading = true;
    this.adminService
      .getFreeSubscriptionStudents(
        this.pageNumber,
        this.pageSize,
        this.schoolIds,
        this.keyword.trim(),
      )
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.allData = res;
            this.students = res.data;
            this.totalCount.emit(this.allData.totalCount);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  searchStudents(): void {
    this.pageNumber = 1;
    this.getStudents();
  }

  fetchAllSchools(): void {
    this.schoolService.getSystemSchools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSchools = result;
        }
      },
    });
  }

  fliterSchool(event: any) {
    this.schoolIds = event ? [event.id] : [];
    this.pageNumber = 1;
    this.getStudents();
  }

  get totalPages(): number {
    return this.allData?.totalPages || 0;
  }

  getPageRange(): (number | string)[] {
    const total = this.totalPages;
    const current = this.pageNumber;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    if (total <= 1) return [1];

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) {
        range.push(i);
      }
    }
    if (total > 1) {
      range.push(total);
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  onPageSizeChange(): void {
    this.pageNumber = 1;
    this.getStudents();
  }

  changePage(page: any) {
    const pageNum = Number(page);
    if (isNaN(pageNum)) return;

    if (
      pageNum >= 1 &&
      pageNum <= this.totalPages &&
      pageNum !== this.pageNumber
    ) {
      this.pageNumber = pageNum;
      this.getStudents();
    }
  }
}
