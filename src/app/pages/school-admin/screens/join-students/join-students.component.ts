import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';

import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from '../../../../shared/services/export.service';
import { AuthService } from '../../../../authentication/services/auth.service';
import { AdminService } from '../../../dashboard/services/admin.service';
import { SubAdminService } from '../../../dashboard/services/sub-admin.service';
import {
  AllDataStudent,
  StudentsDetail,
} from '../../../dashboard/model/admin-model';
import { SchoolAdminService } from '../../services/school-admin.service';
type dataFilter = {
  pageNumber: number;
  pageSize: number;
  // keyWord: string;
  grade?: string;
  classNumber?: string;
  schoolsIds: number[] | null;
};
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
@Component({
  selector: 'app-join-students',
  standalone: true,
  imports: [NgClass, DatePipe, FormsModule, NgSelectModule, RouterLink],
  templateUrl: './join-students.component.html',
  styleUrl: './join-students.component.scss',
})
export class JoinStudentsComponent implements OnInit {
  exportService = inject(ExportService);
  schoolAdminService = inject(SchoolAdminService);
  adminService = inject(AdminService);
  toastr = inject(ToastrService);
  isLoading: boolean = false;
  isLocked: boolean = false;
  isOpenConfirm: boolean = false;
  selectedCount: number = 0;
  role: string = '';
  startSub: string = '';
  endSub: string = '';
  emailStudent: string = '';
  tutorialIds: number[] = [];
  allTutorials: { id: number; name: string }[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;
  keywork: string = '';
  content: string = '';
  subject: string = '';
  selectedEmails: string[] = [];
  selectAll: boolean = false;
  isOpenEmail: boolean = false;
  isLoadingEmail: boolean = false;
  isLoadingC: boolean = false;
  showSchool: boolean = false;
  showEmail: boolean = false;
  showNum: boolean = false;
  data: dataFilter = {} as dataFilter;
  dataTutorialSchools: Data = {} as Data;
  selectedStudentIds: number[] = [];
  allStudentJoin: StudentsDetail[] = [];
  allData: AllDataStudent = {} as AllDataStudent;
  @Output() totalCount: EventEmitter<number> = new EventEmitter<number>();
  classNumbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  isOpen: boolean = false;
  isLoadingSub: boolean = false;

  ngOnInit(): void {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.startSub = `${year}-${month}-${day}`;

    this.getTutorialsAndSchools();
    this.data.schoolsIds = null;

    this.getAllStudents(this.data);
  }

  checkEndDateForClinet(endDate: string): boolean {
    const currentDate = new Date();
    const apiEndDate = new Date(endDate);
    const isPastDate = apiEndDate > currentDate;
    return isPastDate;
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      // لو اختار الكل
      this.selectedStudentIds = this.allStudentJoin.map(
        (student) => student.userId
      );
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
    this.selectAll =
      this.selectedStudentIds.length === this.allStudentJoin.length;
  }

  getAllStudents(data: dataFilter): void {
    this.isLoading = true;
    this.schoolAdminService.getJoinStudents(data).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.allData = res;
          this.allStudentJoin = [...this.allData.data];
          this.allStudentJoin = this.allStudentJoin.sort(
            (a, b) => b.userId - a.userId
          );
          if (this.isExporting) {
            this.exportService.exportTableToExcelStudentSub(
              this.allStudentJoin,
              'إحصائيات الطلاب مشتركين'
            );
            this.isExporting = false;
          }
          this.isLoading = false;
          this.totalCount.emit(this.allData.totalCount);
        } else {
          this.toastr.error(res.msg);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  filterSchool(item: { id: number; name: string }[]) {
    // this.schoolId = item.map((school) => school.id)[0];
    // this.schoolName = item.map((school) => school.name)[0];
    this.data.schoolsIds = item.map((school) => school.id);
    this.data.pageNumber = 1;
    if (this.data.schoolsIds.length === 0) {
      this.data.schoolsIds = null;
    }
    this.getAllStudents(this.data);
  }

  fliterState(item: string) {
    this.data.pageNumber = 1;
    this.data.grade = item;
    this.getAllStudents(this.data);
  }
  filterClassNo(item: string) {
    this.data.pageNumber = 1;
    this.data.classNumber = item;
    this.getAllStudents(this.data);
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
      this.data.pageNumber = this.pageNumber;
      this.getAllStudents(this.data);
    }
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
          this.getAllStudents(this.data);
          this.toastr.success('تم الاشتراك في الدورات بنجاح');
          this.isLoadingSub = false;
          this.selectedStudentIds = [];
          this.tutorialIds = [];
          this.selectAll = false;
        } else {
          this.toastr.error('حدث خطأ ما، يرجى المحاولة لاحقاً');
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
    this.schoolAdminService.getTutorialsAndSchools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.dataTutorialSchools = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  changeLocked(userId: number, tutorialId: number, isLocked: boolean): void {
    this.isLoadingC = true;
    this.schoolAdminService
      .lockTutorial({
        userId: userId,
        tutorialId: tutorialId,
        isLock: !isLocked,
      })
      .subscribe({
        next: ({ statusCode, msg, result }) => {
          if (statusCode === 200) {
            this.isLocked = result;
            this.isLoadingC = false;
            this.getAllStudents(this.data);
            this.toastr.success('تم التعديل بنجاح');
          } else {
            this.toastr.error('حدث خطأ ما، يرجى المحاولة لاحقاً');
            this.isLoadingC = false;
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoadingC = false;
        },
      });
  }
  isExporting: boolean = false;
  exportTable(): void {
    this.isExporting = true;
    this.data.pageNumber = 1;
    this.data.pageSize = this.allData.totalCount;
    this.data.schoolsIds = null;
    this.getAllStudents(this.data);
  }

  lockAllTutorials(): void {
    this.isLoadingC = true;
    this.adminService.lockAllTutorials(this.selectedStudentIds).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.toastr.success('تم قفل الدورات لجميع الطلاب المحددين بنجاح');
          this.selectedStudentIds = [];
          this.selectAll = false;
          this.getAllStudents(this.data);
        } else {
          this.toastr.error(res.msg || 'حدث خطأ ما');
        }
        this.isLoadingC = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoadingC = false;
        this.toastr.error('حدث خطأ أثناء تنفيذ العملية');
      },
    });
  }

  openConfirm(): void {
    this.selectedCount = this.selectedStudentIds.length;
    if (this.selectedCount === 0) {
      this.toastr.error('يجب تحديد الطلاب أولاً');
      return;
    }
    this.isOpenConfirm = true;
  }
}
