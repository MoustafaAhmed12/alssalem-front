import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../../authentication/services/auth.service';
import { ExportService } from '../../../../../shared/services/export.service';
import { AdminService } from '../../../services/admin.service';
import { SubAdminService } from '../../../services/sub-admin.service';
import { SchoolService } from '../../../services/school.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

interface Student {
  userId: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  schoolName: string | null;
  creationDate: string;
  selected?: boolean;
}

@Component({
  selector: 'app-student-notjoin',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, ReactiveFormsModule],
  templateUrl: './student-notjoin.component.html',
})
export class StudentNotjoinComponent implements OnInit {
  authService = inject(AuthService);
  exportService = inject(ExportService);
  adminService = inject(AdminService);
  subAdminService = inject(SubAdminService);
  schoolService = inject(SchoolService);
  toastr = inject(ToastrService);
  isOpen: boolean = false;
  startSub: string = '';
  endSub: string = '';
  emailsToSubscribe: string[] = [];
  tutorialIds: number[] = [];
  allTutorials: { id: number; name: string }[] = [];
  isLoadingSub: boolean = false;
  role: string = '';
  allStudents: Student[] = [];

  filteredStudents: Student[] = [];
  paginatedStudents: Student[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Filters
  dateFrom = '';
  dateTo = '';
  selectedSchool = '';
  fb = inject(FormBuilder);

  // Selection
  selectedCount = 0;
  isAllSelected = false;
  isIndeterminate = false;
  isLoading = signal<boolean>(false);
  isLoadingAll = signal<boolean>(false);
  isOpenEmail: boolean = false;
  isLoadingEmail: boolean = false;
  emailForm: FormGroup;
  selectedEmails = new Set<any>();
  emailsToReady: string[] = [];
  keywork: string = '';
  isOpenOk = signal<boolean>(false);
  userId = signal<number>(0);
  alertMsg = signal<string>("");
  alertType = signal<"success" | "danger">("success");
  constructor() {
    this.emailForm = this.fb.group({
      subject: new FormControl(""),
      content: new FormControl(""),
    });
  }
  ngOnInit() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.startSub = `${year}-${month}-${day}`;
    this.role = this.authService.currentUser().roleDto.roleName;
    this.fetchAllStudents();
    // this.fetchAllSchools();
    this.getAllTutorials();
    this.applyFilters();
  }

