import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SchoolAdminService } from '../../services/school-admin.service';
import { ToastrService } from 'ngx-toastr';
import { ExportService } from '../../../../shared/services/export.service';
import { NgClass } from '@angular/common';
export interface Data {
  schools: School[];
  tutorials: Tutorial[];
  totalAllowedStudents: number;
  allowedStudents: number;
}

export interface School {
  id: number;
  name: string;
}

export interface Tutorial {
  id: number;
  name: string;
}
interface SchoolStudents {
  id: number;
  name: string;
  email: string;
  classNumber: string;
  grade: string;
  schoolName: string;
  phoneNumber: string;
}

export interface SchoolDataStudents {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: SchoolStudents[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
type dataFilter = {
  pageNumber: number;
  pageSize: number;
  // keyWord: string;
  grade?: string;
  classNumber?: string;
  schoolsIds: number[] | null;
};
@Component({
  selector: 'app-schools-students',
  standalone: true,
  imports: [NgSelectModule, FormsModule, NgClass],
  templateUrl: './schools-students.component.html',
  styleUrl: './schools-students.component.scss',
})
export class SchoolsStudentsComponent {
  schoolAdminService = inject(SchoolAdminService);
  toastr = inject(ToastrService);
  exportService = inject(ExportService);

  classNumbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  allData: SchoolDataStudents = {} as SchoolDataStudents;
  allStudents: SchoolStudents[] = [];
  isLoading = signal<boolean>(false);
  isExporting = signal<boolean>(false);
  isLoadingData = signal<boolean>(false);
  schoolId: number = 0;
  keywork: string = '';
  totalPages: number = 1;
  totalCount: number = 0;
  schoolName: string = '';
  msg: string = '';
  totalPagesArray: number[] = [];
  data: dataFilter = {} as dataFilter;
  selectAll: boolean = false;
  selectedStudentIds: number[] = [];
  tutorialIds: number[] = [];
  isOpen: boolean = false;
  isLoadingSub: boolean = false;
  dataTutorialSchools: Data = {} as Data;
  isAll = signal<boolean>(false);
  ngOnInit(): void {
    this.data = {
      pageNumber: 1,
      pageSize: 50,
      schoolsIds: null,
    };
    this.getSchoolStudents(this.data);
    this.getTutorialsAndSchools();
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      // لو اختار الكل
      this.selectedStudentIds = this.allStudents.map((student) => student.id);
    } else {
      // لو لغى الكل
      this.selectedStudentIds = [];
    }
  }

  updateSelection(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      // أضف الطالب للمصفوفة
      if (!this.selectedStudentIds.includes(id)) {
        this.selectedStudentIds.push(id);
      }
    } else {
      // اشيله من المصفوفة
      this.selectedStudentIds = this.selectedStudentIds.filter(
        (studentId) => studentId !== id
      );
    }

    // تحديث حالة الـ selectAll
    this.selectAll = this.selectedStudentIds.length === this.allStudents.length;
  }

  toggleAll() {
    this.isAll.set(!this.isAll());
    if (this.isAll()) {
      this.data.pageNumber = 1;
      this.data.pageSize = this.allData.totalCount;
      this.getSchoolStudents(this.data);
      this.selectedStudentIds = this.allStudents.map((student) => student.id);
    } else {
      this.data.pageNumber = 1;
      this.data.pageSize = 50;
      this.getSchoolStudents(this.data);
      this.selectedStudentIds = [];
    }
  }

  getSchoolStudents(data: dataFilter): void {
    this.isLoading.set(true);
    this.schoolAdminService.getSchoolStudents(data).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.allData = res;
          this.totalPages = this.allData.totalPages;
          this.allStudents = [...this.allData.data];
          this.isLoading.set(false);
          this.totalCount = this.allData.totalCount;
          this.calculateTotalPages();
          if (this.isExporting()) {
            this.exportService.exportTableToExcel(
              this.allStudents,
              this.data.grade,
              this.data.classNumber,
              this.schoolName
            );
            this.isExporting.set(false);
          }
          // this.fetchAllSchools();
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

  filterSchool(item: { id: number; name: string }[]) {
    this.schoolId = item.map((school) => school.id)[0];
    this.schoolName = item.map((school) => school.name)[0];
    this.data.schoolsIds = item.map((school) => school.id);
    this.data.pageNumber = 1;
    if (this.data.schoolsIds.length === 0) {
      this.data.schoolsIds = null;
    }
    this.getSchoolStudents(this.data);
  }

  fliterState(item: string) {
    this.data.pageNumber = 1;
    this.data.grade = item;
    this.getSchoolStudents(this.data);
  }
  filterClassNo(item: string) {
    this.data.pageNumber = 1;
    this.data.classNumber = item;
    this.getSchoolStudents(this.data);
  }

  calculateTotalPages() {
    this.totalPagesArray = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }

  getPageRange(): number[] {
    const rangeSize = 6;
    const start = Math.max(0, this.data.pageNumber - Math.floor(rangeSize / 2));
    const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.data.pageNumber) {
      this.data.pageNumber = page;
      this.getSchoolStudents(this.data);
    }
  }
  exportTable(): void {
    this.isExporting.set(true);
    this.data.pageNumber = 1;
    this.data.pageSize = this.allData.totalCount;
    this.getSchoolStudents(this.data);
  }

  selectAllTutorials() {
    this.tutorialIds = this.dataTutorialSchools.tutorials.map((t) => t.id);
  }

  deselectAllTutorials() {
    this.tutorialIds = [];
  }

  open(): void {
    if (this.selectedStudentIds.length === 0) {
      this.toastr.error('يجب تحديد الطلاب');
      return;
    }
    this.isOpen = true;
  }
  hide(): void {
    this.isOpen = false;
  }

  addSub(): void {
    if (this.tutorialIds.length === 0) {
      this.toastr.error('يجب تحديد الدورات');
      return;
    }

    const info = {
      studentsId: this.selectedStudentIds,
      tutorialsIds: this.tutorialIds,
    };
    console.log(info);
    this.isLoadingSub = true;
    this.schoolAdminService.addSubscribe(info).subscribe({
      next: ({ statusCode }) => {
        if (statusCode === 200) {
          this.isOpen = false;
          this.data.pageNumber = 1;
          this.data.pageSize = 15;
          this.getSchoolStudents(this.data);
          this.toastr.success('تم الاشتراك في الدورات بنجاح');
          this.isLoadingSub = false;
          this.selectedStudentIds = [];
          this.tutorialIds = [];
          this.selectAll = false;
        } else {
          this.msg = 'لقد تخطيت عدد الطلبة المسموح به';
          this.toastr.error(this.msg);
          this.isLoadingSub = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSub = false;
      },
    });
  }

  getTutorialsAndSchools(): void {
    this.isLoadingData.set(true);
    this.schoolAdminService.getTutorialsAndSchools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.dataTutorialSchools = result;
        } else {
          this.toastr.error('حدث خطأ أثناء جلب البيانات');
        }
        this.isLoadingData.set(false);
      },
      error: (err) => {
        this.toastr.error('حدث خطأ أثناء جلب البيانات');
        this.isLoadingData.set(false);
        console.log(err);
      },
    });
  }
}
