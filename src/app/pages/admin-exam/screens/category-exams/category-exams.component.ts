import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminExamService } from '../../admin-exam.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute } from '@angular/router';
import { QuestionsService } from '../../../instructor/services/questions.service';
import { SkillService } from '../../../instructor/services/skill.service';
import { TeacherService } from '../../../instructor/services/exams.service';
import { AuthService } from '../../../../authentication/services/auth.service';

interface Tutorial {
  id: number;
  name: string;
}

interface Exam {
  id: number;
  tutorialId: number;
  name: string;
}

interface SelectedExam {
  tutorialId: number;
  examId: number;
  tutorialName: string;
  examName: string;
}

interface TutorialWithQuestions {
  tutorialId: number;
  tutorialName: string;
  questionIds: number[];
}

interface MockExamPayload {
  name: string;
  durationInMinutes: number;
  successPercent: number;
  isRevisionAvailable: boolean;
  tutorials: any;
  exams: { tutorialId: number; examId: number }[];
}

@Component({
  selector: 'app-category-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './category-exams.component.html',
})
export class CategoryExamsComponent implements OnInit {
  adminExam = inject(AdminExamService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  questionsService = inject(QuestionsService);
  skillService = inject(SkillService);
  teacherService = inject(TeacherService);
  authService = inject(AuthService);

  formData = {
    name: '',
    durationInMinutes: 0,
    successPercent: 0,
    isRevisionAvailable: false,
  };
  isLoading = signal<boolean>(false);
  tutorials = signal<Tutorial[]>([]);
  allExams = signal<Exam[]>([]);
  selectedExams = signal<SelectedExam[]>([]);
  tutorialsWithQuestions = signal<TutorialWithQuestions[]>([]);
  selectedTutorialId: number | null = null;
  selectedExamId: number | null = null;
  activeTab = signal<0 | 1>(0);
  questionCodeInput = '';
  selectedTutorialIdForQuestions: number | null = null;
  currentExamId: number | null = null; // To track edit mode

  // Questions Filter & Browse Properties
  allSkillsById = signal<any[]>([]);
  allQuestionTypes = signal<any[]>([]);
  allExamsToFilter = signal<{ id: number; name: string }[]>([]);
  allQuestions = signal<any[]>([]);
  notSelectedQuestions = signal<any[]>([]);
  selectedQuestions = signal<any[]>([]);
  totalQSelected = signal<number>(0);
  totalQNotSelected = signal<number>(0);
  selectedIds = signal<number[]>([]);
  isLoadingAll = signal<boolean>(false);
  isManual = false;

  pageNumber = 1;
  pageSize = 100;
  totalQuestionsCount = 0;
  searchText = '';
  questionDifficulty: any = null;
  questionTypeId: number = 0;
  skillId: number = 0;
  selectedExamsIds: number[] = [];

  ngOnInit() {
    this.getAllTutorials();
    // this.fetchAllQuestionTypes();
    // this.fetchAllExamsForFilter();
    this.getAllQuestionPaging();

    // Check for edit mode
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.currentExamId = +id;
        this.getExamDetails(this.currentExamId);
      }
    });
  }

  getExamDetails(id: number) {
    this.isLoading.set(true);
    this.adminExam.getVirtualExamById(id).subscribe({
      next: ({ result, statusCode }) => {
        this.isLoading.set(false);
        if (statusCode === 200 && result) {
          this.populateForm(result);
        } else {
          this.toastr.error('فشل في جلب بيانات الاختبار');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  populateForm(data: any) {
    this.formData = {
      name: data.name,
      durationInMinutes: data.durationInMinutes,
      successPercent: data.successPercent,
      isRevisionAvailable: data.isRevisionAvailable,
    };

    // Populate Selected Exams (Tab 0)
    if (data.exams && data.exams.length > 0) {
      this.activeTab.set(0);
      const mappedExams: SelectedExam[] = data.exams.map((e: any) => ({
        tutorialId: e.tutorialId,
        examId: e.examId,
        tutorialName: e.tutorialName || 'غير معروف', // API should ideally return this
        examName: e.examName || 'غير معروف',
      }));
      this.selectedExams.set(mappedExams);
    }

    // Populate Tutorials with Questions (Tab 1)
    if (data.tutorials && data.tutorials.length > 0) {
      this.activeTab.set(1);
      const mappedTutorials: TutorialWithQuestions[] = data.tutorials.map(
        (t: any) => ({
          tutorialId: t.tutorialId,
          tutorialName: t.tutorialName || 'غير معروف',
          questionIds: t.questionId || [], // API maps questionId (array)
        }),
      );
      this.tutorialsWithQuestions.set(mappedTutorials);

      // Populate selectedIds based on loaded tutorials
      const allIds = mappedTutorials.flatMap((t) => t.questionIds);
      this.selectedIds.set(allIds);
      const dummies = allIds.map((id) => ({
        id,
        skillName: '',
        difficulty: 1,
        text: '',
        image1Url: '',
      }));
      this.selectedQuestions.set(dummies);
      this.updateNotSelectedQuestions();
    }
  }

  getAllTutorials(): void {
    this.adminExam.getAllTutorials().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.tutorials.set(result);
        } else {
          this.toastr.error('حدث خطأ أثناء جلب الدورات');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getExamsByTutorial(id: number): void {
    this.adminExam.getExamsByTutorial(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allExams.set(result);
        } else {
          this.toastr.error('حدث خطأ أثناء جلب الاختبارات');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onTutorialChange(item: { id: number }) {
    this.getExamsByTutorial(item.id);
    this.selectedExamId = null;
  }

  addExam() {
    if (!this.selectedTutorialId || !this.selectedExamId) return;

    const tutorial = this.tutorials().find(
      (t) => t.id === this.selectedTutorialId,
    );
    const exam = this.allExams().find((e) => e.id === this.selectedExamId);

    if (!tutorial || !exam) return;

    // Check if exam is already added
    const isAlreadyAdded = this.selectedExams().some(
      (se) => se.examId === exam.id && se.tutorialId === tutorial.id,
    );

    if (isAlreadyAdded) {
      alert('هذا الاختبار مضاف بالفعل!');
      return;
    }

    this.selectedExams.update((exams) => [
      ...exams,
      {
        tutorialId: tutorial.id,
        examId: exam.id,
        tutorialName: tutorial.name,
        examName: exam.name,
      },
    ]);

    this.selectedExamId = null;
  }

  removeExam(index: number) {
    this.selectedExams.update((exams) => exams.filter((_, i) => i !== index));
  }

  // New methods for question code mode (activeTab === 1)
  onTutorialChangeForQuestions(event: any) {
    if (event && event.id) {
      this.selectedTutorialIdForQuestions = event.id;
      this.getExamsByTutorial(event.id);
      this.questionCodeInput = '';
    }
  }

  addQuestionCode(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();

      const inputValue = String(this.questionCodeInput || '').trim();
      if (!this.selectedTutorialIdForQuestions || !inputValue) {
        return;
      }

      const code = parseInt(inputValue, 10);
      if (isNaN(code)) {
        this.toastr.error('أدخل رقم صحيح للسؤال');
        return;
      }

      // Check if question code exists in ANY tutorial
      const codeExistsInAnyTutorial = this.tutorialsWithQuestions().some((t) =>
        t.questionIds.includes(code),
      );

      if (codeExistsInAnyTutorial) {
        this.toastr.warning('هذا رقم السؤال مضاف بالفعل في إحدى الدورات');
        return;
      }

      // Find or create tutorial entry
      const existing = this.tutorialsWithQuestions().find(
        (t) => t.tutorialId === this.selectedTutorialIdForQuestions,
      );

      const tutorialName = this.tutorials().find(
        (t) => t.id === this.selectedTutorialIdForQuestions,
      )?.name;

      if (existing) {
        if (!existing.questionIds.includes(code)) {
          existing.questionIds.push(code);
        }
      } else {
        this.tutorialsWithQuestions.update((tutorials) => [
          ...tutorials,
          {
            tutorialId: this.selectedTutorialIdForQuestions!,
            tutorialName: tutorialName || 'دورة',
            questionIds: [code],
          },
        ]);
      }

      if (!this.selectedIds().includes(code)) {
        this.selectedIds.update((ids) => [...ids, code]);
        this.selectedQuestions.update((qs) => [
          ...qs,
          {
            id: code,
            skillName: '',
            difficulty: 1,
            text: 'سؤال مضاف بالكود',
            image1Url: '',
          },
        ]);
      }
      this.updateNotSelectedQuestions();

      this.questionCodeInput = '';
      this.toastr.success('تم إضافة رقم السؤال');
    }
  }

  removeQuestionCode(tutorialId: number, code: number) {
    this.tutorialsWithQuestions.update((tutorials) =>
      tutorials
        .map((t) =>
          t.tutorialId === tutorialId
            ? { ...t, questionIds: t.questionIds.filter((q) => q !== code) }
            : t,
        )
        .filter((t) => t.questionIds.length > 0),
    );

    const remainingInAny = this.tutorialsWithQuestions().some((t) =>
      t.questionIds.includes(code),
    );
    if (!remainingInAny) {
      this.selectedIds.update((ids) => ids.filter((id) => id !== code));
      this.selectedQuestions.update((qs) => qs.filter((q) => q.id !== code));
      this.updateNotSelectedQuestions();
    }
  }

  removeTutorialWithQuestions(tutorialId: number) {
    const tutorial = this.tutorialsWithQuestions().find(
      (t) => t.tutorialId === tutorialId,
    );
    const removedCodes = tutorial ? tutorial.questionIds : [];

    this.tutorialsWithQuestions.update((tutorials) =>
      tutorials.filter((t) => t.tutorialId !== tutorialId),
    );

    removedCodes.forEach((code) => {
      const remainingInAny = this.tutorialsWithQuestions().some((t) =>
        t.questionIds.includes(code),
      );
      if (!remainingInAny) {
        this.selectedIds.update((ids) => ids.filter((id) => id !== code));
        this.selectedQuestions.update((qs) => qs.filter((q) => q.id !== code));
      }
    });
    this.updateNotSelectedQuestions();
  }

  // --- New Methods Built For Searching and Selecting Questions ---
  fetchAllQuestionTypes(): void {
    this.questionsService.getTeacherQuestionTypes().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allQuestionTypes.set(result);
        }
      },
    });
  }

  fetchAllExamsForFilter(): void {
    const user = this.authService.currentUser();
    const teacherId = user && user.userDto ? user.userDto.id : 0;
    this.teacherService
      .getAllExamsPerTeacherTutorials({ teacherId })
      .subscribe({
        next: ({ result, statusCode }) => {
          if (statusCode === 200) {
            this.allExamsToFilter.set(
              result.map((exam: any) => ({
                id: exam.examId,
                name: exam.examName,
              })),
            );
          }
        },
      });
  }

  getAllSkillByQuestionTypeId(id: number): void {
    this.skillService.getAllSkillByQuestionTypeId(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSkillsById.set(result);
        }
      },
    });
  }

  filterQuestionType(item: any) {
    this.questionTypeId = item?.id;
    if (item) {
      this.getAllSkillByQuestionTypeId(this.questionTypeId);
    }
    this.getAllQuestionPaging();
  }
  filterSkillId(item: any) {
    this.skillId = item?.id;
    this.getAllQuestionPaging();
  }
  filterDifficulty(item: any) {
    this.questionDifficulty = item;
    this.getAllQuestionPaging();
  }
  filterByExams(exams: any[]) {
    this.selectedExamsIds = exams.map((e) => e.id);
    this.pageNumber = 1;
    this.getAllQuestionPaging();
  }

  getAllQuestionPaging(): void {
    this.isLoadingAll.set(true);
    this.questionsService
      .getAllQuestion(
        this.pageSize,
        this.pageNumber,
        undefined,
        this.questionDifficulty,
        this.questionTypeId,
        this.skillId,
        this.searchText,
        this.selectedExamsIds,
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allQuestions.set(res.data);
            this.totalQuestionsCount = res.totalCount;
            this.updateNotSelectedQuestions();
            this.isLoadingAll.set(false);
          } else {
            this.isLoadingAll.set(false);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoadingAll.set(false);
        },
      });
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.getAllQuestionPaging();
  }

  handleSearchQuestions(event: any) {
    this.searchText = event.target.value;
    this.pageNumber = 1;
    this.getAllQuestionPaging();
  }

  updateNotSelectedQuestions() {
    this.notSelectedQuestions.set(
      this.allQuestions().filter(
        (item1) => !this.selectedIds().includes(item1.id),
      ),
    );
    this.totalQNotSelected.set(this.notSelectedQuestions().length);
    this.totalQSelected.set(this.selectedQuestions().length);
  }

  handleChoose(questionId: number, event: Event, questionHasSelected: any) {
    const checkbox = event.target as HTMLInputElement;

    if (!this.selectedTutorialIdForQuestions) {
      this.toastr.warning(
        'الرجاء اختيار الدورة أعلاه حتى يتم إضافة السؤال إليها',
      );
      checkbox.checked = !checkbox.checked; // Revert
      return;
    }

    if (checkbox.checked) {
      if (!this.selectedIds().includes(questionId)) {
        this.selectedIds.update((ids) => [...ids, questionId]);
      }
      if (!this.selectedQuestions().some((q) => q.id === questionId)) {
        this.selectedQuestions.update((qs) => [...qs, questionHasSelected]);
      }

      const existing = this.tutorialsWithQuestions().find(
        (t) => t.tutorialId === this.selectedTutorialIdForQuestions,
      );
      if (existing) {
        if (!existing.questionIds.includes(questionId)) {
          existing.questionIds.push(questionId);
        }
      } else {
        const tutorialName = this.tutorials().find(
          (t) => t.id === this.selectedTutorialIdForQuestions,
        )?.name;
        this.tutorialsWithQuestions.update((tutorials) => [
          ...tutorials,
          {
            tutorialId: this.selectedTutorialIdForQuestions!,
            tutorialName: tutorialName || 'دورة',
            questionIds: [questionId],
          },
        ]);
      }
    } else {
      this.selectedIds.update((ids) => ids.filter((id) => id !== questionId));
      this.selectedQuestions.update((qs) =>
        qs.filter((q) => q.id !== questionId),
      );

      this.tutorialsWithQuestions.update((tutorials) =>
        tutorials
          .map((t) => {
            if (t.tutorialId === this.selectedTutorialIdForQuestions) {
              return {
                ...t,
                questionIds: t.questionIds.filter((q) => q !== questionId),
              };
            }
            return t;
          })
          .filter((t) => t.questionIds.length > 0),
      );
    }
    this.updateNotSelectedQuestions();
  }

  isFormValid(): boolean {
    const hasExams =
      this.activeTab() === 0
        ? this.selectedExams().length > 0
        : this.tutorialsWithQuestions().length > 0;

    return (
      this.formData.name.trim() !== '' &&
      this.formData.durationInMinutes >= 0 &&
      this.formData.successPercent >= 0 &&
      this.formData.successPercent <= 100 &&
      hasExams
    );
  }

  submitForm() {
    if (!this.isFormValid()) {
      alert('الرجاء ملء جميع الحقول المطلوبة واختيار اختبار واحد على الأقل');
      return;
    }

    // Determine tutorials data based on activeTab
    let tutorialsData: any = [];
    if (this.activeTab() === 0) {
      // Use selectedExams for tab 0
      tutorialsData = this.selectedExams().map((exam) => ({
        tutorialId: exam.tutorialId,
        questionId: [exam.examId],
      }));
    } else {
      // Use tutorialsWithQuestions for tab 1
      tutorialsData = this.tutorialsWithQuestions().map((t) => ({
        tutorialId: t.tutorialId,
        questionId: t.questionIds,
      }));
    }
    console.log(this.selectedExams());
    const payload: MockExamPayload = {
      name: this.formData.name,
      durationInMinutes: this.formData.durationInMinutes,
      successPercent: this.formData.successPercent,
      isRevisionAvailable: this.formData.isRevisionAvailable,
      tutorials: this.selectedExams().length === 0 ? tutorialsData : null,
      exams: this.selectedExams().map((exam) => ({
        tutorialId: exam.tutorialId,
        examId: exam.examId,
      })),
    };

    if (this.currentExamId) {
      // Update
      const updatePayload = { ...payload, id: this.currentExamId };
      this.isLoading.set(true);
      this.adminExam.updateVirtualExam(updatePayload).subscribe({
        next: ({ statusCode, msg }) => {
          this.isLoading.set(false);
          if (statusCode === 200) {
            this.toastr.success(`تم تحديث الاختبار: ${payload.name}`);
            // Optional: Redirect back or stay
          } else {
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error(err);
          this.toastr.error('فشل التحديث');
        },
      });
    } else {
      // Create
      console.log(payload);
      this.isLoading.set(true);
      this.adminExam.createVirtualExam(payload).subscribe({
        next: ({ result, statusCode, msg }) => {
          if (statusCode === 200) {
            this.tutorials.set(result); // This looks suspicious, does it return tutorials?
            this.toastr.success(`تم حفظ الاختبار: ${payload.name}`);
            this.resetForm();
          } else {
            this.toastr.error(msg);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.log(err);
        },
      });
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      durationInMinutes: 0,
      successPercent: 0,
      isRevisionAvailable: false,
    };
    this.selectedExams.set([]);
    this.tutorialsWithQuestions.set([]);
    this.selectedIds.set([]);
    this.selectedQuestions.set([]);
    this.updateNotSelectedQuestions();
    this.selectedTutorialId = null;
    this.selectedExamId = null;
    this.selectedTutorialIdForQuestions = null;
    this.questionCodeInput = '';
    this.currentExamId = null;
  }
}
