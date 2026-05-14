import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuestionsService } from '../../services/questions.service';
import { ToastrService } from 'ngx-toastr';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { ActivatedRoute, Router } from '@angular/router';
import { SkillService } from '../../services/skill.service';
import { TeacherService } from '../../services/teacher.service';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  catchError,
} from 'rxjs';
@Component({
  selector: 'app-edit-question',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgSelectModule],
  templateUrl: './edit-question.component.html',
  styleUrl: './edit-question.component.scss',
})
export class EditQuestionComponent implements OnInit {
  questionsService = inject(QuestionsService);
  skillService = inject(SkillService);
  teacherService = inject(TeacherService);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  questionForm!: FormGroup;
  allQuestionTypes: ID_Name[] = [];
  allSkills: ID_Name[] = [];
  totalQuestion: any = 1;
  isLoading: boolean = false;
  submitted: boolean = false;
  isChecked: boolean = false;
  exams: { id: number; name: string }[] = [];
  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id']);
      this.fetchQuestion(id);
    });
    this.questionForm = this.fb.group({
      id: [0],
      image1: [''],
      image2: [null],
      answerUrl: [null],
      text: [null],
      correctChoice: [null],
      difficulty: [null],
      questionTypeId: [null],
      skillId: [null],
      answer1: [null],
      answer2: [null],
      answer3: [null],
      answer4: [null],
      slug: [''],
      keyWord: [''],
    });
    this.fetchAllQuestionTypes();

    // Subscribe to search subject with debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((text) => {
          if (!text || text.length < 3) {
            return of({ result: [] });
          }
          return this.teacherService
            .getTextSuggestions({ text })
            .pipe(catchError(() => of({ result: [] })));
        })
      )
      .subscribe((response: any) => {
        this.suggestions = response.result || [];
        this.showSuggestions = this.suggestions.length > 0;
      });
  }

  // Suggestions logic
  suggestions: { id: number; text: string }[] = [];
  showSuggestions: boolean = false;
  private searchSubject = new Subject<string>();

  selectSuggestion(suggestion: { id: number; text: string }): void {
    this.questionForm.get('text')?.setValue(suggestion.text);
    this.onTextChange(); // Update slug and keywords
    this.showSuggestions = false;
    this.suggestions = [];
  }

  hideSuggestions(): void {
    // Small delay to allow click event on suggestion to fire
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
  fetchQuestion(id: number): void {
    this.isLoading = true;
    this.questionsService.getQestion(id).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          let q = result;
          this.exams = q.exams;

          // Fetch skills first if questionTypeId exists
          if (q.questionTypeId) {
            this.skillService
              .getAllSkillByQuestionTypeId(q.questionTypeId)
              .subscribe({
                next: ({ result: skills, statusCode: skillStatus }) => {
                  if (skillStatus === 200) {
                    this.allSkills = skills;
                  }
                  this.patchQuestionForm(q);
                  this.isLoading = false;
                },
                error: (err) => {
                  console.error(err);
                  this.patchQuestionForm(q); // Still patch form even if skill fetch fails
                  this.isLoading = false;
                },
              });
          } else {
            this.patchQuestionForm(q);
            this.isLoading = false;
          }
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
    });
  }

  private patchQuestionForm(q: any): void {
    this.questionForm.patchValue({
      id: q.id,
      image1: q.image1Url,
      image2: q.image2Url,
      answerUrl: q.answerUrl,
      text: q.text,
      correctChoice: q.correctChoice,
      difficulty: q.difficulty,
      questionTypeId: q.questionTypeId,
      skillId: q.skillId,
      answer1: q.answer1,
      answer2: q.answer2,
      answer3: q.answer3,
      answer4: q.answer4,
      slug: q.slug,
      keyWord: q.keyWord,
    });
  }
  onAnswerChange(answerNumber: number) {
    this.questionForm.get('correctChoice')?.setValue(answerNumber);
  }
  onSubmit() {
    this.submitted = true;
    if (this.questionForm.invalid) {
      this.toastr.error('تأكد ان جيمع البيانات مُدخلة');
      return;
    }
    const isBasw64Bit = this.isBase64Image(
      this.questionForm.get('image1')?.value
    );
    const isBasw64Bit2 = this.isBase64Image(
      this.questionForm.get('image2')?.value
    );
    if (isBasw64Bit) {
      this.questionForm
        .get('image1')
        ?.setValue(this.questionForm.get('image1')?.value);
    } else {
      if (this.questionForm.get('image1')?.value == '') {
        this.questionForm.get('image1')?.setValue('');
      } else {
        this.questionForm.get('image1')?.setValue(null);
      }
    }
    if (isBasw64Bit2) {
      this.questionForm
        .get('image2')
        ?.setValue(this.questionForm.get('image2')?.value);
    } else {
      if (this.questionForm.get('image2')?.value == '') {
        this.questionForm.get('image2')?.setValue('');
      } else {
        this.questionForm.get('image2')?.setValue(null);
      }
    }
    this.isLoading = true;

    // Sanitize payload to avoid null values for numeric IDs
    const payload = { ...this.questionForm.value };
    if (payload.questionTypeId === null || payload.questionTypeId === undefined) {
      payload.questionTypeId = null;
    }
    if (payload.skillId === null || payload.skillId === undefined) {
      payload.skillId = null;
    }
    if (payload.difficulty === null || payload.difficulty === undefined) {
      payload.difficulty = null;
    }

    this.questionsService.updateQestion(payload).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.router.navigateByUrl('/instructor/questions');
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

  deleteImg(num: number): void {
    if (num === 1) {
      this.questionForm.get('image1')?.setValue('');
    } else {
      this.questionForm.get('image2')?.setValue('');
    }
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
  changeQuestionType(item: ID_Name): void {
    this.questionForm.get('skillId')?.setValue(null);
    if (item?.id) {
      this.getAllSkillByQuestionTypeId(item.id);
    } else {
      this.allSkills = [];
    }
    this.updateKeywords();
  }
  getAllSkillByQuestionTypeId(id: number): void {
    if (!id) return;
    this.skillService.getAllSkillByQuestionTypeId(id).subscribe({
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
  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (items) {
      const itemsArray = Array.from(items);
      for (const item of itemsArray) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            this.convertToBase64(file).then((base64Image: string) => {
              this.questionForm.get('image1')?.setValue(base64Image);
            });
          }
        }
      }
    }
  }
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.convertToBase64(files[0]).then((base64Image: string) => {
        this.questionForm.get('image1')?.setValue(base64Image);
      });
    }
  }
  onPaste2(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (items) {
      const itemsArray = Array.from(items);
      for (const item of itemsArray) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            this.convertToBase64(file).then((base64Image: string) => {
              this.questionForm.get('image2')?.setValue(base64Image);
            });
          }
        }
      }
    }
  }
  onFileDrop2(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.convertToBase64(files[0]).then((base64Image: string) => {
        this.questionForm.get('image2')?.setValue(base64Image);
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
  isBase64Image(str: string): boolean {
    const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;
    return base64Pattern.test(str);
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
  onTextChange(): void {
    const textControl = this.questionForm.get('text');
    const slugControl = this.questionForm.get('slug');

    if (textControl?.value) {
      const generatedSlug = this.slugify(textControl.value);
      slugControl?.setValue(generatedSlug, { emitEvent: false });

      // Trigger suggestion search
      this.searchSubject.next(textControl.value);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
    this.updateKeywords();
  }

  // Update keywords dynamically
  private updateKeywords(): void {
    const keywords: string[] = [];

    // Get question type name
    const questionTypeId = this.questionForm.get('questionTypeId')?.value;
    if (questionTypeId) {
      const questionType = this.allQuestionTypes.find(
        (qt) => qt.id === questionTypeId
      );
      if (questionType?.name) {
        keywords.push(questionType.name);
      }
    }

    // Get skill name
    const skillId = this.questionForm.get('skillId')?.value;
    if (skillId) {
      const skill = this.allSkills.find((s) => s.id === skillId);
      if (skill?.name) {
        keywords.push(skill.name);
      }
    }

    // Get difficulty level
    const difficulty = this.questionForm.get('difficulty')?.value;
    const difficultyMap: { [key: number]: string } = {
      1: 'سهل',
      2: 'متوسط',
      3: 'صعب',
    };
    if (difficulty && difficultyMap[difficulty]) {
      keywords.push(difficultyMap[difficulty]);
    }

    // Get first 4 words from text
    const textVal = this.questionForm.get('text')?.value;
    if (textVal) {
      const words = textVal.trim().split(/\s+/).slice(0, 4);
      if (words.length > 0) {
        keywords.push(...words);
      }
    }

    // Update keyWord field
    this.questionForm
      .get('keyWord')
      ?.setValue(keywords.join(', '), { emitEvent: false });
  }

  // Handle skill change
  onSkillChange(): void {
    this.updateKeywords();
  }

  // Handle difficulty change
  onDifficultyChange(): void {
    this.updateKeywords();
  }
}
