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
import { ArticleService } from '../../services/article.service';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import Config from 'chart.js/dist/core/core.config';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-article-admin',
  standalone: true,
  imports: [TableModule, TitleScreenComponent, RouterLink],
  templateUrl: './article-admin.component.html',
  styleUrl: './article-admin.component.scss',
})
export class ArticleAdminComponent implements OnInit {
  articleService = inject(ArticleService);
  toastr = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);
  articleId: number = 0;
  ageSummary: number = 0;
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('actionToggle', { static: true }) actionToggle?: TemplateRef<any>;
  @ViewChild('editPrice', { static: true }) editPrice?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: any[] = [];
  dataCopy: any[] = [];
  isDelete: boolean = false;
  /// loading
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnInit(): void {
    this.columns = [
      { key: 'title', title: 'عنوان المقال' },
      { key: 'id', title: 'تعديل او حذف ', cellTemplate: this.actionTpl },
    ];
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationMaxSize = 7;
    this.configuration.rows = 20;
    this.configuration.tableLayout = {
      striped: true,
      hover: true,
      theme: 'light',
    };
    this.configuration.horizontalScroll = true;
    this.ageSummary = this.data
      .map((_) => _.id)
      .reduce((acc, cur) => cur + acc, 0);
    this.fetchAllArticles();
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
  remove(articleId: number): void {
    this.isDelete = true;
    this.articleService.deleteArticle(articleId).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.fetchAllArticles();
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
  fetchAllArticles(): void {
    this.configuration.isLoading = true;
    this.articleService
      .getArticles()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ({ result, statusCode, msg }) => {
          if (statusCode === 200) {
            this.data = result;
            this.dataCopy = result;
            // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
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
