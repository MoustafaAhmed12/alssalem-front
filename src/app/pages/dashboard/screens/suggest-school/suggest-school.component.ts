import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import {
  API,
  APIDefinition,
  Columns,
  DefaultConfig,
  TableModule,
} from 'ngx-easy-table';
import { ToastrService } from 'ngx-toastr';
import { SchoolService } from '../../services/school.service';
import Config from 'chart.js/dist/core/core.config';
import { Subject, takeUntil } from 'rxjs';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-suggest-school',
  standalone: true,
  imports: [TableModule, TitleScreenComponent, NgClass],
  templateUrl: './suggest-school.component.html',
  styleUrl: './suggest-school.component.scss',
})
export class SuggestSchoolComponent implements OnInit {
  schoolService = inject(SchoolService);
  toastr = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);
  schoolId: number = 0;
  isDelete: boolean = false;
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('type', { static: true }) type?: TemplateRef<any>;
  @ViewChild('gender', { static: true }) gender?: TemplateRef<any>;
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
    this.columns = [
      { key: 'name', title: 'أسم المدرسة' },
      { key: 'schoolType', title: 'نوع المدرسة', cellTemplate: this.type },
      { key: 'gender', title: 'بنين ام بنات', cellTemplate: this.gender },
      { key: 'city', title: 'المدينة' },
      { key: 'id', title: 'حذف', cellTemplate: this.actionTpl },
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
  remove(schoolId: number): void {
    this.isDelete = true;
    this.schoolService.deleteSuggestSchool(schoolId).subscribe({
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
      .getSuggestedSchools()
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
}
