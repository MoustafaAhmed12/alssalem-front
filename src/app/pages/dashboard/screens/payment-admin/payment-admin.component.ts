import { Component, OnInit, inject, signal } from '@angular/core';

import {
  AllPaymentInfo,
  ID_Name,
  PaymentRecord,
} from '../../model/admin-model';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../services/payment.service';

import { ExportService } from '../../../../shared/services/export.service';
import { SchoolService } from '../../services/school.service';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-payment-admin',
  standalone: true,
  imports: [NgClass, CurrencyPipe, NgSelectModule, DatePipe, FormsModule],
  templateUrl: './payment-admin.component.html',
  styleUrl: './payment-admin.component.scss',
})
export class PaymentAdminComponent implements OnInit {
  paymentService = inject(PaymentService);
  schoolService = inject(SchoolService);
  exportService = inject(ExportService);
  toastr = inject(ToastrService);

  isLoading = signal<boolean>(false);
  isLoading1: boolean = false;
  allSchools: ID_Name[] = [];

  modalDetails: boolean = false;
  paymentDetails: any;
  totalMoney: number = 0;
  allPayments: PaymentRecord[] = [];
  displayedData: PaymentRecord[] = [];
  allData: AllPaymentInfo = {} as AllPaymentInfo;

  pageNumber: number = 1;
  pageSize: number = 20;
  startDate: string = '';
  endDate: string = '';
  keyword: string = '';
  isExporting: boolean = false;
  schoolsIds: number[] = [];
  status: 0 | 1 | 2 | null = null;
  showUniqueOnly: boolean = false;

  constructor() {}
  ngOnInit(): void {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.endDate = `${year}-${month}-${day}`;

    this.getAllPayments(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword,
      this.schoolsIds,
      this.status
    );
    this.fetchAllSchools();
  }

  toggleUnique(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      if (input.checked) {
        this.filterUniqueStudents();
      } else {
        this.displayedData = [...this.allPayments];
      }
    }
  }

  filterUniqueStudents() {
    const uniqueStudents = new Map<string, any>();
    for (const student of this.allPayments) {
      if (
        student.paymentStatus === 1 &&
        !uniqueStudents.has(student.studentName)
      ) {
        uniqueStudents.set(student.studentName, student);
      }
    }
    this.displayedData = Array.from(uniqueStudents.values());
  }

  showModalDetails(paymentId: any): void {
    this.getPaymentById(paymentId);
    this.modalDetails = true;
  }
  hideModalDetails(): void {
    this.modalDetails = false;
  }

  getPaymentById(paymentId: any): void {
    this.isLoading1 = true;
    this.paymentService.getPaymentById(paymentId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          this.isLoading1 = false;
          this.paymentDetails = result;
        } else {
          this.toastr.error(msg);
          this.isLoading1 = false;
        }
      },
    });
  }

  /////////////////////////////////////

  getAllPayments(
    pageNumber: number,
    pageSize: number,
    startDate: string,
    endDate: string,
    keyWord: string,
    schoolsIds: number[],
    status: number | null
  ): void {
    this.isLoading.set(true);
    this.paymentService
      .getAllPayments(
        pageNumber,
        pageSize,
        startDate,
        endDate,
        keyWord,
        schoolsIds,
        status
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allData = res;
            this.allPayments = [...this.allData.data];
            this.displayedData = [...this.allPayments];
            this.totalMoney = this.allData.totalAmount;
            this.isLoading.update((v) => (v = false));
            if (this.isExporting) {
              this.exportService.exportTableToExcelPayment(
                this.allPayments,
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

  checkPaymentStatus(paymentId: number) {
    this.isLoading1 = true;
    this.paymentService.checkPaymentStatus(paymentId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          this.isLoading1 = false;
          this.paymentDetails = result;
        } else {
          this.toastr.error(msg);
          this.isLoading1 = false;
        }
      },
    });
  }

  exportTable(): void {
    this.isExporting = true;
    this.getAllPayments(
      1,
      this.allData.totalCount,
      this.startDate,
      this.endDate,
      this.keyword,
      this.schoolsIds,
      this.status
    );
  }

  selectEnd(end: string): void {
    this.endDate = end;
    this.pageNumber = 1;
    this.getAllPayments(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword,
      this.schoolsIds,
      this.status
    );
  }
  selectStart(start: string): void {
    this.startDate = start;
    this.pageNumber = 1;
    this.getAllPayments(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword,
      this.schoolsIds,
      this.status
    );
  }

  search(): void {
    this.pageNumber = 1;
    this.getAllPayments(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword,
      this.schoolsIds,
      this.status
    );
  }

  fliterSchools(items: { id: number; name: string }[]) {
    this.schoolsIds = items.map((s) => s.id);
    this.pageNumber = 1;
    this.getAllPayments(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword,
      this.schoolsIds,
      this.status
    );
  }
  fliterState(item: any) {
    this.status = item;
    this.pageNumber = 1;
    this.getAllPayments(
      this.pageNumber,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.keyword,
      this.schoolsIds,
      this.status
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
      this.getAllPayments(
        this.pageNumber,
        this.pageSize,
        this.startDate,
        this.endDate,
        this.keyword,
        this.schoolsIds,
        this.status
      );
    }
  }

  fetchAllSchools(): void {
    this.schoolService.getSystemSchools().subscribe({
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
}
