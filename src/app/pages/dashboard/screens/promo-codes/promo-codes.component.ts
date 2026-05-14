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
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';

import { PromoService } from '../../services/promo.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from '../../../../shared/services/export.service';
import { PackageTutorialService } from '../../services/package-tutorial.service';
import { ID_Name } from '../../model/admin-model';
@Component({
  selector: 'app-promo-codes',
  standalone: true,
  imports: [
    TableModule,
    NgSelectModule,
    ReactiveFormsModule,
    CommonModule,
    TitleScreenComponent,
  ],
  templateUrl: './promo-codes.component.html',
  styleUrl: './promo-codes.component.scss',
})
export class PromoCodesComponent implements OnInit {
  toastr = inject(ToastrService);
  packageTutorialService = inject(PackageTutorialService);
  promoService = inject(PromoService);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  exportService = inject(ExportService);
  isDelete: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;
  isPackage: boolean = false;
  modal: boolean = false;
  startDate: string = '';
  endDate?: string | null;
  maxDate: string = '';
  promoId: number = 0;
  formData!: FormGroup;
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('startDateTable', { static: true })
  startDateTable?: TemplateRef<any>;
  @ViewChild('actionToggle', { static: true }) actionToggle?: TemplateRef<any>;
  @ViewChild('endDateTable', { static: true }) endDateTable?: TemplateRef<any>;
  @ViewChild('totalUsed', { static: true }) totalUsed?: TemplateRef<any>;
  @ViewChild('discount', { static: true })
  discount?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: any[] = [];
  dataCopy: any[] = [];
  onePromoCode: any;
  allTutorials: ID_Name[] = [];
  softCopyTutorials: ID_Name[] = [];
  freeTutorials: ID_Name[] = [];
  packageByNames: ID_Name[] = [];
  isAll: boolean = true;
  isM: boolean = false;
  /// loading
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
    this.endDate = `${year}-${month}-${day}`;
    this.formData = this.fb.group({
      id: [''],
      customPromoCode: [null],
      promoCodeName: ['', [Validators.required]],
      numberOfPromoCodes: [0],
      discount: ['', [Validators.required]],
      freeTutorialsIds: [null],
      usageCount: ['', [Validators.required]],
      remainUsageCount: [0],
      isPrecent: [false],
      startDate: ['', [Validators.required]],
      tutorialsIds: [null, [Validators.required]],
      packageId: [null],
      benifitPeriodInWeek: [0],
      endDate: ['', [Validators.required]],
    });
    this.columns = [
      { key: 'promoCodeName', title: 'أسم كود الخصم' },
      { key: 'promoCode', title: 'كود الخصم' },
      {
        key: 'startDate',
        title: 'تاريخ بداية الخصم',
        cellTemplate: this.startDateTable,
      },
      {
        key: 'endDate',
        title: 'تاريخ نهاية الخصم',
        cellTemplate: this.endDateTable,
      },
      {
        key: 'discount',
        title: 'الخصم',
        cellTemplate: this.discount,
      },
      {
        key: 'usageCount',
        title: 'عدد الاستخدام',
        cellTemplate: this.totalUsed,
      },
      {
        key: 'isActive',
        title: 'نشط',
        cellTemplate: this.actionToggle,
      },
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
    this.fetchAllPromoCodes();
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

  changeIsActive(promoId: number, currentIsActive: boolean, event: any): void {
    // منع التغيير الفوري للـ switch
    event.preventDefault();
    // العثور على الكود الترويجي بالـ ID
    const promoCode = this.dataCopy.find((promo) => promo.id === promoId);

    if (!promoCode) {
      this.toastr.error('الكود الترويجي غير موجود');
      return;
    }

    // التحقق من العدد المتبقي والعدد الكلي
    const isUsageCountEqual =
      promoCode.remainUsageCount === promoCode.usageCount;

    // منع التفعيل إذا كان العدد المتبقي يساوي العدد الكلي (يعني لم يستخدم أبداً)
    if (promoCode.remainUsageCount === 0 && currentIsActive === false) {
      this.toastr.warning(
        'لا يمكن تفعيل الكود الترويجي - لان عدد الاستخدامات المتبقية يساوي 0'
      );
      return;
    }

    // استدعاء الـ API
    this.isLoading = true;
    this.promoService
      .ChangeActiveStatusPromoCode(!currentIsActive, [promoId])
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            // تحديث الحالة بس لما الـ API ترجع بنجاح
            promoCode.isActive = !currentIsActive;
            this.isLoading = false;
            this.toastr.success(msg);
          } else {
            this.isLoading = false;
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
          this.toastr.error('حدث خطأ أثناء تحديث الحالة');
        },
      });
  }

  setM(event: HTMLInputElement): void {
    this.isM = event.checked;
  }
  // Remove fun.
  remove(promoCodeId: number): void {
    this.isDelete = true;
    this.promoService
      .deletePromoCode({
        id: promoCodeId,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.fetchAllPromoCodes();
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
  edit(promoId: number): void {
    this.promoId = promoId;
    this.modal = true;
    this.formData.controls['id'].setValue(promoId);
    if (promoId > 0) {
      this.getPromoCodeById(promoId);
    }
  }
  fetchAllPromoCodes(): void {
    this.configuration.isLoading = true;
    this.promoService
      .getAllPromoCodes()
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
  getPromoCodeById(id: number): void {
    this.isLoading = true;
    this.promoService
      .getPromoCodeById({
        id: id,
      })
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.onePromoCode = result;
            this.fetchAllTutorials();
            if (this.onePromoCode.isPagackage) {
              this.getPackageByName();
            }
            this.isLoading = false;
            this.isPackage = this.onePromoCode.isPagackage;
            this.formData.patchValue({
              id: this.onePromoCode.id,
              discount: this.onePromoCode.discount,
              promoCodeName: this.onePromoCode.promoName,
              isPrecent: this.onePromoCode.isPrecent,
              startDate: this.onePromoCode.startDate.split('T')[0],
              endDate: this.onePromoCode.endDate.split('T')[0],
              usageCount: this.onePromoCode.usageCount,
              // remainUsageCount:
              //   this.onePromoCode.usageCount -
              //   this.onePromoCode.remainUsageCount,
              packageId: this.onePromoCode.packageId,
              tutorialsIds: this.onePromoCode.tutorials
                ?.filter((t: any) => t.isFree == false)
                .map((t: any) => t.id),
              freeTutorialsIds: this.onePromoCode.tutorials
                ?.filter((t: any) => t.isFree == true)
                .map((t: any) => t.id),
            });
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
  hideModal(): void {
    this.removeFormValidators();
    this.modal = false;
  }
  showModal(): void {
    this.formData.reset();
    this.fetchAllTutorials();
    this.promoId = 0;
    this.formData.controls['id'].setValue(0);
    this.modal = true;
  }
  setFormValidators(): void {
    this.formData?.setValidators([Validators.required]);
  }
  removeFormValidators(): void {
    this.formData?.setValidators(null);
  }
  onSubmit() {
    this.setFormValidators();
    this.submitted = true;
    this.isLoading = true;
    if (this.formData.value.startDate > this.formData.value.endDate) {
      this.toastr.error('تأكد من صلاحية التاريخ');
      return;
    }
    if (this.formData.controls['isPrecent'].value == null) {
      this.formData.controls['isPrecent'].setValue(false);
    }
    if (this.formData.controls['customPromoCode'].value !== null) {
      this.formData.controls['numberOfPromoCodes'].setValue(0);
    }
    this.formData.get('packageId')?.valueChanges.subscribe((value) => {
      if (value) {
        this.formData.get('tutorialsIds')?.setValue(null);
      }
    });
    this.formData.get('tutorialsIds')?.valueChanges.subscribe((value) => {
      if (value) {
        this.formData.get('packageId')?.setValue(null);
      }
    });
    if (this.promoId === 0) {
      this.promoService
        .generateRandomPromoCodes(this.formData.value)
        .subscribe({
          next: ({ msg, statusCode }) => {
            if (statusCode === 200) {
              this.toastr.success(msg);
              this.isLoading = false;
              this.modal = false;
              this.fetchAllPromoCodes();
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
    } else {
      if (this.formData.get('remainUsageCount')?.value === null) {
        this.toastr.error('عدد الاستخدام المتبقي مطلوب');
      }
      this.promoService.updatePromoCode(this.formData.value).subscribe({
        next: ({ msg, statusCode }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading = false;
            this.modal = false;
            this.fetchAllPromoCodes();
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
  exportTable(): void {
    this.exportService.exportTableToExcelPromoCodes(this.data, 'أكواد خصم');
  }
  handleFilter(items: ID_Name[]): void {
    if (items[0]?.id === 0) {
      this.freeTutorials = [];
      this.softCopyTutorials = [];
      const allIds = this.allTutorials.map((v) => v.id);
      this.formData.get('tutorialsIds')?.setValue(allIds);
    } else {
      this.softCopyTutorials = this.allTutorials;
    }
    if (items.length === 0) {
      this.isAll = true;
    } else {
      this.isAll = false;
    }
  }
  fetchAllTutorials(): void {
    this.packageTutorialService.getAllSystemTutorials().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allTutorials =
            this.freeTutorials =
            this.softCopyTutorials =
              result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getPackageByName(): void {
    this.packageTutorialService.getPackageByName().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.packageByNames = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  isPackageFun(event: any): void {
    this.isPackage = event.target.checked;
    if (this.isPackage) {
      this.getPackageByName();
      this.formData.get('tutorialsIds')?.setValue(null);
    } else {
      this.formData.get('isPackage')?.setValue(null);
      this.formData.get('packageId')?.setValue(null);
    }
  }
}
