import { ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { API, APIDefinition, Columns, DefaultConfig, TableModule } from 'ngx-easy-table';
import { CategoryService } from '../../services/category.service';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-categories-admin',
  standalone: true,
  imports: [TableModule, TitleScreenComponent, RouterLink],
  templateUrl: './categories-admin.component.html',
  styleUrl: './categories-admin.component.scss'
})
export class CategoriesAdminComponent implements OnInit {
  service = inject(CategoryService);
  toastr = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);

  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;

  configuration: any;
  columns: Columns[] = [];
  data: any[] = [];

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.columns = [
      { key: 'id', title: 'المعرف' },
      { key: 'name', title: 'الاسم' },
      { key: 'parentName', title: 'التصنيف الأب' },
      { key: 'edit', title: 'تعديل', cellTemplate: this.actionTpl },
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

    this.fetchCategories();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  fetchCategories(): void {
    this.configuration.isLoading = true;
    this.service.getCategories()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ({ result, statusCode, msg }) => {
          if (statusCode === 200) {
            this.data = result;
            this.configuration.isLoading = false;
            this.cdr.detectChanges();
          } else {
            this.toastr.error(msg);
            this.configuration.isLoading = false;
          }
        },
        error: (err) => {
          console.log(err);
          this.configuration.isLoading = false;
        }
      });
  }

  onChange(event: Event): void {
    this.table.apiEvent({
      type: API.onGlobalSearch,
      value: (event.target as HTMLInputElement).value,
    });
  }
}
