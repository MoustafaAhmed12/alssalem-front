import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { QuestionsService } from '../../services/questions.service';
import { FormQuestion, QuestionForm } from '../../model/questions';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { Clipboard } from '@angular/cdk/clipboard';
import { SkillService } from '../../services/skill.service';
import { TeacherService } from '../../services/teacher.service';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  catchError,
  Subscription,
} from 'rxjs';

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgSelectModule],
  templateUrl: './add-questions.component.html',
  styleUrl: './add-questions.component.scss',
})
export class AddQuestionsComponent implements OnInit {
  questionsService = inject(QuestionsService);
  skillService = inject(SkillService);
  teacherService = inject(TeacherService);
  cdr = inject(ChangeDetectorRef);
  fb = inject(NonNullableFormBuilder);
  clipboard = inject(Clipboard);
  toastr = inject(ToastrService);
  router = inject(Router);
  questionForm!: QuestionForm;
  allQuestionTypes: ID_Name[] = [];
  allSkills: ID_Name[] = [];
  totalQuestion: number = 1;
  isLoading = signal(false);
  isOpen: boolean = false;
  isManual: boolean = false;
  ids: number[] = [];
  generateCount: number = 1;

  // Suggestions logic
  suggestions: { id: number; text: string }[] = [];
  showSuggestions: boolean = false;
  activeQuestionIndex: number | null = null;
  private searchSubject = new Subject<{ text: string; index: number }>();
  private saveSubscription: Subscription | null = null;

