import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SupervisorService } from '../../services/supervisor.service';
import { trigger, transition, style, animate } from '@angular/animations';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Student {
  id: number;
  name: string;
  classNo: string;
  state: string;
  phoneNumber: string;
  email: string;
  schoolName: string;
}

@Component({
  selector: 'app-active-status-students',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgSelectModule],
  templateUrl: './active-status-students.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '0.5s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class ActiveStatusStudentsComponent implements OnInit {
  private supervisorService = inject(SupervisorService);
  private route = inject(ActivatedRoute);

  students = signal<Student[]>([]);
  totalCount = signal<number>(0);
  isLoading = signal<boolean>(false);

  // Using signals for filters
  pageNumber = signal<number>(1);
  pageSize = signal<number>(50);
  keyWord = signal<string>('');
  state = signal<string | null>(null);
  classNumber = signal<string | null>(null);
  schoolId = signal<number | null>(null);
  unActiveStudents = signal<number>(3);

  statusTextSignal = computed(() => {
    const s = this.unActiveStudents();
    if (s === 1) return "غير المشتركين";
    if (s === 2) return "غير النشطين";
    if (s === 0) return "النشطين";
    return "الكل";
  });

  allSchools: any[] = [];
  classNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  selectedStudents = signal<{ [email: string]: boolean }>({});
  selectAll = signal<boolean>(false);

  toggleSelectAll() {
    const isAll = !this.selectAll();
    this.selectAll.set(isAll);
    const newSelection: { [email: string]: boolean } = {};
    if (isAll) {
      this.students().forEach((s) => (newSelection[s.email] = true));
    }
    this.selectedStudents.set(newSelection);
  }

  updateSelection(email: string) {
    const current = this.selectedStudents();
    current[email] = !current[email];
    this.selectedStudents.set({ ...current });
    this.selectAll.set(this.students().every((s) => current[s.email]));
  }

  getSelectedCount(): number {
    return Object.values(this.selectedStudents()).filter(Boolean).length;
  }

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

  ngOnInit(): void {
    this.fetchSchools();
    this.route.queryParams.subscribe((params) => {
      const unActiveStudents = params['unActiveStudents'];
      if (unActiveStudents !== undefined && unActiveStudents !== null) {
        this.unActiveStudents.set(Number(unActiveStudents));
      } else {
        this.unActiveStudents.set(3);
      }
      this.loadStudents();
    });
  }

  loadStudents(): void {
    const filter = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      keyWord: this.keyWord(),
      state: this.state(),
      classNumber: this.classNumber(),
      schoolId: this.schoolId(),
      unActiveStudents: this.unActiveStudents(),
    };

    this.isLoading.set(true);
    this.students.set([]);
    this.supervisorService.getSchoolStudentsByActiveStatus(filter).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.students.set(res.data);
          this.totalCount.set(res.totalCount);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  fetchSchools(): void {
    this.supervisorService.getAllShools().subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.allSchools = res.result;
        }
      },
    });
  }

  onFilterChange(): void {
    this.pageNumber.set(1);
    this.selectedStudents.set({});
    this.selectAll.set(false);
    this.loadStudents();
  }

  changePage(page: number): void {
    this.pageNumber.set(page);
    this.selectedStudents.set({});
    this.selectAll.set(false);
    this.loadStudents();
  }

  getVisiblePages(): (number | null)[] {
    const total = this.totalPages();
    const current = this.pageNumber();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
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

  // Replaced by statusTextSignal computed signal above

  async exportSelectedToExcel() {
    const selectedEmails = Object.keys(this.selectedStudents()).filter(
      (email) => this.selectedStudents()[email],
    );
    const selectedData = this.students().filter((s) =>
      selectedEmails.includes(s.email),
    );

    if (selectedData.length === 0) {
      return;
    }

    await this.exportToExcel(selectedData, 'سجل الطلاب المحددين');
  }

  async exportAllToExcel() {
    const filter = {
      pageNumber: 1,
      pageSize: this.totalCount(),
      keyWord: this.keyWord(),
      state: this.state(),
      classNumber: this.classNumber(),
      schoolId: this.schoolId(),
      unActiveStudents: this.unActiveStudents(),
    };

    this.isLoading.set(true);
    this.supervisorService.getSchoolStudentsByActiveStatus(filter).subscribe({
      next: async (res) => {
        if (res.statusCode === 200) {
          await this.exportToExcel(res.data, 'سجل كافة الطلاب');
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  async exportToExcel(dataToExport?: Student[], customTitle?: string) {
    const data = dataToExport || this.students();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('الطلاب', {
      views: [{ rightToLeft: true }],
    });

    // --- Styling Config ---
    const primaryColor = 'FF1E3A8A'; // Blue-900

    // --- 1. Main Title ---
    const subStatValue = this.unActiveStudents();

    const statusText =
      subStatValue === 1
        ? 'غير مشتركين'
        : subStatValue === 2
          ? 'غير نشطين'
          : subStatValue === 0
            ? 'نشطين'
            : 'الكل';

    const mainTitle =
      customTitle ||
      (subStatValue === 1
        ? "سجل غير المشتركين"
        : subStatValue === 2
        ? "سجل الطلاب غير النشطين"
        : subStatValue === 0
        ? "سجل الطلاب النشطين"
        : "سجل كافة الطلاب");

    worksheet.mergeCells('A1:G2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = mainTitle;
    titleCell.font = {
      name: 'Arial',
      size: 20,
      bold: true,
      color: { argb: primaryColor },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // --- 2. Filter Summary Section ---
    worksheet.addRow([]); // Empty row
    const filtersLabelCell = worksheet.getCell('A4');
    filtersLabelCell.value = 'تفاصيل الفلاتر المختارة:';
    filtersLabelCell.font = { bold: true, size: 12 };

    const selectedSchool =
      this.allSchools.find((s) => s.id === this.schoolId())?.name || 'الكل';

    const filterRows = [
      ['المدرسة:', selectedSchool, '', 'الصف الدراسي:', this.state() || 'الكل'],
      [
        'رقم الفصل:',
        this.classNumber() || 'الكل',
        '',
        'حالة الطلاب:',
        statusText,
      ],
      [
        'كلمة البحث:',
        this.keyWord() || 'لا يوجد',
        '',
        'إجمالي العدد:',
        this.totalCount() + ' طالب',
      ],
    ];

    filterRows.forEach((row) => {
      const addedRow = worksheet.addRow(row);
      addedRow.font = { name: 'Arial', size: 10 };
      addedRow.getCell(1).font = { bold: true, color: { argb: 'FF64748B' } };
      addedRow.getCell(4).font = { bold: true, color: { argb: 'FF64748B' } };
    });

    worksheet.addRow([]); // Empty row before table

    // --- 3. Table Headers ---
    const headerRow = worksheet.addRow([
      '#',
      'الاسم',
      'البريد الإلكتروني',
      'رقم الجوال',
      'المدرسة',
      'الصف',
      'الفصل',
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' },
      }; // Blue-600
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // --- 4. Table Data ---
    data.forEach((student, index) => {
      const row = worksheet.addRow([
        index + 1,
        student.name,
        student.email || '-',
        student.phoneNumber || '-',
        student.schoolName,
        student.state || '-',
        student.classNo,
      ]);

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // --- Column Widths ---
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 40;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 10;

    // --- Save File ---
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `${mainTitle} - ${new Date().toLocaleDateString('ar-EG')}.xlsx`,
    );
  }
}
