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
import { FormsModule } from '@angular/forms';
import { ID_Name } from '../../model/admin-model';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { QuestionsService } from '../../../instructor/services/questions.service';
@Component({
  selector: 'app-question-types',
  standalone: true,
  imports: [TableModule, FormsModule, NgClass, TitleScreenComponent],
  templateUrl: './question-types.component.html',
  styleUrl: './question-types.component.scss',
})
export class QuestionTypesComponent implements OnInit {
  toastr = inject(ToastrService);
  questionsService = inject(QuestionsService);
  cdr = inject(ChangeDetectorRef);
  questionId: number = 0;
  questionTypeName: string = '';
  isDelete: boolean = false;
  isLoading: boolean = false;
  modal: boolean = false;
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
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
    this.columns = [
      { key: 'name', title: 'نوع السؤال' },
      { key: 'id', title: 'تعديل', cellTemplate: this.actionTpl },
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
    this.fetchAllQuestionTypes();
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
  fetchAllQuestionTypes(): void {
    this.configuration.isLoading = true;
    this.questionsService
      .getTeacherQuestionTypes()
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
  hideModal(): void {
    this.modal = false;
    this.questionTypeName = '';
  }
  showModal(): void {
    this.questionId = 0;
    this.modal = true;
  }
  edit(questionId: number): void {
    this.questionId = questionId;
    this.questionTypeName = this.data.filter(
      (s) => s.id === questionId
    )[0].name;
    this.modal = true;
  }
  onSubmit() {
    if (!this.questionTypeName) {
      this.toastr.error('نوع السؤال مطلوب');
      return;
    }
    this.isLoading = true;
    this.questionsService
      .saveQuestionTypes({ id: this.questionId, name: this.questionTypeName })
      .subscribe({
        next: ({ msg, statusCode }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading = false;
            this.modal = false;
            this.questionTypeName = '';
            this.fetchAllQuestionTypes();
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
