import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerAccountantService } from '../../manager-accountant/manager-accountant.service';
import { ExportService } from '../../../shared/services/export.service';

export interface PaymentDetail {
  id: number | null;
  tutorialId: number;
  tutorialName: string;
  amount: number;
}

export interface PaymentOperation {
  id: number;
  studentName: string;
  schoolName: string | null;
  paymentDate: string;
  amount: number;
  discount: number;
  totalAmount: number;
  phone: string;
  paymentStatus: string;
  paymentType: number;
  details: PaymentDetail[];
}

@Component({
  selector: 'app-payment-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-report.component.html',
})
export class PaymentReportComponent implements OnInit {
  managerAccountantService = inject(ManagerAccountantService);
  exportService = inject(ExportService);
  private paymentData = signal<PaymentOperation[]>([]);
  isLoading = signal<boolean>(false);
  schoolFilter = signal('');
  dateFromFilter = signal('');
  dateToFilter = signal('');
  statusFilter = signal('');
  searchFilter = signal('');

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  expandedRows = signal(new Set<number>());
  failedOnlyFilter = signal(false);
  distinctFilter = signal(false); // toggle جديد

  // Computed properties
  uniqueSchools = computed(() => {
    const schools = this.paymentData()
      .map((p) => p.schoolName)
      .filter(
        (school) =>
          school !== null && school !== undefined && school.trim() !== ''
      )
      .filter((school, index, self) => self.indexOf(school) === index);
    return schools as string[];
  });

  filteredData = computed(() => {
    let data = this.paymentData();

    // Apply filters
    if (this.schoolFilter()) {
      data = data.filter((p) => p.schoolName === this.schoolFilter());
    }

    const formatDate = (d: string) => d.split('T')[0];

    if (this.dateFromFilter()) {
      data = data.filter(
        (p) => formatDate(p.paymentDate) >= this.dateFromFilter()
      );
    }

    if (this.dateToFilter()) {
      data = data.filter(
        (p) => formatDate(p.paymentDate) <= this.dateToFilter()
      );
    }

    // if (this.dateFromFilter()) {
    //   data = data.filter(
    //     (p) => new Date(p.paymentDate) >= new Date(this.dateFromFilter())
    //   );
    // }

    // if (this.dateToFilter()) {
    //   data = data.filter(
    //     (p) => new Date(p.paymentDate) <= new Date(this.dateToFilter())
    //   );
    // }

    if (this.statusFilter() !== '') {
      data = data.filter(
        (p) => p.paymentStatus.toString() === this.statusFilter()
      );
    }

    if (this.searchFilter()) {
      const searchTerm = this.searchFilter().toLowerCase();
      data = data.filter(
        (p) =>
          p.studentName.toLowerCase().includes(searchTerm) ||
          p.phone.toLowerCase().includes(searchTerm)
      );
    }

    if (this.failedOnlyFilter()) {
      const grouped = data.reduce((acc, payment) => {
        const key = payment.studentName; // أو studentId لو متاح
        if (!acc[key]) acc[key] = [];
        acc[key].push(payment.paymentStatus);
        return acc;
      }, {} as Record<string, string[]>);

      const failedOnlyStudents = Object.keys(grouped).filter(
        (name) =>
          grouped[name].length > 1 && // شرط انه جرب اكتر من مرة
          !grouped[name].includes('PaymentReceived') // مفيش ولا محاولة نجحت
      );

      data = data.filter((p) => failedOnlyStudents.includes(p.studentName));
    }

    if (this.distinctFilter()) {
      const seen = new Set<string>();
      data = data.filter((p) => {
        if (!seen.has(p.studentName)) {
          seen.add(p.studentName);
          return true;
        }
        return false;
      });
    }

    return data.sort((a, b) => b.id - a.id);
  });

  onFailedOnlyToggle(event: Event) {
    const input = event.target as HTMLInputElement;
    this.failedOnlyFilter.set(input.checked);
  }

