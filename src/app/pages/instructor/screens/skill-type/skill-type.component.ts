import {
  ChangeDetectorRef,
  Component,
  inject,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { NgClass } from '@angular/common';
import {
  API,
  APIDefinition,
  Columns,
  DefaultConfig,
  TableModule,
} from 'ngx-easy-table';
import { ToastrService } from 'ngx-toastr';
import { QuestionsService } from '../../services/questions.service';
import Config from 'chart.js/dist/core/core.config';
import { Subject, takeUntil } from 'rxjs';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { SkillService } from '../../services/skill.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-skill-type',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    NgClass,
    NgSelectModule,
    TitleScreenComponent,
  ],
  templateUrl: './skill-type.component.html',
  styleUrl: './skill-type.component.scss',
})
export class SkillTypeComponent {
  toastr = inject(ToastrService);
  questionsService = inject(QuestionsService);
  skillService = inject(SkillService);
  cdr = inject(ChangeDetectorRef);
  skillId: number = 0;
  skillName: string = '';
  id: number | null = 0;
  isDelete: boolean = false;
  isLoading = signal<boolean>(false);
  modal: boolean = false;
  @ViewChild('table') table: APIDefinition | any;
  @ViewChild('actionTpl', { static: true }) actionTpl?: TemplateRef<any>;
  configuration: Config | any;
  columns: Columns[] = [];
  data: any[] = [];
  dataCopy: any[] = [];
  allQuestionTypes: ID_Name[] = [];
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  isOpen = signal<boolean>(false);
  errorMsg = signal<string>('');
  ngOnInit(): void {
    this.columns = [
      { key: 'name', title: 'اسم المهارة' },
      { key: 'questionTypeName', title: 'نوع السؤال' },
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
    this.fetchAllSlillTypes();
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
  skilId = signal<number>(0);
  openPopup(id: number): void {
    this.skilId.set(id);
    this.isOpen.set(true);
  }

  close() {
    this.skilId.set(0);
    this.isOpen.set(false);
    this.errorMsg.set('');
  }
  fetchAllQuestionTypes(): void {
    this.questionsService.getTeacherQuestionTypes().subscribe({
      next: ({ result, statusCode, msg }) => {
        if (statusCode === 200) {
          this.allQuestionTypes = result;
        } else {
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  fetchAllSlillTypes(): void {
    this.configuration.isLoading = true;
    this.skillService
      .getSkills()
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
  selectQuestionType(item: ID_Name): void {
    this.id = item.id;
  }
  hideModal(): void {
    this.modal = false;
  }
  showModal(): void {
    this.skillId = 0;
    this.id = null;
    this.skillName = '';
    this.modal = true;
  }
  onSubmit() {
    if (!this.skillName) {
      this.toastr.error('أسم المهارة مطلوب');
      return;
    }
    if (!this.id) {
      this.toastr.error('نوع السؤال مطلوب');
      return;
    }
    this.isLoading.set(true);
    if (this.skillId === 0) {
      this.skillService
        .addSkill({ name: this.skillName, questionTypeId: this.id })
        .subscribe({
          next: ({ msg, statusCode }) => {
            if (statusCode === 200) {
              this.toastr.success(msg);
              this.isLoading.update((v) => (v = false));
              this.skillName = '';
              this.id = null;
              this.skillId = 0;
              this.modal = false;
              this.fetchAllSlillTypes();
            } else {
              this.toastr.error(msg);
              this.isLoading.update((v) => (v = false));
            }
          },
          error: (err) => {
            console.log(err);
            this.isLoading.update((v) => (v = false));
          },
        });
    } else {
      this.skillService
        .updateSkill({
          id: this.skillId,
          name: this.skillName,
          questionTypeId: this.id,
        })
        .subscribe({
          next: ({ msg, statusCode }) => {
            if (statusCode === 200) {
              this.toastr.success(msg);
              this.isLoading.update((v) => (v = false));
              this.modal = false;
              this.skillName = '';
              this.id = null;
              this.skillId = 0;
              this.fetchAllSlillTypes();
            } else {
              this.toastr.error(msg);
              this.isLoading.update((v) => (v = false));
            }
          },
          error: (err) => {
            console.log(err);
            this.isLoading.update((v) => (v = false));
          },
        });
    }
  }
  edit(skillId: number, questionTypeSelect: NgSelectComponent): void {
    this.skillId = skillId;
    this.skillName = this.data.filter((s) => s.id === skillId)[0].name;
    let name = this.data.filter((s) => s.id === skillId)[0].questionTypeName;
    let id: number = this.allQuestionTypes.filter((v) => v.name === name)[0].id;
    this.id = id;
    questionTypeSelect.bindValue = 'id';
    this.modal = true;
  }

  remove(): void {
    this.isDelete = true;
    this.skillService.deleteStSkill(this.skilId()).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.data = this.dataCopy = this.data.filter(
            (v) => v.id !== this.skilId()
          );
          this.isDelete = false;
          this.skilId.set(0);
          this.errorMsg.set('');
          this.toastr.success(msg);
        } else {
          this.errorMsg.set('لا يمكن حذف هذه المهارة لانها مرتبطة بالأسئلة');
        
          // this.toastr.error(msg);
          this.isDelete = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isDelete = false;
      },
    });
  }
}
