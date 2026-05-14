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
import { NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { AdminService } from '../../services/admin.service';
@Component({
  selector: 'app-feedback-admin',
  standalone: true,
  imports: [TableModule, ReactiveFormsModule, NgClass, TitleScreenComponent],
  templateUrl: './feedback-admin.component.html',
  styleUrl: './feedback-admin.component.scss',
})
export class FeedbackAdminComponent implements OnInit {
  toastr = inject(ToastrService);
  adminService = inject(AdminService);
  formBuilder = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  schoolId: number = 0;
  isDelete: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;
  modal: boolean = false;
  formData!: FormGroup;
  // table
  @ViewChild('table') table: APIDefinition | any;
  // edit
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('feedback', { static: true }) feedback?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: any[] = [];
  dataCopy: any[] = [];
  /// loading
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnInit(): void {
    this.formData = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
    });
    this.columns = [
      { key: 'feedback', title: 'أراء الطلاب', cellTemplate: this.feedback },
      { key: 'id', title: ' حذف', cellTemplate: this.actionTpl },
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
    this.fetchAllFeedback();
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  // Search
  onChange(event: Event): void {
    this.table.apiEvent({
      type: API.onGlobalSearch,
      value: (event.target as HTMLInputElement).value,
    });
  }
  // Remove fun.
  remove(id: number): void {
    this.isDelete = true;
    this.adminService.deleteFeedback(id).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.fetchAllFeedback();
          this.isDelete = false;
          this.toastr.success(msg);
        } else {
          this.toastr.error(msg);
          this.isDelete = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isDelete = false;
      },
    });
  }
  fetchAllFeedback(): void {
    this.configuration.isLoading = true;
    this.adminService
      .getAllFeedback()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ({ result, statusCode, msg }) => {
          if (statusCode === 200) {
            this.data = this.dataCopy = result;
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
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  get name(): AbstractControl | null {
    return this.formData.get('name');
  }
  hideModal(): void {
    this.name?.setValidators(null);
    this.name?.updateValueAndValidity();
    this.modal = false;
  }
  showModal(): void {
    this.formData.reset();
    this.formData.controls['id'].setValue(0);
    this.schoolId = 0;
    this.modal = true;
  }
  onSubmit() {
    this.name?.setValidators([Validators.required]);
    this.name?.updateValueAndValidity();
    this.submitted = true;
    if (this.formData.invalid) {
      return;
    }
    this.isLoading = true;
    this.adminService
      .saveFeedbacks(this.formData.get('name')?.value)
      .subscribe({
        next: ({ msg, statusCode }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading = false;
            this.modal = false;
            this.fetchAllFeedback();
          } else {
            this.toastr.error(msg);
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
        },
      });
  }
}
