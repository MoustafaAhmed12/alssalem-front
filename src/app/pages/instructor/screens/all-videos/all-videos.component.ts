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
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { AuthService } from '../../../../authentication/services/auth.service';
import { TeacherService } from '../../services/teacher.service';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { Video } from '../../model/teacher';
@Component({
  selector: 'app-all-videos',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    TitleScreenComponent,
    VideoUploadComponent,
  ],
  templateUrl: './all-videos.component.html',
  styleUrl: './all-videos.component.scss',
})
export class AllVideosComponent implements OnInit {
  toastr = inject(ToastrService);
  teacherService = inject(TeacherService);
  authService = inject(AuthService);
  currentUser: any;
  cdr = inject(ChangeDetectorRef);
  isDelete: boolean = false;
  ageSummary: number = 0;
  // table
  @ViewChild('table') table: APIDefinition | any;
  // edit
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  @ViewChild('date', { static: true }) date?: TemplateRef<any>;
  @ViewChild('link', { static: true }) link?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: Video[] = [];
  dataCopy: Video[] = [];
  /// loading
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnInit(): void {
    this.columns = [
      { key: 'name', title: 'أسم الفيديو' },
      { key: 'uploadedAt', title: 'تاريخ الرفع', cellTemplate: this.date },
      { key: 'link', title: 'الرابط', cellTemplate: this.link },
      { key: 'id', title: ' حذف', cellTemplate: this.actionTpl },
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
    this.ageSummary = this.data
      .map((_) => _.id)
      .reduce((acc, cur) => cur + acc, 0);
    this.currentUser = this.authService.currentUser().userDto;
    this.fetchAllVideos({ userId: this.currentUser.id });
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
  // Remove fun.
  remove(videoId: number): void {
    this.isDelete = true;
    this.teacherService
      .deleteVideo({
        videoId: videoId,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.fetchAllVideos({ userId: this.currentUser.id });
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
  fetchAllVideos(userId: any): void {
    this.configuration.isLoading = true;
    this.teacherService
      .getAllVideos(userId)
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
}
