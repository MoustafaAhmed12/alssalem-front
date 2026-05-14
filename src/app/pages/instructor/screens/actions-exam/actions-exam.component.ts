import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
  signal,
  computed,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { TeacherService } from '../../services/exams.service';
import { TeacherService as SuggestionService } from '../../services/teacher.service';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  catchError,
} from 'rxjs';
import { AuthService } from '../../../../authentication/services/auth.service';
import { ExamInfo } from '../../model/teacher';
import { NgSelectModule } from '@ng-select/ng-select';
import { SkillService } from '../../services/skill.service';
import { QuestionsService } from '../../services/questions.service';
export type Form = FormGroup<{
  id: FormControl;
  name: FormControl;
  passingPrecent: FormControl;
  durationInMinutes: FormControl;
  tutorialId: FormControl;
  isDetectLevelExam: FormControl;
  questionsIds: FormArray<FormQuestion>;
}>;
type FormQuestion = FormGroup<{
  questionId: FormControl;
  order: FormControl;
  image1Url: FormControl;
  link: FormControl;
  questionTypeId: FormControl;
  skillId: FormControl;
  difficulty: FormControl;
  text: FormControl;
  slug: FormControl;
  keyWord: FormControl;
  correctChoice: FormControl;
}>;
type QuestionInfo = {
  id: number;
  image1Url: string;
  image2Url: string;
  skillName: string;
  difficulty: number;
  exams: any;
  text: string;
  slug: string;
  keyWord: string;
  correctChoice: number;
};
@Component({
  selector: 'app-actions-exam',
  standalone: true,
  templateUrl: './actions-exam.component.html',
  styleUrl: './actions-exam.component.scss',
  imports: [ReactiveFormsModule, NgClass, NgSelectModule, FormsModule],
})
export class ActionsExamComponent implements OnInit {
  teacherService = inject(TeacherService);
  suggestionService = inject(SuggestionService);
  authService = inject(AuthService);
  skillService = inject(SkillService);
  questionsService = inject(QuestionsService);
  fb = inject(NonNullableFormBuilder);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  currentUserId = signal<number>(0);
  examForm!: Form;
  examsTutorials = signal<ID_Name[]>([]);
  allSkills = signal<ID_Name[]>([]);
  allQuestionTypes = signal<ID_Name[]>([]);
  allSkillsById = signal<ID_Name[]>([]);
  allQuestions = signal<QuestionInfo[]>([]);
  selectedQuestions = signal<QuestionInfo[]>([]);
  notSelectedQuestions = signal<QuestionInfo[]>([]);
  totalQSelected = signal<number>(0);
  totalQNotSelected = signal<number>(0);
  examId = signal<number>(0);
  questionDifficulty = signal<any>(null);
  questionTypeId = signal<number>(0);
  skillId = signal<number>(0);
  isLoading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  isLoadingAll = signal<boolean>(false);
  order = signal<number>(1);
  isManual = signal<boolean>(false);
  isDetectLevelExam = signal<boolean>(false);
  selectedIds = signal<number[]>([]);
  allExamsToFilter = signal<{ id: number; name: string }[]>([]);
  selectedExamsIds = signal<number[]>([]);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(100);
  totalQuestions = signal<number>(0);
  searchText = signal<string>('');
  @ViewChildren('idInput') idInputs!: QueryList<ElementRef>;

