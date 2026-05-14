import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import {
  CorrectionExam,
  MainDetailsExam,
} from '../../../../model/question-student';
import { ConvertMinutesToTimePipe } from '../../../../../../shared/Pipes/convert-minutes-to-time-pipe.pipe';
import { DuringExamComponent } from '../during-exam/during-exam.component';
import { ExamService } from '../../../../services/exam.service';
import { CorrectionExamComponent } from '../correction-exam/correction-exam.component';
import { IsCompletedExamComponent } from '../is-completed-exam/is-completed-exam.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-start-exam',
  standalone: true,
  imports: [
    ConvertMinutesToTimePipe,
    DuringExamComponent,
    CorrectionExamComponent,
    IsCompletedExamComponent,
    RouterLink,
  ],
  templateUrl: './start-exam.component.html',
  styleUrl: './start-exam.component.scss',
  animations: [
    trigger('tabAnimation', [
      state(
        'tab1',
        style({
          opacity: 1,
          transform: 'scale(1)',
        }),
      ),
      state(
        'tab2',
        style({
          opacity: 1,
          transform: 'scale(1)',
        }),
      ),
      state(
        'tab3',
        style({
          opacity: 1,
          transform: 'scale(1)',
        }),
      ),
      state(
        'tab4',
        style({
          opacity: 1,
          transform: 'scale(1)',
        }),
      ),
      transition('* => *', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('250ms ease-out'),
      ]),
    ]),
  ],
})
export class StartExamComponent implements OnInit {
  examService = inject(ExamService);
  route = inject(ActivatedRoute);
  titleService = inject(Title);
  metaService = inject(Meta);
  correctionExam: CorrectionExam = {} as CorrectionExam;
  mainDetailsExam: MainDetailsExam = {} as MainDetailsExam;
  isLoading = signal<boolean>(false);
  examId: number = 0;
  tutorialId: number = 0;
  selectedTab: number = 1;
  takeTime: number = 1;

  constructor() {
    this.route.parent?.params.subscribe((params) => {
      this.tutorialId = +params['tutorialId'];
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.examId = +params['examId'];
      this.getExamDetails(this.examId, this.tutorialId);
    });
  }

  getExamDetails(examId: number, tutorialId: number): void {
    this.isLoading.set(true);
    this.examService.getExamDetails(examId, tutorialId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.selectedTab = 1;
          this.mainDetailsExam = result;
          this.titleService.setTitle(
            `منصة السالم التعليمية للاختبارات - ${result.name}`,
          );
          this.metaService.updateTag({
            name: 'description',
            content: `ابدأ اختبار ${result.name} الآن على منصة السالم التعليمية. تحقق من مستواك وحسن مهاراتك.`,
          });
          this.isLoading.update((v) => (v = false));
          if (this.mainDetailsExam.hasPrviousTrail) {
            this.selectedTab = 4;
          }
        } else {
          this.isLoading.update((v) => (v = false));
          this.selectedTab = 0;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }
}