  onDistinctToggle(event: Event) {
    const input = event.target as HTMLInputElement;
    this.distinctFilter.set(input.checked);
  }

  // filteredData = computed(() => {
  //   let data = this.paymentData();

  //   // Apply filters
  //   if (this.schoolFilter()) {
  //     data = data.filter((p) => p.schoolName === this.schoolFilter());
  //   }

  //   if (this.dateFromFilter()) {
  //     data = data.filter(
  //       (p) => new Date(p.paymentDate) >= new Date(this.dateFromFilter())
  //     );
  //   }

  //   if (this.dateToFilter()) {
  //     data = data.filter(
  //       (p) => new Date(p.paymentDate) <= new Date(this.dateToFilter())
  //     );
  //   }

  //   if (this.statusFilter() !== '') {
  //     data = data.filter(
  //       (p) => p.paymentStatus.toString() === this.statusFilter()
  //     );
  //   }

  //   if (this.searchFilter()) {
  //     const searchTerm = this.searchFilter().toLowerCase();
  //     data = data.filter(
  //       (p) =>
  //         p.studentName.toLowerCase().includes(searchTerm) ||
  //         p.phone.toLowerCase().includes(searchTerm)
  //     );
  //   }

  //   return data.sort((a, b) => b.id - a.id);
  // });

  paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredData().slice(start, end);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredData().length / this.itemsPerPage())
  );

  statistics = computed(() => {
    const data = this.filteredData();
    return {
      totalOperations: data.length,
      totalAmount: data
        .filter((p) => p.paymentStatus === 'PaymentReceived')
        .reduce((sum, p) => sum + p.totalAmount, 0),

      successfulOperations: data.filter(
        (p) => p.paymentStatus === 'PaymentReceived'
      ).length,
      newfulOperations: data.filter((p) => p.paymentStatus === 'NewPayment')
        .length,
      pendingfulOperations: data.filter((p) => p.paymentStatus === 'Pending')
        .length,

      failedOperations: data.filter((p) => p.paymentStatus === 'PaymentFailed')
        .length,
    };
  });

  Math = Math;

  ngOnInit() {
    this.getAllPayments();
  }
  getAllPayments(): void {
    this.isLoading.set(true);
    this.managerAccountantService.getAllPayments().subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.paymentData.set(result);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  exportData() {
    this.exportService.exportTableToExcelPayment(
      this.filteredData(),
      this.dateFromFilter(),
      this.dateToFilter()
    );
  }
  onSchoolChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.schoolFilter.set(target.value);
    this.currentPage.set(1);
  }

  onDateFromChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.dateFromFilter.set(target.value);
    this.currentPage.set(1);
  }

  onDateToChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.dateToFilter.set(target.value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.statusFilter.set(target.value);
    this.currentPage.set(1);
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchFilter.set(target.value);
    this.currentPage.set(1);
  }

  applyFilters() {
    this.currentPage.set(1);
  }

  clearFilters() {
    this.schoolFilter.set('');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.statusFilter.set('');
    this.searchFilter.set('');
    this.currentPage.set(1);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusText(paymentType: string): string {
    switch (paymentType) {
      case 'Pending':
        return 'قيد التنفيذ';
      case 'PaymentReceived':
        return 'العملية نجحت';
      case 'PaymentFailed':
        return 'العملية فشلت';
      case 'NewPayment':
        return 'عملية جديدة';
      default:
        return 'غير محدد';
    }
  }

  getStatusClass(paymentType: string): string {
    switch (paymentType) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'PaymentReceived':
        return 'bg-green-100 text-green-800';
      case 'PaymentFailed':
        return 'bg-red-100 text-red-800';
      case 'NewPayment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  toggleDetails(paymentId: number) {
    const expanded = new Set(this.expandedRows());
    if (expanded.has(paymentId)) {
      expanded.delete(paymentId);
    } else {
      expanded.add(paymentId);
    }
    this.expandedRows.set(expanded);
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(total);
      }
    }

    return pages;
  }
}
