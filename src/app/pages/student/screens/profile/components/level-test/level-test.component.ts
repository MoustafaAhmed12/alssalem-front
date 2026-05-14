import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { ProfileService } from '../../../../services/profile.service';
import { ExamService } from '../../../../services/exam.service';
import { ToastrService } from 'ngx-toastr';
import { AdditionalExamComponent } from '../../../additional-exam/additional-exam/additional-exam.component';
import { ResultAdditionalExamComponent } from '../../../additional-exam/result-additional-exam/result-additional-exam.component';
import { NavbarComponent } from '../../../../../../shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { PlanStudyFormComponent } from '../../plan-study-form/plan-study-form.component';
export type Exam = {
  isEnglish: boolean;
  choicesCount: number;
  questions: {
    id: number;
    image1Url: string;
    image2Url: string;
    text: string;
  }[];
};

export interface ResultExam {
  precent: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  takenTime: number;
  questionsLength: number;
  questionsTypesPrecent: QuestionsTypesPrecent[];
}

export interface QuestionsTypesPrecent {
  name: string;
  precent: number;
}

export interface ReviewExam {
  questions: Questions[];
  choicesCount: number;
  isEnglish: boolean;
}

type Questions = {
  id: number;
  image1Url: any;
  image2Url: any;
  text: any;
  answerUrl: string;
  correctChoice: number;
  difficulty: number;
  choice: number;
  isFavourite: boolean;
};
interface Category {
  id: number;
  name: string;
  tutorialId: number;
  percent: number;
  examId: number;
  completed: boolean;
}

interface MainSection {
  id: number;
  name: string;
  icon: string;
  subcategories: Category[];
}

interface TestResult {
  startDate: string;
  categories: {
    id: number;
    percent: number;
  }[];
}

interface Tab {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-level-test',
  standalone: true,
  imports: [
    CommonModule,
    AdditionalExamComponent,
    ResultAdditionalExamComponent,
    NavbarComponent,
    FormsModule,
    PlanStudyFormComponent,
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '500ms ease-in-out',
          style({ transform: 'translateX(0%)', opacity: 1 }),
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in-out',
          style({ transform: 'translateX(-100%)', opacity: 0 }),
        ),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate(
          '400ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 }),
        ),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
    trigger('staggerList', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
    trigger('progressBar', [
      transition('* => *', [style({ width: '0%' }), animate('800ms ease-out')]),
    ]),
    trigger('tabSlide', [
      state('active', style({ transform: 'translateX(0)', opacity: 1 })),
      state('inactive', style({ transform: 'translateX(100%)', opacity: 0 })),
      transition('inactive => active', [animate('400ms ease-in-out')]),
      transition('active => inactive', [animate('300ms ease-in-out')]),
    ]),
  ],
  templateUrl: './level-test.component.html',
})
export class LevelTestComponent implements OnInit {
  activeTab: string = 'instructions';
  profileService = inject(ProfileService);
  examService = inject(ExamService);
  toastr = inject(ToastrService);
  isLoadingCategories = signal<boolean>(false);
  isOpenAdditionalExam = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  activeTabExam: number = 1;
  phoneNumber: string = '';

  exam: Exam = {} as Exam;
  correctionExamDetails: any;
  examInfo: { questionId: number; choice: number }[] = [];
  reviewExamInfo: ReviewExam = {} as ReviewExam;
  isEnglish: boolean = false;
  choicesCount: number = 4;
  examResults: { [id: number]: number } = {};
  counter: number = 0;
  today: string = '';
  startDate: string = '';

  tabs: Tab[] = [
    {
      id: 'instructions',
      title: 'التعليمات',
      icon: '📋',
      completed: false,
      active: true,
    },
    {
      id: 'selection',
      title: 'اختيار الأقسام',
      icon: '🎯',
      completed: false,
      active: false,
    },

    {
      id: 'results',
      title: 'النتائج',
      icon: '🎉',
      completed: false,
      active: false,
    },
    {
      id: 'plan',
      title: 'الخطة الدراسية',
      icon: '📅',
      completed: false,
      active: false,
    },
  ];

