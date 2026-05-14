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
import { AdminService } from '../../../services/admin.service';
import { SubAdminService } from '../../../services/sub-admin.service';
import { AuthService } from '../../../../../authentication/services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { AllDataStudent, StudentsDetail } from '../../../model/admin-model';
import { ExportService } from '../../../../../shared/services/export.service';
import { ProfileService } from '../../../../student/services/profile.service';
import { SupervisorService } from '../../../../supervisor/services/supervisor.service';
import { SchoolService } from '../../../services/school.service';
@Component({
  selector: 'app-student-join',
  standalone: true,
  imports: [NgClass, DatePipe, FormsModule, NgSelectModule, RouterLink],
  templateUrl: './student-join.component.html',
  styleUrl: './student-join.component.scss',
})
export class StudentJoinComponent implements OnInit {
  exportService = inject(ExportService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  adminService = inject(AdminService);
  subAdminService = inject(SubAdminService);
  schoolService = inject(SchoolService);
  toastr = inject(ToastrService);
  isLoading: boolean = false;
  isLocked: boolean = false;
  role: string = '';
  startSub: string = '';
  endSub: string = '';
  tutorialIds: number[] = [];
  allTutorials: { id: number; name: string }[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;
  keywork: string = '';
  content: string = '';
  subject: string = '';
  selectedStudents: { [email: string]: boolean } = {};
  selectedEmails: string[] = [];
  selectedStudentIds: number[] = [];
  selectAll: boolean = false;
  isOpenEmail: boolean = false;
  isLoadingEmail: boolean = false;
  isLoadingC: boolean = false;
  showSchool: boolean = false;
  showEmail: boolean = false;
  showNum: boolean = false;
  showNationalId: boolean = false;
  changePass: boolean = false;
  showState: boolean = false;
  showClassNo: boolean = false;
  isOpenConfirm: boolean = false;
  selectedCount: number = 0;

  classNumbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  allSchools: any[] = [];
  state: string = '';
  classNo: string = '';
  schoolIds: number[] = [];
  filterIsLocked: boolean | null = null;
  lockedOptions = [
    { name: 'الكل', value: null },
    { name: 'مقفل', value: true },
    { name: 'مفتوح', value: false },
  ];

  allStudentJoinSub: StudentsDetail[] = [];
  allStudentJoin: StudentsDetail[] = [];
  allData: AllDataStudent = {} as AllDataStudent;
  @Output() totalCount: EventEmitter<number> = new EventEmitter<number>();

  isOpenChage: boolean = false;
  isOpen: boolean = false;
  isLoadingSub: boolean = false;
  password: string = '';
  ngOnInit(): void {
    this.role = this.authService.currentUser().roleDto.roleName;

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.startSub = `${year}-${month}-${day}`;

    if (this.role === 'أدمن') {
      this.getAllStudents(this.pageNumber, this.pageSize, this.keywork);
    } else {
      this.getAllStudentsSub(this.pageNumber, this.pageSize, this.keywork);
    }
    this.fetchAllSchools();
  }
  studentId = signal<number>(0);
  changePasswordOpen(id: number): void {
    this.isOpenChage = true;
    this.studentId.set(id);
  }
  isLoadingChange = signal<boolean>(false);
  changePassword(): void {
    if (!this.password) {
      this.toastr.error('يجب ادخال كلمة المرور');
      return;
    }
    if (this.password.length < 6) {
      this.toastr.error('كلمة المرور يجب ان تكون اكثر من 6 حروف');
      return;
    }
    const user = {
      userId: this.studentId(),
      NewPassword: this.password,
    };
    this.isLoadingChange.update((v) => (v = true));
    this.profileService.updateUserPassword(user).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success('تم تحديث البيانات بنجاح.');
          this.isLoadingChange.update((v) => (v = false));
          this.isOpenChage = false;
        } else {
          this.toastr.error(msg);
          this.isLoadingChange.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingChange.update((v) => (v = false));
        this.toastr.success(err);
      },
    });
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
      this.selectedEmails = this.allStudentJoin.map((student) => student.email);
      this.selectedStudentIds = this.allStudentJoin.map(
        (student) => student.userId,
      );
      this.allStudentJoin.forEach(
        (student) => (this.selectedStudents[student.email] = true),
      );
    } else {
      this.selectedEmails = [];
      this.selectedStudentIds = [];
      this.selectedStudents = {};
    }
  }

  updateSelection(student: StudentsDetail) {
    const studentEmail = student.email;
    const userId = student.userId;

    if (this.selectedStudents[studentEmail]) {
      // Add email if not exists
      if (!this.selectedEmails.includes(studentEmail)) {
        this.selectedEmails.push(studentEmail);
      }
      // Add ID if not exists
      if (!this.selectedStudentIds.includes(userId)) {
        this.selectedStudentIds.push(userId);
      }
    } else {
      // Remove email
      this.selectedEmails = this.selectedEmails.filter(
        (email) => email !== studentEmail,
      );
      // Remove ID
      this.selectedStudentIds = this.selectedStudentIds.filter(
        (id) => id !== userId,
      );
    }
    this.selectAll = this.allStudentJoin.every(
      (s) => this.selectedStudents[s.email],
    );
  }

  searchName() {
    this.pageNumber = 1;
    // استدعاء الـ API حتى لو كان النص فارغاً (لإعادة تحميل جميع البيانات)
    if (this.role === 'أدمن') {
      this.getAllStudents(
        this.pageNumber,
        this.pageSize,
        this.keywork.trim(),
        this.schoolIds,
        this.classNo,
        this.state,
        this.filterIsLocked,
      );
    } else {
      this.getAllStudentsSub(
        this.pageNumber,
        this.pageSize,
        this.keywork.trim(),
        this.schoolIds,
        this.classNo,
        this.state,
        this.filterIsLocked,
      );
    }
  }

  fliterState(event: any) {
    this.state = event;
    this.searchName();
  }

  fliterClass(event: any) {
    this.classNo = event;
    this.searchName();
  }

  fliterSchool(event: any) {
    this.schoolIds = event ? [event.id] : [];
    this.searchName();
  }

  filterLocked(event: any) {
    this.filterIsLocked = event ? event.value : null;
    this.searchName();
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

  getAllStudents(
    pageNumber: number,
    pageSize: number,
    keywork: string,
    schoolIds: number[] = [],
    classNo: string = '',
    state: string = '',
    isLocked: boolean | null = null,
  ): void {
    this.isLoading = true;
    const info = {
      pageNumber,
      pageSize,
      keyWord: keywork || null,
      schoolIds: schoolIds.length > 0 ? schoolIds : null,
      classNo: classNo || null,
      state: state || null,
      isLocked: isLocked,
    };
    this.adminService.getStudentTutorials(info).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.allData = res;
          this.allStudentJoin = [...this.allData.data];
          this.allStudentJoin = this.allStudentJoin.map((student) => {
            const uniqueDetails = Array.from(
              new Map(
                student.details.map((d: any) => [d.tutorialId, d]),
              ).values(),
            );
            return {
              ...student,
              details: uniqueDetails,
            };
          });

          // 🔹 ترتيب الطلاب
          this.allStudentJoin = this.allStudentJoin.sort(
            (a, b) => b.userId - a.userId,
          );
          if (this.isExporting) {
            this.exportService.exportTableToExcelStudentSub(
              this.allStudentJoin,
              'إحصائيات الطلاب مشتركين',
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

  getAllStudentsSub(
    pageNumber: number,
    pageSize: number,
    keywork: string,
    schoolIds: number[] = [],
    classNo: string = '',
    state: string = '',
    isLocked: boolean | null = null,
  ): void {
    this.isLoading = true;
    const info = {
      pageNumber,
      pageSize,
      keyWord: keywork || null,
      schoolIds: schoolIds.length > 0 ? schoolIds : null,
      classNo: classNo || null,
      state: state || null,
    };
    this.subAdminService.getStudentTutorials(info).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.allData = res;
          this.allStudentJoin = [...this.allData.data];
          this.allStudentJoin = this.allStudentJoin.map((student) => {
            const uniqueDetails = Array.from(
              new Map(
                student.details.map((d: any) => [d.tutorialId, d]),
              ).values(),
            );
            return {
              ...student,
              details: uniqueDetails,
            };
          });

          // 🔹 ترتيب الطلاب
          this.allStudentJoin = this.allStudentJoin.sort(
            (a, b) => b.userId - a.userId,
          );
          if (this.isExporting) {
            this.exportService.exportTableToExcelStudentSub(
              this.allStudentJoin,
              'إحصائيات الطلاب مشتركين',
            );

            this.isExporting = false;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  get totalPages(): number {
    return Math.ceil(this.allData.totalCount / this.pageSize);
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
    this.searchName();
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
      if (this.role === 'أدمن') {
        this.getAllStudents(
          this.pageNumber,
          this.pageSize,
          this.keywork,
          this.schoolIds,
          this.classNo,
          this.state,
          this.filterIsLocked,
        );
      } else {
        this.getAllStudentsSub(
          this.pageNumber,
          this.pageSize,
          this.keywork,
          this.schoolIds,
          this.classNo,
          this.state,
          this.filterIsLocked,
        );
      }
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
    this.adminService.SendEmailForStudents(info).subscribe({
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

  open(): void {
    if (this.selectedEmails.length === 0) {
      this.toastr.error('يجب تحديد طلاب أولاً');
      return;
    }
    this.isOpen = true;
    this.getAllTutorials();
  }
  hide(): void {
    this.isOpen = false;
  }

  addSub(): void {
    if (this.startSub > this.endSub) {
      this.toastr.error('تأكد من صلاحية التاريخ');
      return;
    }
    if (this.selectedEmails.length === 0) {
      this.toastr.error('يجب تحديد الطلاب');
      return;
    }
    if (this.tutorialIds.length === 0) {
      this.toastr.error('يجب تحديد الدورات');
      return;
    }

    const info = {
      emails: this.selectedEmails,
      tutorialsIds: this.tutorialIds,
      startDate: this.startSub,
      endDate: this.endSub,
    };
    this.isLoadingSub = true;
    this.adminService.addSubscribe(info).subscribe({
      next: ({ statusCode }) => {
        if (statusCode === 200) {
          this.isOpen = false;
          this.tutorialIds = [];
          this.endSub = '';
          this.isLoadingSub = false;
          this.selectedEmails = [];
          this.selectedStudents = {};
          this.selectAll = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSub = false;
      },
    });
  }

  getAllTutorials(): void {
    this.adminService.tutorialNames().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allTutorials = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  changeLocked(userId: number, tutorialId: number): void {
    this.isLoadingC = true;
    this.adminService
      .lockStudentTutorials({
        studentId: userId,
        tutorialId: tutorialId,
      })
      .subscribe({
        next: ({ statusCode, msg, result }) => {
          if (statusCode === 200) {
            this.isLocked = result;
            this.isLoadingC = false;
            this.toastr.success(msg);
          } else {
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
    this.getAllStudents(
      1,
      this.allData.totalCount,
      this.keywork,
      this.schoolIds,
      this.classNo,
      this.state,
      this.filterIsLocked,
    );
  }

  lockAllTutorials(): void {
    this.isLoadingC = true;
    this.adminService.lockAllTutorials(this.selectedStudentIds).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.toastr.success('تم قفل الدورات لجميع الطلاب المحددين بنجاح');
          this.selectedEmails = [];
          this.selectedStudentIds = [];
          this.selectedStudents = {};
          this.selectAll = false;
          this.searchName();
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
