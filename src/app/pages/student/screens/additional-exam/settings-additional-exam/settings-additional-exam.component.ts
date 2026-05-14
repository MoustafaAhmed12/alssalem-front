import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AdditonalExamService } from '../../../services/additonal-exam.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdditionalExamComponent } from '../additional-exam/additional-exam.component';
import { Exam, ReviewExam } from '../../../model/additional-exam';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultAdditionalExamComponent } from '../result-additional-exam/result-additional-exam.component';
import { ReviewAdditionalExamComponent } from '../review-additional-exam/review-additional-exam.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-settings-additional-exam',
  standalone: true,
  imports: [
    FormsModule,
    AdditionalExamComponent,
    ResultAdditionalExamComponent,
    ReviewAdditionalExamComponent,
    NgSelectModule,
  ],
  templateUrl: './settings-additional-exam.component.html',
  styleUrl: './settings-additional-exam.component.scss',
})
export class SettingsAdditionalExamComponent implements OnInit {
  additonalExamService = inject(AdditonalExamService);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  tutorialId: number = 0;
  isLoadingSkills = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isLoadingReview = signal<boolean>(false);
  isFailedSkillsOnly = signal<boolean>(false);
  allSkills: { id: number; name: string }[] = [];
  isSkills: boolean = false;
  activeSkillIds: number[] = [];
  easy: number = 30;
  medium: number = 60;
  hard: number = 10;
  activeTab: number = 0;
  exam: Exam = {} as Exam;
  examId: number = 0;
  selectAll: boolean = true;
  correctionExamDetails: any;
  examInfo: { questionId: number; choice: number }[] = [];
  reviewExamInfo: ReviewExam = {} as ReviewExam;
  isEnglish: boolean = false;
  choicesCount: number = 4;
  questionCount: number = 20;

  constructor() {
    this.route.parent?.params.subscribe((params) => {
      this.tutorialId = +params['tutorialId'];
    });
    this.route.params.subscribe((params) => {
      this.examId = +params['examId'];
    });
  }

  ngOnInit(): void {
    if (this.examId) {
      this.getAllExamSkills(this.examId);
    }
  }

  getAllExamSkills(tutorilId: number): void {
    this.isLoadingSkills.set(true);
    this.additonalExamService.getAllExamSkills(tutorilId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.isLoadingSkills.set(false);
          if (result.tutorialQuetionTypes === null) {
            this.allSkills = result.tutorialSkills;
            this.isSkills = true;
          } else {
            this.allSkills = result.tutorialQuetionTypes;
            this.isSkills = false;
          }
          this.activeSkillIds = this.allSkills.map((s) => s.id);
          this.selectAll = true;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSkills.set(false);
      },
    });
  }

  getNotPassedSkills(examId: number): void {
    this.isLoadingSkills.set(true);
    this.additonalExamService.getNotPassedSkills(examId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.isLoadingSkills.set(false);
          this.allSkills = result.map((s: any) => ({
            id: s.skillId,
            name: s.skillName,
          }));
          this.isSkills = true;
          this.activeSkillIds = this.allSkills.map((s) => s.id);
          this.selectAll = true;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSkills.set(false);
      },
    });
  }

  toggleFailedSkills(event: any): void {
    this.isFailedSkillsOnly.set(event.target.checked);
    if (this.isFailedSkillsOnly()) {
      this.getNotPassedSkills(this.examId);
    } else {
      this.getAllExamSkills(this.examId);
    }
  }

  toggleSelectAll() {
    if (this.selectAll) {
      this.activeSkillIds = [];
    } else {
      this.activeSkillIds = this.allSkills.map((s) => s.id);
    }
    this.selectAll = !this.selectAll;
  }

  toggleActiveSkill(id: number) {
    const index = this.activeSkillIds.indexOf(id);
    if (index === -1) {
      this.activeSkillIds.push(id);
    } else {
      this.activeSkillIds.splice(index, 1);
    }
    this.selectAll = this.activeSkillIds.length === this.allSkills.length;
  }

  updateRange(changed: 'easy' | 'medium' | 'hard', event: any) {
    const newValue = Number(event.target.value);
    let remaining = 100 - newValue;
    if (remaining < 0) remaining = 0;

    if (changed === 'easy') {
      const totalOther = this.medium + this.hard;
      if (totalOther > 0) {
        const factor = remaining / totalOther;
        this.medium = Math.round(this.medium * factor);
        this.hard = remaining - this.medium;
      } else {
        this.medium = 0;
        this.hard = 0;
      }
    } else if (changed === 'medium') {
      const totalOther = this.easy + this.hard;
      if (totalOther > 0) {
        const factor = remaining / totalOther;
        this.easy = Math.round(this.easy * factor);
        this.hard = remaining - this.easy;
      } else {
        this.easy = 0;
        this.hard = 0;
      }
    } else if (changed === 'hard') {
      const totalOther = this.easy + this.medium;
      if (totalOther > 0) {
        const factor = remaining / totalOther;
        this.easy = Math.round(this.easy * factor);
        this.medium = remaining - this.easy;
      } else {
        this.easy = 0;
        this.medium = 0;
      }
    }
    this[changed] = newValue;
  }

  getRandomExam(): void {
    if (this.activeSkillIds.length === 0) {
      this.toastr.warning('يجب اختيار مهارة');
      return;
    }
    if (this.easy + this.medium + this.hard !== 100) {
      this.toastr.warning('يجب ان يكون مجموع المستويات = 100%');
      return;
    }
    this.isLoading.set(true);
    this.activeTab = 1;
    this.additonalExamService
      .getRandomExam(
        this.tutorialId,
        this.activeSkillIds,
        this.isSkills,
        this.easy,
        this.medium,
        this.hard,
        this.questionCount,
      )
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.isLoading.update((v) => (v = false));
            this.exam = result as Exam;
            this.isEnglish = result.isEnglish;
            this.choicesCount = result.choicesCount;
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
  }

  getTheResultExam(result: any): void {
    this.correctionExamDetails = result;
  }
  getTheExamInfo(info: any): void {
    this.examInfo = info;
  }

  reviewQuickExam(): void {
    this.activeTab = 3;
    this.isLoadingReview.set(true);
    this.additonalExamService.reviewQuickExam(this.examInfo).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.isLoadingReview.update((v) => (v = false));
          this.reviewExamInfo = {
            questions: result,
            choicesCount: this.choicesCount,
            isEnglish: this.isEnglish,
          };
        } else {
          this.toastr.error(msg);
          this.isLoadingReview.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingReview.update((v) => (v = false));
      },
    });
  }

  changeTab(getTab: number): void {
    this.activeTab = getTab;
  }
  hideModal(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