  mainSections: MainSection[] = [
    {
      id: 1,
      name: 'قدرات',
      icon: '🧠',
      subcategories: [
        {
          id: 5,
          name: 'قدرات كمي',
          percent: 0,
          completed: false,
          examId: 0,
          tutorialId: 0,
        },
        {
          id: 6,
          name: 'قدرات لفظي',
          percent: 0,
          completed: false,
          examId: 0,
          tutorialId: 0,
        },
      ],
    },
    {
      id: 2,
      name: 'تحصيلي',
      icon: '📚',
      subcategories: [
        {
          id: 7,
          name: 'رياضيات',
          percent: 0,
          completed: false,
          examId: 0,
          tutorialId: 0,
        },
        {
          id: 8,
          name: 'فيزياء',
          percent: 0,
          completed: false,
          examId: 0,
          tutorialId: 0,
        },
        {
          id: 9,
          name: 'كيمياء',
          percent: 0,
          completed: false,
          examId: 0,
          tutorialId: 0,
        },
        {
          id: 10,
          name: 'أحياء',
          percent: 0,
          completed: false,
          examId: 0,
          tutorialId: 0,
        },
      ],
    },
    // {
    //   id: 18,
    //   name: 'البرامج التقنية',
    //   icon: '💻',
    //   subcategories: [
    //     {
    //       id: 19,
    //       name: 'مهارات التقنية',
    //       percent: 0,
    //       completed: false,
    //       examId: 0,
    //       tutorialId: 0,
    //     },
    //     {
    //       id: 20,
    //       name: 'مهارات المستقبل',
    //       percent: 0,
    //       completed: false,
    //       examId: 0,
    //       tutorialId: 0,
    //     },
    //   ],
    // },
  ];

  selectedMainSection: MainSection | null = null;
  selectedCategories: Category[] = [];
  currentTestCategory: Category | null = null;
  testStartDate: string = '';

  // Test simulation properties
  currentQuestionIndex: number = 0;
  totalQuestions: number = 20;
  testProgress: number = 0;

  ngOnInit() {
    this.getTutorials();
    this.testStartDate = new Date().toISOString();
  }

  updateSubcategoriesFromApi(apiCategories: any[]): void {
    for (const section of this.mainSections) {
      for (const subcategory of section.subcategories) {
        const matchedApiCategory = apiCategories.find(
          (cat) => cat.categoryId === subcategory.id,
        );

        if (matchedApiCategory) {
          subcategory.examId = matchedApiCategory.exam?.id || 0;
          subcategory.tutorialId = matchedApiCategory.tutorialId || 0;
        }
      }
    }
  }

  percent(num: number): number {
    return Math.round(num);
  }

