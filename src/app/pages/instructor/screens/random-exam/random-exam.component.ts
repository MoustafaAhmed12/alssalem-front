import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuestionsService } from '../../services/questions.service';
import { SkillService } from '../../services/skill.service';
import { AuthService } from '../../../../authentication/services/auth.service';
import { TeacherService } from '../../services/exams.service';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
type QuestionInfo = {
  id: number;
  image1Url: string;
  image2Url: string;
  skillName: string;
  difficulty: number;
  exams: any;
};
@Component({
  selector: 'app-random-exam',
  standalone: true,
  imports: [NgSelectModule, FormsModule],
  templateUrl: './random-exam.component.html',
  styleUrl: './random-exam.component.scss',
})
export class RandomExamComponent implements OnInit {
  teacherService = inject(TeacherService);
  authService = inject(AuthService);
  skillService = inject(SkillService);
  questionsService = inject(QuestionsService);
  toastr = inject(ToastrService);
  router = inject(Router);
  examsTutorials: ID_Name[] = [];
  allSkills: ID_Name[] = [];
  allQuestionTypes: ID_Name[] = [];
  name: string = '';
  tutorialId: number = 0;
  totalGrades: number = 0;
  passingPrecent: number = 80;
  durationInMinutes: number = 0;
  selectedIds: number[] = [];
  questionsTypesIds: number[] = [];
  skillsIds: number[] = [];
  easyCount: number = 0;
  mediumCount: number = 0;
  hardCount: number = 0;
  allQuestions: QuestionInfo[] = [];
  selectedQuestions: QuestionInfo[] = [];
  notSelectedQuestions: QuestionInfo[] = [];
  totalQSelected: number = 0;
  isLoadingAll: boolean = false;
  isLoading: boolean = false;

  ngOnInit() {
    const currentUserId = this.authService.currentUser().userDto.id;
    this.getAllExamsTutorials({ teacherId: currentUserId });
    this.getAllSkills();
    this.fetchAllQuestionTypes();
  }

  getTutorialId(item: ID_Name): void {
    this.tutorialId = item.id;
  }

  saveExam() {
    if (!this.name) {
      this.toastr.error('يجب ادخال اسم الاختبار');
      return;
    }
    if (!this.tutorialId) {
      this.toastr.error('يجب اختيار دورة');
      return;
    }
    if (this.selectedIds.length === 0) {
      this.toastr.error('يجب اختيار اسئلة');
      return;
    }
    this.isLoading = true;
    const questionsIds = this.selectedIds.map((q) => {
      return {
        questionId: q,
        order: 0,
      };
    });
    const x = {
      name: this.name,
      passingPrecent: this.passingPrecent,
      tutorialId: this.tutorialId,
      durationInMinutes: this.durationInMinutes,
      totalGrades: questionsIds.length,
      questionsIds,
    };
    this.teacherService.SaveExam(x).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.router.navigateByUrl('/instructor/exams');
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

  filterQuestionType(item: ID_Name[]) {
    this.selectedQuestions = [];
    this.questionsTypesIds = item.map((q) => q.id);
    this.getAllQuestion(
      this.easyCount,
      this.mediumCount,
      this.hardCount,
      this.questionsTypesIds,
      []
    );
  }
  filterSkillId(item: ID_Name[]) {
    this.selectedQuestions = [];

    this.skillsIds = item.map((q) => q.id);
    this.getAllQuestion(
      this.easyCount,
      this.mediumCount,
      this.hardCount,
      [],
      this.skillsIds
    );
  }

  handleChoose(questionId: number, event: Event, questionHasSelected: any) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedIds.includes(questionId)) {
        this.selectedIds.push(questionId);
      }
      if (!this.selectedQuestions.some((q) => q.id === questionId)) {
        this.selectedQuestions.push(questionHasSelected);
      }
    } else {
      this.selectedIds = this.selectedIds.filter((id) => id !== questionId);
      this.selectedQuestions = this.selectedQuestions.filter(
        (q) => q.id !== questionId
      );
    }
    this.notSelectedQuestions = this.allQuestions.filter(
      (item1) => !this.selectedQuestions.some((item2) => item2.id === item1.id)
    );
    this.totalQSelected = this.selectedQuestions.length;
  }

  getAllQuestion(
    easyCount: any,
    mediumCount: any,
    hardCount: any,
    questionsTypesIds: number[],
    skillsIds: number[]
  ): void {
    this.isLoadingAll = true;
    if (questionsTypesIds.length === 0 && skillsIds.length === 0) {
      this.isLoadingAll = false;
      this.allQuestions =
        this.selectedQuestions =
        this.notSelectedQuestions =
          [];
      this.totalQSelected = 0;
      return;
    }
    this.questionsService
      .getRandomExam(
        easyCount,
        mediumCount,
        hardCount,
        questionsTypesIds,
        skillsIds
      )
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.allQuestions = result;
            this.selectedIds = this.allQuestions.map((q) => q.id);
            this.selectedQuestions = this.allQuestions;
            this.notSelectedQuestions = [];
            this.totalQSelected = this.selectedQuestions.length;
            this.isLoadingAll = false;
          } else {
            this.isLoadingAll = false;
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoadingAll = false;
        },
      });
  }

  getAllExamsTutorials(teacherId: any): void {
    this.teacherService.getExamsTutorials(teacherId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.examsTutorials = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getAllSkills(): void {
    this.skillService.getSkills().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSkills = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  fetchAllQuestionTypes(): void {
    this.questionsService.getTeacherQuestionTypes().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allQuestionTypes = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
