import { Component, signal, inject, OnInit, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ProfileService } from '../../../services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExamCalendarEnhancedComponent } from '../../../../../shared/components/exam-calendar-enhanced/exam-calendar-enhanced.component';

interface StudyPlan {
  id?: number;
  name?: string;
  startDate: string;
  endDate: string;
  freeDays: number[];
  categoriesIds?: number[];
  tutorialIds?: number[];
  skipSucceededExams?: boolean;
}

interface WeekDay {
  value: number;
  label: string;
  labelEn: string;
}

////////////////
interface Category {
  id: number;
  name: string;
  totalQuestionsNumber?: number;
}

interface DayPlan {
  isFreeDay: boolean;
  categoriesIds: number[];
}

interface WeekPlan {
  [key: string]: DayPlan;
}

interface FormData {
  weekPlan: WeekPlan;
  categoriesIds: number[];
  startDate: string;
  endDate: string;
  name: string;
  skipSucceededExams: boolean;
}

@Component({
  selector: 'app-plan-study-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './plan-study-form.component.html',
})
export class PlanStudyFormComponent implements OnInit {
  profileService = inject(ProfileService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
  titleService = inject(Title);
  metaService = inject(Meta);
  // id = signal<number>(0);
  isloading = signal<boolean>(false);
  @Input() isComponentMode = false;
  @Input() set defaultCategory(value: number) {
    if (value) {
      this.activeCate.set(value);
    }
  }
  studyPlanForm: FormGroup;
  isSubmitting = false;
  selectedFreeDays: number[] = [];
  categoriesCount = signal<any>(null);
  currentDate: string = '';
  tutorialIds = signal<{ id: number; name: string }[]>([]);
  categoriesTahsili = signal<Category[]>([
    { id: 7, name: 'تحصيلي رياضيات' },
    { id: 8, name: 'تحصيلي فيزياء' },
    { id: 9, name: 'تحصيلي كيمياء' },
    { id: 10, name: 'تحصيلي أحياء' },
  ]);
  mainSections = signal<Category[]>([
    {
      id: 5,
      name: 'قدرات كمي',
    },
    {
      id: 6,
      name: 'قدرات لفظي',
    },
  ]);
  weekDays = signal<WeekDay[]>([
    { value: 6, label: 'السبت', labelEn: 'Sat' },
    { value: 0, label: 'الأحد', labelEn: 'Sun' },
    { value: 1, label: 'الإثنين', labelEn: 'Mon' },
    { value: 2, label: 'الثلاثاء', labelEn: 'Tue' },
    { value: 3, label: 'الأربعاء', labelEn: 'Wed' },
    { value: 4, label: 'الخميس', labelEn: 'Thu' },
    { value: 5, label: 'الجمعة', labelEn: 'Fri' },
  ]);
  planName: string = '';
  error = signal<string>('');

  activeCate = signal<number>(1);
  days = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];
  daysArabic: { [key: string]: string } = {
    Saturday: 'السبت',
    Sunday: 'الأحد',
    Monday: 'الإثنين',
    Tuesday: 'الثلاثاء',
    Wednesday: 'الأربعاء',
    Thursday: 'الخميس',
    Friday: 'الجمعة',
  };
  constructor(private fb: FormBuilder) {
    this.currentDate = new Date().toISOString().split('T')[0];
    // const id = Number(this.route.snapshot.params['id']);
    this.planName = this.route.snapshot.params['name'];
    // this.id.set(id);
    this.studyPlanForm = this.createForm();
  }