  remove(id: number): void {
    this.isOpenOk.set(true);
    this.userId.set(id);
  }
  removeStudent(): void {
    this.isLoading.set(true);
    let ids: number[] = [];

    if (this.userId() > 0) {
      ids = [this.userId()];
    } else if (this.userId() === -1) {
      ids = this.allStudents
        .filter((s) => s.selected)
        .map((s) => s.userId);
    }

    if (ids.length === 0) {
      this.isLoading.set(false);
      this.isOpenOk.set(false);
      return;
    }

    this.adminService.deleteAccounts(ids).subscribe({
      next: ({ statusCode, msg }: any) => {
        if (statusCode === 200) {
          this.allStudents = this.allStudents.filter(
            (student) => !ids.includes(student.userId),
          );
          this.filteredStudents = this.filteredStudents.filter(
            (student) => !ids.includes(student.userId),
          );
          this.updatePagination();
          this.alertType.set("success");
          this.alertMsg.set(msg || "تم الحذف بنجاح");
          this.isOpenOk.set(false);
          if (this.userId() === -1) {
            this.selectedCount = 0;
            this.isAllSelected = false;
            this.isIndeterminate = false;
          }
        } else {
          this.alertType.set("danger");
          this.alertMsg.set(msg || "فشل الحذف");
          this.toastr.error(msg);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.log(err);
      },
    });
  }

  removeSelected(): void {
    if (this.selectedCount === 0) {
      this.toastr.error('يجب تحديد طلاب أولاً');
      return;
    }
    this.userId.set(-1);
    this.isOpenOk.set(true);
  }

  fetchAllStudents(): void {
    this.isLoadingAll.set(true);
    if (this.role == 'أدمن') {
      this.adminService.getStudentNotJoin().subscribe({
        next: ({ statusCode, msg, result }) => {
          if (statusCode === 200) {
            this.allStudents = result;
            this.filteredStudents = [...this.allStudents].sort(
              (a, b) => b.userId - a.userId,
            );
            this.updatePagination();
          }
          this.isLoadingAll.set(false);
        },
        error: (err) => {
          console.log(err);
          this.isLoadingAll.set(false);
        },
      });
    } else {
      this.subAdminService.getStudentNotJoin().subscribe({
        next: ({ statusCode, msg, result }) => {
          if (statusCode === 200) {
            this.allStudents = result;
            this.filteredStudents = [...this.allStudents];
            this.updatePagination();
          }
          this.isLoadingAll.set(false);
        },
        error: (err) => {
          console.log(err);
          this.isLoadingAll.set(false);
        },
      });
    }
  }
  exportTable(): void {
    this.exportService.exportTableToExcelStudent(
      this.filteredStudents,
      'إحصائيات الطلاب الغير مشتركين',
    );
  }

  searchName(): void {
    const keyword = this.keywork?.toLowerCase().trim();

    if (!keyword) {
      this.filteredStudents = [...this.allStudents];
    } else {
      this.filteredStudents = this.allStudents.filter((student) => {
        const firstName = student.firstName?.toLowerCase() || '';
        const lastName = student.lastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const email = student.email?.toLowerCase() || '';
        const schoolName = student.schoolName?.toLowerCase() || '';

        return (
          fullName.includes(keyword) ||
          email.includes(keyword) ||
          schoolName.includes(keyword)
        );
      });
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  applyFilters() {
    this.filteredStudents = this.allStudents.filter((student) => {
      let matchesDate = true;
      let matchesSchool = true;

      // Date filter
      if (this.dateFrom && this.dateTo) {
        const studentDate = new Date(student.creationDate);
        const fromDate = new Date(this.dateFrom);
        const toDate = new Date(this.dateTo);
        matchesDate = studentDate >= fromDate && studentDate <= toDate;
      }

      // School filter
      if (this.selectedSchool) {
        matchesSchool = student.schoolName === this.selectedSchool;
      }

      return matchesDate && matchesSchool;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters() {
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedSchool = '';
    this.applyFilters();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.filteredStudents.length,
    );
    this.paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);
    this.updateSelectionState();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.paginatedStudents.forEach((student) => (student.selected = checked));
    this.updateSelectionState();
  }

  onStudentSelect() {
    this.updateSelectionState();
  }

  updateSelectionState() {
    const allSelected = this.allStudents.filter((s) => s.selected);
    const pageSelected = this.paginatedStudents.filter((s) => s.selected);

    this.selectedCount = allSelected.length;
    this.emailsToSubscribe = allSelected.map((s) => s.email);
    this.emailsToReady = [...this.emailsToSubscribe];

    this.isAllSelected =
      pageSelected.length === this.paginatedStudents.length &&
      this.paginatedStudents.length > 0;
    this.isIndeterminate =
      pageSelected.length > 0 &&
      pageSelected.length < this.paginatedStudents.length;
  }

  openAddSubModal() {
    if (this.emailsToSubscribe.length === 0) {
      this.toastr.error('يجب تحديد طلاب أولاً');
      return;
    }
    this.isOpen = true;
  }

  // Computed properties
  get totalStudents(): number {
    return this.filteredStudents.length;
  }

  get uniqueSchools(): string[] {
    const schools = new Set(
      this.allStudents
        .map((s) => s.schoolName)
        .filter((school) => school !== null) as string[],
    );
    return Array.from(schools).sort();
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(
      this.startIndex + this.pageSize,
      this.filteredStudents.length,
    );
  }

  addSub(): void {
    if (this.startSub > this.endSub) {
      this.toastr.error('تأكد من صلاحية التاريخ');
      return;
    }
    if (this.emailsToSubscribe.length === 0) {
      this.toastr.error('يجب تحديد الطلاب');
      return;
    }
    if (this.tutorialIds.length === 0) {
      this.toastr.error('يجب تحديد الدورات');
      return;
    }

    const info = {
      emails: this.emailsToSubscribe,
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
          this.fetchAllStudents();
          this.endSub = '';
          this.isLoadingSub = false;
          this.emailsToSubscribe = [];
          this.allStudents.forEach((s) => (s.selected = false));
          this.updateSelectionState();
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

  hideEmail(): void {
    this.isOpenEmail = false;
  }
  openEmail(): void {
    if (this.emailsToReady.length === 0) {
      this.toastr.error('يجب تحدد طلاب');
    } else {
      this.emailForm.reset();
      this.isOpenEmail = true;
    }
  }
  sendEmail(): void {
    if (this.emailForm.invalid) {
      return;
    }
    this.isLoadingEmail = true;
    const content = this.emailForm
      .get('content')
      ?.value.split('\n') // Split by newline
      .filter((line: any) => line.trim() !== '') // Remove empty lines
      .map((line: any) => `<p dir="rtl">${line}</p>`) // Wrap each line in <p> tags
      .join(''); // Combine all <p> elements into a single string
    const info = {
      subject: this.emailForm.value.subject,
      content,
      usersEmails: this.emailsToReady,
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
}

// import {
//   Component,
//   OnInit,
//   ViewChild,
//   TemplateRef,
//   inject,
//   ChangeDetectorRef,
// } from '@angular/core';
// import {
//   API,
//   APIDefinition,
//   Columns,
//   Config,
//   DefaultConfig,
//   TableModule,
// } from 'ngx-easy-table';
// import { Subject, takeUntil } from 'rxjs';
// import {
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   FormsModule,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { AdminService } from '../../../services/admin.service';
// import { NgSelectModule } from '@ng-select/ng-select';
// import { SchoolService } from '../../../services/school.service';
// import { ID_Name } from '../../../model/admin-model';
// import { AuthService } from '../../../../../authentication/services/auth.service';
// import { SubAdminService } from '../../../services/sub-admin.service';
// import { ExportService } from '../../../../../shared/services/export.service';
// import { ToastrService } from 'ngx-toastr';
// import { NgClass } from '@angular/common';
// import { RouterLink } from '@angular/router';
// @Component({
//   selector: 'app-student-notjoin',
//   standalone: true,
//   imports: [
//     TableModule,
//     ReactiveFormsModule,
//     NgClass,
//     NgSelectModule,
//     RouterLink,
//     FormsModule,
//   ],
//   templateUrl: './student-notjoin.component.html',
//   styleUrl: './student-notjoin.component.scss',
// })
// export class StudentNotjoinComponent implements OnInit {
//   authService = inject(AuthService);
//   exportService = inject(ExportService);
//   adminService = inject(AdminService);
//   subAdminService = inject(SubAdminService);
//   schoolService = inject(SchoolService);
//   toastr = inject(ToastrService);
//   fb = inject(FormBuilder);
//   cdr = inject(ChangeDetectorRef);
//   isLoading: boolean = false;
//   filterData: any[] = [];
//   allSchools: ID_Name[] = [];
//   filter: string = '';
//   role: string = '';
//   @ViewChild('table') table: APIDefinition | any;
//   @ViewChild('name', { static: true }) name?: TemplateRef<any>;
//   @ViewChild('action', { static: true }) action?: TemplateRef<any>;
//   configuration: Config | any;
//   columns: Columns[] = [];
//   data: any[] = [];
//   dataCopy: any[] = [];
//   ageSummary: number = 0;
//   /// loading
//   public pagination = {
//     limit: 10,
//     offset: 0,
//     count: -1,
//   };
//   isOpen: boolean = false;
//   startSub: string = '';
//   endSub: string = '';
//   emailStudent: string = '';
//   tutorialIds: number[] = [];
//   allTutorials: { id: number; name: string }[] = [];
//   private ngUnsubscribe: Subject<void> = new Subject<void>();
//   emailForm!: FormGroup;
//   selectedEmails = new Set<any>();
//   emailsToReady: string[] = [];
//   isFilter: boolean = false;
//   isOpenEmail: boolean = false;
//   isLoadingEmail: boolean = false;
//   isLoadingSub: boolean = false;
//   ngOnInit(): void {
//     this.emailForm = this.fb.group({
//       subject: new FormControl(''),
//       content: new FormControl(''),
//     });

//     const currentDate = new Date();
//     const year = currentDate.getFullYear();
//     const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
//     const day = currentDate.getDate().toString().padStart(2, '0');
//     this.startSub = `${year}-${month}-${day}`;

//     this.role = this.authService.currentUser().roleDto.roleName;
//     this.columns = [
//       { key: 'firstName', title: 'اسم الطالب', cellTemplate: this.name },
//       { key: 'email', title: 'الإيميل' },
//       { key: 'schoolName', title: 'اسم المدرسة' },
//       { key: 'phoneNumber', title: 'رقم الجوال' },
//       { key: 'action', title: 'اضافة اشتراك', cellTemplate: this.action },
//     ];
//     this.configuration = { ...DefaultConfig };
//     this.configuration.paginationMaxSize = 7;
//     this.configuration.checkboxes = true;
//     this.configuration.rows = 25;
//     this.configuration.tableLayout = {
//       striped: true,
//       hover: true,
//       theme: 'light',
//     };
//     this.configuration.horizontalScroll = true;
//     this.ageSummary = this.data
//       .map((_) => _.id)
//       .reduce((acc, cur) => cur + acc, 0);
//     this.fetchAllStudents();
//     this.fetchAllSchools();
//     this.getAllTutorials();
//   }
//   eventEmitted($event: { event: string; value: any }): void {
//     switch ($event.event) {
//       case 'onCheckboxSelect':
//         const isChecked = ($event.value.event.target as HTMLInputElement)
//           .checked;
//         if (!isChecked) {
//           this.selectedEmails.delete($event.value.row.email);
//         } else {
//           this.selectedEmails.add($event.value.row.email);
//         }
//         break;
//       case 'onSelectAll':
//         this.data.forEach((row, key) => {
//           if (this.selectedEmails.has(row.email)) {
//             this.selectedEmails.delete(row.email);
//           } else {
//             this.selectedEmails.add(row.email);
//           }
//         });
//         break;
//     }
//     this.emailsToReady = Array.from(this.selectedEmails);
//   }
//   hideEmail(): void {
//     this.isOpenEmail = false;
//   }
//   openEmail(): void {
//     if (this.emailsToReady.length === 0) {
//       this.toastr.error('يجب تحدد طلاب');
//     } else {
//       this.emailForm.reset();
//       this.isOpenEmail = true;
//     }
//   }
//   sendEmail(): void {
//     if (this.emailForm.invalid) {
//       return;
//     }
//     this.isLoadingEmail = true;
//     const content = this.emailForm
//       .get('content')
//       ?.value.split('\n') // Split by newline
//       .filter((line: any) => line.trim() !== '') // Remove empty lines
//       .map((line: any) => `<p dir="rtl">${line}</p>`) // Wrap each line in <p> tags
//       .join(''); // Combine all <p> elements into a single string
//     const info = {
//       subject: this.emailForm.value.subject,
//       content,
//       usersEmails: this.emailsToReady,
//     };
//     this.adminService.SendEmailForStudents(info).subscribe({
//       next: ({ statusCode, result }) => {
//         if (statusCode === 200) {
//           this.toastr.success(result);
//           this.isOpenEmail = false;
//           this.isLoadingEmail = false;
//         } else {
//           this.isLoadingEmail = false;
//         }
//       },
//       error: (err) => {
//         console.log(err);
//         this.isLoadingEmail = false;
//       },
//     });
//   }
//   ngOnDestroy(): void {
//     this.ngUnsubscribe.next();
//     this.ngUnsubscribe.complete();
//   }
//   onEvent($event: { event: string; value: { key: string; value: string }[] }) {
//     if ($event.event !== 'onSearch') {
//       return;
//     }
//     const filterKey = $event.value[0].key;
//     const filterVal = $event.value[0].value;
//     this.ageSummary = this.data
//       .filter((item: any) => `${item[filterKey]}`.includes(filterVal))
//       .map((_) => _.id)
//       .reduce((acc, cur) => cur + acc, 0);
//   }
//   onChange(event: Event): void {
//     this.table.apiEvent({
//       type: API.onGlobalSearch,
//       value: (event.target as HTMLInputElement).value,
//     });
//   }
//   fetchAllStudents(): void {
//     this.configuration.isLoading = true;
//     if (this.role == 'أدمن') {
//       this.adminService
//         .getStudentNotJoin()
//         .pipe(takeUntil(this.ngUnsubscribe))
//         .subscribe({
//           next: ({ statusCode, msg, result }) => {
//             if (statusCode === 200) {
//               this.data = this.dataCopy = result;
//               this.pagination.count =
//                 this.pagination.count === -1
//                   ? result
//                     ? result.length
//                     : 0
//                   : this.pagination.count;
//               this.pagination = { ...this.pagination };
//               this.configuration.isLoading = false;
//               this.cdr.detectChanges();
//             } else {
//               this.isLoading = false;
//             }
//           },
//           error: (err) => {
//             console.log(err);
//             this.isLoading = false;
//           },
//         });
//     } else {
//       this.subAdminService
//         .getStudentNotJoin()
//         .pipe(takeUntil(this.ngUnsubscribe))
//         .subscribe({
//           next: ({ statusCode, msg, result }) => {
//             if (statusCode === 200) {
//               this.data = this.dataCopy = result;
//               this.pagination.count =
//                 this.pagination.count === -1
//                   ? result
//                     ? result.length
//                     : 0
//                   : this.pagination.count;
//               this.pagination = { ...this.pagination };
//               this.configuration.isLoading = false;
//               this.cdr.detectChanges();
//             } else {
//               this.isLoading = false;
//             }
//           },
//           error: (err) => {
//             console.log(err);
//             this.isLoading = false;
//           },
//         });
//     }
//   }
//   exportTable(): void {
//     this.exportService.exportTableToExcelStudent(
//       this.data,
//       'إحصائيات الطلاب الغير مشتركين'
//     );
//   }
//   changeSchool(school: any): void {
//     this.filter = school?.name;
//     this.filterData = this.data.filter(
//       (item) => item.schoolName === this.filter
//     );
//   }
//   fetchAllSchools(): void {
//     this.schoolService.getSystemSchools().subscribe({
//       next: ({ result, statusCode }) => {
//         if (statusCode === 200) {
//           this.allSchools = result;
//         }
//       },
//       error: (err) => {
//         console.log(err);
//       },
//     });
//   }

//   changeEmailOpen(email: string): void {
//     this.isOpen = true;
//     this.emailStudent = email;
//   }

//   addSub(): void {
//     if (this.startSub > this.endSub) {
//       this.toastr.error('تأكد من صلاحية التاريخ');
//       return;
//     }
//     if (!this.emailStudent.trim()) {
//       this.toastr.error('يجب تحديد الإيميل');
//       return;
//     }
//     if (this.tutorialIds.length === 0) {
//       this.toastr.error('يجب تحديد الدورات');
//       return;
//     }

//     const info = {
//       email: this.emailStudent.trim(),
//       tutorialsIds: this.tutorialIds,
//       startDate: this.startSub,
//       endDate: this.endSub,
//     };
//     this.isLoadingSub = true;
//     this.adminService.addSubscribe(info).subscribe({
//       next: ({ statusCode }) => {
//         if (statusCode === 200) {
//           this.emailStudent = '';
//           this.isOpen = false;
//           this.tutorialIds = [];
//           this.fetchAllStudents();
//           this.endSub = '';
//           this.isLoadingSub = false;
//         }
//       },
//       error: (err) => {
//         console.log(err);
//         this.isLoadingSub = false;
//       },
//     });
//   }

//   getAllTutorials(): void {
//     this.adminService.tutorialNames().subscribe({
//       next: ({ result, statusCode }) => {
//         if (statusCode === 200) {
//           this.allTutorials = result;
//         }
//       },
//       error: (err) => {
//         console.log(err);
//       },
//     });
//   }
// }
