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
  selector: 'app-social-media',
  standalone: true,
  imports: [TableModule, ReactiveFormsModule, NgClass, TitleScreenComponent],
  templateUrl: './social-media.component.html',
  styleUrl: './social-media.component.scss',
})
export class SocialMediaComponent implements OnInit {
  toastr = inject(ToastrService);
  adminService = inject(AdminService);
  formBuilder = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  socialId: number = 0;
  isDelete: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;
  modal: boolean = false;
  formData!: FormGroup;
  // table
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('linkSocial', { static: true }) linkSocial?: TemplateRef<any>;
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
      logo: ['null'],
      link: ['', [Validators.required]],
    });
    this.columns = [
      { key: 'name', title: 'اسم وسيلة التواصل' },
      { key: 'link', title: 'الرابط', cellTemplate: this.linkSocial },
      // { key: 'logo', title: 'الصورة' },
      { key: 'id', title: ' تعديل او حذف', cellTemplate: this.actionTpl },
    ];
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationMaxSize = 7;
    this.configuration.rows = 7;
    this.configuration.tableLayout = {
      striped: true,
      hover: true,
      theme: 'light',
    };
    this.configuration.horizontalScroll = true;
    this.fetchAllSocial();
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
  // edit fun
  edit(id: number): void {
    this.socialId = id;
    this.modal = true;
    this.formData.controls['id'].setValue(id);
  }
  // Remove fun.
  remove(id: number): void {
    this.isDelete = true;
    this.adminService
      .deleteSocialMedia({
        id: id,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.fetchAllSocial();
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
  fetchAllSocial(): void {
    this.configuration.isLoading = true;
    this.adminService
      .getAllSocialMedia()
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
  get link(): AbstractControl | null {
    return this.formData.get('link');
  }
  hideModal(): void {
    this.name?.setValidators(null);
    this.name?.updateValueAndValidity();
    this.link?.setValidators(null);
    this.link?.updateValueAndValidity();
    this.modal = false;
  }
  showModal(): void {
    this.formData.reset();
    this.formData.controls['id'].setValue(0);
    this.socialId = 0;
    this.modal = true;
  }
  onSubmit() {
    this.name?.setValidators([Validators.required]);
    this.name?.updateValueAndValidity();
    this.link?.setValidators([Validators.required]);
    this.link?.updateValueAndValidity();
    this.submitted = true;
    if (this.formData.invalid) {
      console.log('error');
      return;
    }
    this.isLoading = true;
    this.formData.get('logo')?.setValue('test');
    this.adminService.saveSocialMedia(this.formData.value).subscribe({
      next: ({ msg, statusCode }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.modal = false;
          this.fetchAllSocial();
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
