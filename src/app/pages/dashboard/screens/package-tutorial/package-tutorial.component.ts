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
import { Router } from '@angular/router';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { PackageTutorialService } from '../../services/package-tutorial.service';
import { PackageInfo } from '../../../../shared/shared-model/package-model';
@Component({
  selector: 'app-package-tutorial',
  standalone: true,
  imports: [TableModule, CommonModule, TitleScreenComponent],
  templateUrl: './package-tutorial.component.html',
  styleUrl: './package-tutorial.component.scss',
})
export class PackageTutorialComponent implements OnInit {
  toastr = inject(ToastrService);
  packageTutorialService = inject(PackageTutorialService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  packageId: number = 0;
  ageSummary: number = 0;
  isLoading: boolean = false;
  // table
  @ViewChild('table') table: APIDefinition | any;
  // edit
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('actionToggle', { static: true }) actionToggle?: TemplateRef<any>;
  @ViewChild('editPrice', { static: true }) editPrice?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: PackageInfo[] = [];
  dataCopy: PackageInfo[] = [];
  /// loading
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor() {}
  ngOnInit(): void {
    this.columns = [
      { key: 'name', title: 'أسم العرض' },
      { key: 'tutorialNo', title: ' عدد الدورات' },
      { key: 'price', title: ' سعر العرض', cellTemplate: this.editPrice },
      {
        key: 'isActive',
        title: 'إظهار بالموقع',
        cellTemplate: this.actionToggle,
      },
      { key: 'id', title: 'تعديل أو حذف ', cellTemplate: this.actionTpl },
    ];
    this.configuration = { ...DefaultConfig };
    // max size for pagination === 7
    this.configuration.paginationMaxSize = 7;
    // this.configuration.fixedColumnWidth = false;
    this.configuration.rows = 10;
    this.configuration.tableLayout = {
      striped: true,
      hover: true,
      theme: 'light',
    };
    this.configuration.horizontalScroll = true;
    this.ageSummary = this.data
      .map((_) => _.id)
      .reduce((acc, cur) => cur + acc, 0);
    this.fetchAllPackages();
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  onEvent($event: { event: string; value: { key: string; value: string }[] }) {
    if ($event.event !== 'onSearch') {
      return;
    }
    const filterKey = $event.value[0].key;
    const filterVal = $event.value[0].value;
    this.ageSummary = this.data
      .filter((item: any) => `${item[filterKey]}`.includes(filterVal))
      .map((_) => _.id)
      .reduce((acc, cur) => cur + acc, 0);
  }
  // Search
  onChange(event: Event): void {
    this.table.apiEvent({
      type: API.onGlobalSearch,
      value: (event.target as HTMLInputElement).value,
    });
  }
  // edit fun
  edit(packageId: number): void {
    this.router.navigate(['/admin/package-tutorials/', packageId]);
  }
  // goTo Add User
  goToAddPackage(): void {
    this.router.navigate(['/admin/package-tutorials/', 0]);
  }
  // changeIsActive fun.
  changeIsActive(packageId: number): void {
    this.isLoading = true;
    this.packageTutorialService
      .activateAndDeActivatePackage({
        packageId: packageId,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.fetchAllPackages();
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
        },
      });
  }
  fetchAllPackages(): void {
    this.configuration.isLoading = true;
    this.packageTutorialService
      .getPackages()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ({ result, statusCode, msg }) => {
          if (statusCode === 200) {
            this.data = result;
            this.dataCopy = result;
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
}
