import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  ChangeDetectorRef,
  signal,
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
import { Router } from '@angular/router';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { CommentsService } from '../../services/comments.service';
import { Comment } from '../../model/admin-model';
@Component({
  selector: 'app-comments-admin',
  standalone: true,
  imports: [TableModule, NgClass, TitleScreenComponent],
  templateUrl: './comments-admin.component.html',
  styleUrl: './comments-admin.component.scss',
})
export class CommentsAdminComponent implements OnInit {
  toastr = inject(ToastrService);
  commentsService = inject(CommentsService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  commentId: number = 0;
  isLoading = signal<boolean>(false);
  ageSummary: number = 0;
  // table
  @ViewChild('table') table: APIDefinition | any;
  // edit
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('comment', { static: true }) comment?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: Comment[] = [];
  dataCopy: Comment[] = [];
  /// loading
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnInit(): void {
    this.columns = [
      { key: 'studentName', title: 'إسم الطالب' },
      { key: 'comment', title: 'التعليق', cellTemplate: this.comment },
      { key: 'tutorialName', title: 'إسم الدورة' },
      { key: 'id', title: 'إظهار بالموقع ', cellTemplate: this.actionTpl },
    ];
    this.configuration = { ...DefaultConfig };
    // max size for pagination === 7
    this.configuration.paginationMaxSize = 7;
    // this.configuration.fixedColumnWidth = false;
    this.configuration.rows = 25;
    this.configuration.tableLayout = {
      striped: true,
      hover: true,
      theme: 'light',
    };
    this.configuration.horizontalScroll = true;
    this.ageSummary = this.data
      .map((_) => _.id)
      .reduce((acc, cur) => cur + acc, 0);
    this.fetchComments();
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
  fetchComments(): void {
    this.configuration.isLoading = true;
    this.commentsService
      .getAllComments()
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
  // changeIsActive fun.
  IsActive(commentId: number): void {
    this.isLoading.set(true);
    this.commentsService
      .updateCommentApproval({
        commentId: commentId,
        isApproved: true,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.isLoading.update((v) => (v = false));
            this.fetchComments();
            this.toastr.success(msg);
          } else {
            this.isLoading.update((v) => (v = false));
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
  }
  IsHide(commentId: number): void {
    this.isLoading.set(true);
    this.commentsService
      .updateCommentApproval({
        commentId: commentId,
        isApproved: false,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.isLoading.update((v) => (v = false));
            this.toastr.success(msg);
            this.fetchComments();
          } else {
            this.isLoading.update((v) => (v = false));
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
  }
}