  ngOnInit() {
    this.questionForm = this.fb.group({
      questions: this.fb.array<FormQuestion>([this.generateQuestion()]),
    });
    this.fetchAllQuestionTypes();
    this.fetchAllSkills();

    // Subscribe to search subject with debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => prev.text === curr.text),
        switchMap(({ text, index }) => {
          if (!text || text.length < 3) {
            return of({ result: [] });
          }
          return this.teacherService
            .getTextSuggestions({ text })
            .pipe(catchError(() => of({ result: [] })));
        }),
      )
      .subscribe((response: any) => {
        this.suggestions = response.result || [];
        this.showSuggestions = this.suggestions.length > 0;
        this.cdr.markForCheck();
      });
  }
  generateQuestion(): FormQuestion {
    return this.fb.group({
      image1: [null],
      image2: [null],
      answerUrl: [''],
      // answerUrl: ['link'],
      text: [null],
      slug: [''],
      correctChoice: [null, [Validators.required]],
      difficulty: [2],
      questionTypeId: [null],
      skillId: [null],
      answer1: [null],
      answer2: [null],
      answer3: [null],
      answer4: [null],
      answer5: [null],
      keyWord: [''],
    });
  }
  addQuestion(): void {
    this.getQuestions.push(this.generateQuestion());
    this.totalQuestion = this.getQuestions.length;
    this.generateCount = this.totalQuestion;
  }

  addQuestionAt(index: number): void {
    this.getQuestions.insert(index, this.generateQuestion());
    this.totalQuestion = this.getQuestions.length;
    this.generateCount = this.totalQuestion;
  }

  onCountChange(newCount: number): void {
    if (newCount < 1) return;
    const currentCount = this.getQuestions.length;
    if (newCount > currentCount) {
      for (let i = 0; i < newCount - currentCount; i++) {
        this.getQuestions.push(this.generateQuestion());
      }
    } else if (newCount < currentCount) {
      for (let i = 0; i < currentCount - newCount; i++) {
        this.getQuestions.removeAt(this.getQuestions.length - 1);
      }
    }
    this.totalQuestion = this.getQuestions.length;
  }
  get getQuestions() {
    return this.questionForm.get('questions') as FormArray;
  }
  removeQuestion(questionIndex: number): void {
    this.getQuestions.removeAt(questionIndex);
    this.totalQuestion = this.getQuestions.length;
    this.generateCount = this.totalQuestion;
  }
  onAnswerChange(questionIndex: number, answerNumber: number) {
    this.getQuestions
      .at(questionIndex)
      .get('correctChoice')
      ?.setValue(answerNumber);
  }

  onSubmit() {
    if (this.questionForm.invalid) {
      this.toastr.error('تأكد من ادخال جميع البيانات');
      return;
    }
    this.isLoading.set(true);
    this.saveSubscription = this.questionsService
      .saveQestion(this.questionForm.value.questions)
      .subscribe({
        next: ({ statusCode, result, msg }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading.set(false);
            this.ids = result;
            this.isOpen = true;
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

  cancelSave() {
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe();
      this.saveSubscription = null;
    }
    this.isLoading.set(false);
    this.toastr.info('تم إلغاء عملية الحفظ');
  }
  copyText(text: any) {
    this.clipboard.copy(text);
    this.toastr.success('تم نسخ اكواد الأسئلة');
  }
  handleClose(): void {
    this.isOpen = false;
    this.router.navigateByUrl('/instructor/questions');
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
  changeQuestionType(item: ID_Name, questionIndex: number): void {
    this.updateKeywords(questionIndex);
  }
  fetchAllSkills(): void {
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
  onPaste(event: ClipboardEvent, questionIndex: number): void {
    const items = event.clipboardData?.items;
    if (items) {
      const itemsArray = Array.from(items);
      for (const item of itemsArray) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            this.convertToBase64(file).then((base64Image: string) => {
              this.getQuestions
                .at(questionIndex)
                .get('image1')
                ?.setValue(base64Image);
            });
          }
        }
      }
    }
  }
  onFileDrop(event: DragEvent, questionIndex: number): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.convertToBase64(files[0]).then((base64Image: string) => {
        this.getQuestions
          .at(questionIndex)
          .get('image1')
          ?.setValue(base64Image);
      });
    }
  }
  onPaste2(event: ClipboardEvent, questionIndex: number): void {
    const items = event.clipboardData?.items;
    if (items) {
      const itemsArray = Array.from(items);
      for (const item of itemsArray) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            this.convertToBase64(file).then((base64Image: string) => {
              this.getQuestions
                .at(questionIndex)
                .get('image2')
                ?.setValue(base64Image);
            });
          }
        }
      }
    }
  }
  onFileDrop2(event: DragEvent, questionIndex: number): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.convertToBase64(files[0]).then((base64Image: string) => {
        this.getQuestions
          .at(questionIndex)
          .get('image2')
          ?.setValue(base64Image);
      });
    }
  }
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Slugify utility method - supports Arabic and English
  private slugify(text: string): string {
    if (!text) return '';

    return (
      text
        .toString()
        .toLowerCase()
        .trim()
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove special characters but keep Arabic, English, numbers, and hyphens
        .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '')
        // Replace multiple consecutive hyphens with single hyphen
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
    );
  }

  // Generate slug from text field
  onTextChange(questionIndex: number): void {
    const textControl = this.getQuestions.at(questionIndex).get('text');
    const slugControl = this.getQuestions.at(questionIndex).get('slug');
    const textValue = textControl?.value;

    if (textValue) {
      const generatedSlug = this.slugify(textValue);
      slugControl?.setValue(generatedSlug, { emitEvent: false });

      // Trigger suggestion search
      this.activeQuestionIndex = questionIndex;
      this.searchSubject.next({ text: textValue, index: questionIndex });
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
    this.updateKeywords(questionIndex);
  }

  selectSuggestion(
    suggestion: { id: number; text: string },
    questionIndex: number,
  ): void {
    const question = this.getQuestions.at(questionIndex);
    question.get('text')?.setValue(suggestion.text);
    this.onTextChange(questionIndex); // Update slug and keywords
    this.showSuggestions = false;
    this.suggestions = [];
    this.activeQuestionIndex = null;
  }

  hideSuggestions(): void {
    // Small delay to allow click event on suggestion to fire
    setTimeout(() => {
      this.showSuggestions = false;
      this.activeQuestionIndex = null;
    }, 200);
  }

  // Update keywords dynamically based on question type, skill, and difficulty
  private updateKeywords(questionIndex: number): void {
    const question = this.getQuestions.at(questionIndex);
    const keywords: string[] = [];

    // Get question type name
    const questionTypeId = question.get('questionTypeId')?.value;
    if (questionTypeId) {
      const questionType = this.allQuestionTypes.find(
        (qt) => qt.id === questionTypeId,
      );
      if (questionType?.name) {
        keywords.push(questionType.name);
      }
    }

    // Get skill name
    const skillId = question.get('skillId')?.value;
    if (skillId) {
      const skill = this.allSkills.find((s) => s.id === skillId);
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

    // Update keyWord field with comma-separated values
    question
      .get('keyWord')
      ?.setValue(keywords.join(', '), { emitEvent: false });
  }

  // Handle skill change
  onSkillChange(item: any, questionIndex: number): void {
    if (item) {
      let qTypeId = item.questionTypeId;
      if (!qTypeId && item.questionTypeName) {
        qTypeId = this.allQuestionTypes.find(
          (qt) => qt.name === item.questionTypeName
        )?.id;
      }
      if (qTypeId) {
        const question = this.getQuestions.at(questionIndex);
        question.get('questionTypeId')?.setValue(qTypeId);
      }
    }
    this.updateKeywords(questionIndex);
  }

  // Handle difficulty change
  onDifficultyChange(questionIndex: number): void {
    this.updateKeywords(questionIndex);
  }
}