  private createForm(): FormGroup {
    // if (this.id() !== 0) {
    //   return this.fb.group({
    //     id: [0],
    //     name: [this.planName, [Validators.required, Validators.minLength(3)]],
    //     startDate: [this.currentDate, Validators.required],
    //     endDate: ['', Validators.required],
    //     freeDays: [[]],
    //     skipSucceededExams: [false],
    //   });
    // } else {
    return this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoriesIds: [null],
      tutorialIds: [null],
      startDate: [this.currentDate, Validators.required],
      endDate: ['', Validators.required],
      freeDays: [[]],
      skipSucceededExams: [false],
    });
    // }
  }

  ngOnInit(): void {
    this.setSeoTags();
    this.categoriesQuestionCount();
    this.getCustomCategoryTutorials(5);
    this.getCustomCategoryTutorials(6);
  }

  setSeoTags() {
    const title = 'إنشاء خطة دراسية ذكية | منصة السالم';
    const description = 'صمم خطتك الدراسية الذكية والمخصصة لقدراتك والتحصيلي عبر منصة السالم. نظم وقتك، وتتبع تقدمك، وحقق الدرجة الكاملة بكل سهولة.';
    const keywords = 'خطة دراسية, قدرات, تحصيلي, منصة السالم, تنظيم الوقت, جدول مذاكرة, خطة ذكية';
    
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });

    // Open Graph (Facebook/Social)
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://alssalem.com/assets/images/plan-banner.jpg' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    
    // Add Structured Data for SEO (WebPage/SoftwareApplication indicating a tool)
    this.addStructuredData();
  }

  addStructuredData() {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'صانع الخطط الدراسية الذكية',
      'operatingSystem': 'Web',
      'applicationCategory': 'EducationalApplication',
      'provider': {
        '@type': 'Organization',
        'name': 'منصة السالم'
      },
      'description': 'أداة ذكية لإنشاء جداول مذاكرة وخطط دراسية لاختبارات القدرات والتحصيلي',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'SAR'
      }
    };
    
    // Remove old script if exists
    const oldScript = document.getElementById('seo-plan-jsonld');
    if (oldScript) {
      oldScript.remove();
    }
    
    const script = document.createElement('script');
    script.id = 'seo-plan-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }

  mergeWithCounts(localArray: any, apiData: any) {
    return localArray.map((item: any) => {
      const found = apiData.find((a: any) => a.categoryId === item.id);
      return {
        ...item,
        totalQuestionsNumber: found ? found.totalQuestionsNumber : 0,
      };
    });
  }

  onFreeDayChange(dayValue: number) {
    const currentIndex = this.selectedFreeDays.indexOf(dayValue);

    if (currentIndex > -1) {
      this.selectedFreeDays.splice(currentIndex, 1);
    } else if (this.selectedFreeDays.length < 3) {
      this.selectedFreeDays.push(dayValue);
    }
    this.studyPlanForm.patchValue({
      freeDays: [...this.selectedFreeDays],
    });
  }

  changeCategory(event: any, type: number) {
    if (event.length > 0) {
      if (type === 0) {
        this.studyPlanForm.get('tutorialIds')?.disable();
      } else {
        this.studyPlanForm.get('categoriesIds')?.disable();
      }
    } else {
      if (type === 0) {
        this.studyPlanForm.get('tutorialIds')?.enable();
      } else {
        this.studyPlanForm.get('categoriesIds')?.enable();
      }
    }
  }

  getDayLabel(dayValue: number): string {
    const day = this.weekDays().find((d) => d.value === dayValue);
    return day ? day.label : '';
  }

  getCustomCategoryTutorials(id: number) {
    this.profileService.getCustomCategoryTutorials({ id }).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.tutorialIds.set([...this.tutorialIds(), ...result]);
          console.log(this.tutorialIds());
        } else {
          this.toastr.error('حدث خطأ');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  categoriesQuestionCount() {
    this.profileService.categoriesQuestionCount().subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          console.log(result);
          this.categoriesTahsili.set(
            this.mergeWithCounts(this.categoriesTahsili(), result),
          );
          console.log(this.categoriesTahsili());
          this.mainSections.set(
            this.mergeWithCounts(this.mainSections(), result),
          );
        } else {
          this.toastr.error('حدث خطأ');
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private prepareFormData(): StudyPlan {
    const formValues = this.studyPlanForm.value;
    // if (this.id()) {
    //   return {
    //     id: this.id() || 0,
    //     name: formValues.name.trim(),
    //     startDate: new Date(formValues.startDate).toISOString(),
    //     endDate: new Date(formValues.endDate).toISOString(),
    //     freeDays: [...this.selectedFreeDays].sort(),
    //     skipSucceededExams: formValues.skipSucceededExams || false,
    //   };
    // } else {
    return {
      categoriesIds: formValues.categoriesIds ?? null,
      tutorialIds: formValues.tutorialIds ?? null,
      name: formValues.name.trim(),
      startDate: new Date(formValues.startDate).toISOString(),
      endDate: new Date(formValues.endDate).toISOString(),
      freeDays: [...this.selectedFreeDays].sort(),
      skipSucceededExams: formValues.skipSucceededExams || false,
    };
    // }
  }

  onSubmit() {
    if (this.studyPlanForm.valid) {
      this.isloading.set(true);
      const formData = this.prepareFormData();
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end <= start) {
        this.error.set('❌ خطأ: تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        return;
      }
      console.log(formData);
      this.isSubmitting = true;
      // if (this.id()) {
      //   this.profileService.updateRoadMap(formData).subscribe({
      //     next: ({ statusCode }) => {
      //       if (statusCode === 200) {
      //         this.toastr.success('تم تعديل الخطة بنجاح');
      //         this.router.navigate(['/profile/plan']);
      //       } else {
      //         this.toastr.error('عليك حذف الخطة القديمة أولاً', '', {
      //           timeOut: 7000,
      //         });
      //       }
      //       this.isloading.set(false);
      //     },
      //     error: (err) => {
      //       this.isloading.set(false);
      //       console.log(err);
      //     },
      //   });
      // } else {
      this.profileService.addRoadMap(formData).subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.router.navigate(['/profile/plan']);
            this.toastr.success('تم حفظ الخطة بنجاح');
          } else {
            this.toastr.error('عليك حذف الخطة القديمة أولاً', '', {
              timeOut: 7000,
            });
          }
          this.isloading.set(false);
        },
        error: (err) => {
          this.isloading.set(false);
          console.log(err);
        },
      });
    }
    // }
  }

  onCancel() {
    if (confirm('هل أنت متأكد من إلغاء التغييرات؟')) {
      this.router.navigate(['/profile/plan']);
    }
  }

  formData = signal<FormData>({
    weekPlan: {
      Saturday: { isFreeDay: false, categoriesIds: [0] },
      Sunday: { isFreeDay: false, categoriesIds: [0] },
      Monday: { isFreeDay: false, categoriesIds: [0] },
      Tuesday: { isFreeDay: false, categoriesIds: [0] },
      Wednesday: { isFreeDay: false, categoriesIds: [0] },
      Thursday: { isFreeDay: false, categoriesIds: [0] },
      Friday: { isFreeDay: false, categoriesIds: [0] },
    },
    name: '',
    skipSucceededExams: false,
    categoriesIds: [0],
    startDate: new Date().toISOString(),
    endDate: '',
  });

  toggleFreeDay(day: string) {
    this.formData.update((data) => {
      const newData = { ...data };
      newData.weekPlan[day].isFreeDay = !newData.weekPlan[day].isFreeDay;

      if (newData.weekPlan[day].isFreeDay) {
        newData.weekPlan[day].categoriesIds = [0];
      }

      this.updateGlobalCategories(newData);
      return newData;
    });
  }

  toggleCategory(day: string, categoryId: number) {
    this.formData.update((data) => {
      const newData = { ...data };
      const dayCategories = newData.weekPlan[day].categoriesIds;

      if (dayCategories.includes(categoryId)) {
        newData.weekPlan[day].categoriesIds = dayCategories.filter(
          (id) => id !== categoryId,
        );
        if (newData.weekPlan[day].categoriesIds.length === 0) {
          newData.weekPlan[day].categoriesIds = [0];
        }
      } else {
        if (dayCategories[0] === 0) {
          newData.weekPlan[day].categoriesIds = [categoryId];
        } else if (dayCategories.length < 2) {
          newData.weekPlan[day].categoriesIds = [...dayCategories, categoryId];
        }
      }

      this.updateGlobalCategories(newData);
      return newData;
    });
  }

  updateGlobalCategories(data: FormData) {
    const allCategories = new Set<number>();

    Object.values(data.weekPlan).forEach((dayPlan) => {
      dayPlan.categoriesIds.forEach((id) => {
        if (id !== 0) {
          allCategories.add(id);
        }
      });
    });

    data.categoriesIds =
      allCategories.size > 0 ? Array.from(allCategories) : [0];
  }

  isDayHasCategory(day: string, categoryId: number): boolean {
    return this.formData().weekPlan[day].categoriesIds.includes(categoryId);
  }

  canAddCategory(day: string): boolean {
    const categories = this.formData().weekPlan[day].categoriesIds;
    return categories[0] === 0 || categories.length < 2;
  }

  getDayCategories(day: string): number[] {
    return this.formData().weekPlan[day].categoriesIds.filter((id) => id !== 0);
  }

  getCategoryName(id: number): string {
    return this.categoriesTahsili().find((c) => c.id === id)?.name || '';
  }

  updateStartDate(event: Event) {
    const target = event.target as HTMLInputElement;
    this.formData.update((data) => ({
      ...data,
      startDate: new Date(target.value).toISOString(),
    }));
  }

  updateEndDate(event: Event) {
    const target = event.target as HTMLInputElement;
    this.formData.update((data) => ({
      ...data,
      endDate: new Date(target.value).toISOString(),
    }));
  }
  // تحصيلي
  submitForm() {
    this.isloading.set(true);
    const payload: any = { ...this.formData() };

    Object.keys(payload.weekPlan).forEach((dayKey) => {
      const day = payload.weekPlan[dayKey];

      // لو مفيش categoriesIds => اليوم Free
      if (!Array.isArray(day.categoriesIds) || day.categoriesIds.length === 0) {
        day.isFreeDay = true;
        day.categoriesIds = null;
        return;
      }

      // لو Free Day أو categoriesIds = [0]
      if (
        day.isFreeDay === true ||
        (day.categoriesIds.length === 1 && day.categoriesIds[0] === 0)
      ) {
        day.categoriesIds = null;
        day.isFreeDay = true;
      }
    });

    console.log(payload);
    // send payload to API
    this.profileService.addRoadMapScience(payload).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.router.navigate(['/profile/plan']);
          this.toastr.success('تم حفظ الخطة بنجاح');
        } else {
          this.toastr.error('حدث خطأ');
        }
        this.isloading.set(false);
      },
      error: (err) => {
        this.isloading.set(false);
        console.log(err);
      },
    });
  }

  resetForm() {
    this.formData.set({
      weekPlan: {
        Sunday: { isFreeDay: false, categoriesIds: [0] },
        Monday: { isFreeDay: false, categoriesIds: [0] },
        Tuesday: { isFreeDay: false, categoriesIds: [0] },
        Wednesday: { isFreeDay: false, categoriesIds: [0] },
        Thursday: { isFreeDay: true, categoriesIds: [0] },
        Friday: { isFreeDay: true, categoriesIds: [0] },
        Saturday: { isFreeDay: true, categoriesIds: [0] },
      },
      categoriesIds: [0],
      startDate: new Date().toISOString(),
      name: '',
      skipSucceededExams: false,
      endDate: new Date().toISOString(),
    });
  }
}