  // Video Modal Logic
  sanitizer = inject(DomSanitizer);
  showVideoModal = signal<boolean>(false);
  videoUrl = signal<string>('');
  safeVideoUrl = computed(() => {
    const url = this.videoUrl();
    if (!url) return null;

    // Regular expressions to extract YouTube video ID
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const shortsRegExp = /youtube\.com\/shorts\/([^"&?\/\s]{11})/;

    let videoId: string | null = null;

    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      const shortsMatch = url.match(shortsRegExp);
      if (shortsMatch && shortsMatch[1]) {
        videoId = shortsMatch[1];
      }
    }

    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}`,
      );
    }

    // If it's not a YouTube link, try to use it as is (sanitized)
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // Suggestions logic
  suggestions = signal<{ id: number; text: string }[]>([]);
  showSuggestions = signal<boolean>(false);
  activeQuestionControl = signal<AbstractControl | null>(null);
  private searchSubject = new Subject<{
    text: string;
    control: AbstractControl;
  }>();
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.examId.set(parseInt(params['id']));
      if (this.examId() > 0) {
        this.fetchExam({ examId: this.examId() });
      }
      this.fetchAllQuestionTypes();
      this.fetchAllSkills();
    });

    // Subscribe to search subject with debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) =>
            prev.text === curr.text && prev.control === curr.control,
        ),
        switchMap(({ text, control }) => {
          if (!text || text.length < 3) {
            return of({ result: [] });
          }
          return this.suggestionService
            .getTextSuggestions({ text })
            .pipe(catchError(() => of({ result: [] })));
        }),
      )
      .subscribe((response: any) => {
        this.suggestions.set(response.result || []);
        this.showSuggestions.set(this.suggestions().length > 0);
      });

    this.examForm = this.fb.group({
      id: [this.examId() === 0 ? 0 : this.examId()],
      name: ['', [Validators.required]],
      passingPrecent: [80],
      durationInMinutes: [0],
      isDetectLevelExam: [false],
      tutorialId: [null, [Validators.required]],
      questionsIds: this.fb.array<FormQuestion>([]),
    });
    this.currentUserId.set(this.authService.currentUser().userDto.id);
    this.fetchAllExamsTutorials({ teacherId: this.currentUserId() });
    this.fetchAllExamsForFilter({ teacherId: this.currentUserId() });
    this.getAllQuestionPaging();
  }
  get getQuestions() {
    return this.examForm.get('questionsIds') as FormArray;
  }
  generateQuestion(): FormQuestion {
    return this.fb.group({
      questionId: [null, [Validators.required]],
      order: [1, [Validators.pattern('^[0-9]*$')]],
      image1Url: [null],
      link: [''],
      questionTypeId: [null],
      skillId: [null],
      difficulty: [null],
      text: [null],
      slug: [''],
      keyWord: [''],
      correctChoice: [null, [Validators.required]],
    });
  }
  addQuestion(): void {
    this.getQuestions.push(this.generateQuestion());
    const lastQuestionIndex = this.getQuestions.length - 1;
    (this.getQuestions.at(lastQuestionIndex) as FormGroup)
      .get('order')
      ?.setValue(this.getQuestions.length);
    setTimeout(() => {
      this.focusLastInput();
    });
  }
  focusLastInput() {
    const lastInput = this.idInputs.last;
    if (lastInput) {
      lastInput.nativeElement.focus();
    }
  }
  removeQuestion(questionIndex: number): void {
    this.getQuestions.removeAt(questionIndex);
    this.updateOrder();
  }
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addQuestion();
    }
  }
  updateOrder() {
    this.getQuestions.controls.forEach((group, index) => {
      (group as FormGroup).get('order')?.setValue(index + 1);
    });
  }

  getQuestionDetails(questionGroup: FormGroup): void {
    const id = questionGroup.get('questionId')?.value;

    if (!id) return;

    this.questionsService.getQestion(id).subscribe({
      next: ({ statusCode, result: q }) => {
        if (statusCode === 200) {
          questionGroup.patchValue({
            image1Url: q.image1Url,
            questionTypeId: q.questionTypeId,
            skillId: q.skillId,
            difficulty: q.difficulty,
            text: q.text,
            slug: q.slug,
            keyWord: q.keyWord,
            correctChoice: q.correctChoice,
          });
        }
      },
      error: (err) => console.error(err),
    });
  }
  onSubmit() {
    this.submitted.set(true);

    this.examForm.get('isDetectLevelExam')?.setValue(this.isDetectLevelExam());
    if (this.examForm.get('durationInMinutes')?.value < 0) {
      this.toastr.error('تأكد ان وقت الاختبار اكبر او يساوي صفر');
      return;
    }
    this.isLoading.set(true);
    // to edit
    const examInfo = {
      ...this.examForm.value,
      questionsIds: this.examForm
        .get('questionsIds')
        ?.value.map(({ image1Url, ...rest }) => rest),
    };

    // add Question Manual
    const examInfoIds = {
      ...this.examForm.value,
      questionsIds: this.examForm
        .get('questionsIds')
        ?.value.map(({ image1Url, questionTypeId, skillId, ...rest }) => rest),
    };

    // to add question with filter
    const {
      name,
      passingPrecent,
      tutorialId,
      durationInMinutes,
      isDetectLevelExam,
    } = this.examForm.value;
    const questionsIds = this.selectedQuestions().map((q, index) => {
      return {
        questionId: q.id,
        order: index + 1,
        link: '',
        text: q.text,
        slug: q.slug,
        keyWord: q.keyWord,
        correctChoice: q.correctChoice,
      };
    });
    // const questions = this.generateQuestions(28629, 28688);
    const x = {
      name,
      passingPrecent,
      tutorialId,
      isDetectLevelExam,
      durationInMinutes,
      // questionsIds: questions, // شفل دا واقفل الي تحته - وفي saveExam خلي ال X بس
      questionsIds,
    };

    this.teacherService
      .SaveExam(
        this.isManual() ? (this.examId() === 0 ? examInfoIds : examInfo) : x,
        // x
      )
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading.set(false);
            this.router.navigateByUrl('/instructor/exams');
          } else {
            this.toastr.error(msg);
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.set(false);
        },
      });
  }

  generateQuestions(
    start: number,
    end: number,
  ): { questionId: number; order: number }[] {
    if (start > end) return []; // التحقق من أن البداية أصغر من النهاية
    return Array.from({ length: end - start + 1 }, (_, i) => ({
      questionId: start + i,
      order: i + 1,
    }));
  }

  fetchAllQuestionTypes(): void {
    this.questionsService.getTeacherQuestionTypes().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allQuestionTypes.set(result);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  fetchAllSkills(): void {
    this.skillService.getSkills().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSkills.set(result);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  fetchExam(examId: any): void {
    this.isLoading.set(true);
    this.teacherService.getExamById(examId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          this.isManual.set(true);
          let exam = result as ExamInfo;
          this.isLoading.set(false);
          this.examForm.patchValue({
            id: exam.id,
            name: exam.name,
            tutorialId: exam.tutorialId,
            durationInMinutes: exam.durationInMinutes,
            passingPrecent: exam.passingPrecent,
          });
          this.getQuestions.clear();
          const q = this.examForm.get('questionsIds') as FormArray;

          let curSelIds = [...this.selectedIds()];
          let curSelQs = [...this.selectedQuestions()];

          exam.questionsId.forEach((question: any) => {
            q.push(
              this.fb.group({
                questionId: question.questionId,
                order: question.order,
                image1Url: question.image1Url,
                link: question.link,
                questionTypeId: question.questionTypeId,
                skillId: question.skillId,
                difficulty: question.difficulty,
                text: question.text,
                slug: question.slug,
                keyWord: question.keyWord,
                correctChoice: question.correctChoice,
              }),
            );
            curSelIds.push(question.questionId);
            curSelQs.push({
              id: question.questionId,
              image1Url: question.image1Url,
              image2Url: '',
              skillName: question.skillName,
              difficulty: question.difficulty,
              text: question.text,
              slug: question.slug,
              keyWord: question.keyWord,
              correctChoice: question.correctChoice,
              exams: [],
            });
          });
          this.selectedIds.set(curSelIds);
          this.selectedQuestions.set(curSelQs);

          this.updateNotSelectedQuestions();
        } else {
          this.toastr.error(msg);
          this.isLoading.set(false);
        }
      },
    });
  }
  fetchAllExamsTutorials(teacherId: any): void {
    this.teacherService.getExamsTutorials(teacherId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.examsTutorials.set(result);
        }
      },
      error: (err) => {
        console.log(err);
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
      error: (err) => {
        console.log(err);
      },
    });
  }

  filterQuestionType(item: any) {
    this.questionTypeId.set(item?.id ?? 0);
    if (item) {
      this.getAllSkillByQuestionTypeId(this.questionTypeId());
    }
    this.getAllQuestionPaging();
  }
  filterSkillId(item: any) {
    this.skillId.set(item?.id ?? 0);
    this.getAllQuestionPaging();
  }
  filterDifficulty(item: any) {
    this.questionDifficulty.set(item);
    this.getAllQuestionPaging();
  }
  handleSearch(e: any) {
    this.searchText.set(e.target.value);
    this.pageNumber.set(1);
    this.getAllQuestionPaging();
  }
  handleChoose(questionId: number, event: Event, questionHasSelected: any) {
    const checkbox = event.target as HTMLInputElement;
    let currentSelectedIds = [...this.selectedIds()];
    let currentSelectedQuestions = [...this.selectedQuestions()];

    if (checkbox.checked) {
      if (!currentSelectedIds.includes(questionId)) {
        currentSelectedIds.push(questionId);
      }
      if (!currentSelectedQuestions.some((q) => q.id === questionId)) {
        currentSelectedQuestions.push(questionHasSelected);
      }
    } else {
      currentSelectedIds = currentSelectedIds.filter((id) => id !== questionId);
      currentSelectedQuestions = currentSelectedQuestions.filter(
        (q) => q.id !== questionId,
      );
    }
    this.selectedIds.set(currentSelectedIds);
    this.selectedQuestions.set(currentSelectedQuestions);
    this.updateNotSelectedQuestions();
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
  fetchAllExamsForFilter(teacherId: any): void {
    this.teacherService.getAllExamsPerTeacherTutorials(teacherId).subscribe({
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

  filterByExams(exams: any[]) {
    this.selectedExamsIds.set(exams.map((e) => e.id));
    this.pageNumber.set(1);
    this.getAllQuestionPaging();
  }

  getAllQuestionPaging(): void {
    this.isLoadingAll.set(true);
    this.questionsService
      .getAllQuestion(
        this.pageSize(),
        this.pageNumber(),
        undefined,
        this.questionDifficulty(),
        this.questionTypeId(),
        this.skillId(),
        this.searchText(),
        this.selectedExamsIds(),
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allQuestions.set(
              res.data.map((q: any) => ({
                id: q.id,
                image1Url: q.image1Url,
                image2Url: q.image2Url,
                skillName: q.skillName,
                difficulty: q.difficulty,
                exams: q.exams,
                text: q.text,
                slug: q.slug,
                keyWord: q.keyWord,
                correctChoice: q.correctChoice,
              })),
            );
            this.totalQuestions.set(res.totalCount);
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
    this.pageNumber.set(page);
    this.getAllQuestionPaging();
  }

  handleSearchQuestions(event: any) {
    this.searchText.set(event.target.value);
    this.pageNumber.set(1);
    this.getAllQuestionPaging();
  }

  // Slugify utility method
  private slugify(text: string): string {
    if (!text) return '';

    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Generate slug from text field
  onTextChange(question: AbstractControl): void {
    const textControl = question.get('text');
    const slugControl = question.get('slug');

    if (textControl?.value) {
      const generatedSlug = this.slugify(textControl.value);
      slugControl?.setValue(generatedSlug, { emitEvent: false });

      // Trigger suggestion search
      this.activeQuestionControl.set(question);
      this.searchSubject.next({ text: textControl.value, control: question });
    } else {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    }
    this.updateKeywords(question);
  }

  selectSuggestion(
    suggestion: { id: number; text: string },
    question: AbstractControl,
  ): void {
    question.get('text')?.setValue(suggestion.text);
    this.onTextChange(question);
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    this.activeQuestionControl.set(null);
  }

  hideSuggestions(): void {
    // Small delay to allow click event on suggestion to fire
    setTimeout(() => {
      this.showSuggestions.set(false);
      this.activeQuestionControl.set(null);
    }, 200);
  }

  // Update keywords dynamically
  updateKeywords(question: AbstractControl): void {
    const keywords: string[] = [];

    // Get question type name
    const questionTypeId = question.get('questionTypeId')?.value;
    if (questionTypeId) {
      const questionType = this.allQuestionTypes().find(
        (qt) => qt.id === questionTypeId,
      );
      if (questionType?.name) {
        keywords.push(questionType.name);
      }
    }

    // Get skill name
    const skillId = question.get('skillId')?.value;
    if (skillId) {
      const skill = this.allSkills().find((s) => s.id === skillId);
      if (skill?.name) {
        keywords.push(skill.name);
      }
    }

    // Get difficulty level
    const difficulty = question.get('difficulty')?.value;
    const difficultyMap: { [key: number]: string } = {
      1: 'سهل',
      2: 'متوسط',
      3: 'صعب',
    };
    if (difficulty && difficultyMap[difficulty]) {
      keywords.push(difficultyMap[difficulty]);
    }

    // Get first 4 words from text
    const textVal = question.get('text')?.value;
    if (textVal) {
      const words = textVal.trim().split(/\s+/).slice(0, 4);
      if (words.length > 0) {
        keywords.push(...words);
      }
    }

    // Update keyWord field
    question
      .get('keyWord')
      ?.setValue(keywords.join(', '), { emitEvent: false });
  }

  onSkillChange(item: any, question: AbstractControl) {
    if (item) {
      // Find the QuestionType ID from the selected skill object
      let qTypeId = item.questionTypeId;

      // Fallback if the API only returns the questionTypeName instead of ID
      if (!qTypeId && item.questionTypeName) {
        qTypeId = this.allQuestionTypes().find(
          (qt) => qt.name === item.questionTypeName,
        )?.id;
      }

      // If we found a matching question type, patch its value to the form
      if (qTypeId) {
        question.get('questionTypeId')?.setValue(qTypeId);
      }
    }
    // Update the keywords after the value has been patched
    this.updateKeywords(question);
  }

  onAnswerChange(question: AbstractControl, value: number): void {
    question.get('correctChoice')?.setValue(value);
  }

  openVideo(url: string) {
    this.videoUrl.set(url);
    this.showVideoModal.set(true);
  }

  closeVideo() {
    this.showVideoModal.set(false);
    this.videoUrl.set('');
  }
}