  getTutorials() {
    this.isLoadingCategories.set(true);
    this.profileService.getDetectLevelExams().subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.updateSubcategoriesFromApi(result);
          this.isLoadingCategories.set(false);
        }
        this.isLoadingCategories.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoadingCategories.set(false);
      },
    });
  }

  setActiveTab(tabId: string) {
    if (
      (tabId === 'results' || tabId === 'plan') &&
      !this.hasCompletedTests()
    ) {
      this.toastr.error('لا توجد نتائج لاختبارات مكتملة.');
      return;
    }
    this.tabs.forEach((tab) => {
      tab.active = tab.id === tabId;
    });
    this.activeTab = tabId;
  }

  onPhoneNumberChange() {
    this.phoneNumber = this.phoneNumber.replace(/[^0-9]/g, '');
  }

  selectMainSection(section: MainSection) {
    this.selectedMainSection = section;
  }

  goBackToMainSections() {
    this.selectedMainSection = null;
    this.selectedCategories = [];
  }

  toggleCategorySelection(category: Category) {
    const index = this.selectedCategories.findIndex(
      (cat) => cat.id === category.id,
    );
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }

  startCategoryTest(category: Category) {
    console.log(category);
    this.currentTestCategory = category;
    if (category.examId === 0) {
      this.toastr.error('لا يوجد اختبار متاح لهذا القسم، يرجى اختيار قسم آخر.');
      return;
    }
    if (!this.phoneNumber || this.phoneNumber.trim() === '') {
      this.toastr.error('الرجاء إدخال رقم الهاتف');
      return;
    }

    if (!this.phoneNumber.startsWith('5') || this.phoneNumber.length !== 9) {
      this.toastr.error(
        'الرجاء إدخال رقم جوال صحيح يبدأ بـ 5 ويتكون من 9 خانات',
      );
      return;
    }
    this.activeTabExam = 1;
    this.isOpenAdditionalExam.set(true);
    this.getExamQuestions(category.id, category.examId, 1, 60);
  }

  get tuotialId(): number {
    return this.currentTestCategory?.tutorialId || 0;
  }

  goToPlan() {
    this.activeTab = 'plan';
    const tab = this.tabs.find((t) => t.id === 'plan');
    if (tab) {
      tab.active = true;
      tab.completed = true;
    }
  }

  getTheResultExam(result: any): void {
    this.correctionExamDetails = result;
    if (this.currentTestCategory) {
      this.currentTestCategory.percent = this.percent(result.precent);
      this.currentTestCategory.completed = true;
      this.updateCategoryInMainSections(
        this.currentTestCategory.id,
        this.currentTestCategory.percent,
        true,
      );
      this.saveExamResults();
    }
    this.setActiveTab('selection');
    this.currentTestCategory = null;
  }

  cancelTest() {
    this.setActiveTab('selection');
    this.currentTestCategory = null;
  }

  updateCategoryInMainSections(
    categoryId: number,
    percent: number,
    completed: boolean,
  ) {
    for (let section of this.mainSections) {
      const category = section.subcategories.find(
        (cat) => cat.id === categoryId,
      );
      if (category) {
        category.percent = percent;
        category.completed = completed;
        break;
      }
    }
  }

  hasCompletedTests(): boolean {
    return this.getAllCompletedCategories().length > 0;
  }

  getCompletedTestsCount(): number {
    return this.getAllCompletedCategories().length;
  }

  getAllCompletedCategories(): Category[] {
    const completed: Category[] = [];
    for (let section of this.mainSections) {
      for (let category of section.subcategories) {
        if (category.completed) {
          completed.push(category);
        }
      }
    }
    return completed;
  }

  get detectedSectionId(): number {
    const completed = this.getAllCompletedCategories();
    if (completed.length > 0) {
      const categoryId = completed[0].id;
      for (const section of this.mainSections) {
        if (section.subcategories.some((cat) => cat.id === categoryId)) {
          return section.id;
        }
      }
    }
    return 1;
  }

  saveExamResults() {
    let testResult: any | null = null;
    if (this.currentTestCategory) {
      testResult = {
        categoryId: this.currentTestCategory.id || 0,
        examId: this.currentTestCategory?.examId || 0,
        percent: this.currentTestCategory?.percent || 0,
        phoneNumber: `966${this.phoneNumber.trim()}`,
      };
    }

    this.profileService.detectLevelExam(testResult).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.toastr.success('تم حفظ نتيجة الاختبار بنجاح!');
        } else {
          this.toastr.error('حدث خطأ أثناء جلب الاختبار');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  restartTest() {
    this.activeTab = 'instructions';
    this.selectedMainSection = null;
    this.selectedCategories = [];
    this.currentTestCategory = null;
    this.testStartDate = new Date().toISOString();

    // Reset all tabs
    this.tabs.forEach((tab, index) => {
      tab.completed = false;
      tab.active = index === 0;
    });

    // Reset all test results
    for (let section of this.mainSections) {
      for (let category of section.subcategories) {
        category.percent = 0;
        category.completed = false;
      }
    }
  }

  getTheExamInfo(info: any): void {
    this.examInfo = info;
  }

  errorMessage: string = '';

  getExamQuestions(
    categoryId: number,
    examId: number,
    pageNumber: number,
    pageSize: number,
  ): void {
    this.isLoading.set(true);
    this.examService
      .getExamTestQuestions(categoryId, examId, pageNumber, pageSize)
      .subscribe({
        next: ({ statusCode, result, msg }) => {
          if (statusCode === 200) {
            this.errorMessage = '';
            this.exam = result;
            this.exam = {
              ...this.exam,
              isEnglish: this.isEnglish,
              choicesCount: this.choicesCount,
            };

            this.isLoading.update((v) => (v = false));
          } else {
            this.errorMessage = 'يجب الأشتراك في الدورة';
            this.toastr.error(this.errorMessage);
            this.isLoading.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = 'حدث خطأ أثناء جلب الأسئلة';
          this.toastr.error(this.errorMessage);
          this.isLoading.update((v) => (v = false));
        },
      });
  }

  changeTab(getTab: number): void {
    if (getTab === 1) {
      this.counter += 1;
    }
    this.activeTabExam = getTab;
  }
}
