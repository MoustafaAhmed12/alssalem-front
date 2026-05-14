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
import { ID_Name } from '../../model/admin-model';
import { SchoolService } from '../../services/school.service';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
@Component({
  selector: 'app-school-admin',
  standalone: true,
  imports: [TableModule, ReactiveFormsModule, NgClass],
  templateUrl: './school-admin.component.html',
  styleUrl: './school-admin.component.scss',
})
export class SchoolAdminComponent implements OnInit {
  toastr = inject(ToastrService);
  schoolService = inject(SchoolService);
  formBuilder = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  schoolId: number = 0;
  isDelete: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;
  modal: boolean = false;
  formData!: FormGroup;
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('precent', { static: true }) precent?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: ID_Name[] = [];
  dataCopy: ID_Name[] = [];
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
      precent: [0],
    });
    this.columns = [
      { key: 'name', title: 'أسم المدرسة' },
      { key: 'precent', title: 'نسبة الاشتراك', cellTemplate: this.precent },
      { key: 'id', title: 'تعديل أو حذف', cellTemplate: this.actionTpl },
    ];
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationMaxSize = 7;
    this.configuration.rows = 10;
    this.configuration.tableLayout = {
      striped: true,
      hover: true,
      theme: 'light',
    };
    this.configuration.horizontalScroll = true;
    this.fetchAllSchools();
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
  edit(schoolId: number): void {
    this.schoolId = schoolId;
    this.modal = true;
    this.formData.controls['id'].setValue(schoolId);
    if (schoolId > 0) {
      this.fetchSchool({
        schoolId: schoolId,
      });
    }
  }
  fetchSchool(schoolId: { schoolId: number }): void {
    this.isLoading = true;
    this.schoolService.getSchoolById(schoolId).subscribe({
      next: ({ result, statusCode, msg }) => {
        if (statusCode == 200) {
          const school = result;
          this.formData.patchValue({
            name: school.name,
            precent: school.precent,
          });
          this.isLoading = false;
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
    });
  }
  remove(schoolId: number): void {
    this.isDelete = true;
    this.schoolService
      .deleteSchool({
        schoolId: schoolId,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.fetchAllSchools();
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
  fetchAllSchools(): void {
    this.configuration.isLoading = true;
    this.schoolService
      .getSystemSchools()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ({ result, statusCode, msg }) => {
          if (statusCode === 200) {
            this.data = this.dataCopy = result.sort((a: any, b: any) =>
              a.name.localeCompare(b.name, 'ar')
            );
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
    if (this.formData.get('precent')?.value === null) {
      this.formData.get('precent')?.setValue(0);
    }
    this.isLoading = true;
    this.schoolService.SaveSchool(this.formData.value).subscribe({
      next: ({ msg, statusCode }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.modal = false;
          this.fetchAllSchools();
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
