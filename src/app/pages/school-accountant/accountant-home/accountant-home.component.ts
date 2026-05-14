import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import {
  API,
  APIDefinition,
  Columns,
  Config,
  DefaultConfig,
  TableModule,
} from 'ngx-easy-table';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TitleScreenComponent } from '../../../shared/components/title-screen/title-screen.component';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AccountantService } from '../services/accountant.service';
import { ID_Name } from '../../dashboard/model/admin-model';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from '../../../shared/services/export.service';
type StudentInfo = {
  studentsCount: number;
  totalAmount: number;
  students: Student[];
};
type Student = {
  id: number;
  studentName: string;
  totalPayment: number;
  schoolName: string;
  lastPayment: string;
  phone: string;
};
@Component({
  selector: 'app-accountant-home',
  standalone: true,
  imports: [
    TableModule,
    NgClass,
    TitleScreenComponent,
    FormsModule,
    CurrencyPipe,
    NgSelectModule,
    DatePipe,
  ],
  templateUrl: './accountant-home.component.html',
  styleUrl: './accountant-home.component.scss',
})
export class AccountantHomeComponent implements OnInit {
  accountantService = inject(AccountantService);
  exportService = inject(ExportService);
  cdr = inject(ChangeDetectorRef);
  toastr = inject(ToastrService);
  modal: boolean = false;
  fromDate: string = '';
  toDate: string = '';
  currentDate: string = '';
  studentsCount: number = 0;
  totalAmount: number = 0;
  allSchools: ID_Name[] = [];
  schoolIds: number[] = [];
  schoolNames: string[] = [];
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('amount', { static: true }) amount?: TemplateRef<any>;
  @ViewChild('paymentDate', { static: true }) paymentDate?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  allStudentInfo!: StudentInfo;
  data: Student[] = [];
  dataCopy: Student[] = [];
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnInit(): void {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.currentDate = `${year}-${month}-${day}`;
    this.toDate = this.currentDate;
    this.columns = [
      { key: 'studentName', title: 'إسم الطالب' },
      { key: 'phone', title: 'رقم الجوال' },
      { key: 'schoolName', title: 'اسم المدرسة' },
      {
        key: 'lastPayment',
        title: 'تاريخ عملية الدفع',
        cellTemplate: this.paymentDate,
      },
      {
        key: 'totalPayment',
        title: 'مبلغ الدفع',
        cellTemplate: this.amount,
      },
    ];
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationMaxSize = 7;
    this.configuration.rows = 25;
    this.configuration.tableLayout = {
      striped: true,
      hover: true,
      theme: 'light',
    };
    this.configuration.horizontalScroll = true;
    this.fetchAllSchools();
    this.fetchAllStudents(this.toDate);
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  onChange(event: Event): void {
    this.table.apiEvent({
      type: API.onGlobalSearch,
      value: (event.target as HTMLInputElement).value,
    });
  }
  showModal(): void {
    this.modal = true;
  }
  hideModal(): void {
    this.modal = false;
  }
  setPaymentDate() {
    if (this.fromDate > this.toDate) {
      this.toastr.error('تأكد من صلاحية التاريخ');
      return;
    }
    this.fetchAllStudents(this.toDate, this.schoolIds, this.fromDate);
  }
  fetchAllStudents(
    toDate: string,
    schoolIds?: number[],
    fromDate?: string
  ): void {
    this.configuration.isLoading = true;
    this.accountantService
      .studentsPayments(toDate, schoolIds, fromDate)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ({ statusCode, msg, result }) => {
          if (statusCode === 200) {
            this.allStudentInfo = result;
            this.data = this.dataCopy = result.students;
            this.studentsCount = this.allStudentInfo.studentsCount;
            this.totalAmount = this.allStudentInfo.totalAmount;
            this.modal = false;
            this.pagination.count =
              this.pagination.count === -1
                ? result
                  ? result.length
                  : 0
                : this.pagination.count;
            this.pagination = { ...this.pagination };
            this.configuration.isLoading = false;
            this.cdr.detectChanges();
          } else {
            this.toastr.error(msg);
            this.configuration.isLoading = false;
            this.studentsCount = 0;
            this.totalAmount = 0;
          }
        },
        error: (err) => {
          console.log(err);
          this.configuration.isLoading = false;
          this.studentsCount = 0;
          this.totalAmount = 0;
        },
      });
  }
  fetchAllSchools(): void {
    this.accountantService.getSchools().subscribe({
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
  changeSchool(item: ID_Name[]) {
    this.schoolIds = item.map((_) => _.id);
    this.schoolNames = item.map((_) => _.name);
    this.fetchAllStudents(this.toDate, this.schoolIds, this.fromDate);
  }
  clearDate(): void {
    if (this.fromDate) {
      this.fromDate = '';
      this.toDate = this.currentDate;
      this.fetchAllStudents(this.toDate, this.schoolIds);
      this.toastr.info('تم مسح التاريخ المحدد');
    } else {
      this.toastr.error('لا يوجد تاريخ محدد');
    }
  }
  exportTable(): void {
    this.exportService.exportTableToExcelStudentSchools(
      this.data,
      this.toDate,
      this.schoolNames,
      this.fromDate,
      this.totalAmount
    );
  }
}
