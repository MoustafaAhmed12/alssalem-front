import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SupervisorService } from '../../../services/supervisor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, DragDropModule],
  templateUrl: './create-roadmap.component.html',
  styleUrl: './create-roadmap.component.scss',
})
export class CreateRoadmapComponent implements OnInit {
  superService = inject(SupervisorService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  toastr = inject(ToastrService);

  currentStep = signal<number>(1);
  roadmapId = signal<number | null>(null);
  isLoading = signal<boolean>(false);

  // Data for Step 1
  allSchools = signal<any[]>([]);
  allStudents = signal<any[]>([]);
  grades = [
    { id: 1, name: 'الصف الأول الثانوي' },
    { id: 2, name: 'الصف الثاني الثانوي' },
    { id: 3, name: 'الصف الثالث الثانوي' },
    { id: 4, name: 'الصف الثالث المتوسط' },
  ];
  classNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  // Form Data
  formData = {
    name: '',
    categoriesIds: [1, 2], // Default for now
    schoolsIds: [] as number[],
    studentsIds: [] as number[],
    classNumbers: [] as number[],
    state: null as string | null,
    days: [] as any[],
  };

  // Step 2 Data
  allTutorials = signal<any[]>([]);
  selectedTutorialsData = signal<any[]>([]);

  // Computed to get all selected exams across all tutorials
  selectedExamsIds = computed(() => {
    return this.selectedTutorialsData().reduce((acc, curr) => {
      return [...acc, ...curr.selectedExamsIds];
    }, []);
  });

  weekDays = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الاثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' },
  ];
  holidays = signal<number[]>([]);
  examsPerDay = 1;
  endDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0];
  startDate = new Date().toISOString().split('T')[0];

  generatedDays = signal<any[]>([]);
  allAssignedExamsIds = computed(() => {
    return this.generatedDays().reduce((acc, day) => {
      return [...acc, ...(day.examsIds || [])];
    }, [] as number[]);
  });

  tutorialsWithAvailableExams = computed(() => {
    const assignedIds = this.allAssignedExamsIds();
    return this.selectedTutorialsData().map((tutorial: any) => ({
      ...tutorial,
      availableExams: tutorial.allExams ? tutorial.allExams.filter((exam: any) => !assignedIds.includes(Number(exam.id))) : []
    }));
  });

  ngOnInit(): void {
    this.fetchSchools();
    this.fetchTutorials();

    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.roadmapId.set(+params['id']);
        this.loadRoadMap(+params['id']);
      }
    });
  }

  loadRoadMap(id: number) {
    this.isLoading.set(true);
    this.superService.getOneRoadMap(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200 && result.length > 0) {
          const roadmap = result[0];
          this.formData.name = roadmap.name || '';
          this.formData.schoolsIds = roadmap.schoolsIds || [];
          this.formData.studentsIds = roadmap.studentsIds || [];
          this.formData.classNumbers = roadmap.classNumbers || [];
          this.formData.state = roadmap.state || null;

          // Map days and tasks back to our structure
          const mappedDays = roadmap.days.map((day: any) => ({
            date: day.date,
            examsIds: day.tasks.map((task: any) => task.id),
          }));

          this.generatedDays.set(mappedDays);
          this.formData.days = mappedDays;

          // Optional: You might want to pre-select tutorials based on exams
          // but for now we populate the generated days which is enough for Step 3
        }
        this.isLoading.set(true);
        setTimeout(() => this.isLoading.set(false), 500);
      },
      error: () => this.isLoading.set(false),
    });
  }

  fetchSchools() {
    this.superService.getAllShools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) this.allSchools.set(result);
      },
    });
  }

  fetchTutorials() {
    this.superService.getAllTutorials().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) this.allTutorials.set(result);
      },
    });
  }

  onTutorialsChange(tutorials: any[]) {
    if (!tutorials) {
      this.selectedTutorialsData.set([]);
      return;
    }

    const currentData = this.selectedTutorialsData();
    const newTutorialIds = tutorials.map((t) => t.id);

    // Filter out removed tutorials
    const filteredData = currentData.filter((d: any) =>
      newTutorialIds.includes(d.id),
    );

    // Add new tutorials
    const addedTutorials = tutorials.filter(
      (t: any) => !currentData.some((d: any) => d.id === t.id),
    );

    addedTutorials.forEach((tutorial: any) => {
      this.superService.getTutorialExams(tutorial.id).subscribe({
        next: ({ result, statusCode }) => {
          if (statusCode === 200) {
            this.selectedTutorialsData.update((data) => [
              ...data,
              {
                id: tutorial.id,
                name: tutorial.name,
                allExams: result,
                selectedExamsIds: [],
              },
            ]);
          }
        },
      });
    });

    if (addedTutorials.length === 0) {
      this.selectedTutorialsData.set(filteredData);
    }
  }

  toggleSelectAll(tutorialId: number) {
    this.selectedTutorialsData.update((data) => {
      return data.map((t: any) => {
        if (t.id === tutorialId) {
          const allIds = t.allExams.map((e: any) => e.id);
          const isAllSelected = t.selectedExamsIds.length === allIds.length;
          return {
            ...t,
            selectedExamsIds: isAllSelected ? [] : allIds,
          };
        }
        return t;
      });
    });
  }

  toggleHoliday(dayId: number) {
    if (this.holidays().includes(dayId)) {
      this.holidays.set(this.holidays().filter((h) => h !== dayId));
    } else {
      this.holidays.set([...this.holidays(), dayId]);
    }
  }

  nextStep() {
    if (this.currentStep() === 1) {
      if (!this.formData.name?.trim()) {
        this.toastr.warning('يرجى إدخال اسم الخطة');
        return;
      }
      const hasSelection =
        (this.formData.schoolsIds?.length ?? 0) > 0 ||
        (this.formData.studentsIds?.length ?? 0) > 0 ||
        (this.formData.classNumbers?.length ?? 0) > 0;
      if (!hasSelection) {
        this.toastr.warning('يرجى اختيار مدرسة أو طالب أو فصل دراسي على الأقل');
        return;
      }
    }

    if (this.currentStep() === 2) {
      if (this.selectedTutorialsData().length === 0) {
        this.toastr.warning('يرجى اختيار دورة واحدة على الأقل للمتابعة');
        return;
      }
      if (new Date(this.startDate) > new Date(this.endDate)) {
        this.toastr.warning('تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية');
        return;
      }
      this.distributeExams();
    }

    if (this.currentStep() < 3) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  distributeExams() {
    const exams = [...this.selectedExamsIds()];
    const days: any[] = [];
    let currentDate = new Date(this.startDate);
    const holidayIndices = this.holidays();
    const countPerDay = this.examsPerDay;

    // If no exams selected, generate empty days up to endDate
    if (exams.length === 0) {
      let current = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // Ensure it includes the whole end day

      while (current <= end) {
        const dayOfWeek = current.getDay();
        const isHoliday = holidayIndices.includes(dayOfWeek);
        days.push({
          date: current.toISOString(),
          examsIds: [],
          isHoliday: isHoliday,
        });
        current.setDate(current.getDate() + 1);
      }
    } else {
      let examIndex = 0;
      while (examIndex < exams.length) {
        const dayOfWeek = currentDate.getDay();

      // Map JS day (0-Sun) to our weekDays (if needed, but usually 0 is Sun in both if we match)
      // Actually weekDays is 0-Sun, 1-Mon... JS is 0-Sun.

      const isHoliday = holidayIndices.includes(dayOfWeek);

      const dayEntry = {
        date: currentDate.toISOString(),
        examsIds: [] as number[],
      };

      if (!isHoliday) {
        for (let i = 0; i < countPerDay && examIndex < exams.length; i++) {
          dayEntry.examsIds.push(exams[examIndex]);
          examIndex++;
        }
      }

      (dayEntry as any).isHoliday = isHoliday;
      days.push(dayEntry);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

    this.generatedDays.set(days);
    this.formData.days = days;
  }

  toggleDayHoliday(day: any) {
    day.isHoliday = !day.isHoliday;
    if (day.isHoliday) {
      // Optional: you might want to keep the exams or clear them.
      // Clearing them makes it look like a holiday.
      day.examsIds = [];
    }
    this.generatedDays.set([...this.generatedDays()]);
    this.formData.days = this.generatedDays();
  }

  addExamToDay(day: any, examId: any) {
    let id = (typeof examId === 'object' && examId !== null) ? examId.id : examId;
    id = Number(id);
    if (!id) return;
    if (!day.examsIds.includes(id)) {
      day.examsIds.push(id);
      this.generatedDays.set([...this.generatedDays()]);
      this.formData.days = this.generatedDays();
    }
  }

  addDayToEnd() {
    const days = this.generatedDays();
    let nextDate = new Date();
    if (days.length > 0) {
      nextDate = new Date(days[days.length - 1].date);
      nextDate.setDate(nextDate.getDate() + 1);
    } else {
      nextDate = new Date(this.startDate);
    }
    
    const dayOfWeek = nextDate.getDay();
    const isHoliday = this.holidays().includes(dayOfWeek);
    
    const newDay = {
      date: nextDate.toISOString(),
      examsIds: [],
      isHoliday: isHoliday,
    };
    
    this.generatedDays.set([...days, newDay]);
    this.formData.days = this.generatedDays();
  }

  removeExamFromDay(day: any, examId: number) {
    day.examsIds = day.examsIds.filter((id: number) => id !== examId);
    this.generatedDays.set([...this.generatedDays()]);
    this.formData.days = this.generatedDays();
  }

  getAllExamsForSelect() {
    const list: any[] = [];
    this.selectedTutorialsData().forEach((t) => {
      t.allExams.forEach((e: any) => {
        list.push({ ...e, tutorialName: t.name });
      });
    });
    return list;
  }

  submit() {
    if (!this.formData.name?.trim()) {
      this.toastr.warning('يرجى إدخال اسم الخطة');
      return;
    }

    const hasSelection =
      (this.formData.schoolsIds?.length ?? 0) > 0 ||
      (this.formData.studentsIds?.length ?? 0) > 0 ||
      (this.formData.classNumbers?.length ?? 0) > 0;

    if (!hasSelection) {
      this.toastr.warning('يرجى اختيار مدرسة أو طالب أو فصل دراسي على الأقل');
      return;
    }

    const hasExams = this.formData.days?.some(d => d.examsIds?.length > 0);
    if (!hasExams) {
      this.toastr.warning('يرجى توزيع الاختبارات على الأيام أولاً');
      return;
    }

    this.isLoading.set(true);
    const payload = { ...this.formData };

    if (this.roadmapId()) {
      (payload as any).id = this.roadmapId();
      this.superService.updateRoadMap(payload).subscribe({
        next: (res) => {
          this.toastr.success('تم تعديل الخطة بنجاح');
          this.router.navigate(['/super/roadmaps']);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toastr.error('حدث خطأ أثناء تعديل الخطة');
          this.isLoading.set(false);
        },
      });
    } else {
      this.superService.createRoadMap(payload).subscribe({
        next: (res) => {
          this.toastr.success('تم إنشاء الخطة بنجاح');
          this.router.navigate(['/super/roadmaps']);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toastr.error('حدث خطأ أثناء إنشاء الخطة');
          this.isLoading.set(false);
        },
      });
    }
  }

  // Calendar Helpers
  getWeekDayName(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { weekday: 'long' });
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getExamName(id: any) {
    if (!id) return '...';
    for (const t of this.selectedTutorialsData()) {
      const exam = t.allExams.find((e: any) => e.id == id);
      if (exam) return exam.name;
    }
    return 'اختبار ' + id;
  }

  getTutorialColorClasses(index: number) {
    const colors = [
      { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', dot: 'bg-sky-500', primary: 'text-primary' },
      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500', primary: 'text-emerald-600' },
      { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500', primary: 'text-amber-600' },
      { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500', primary: 'text-rose-600' },
      { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-indigo-500', primary: 'text-indigo-600' },
      { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100', dot: 'bg-violet-500', primary: 'text-violet-600' },
      { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100', dot: 'bg-teal-500', primary: 'text-teal-600' },
      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', dot: 'bg-orange-500', primary: 'text-orange-600' },
    ];
    return colors[index % colors.length];
  }

  getExamColorClasses(id: any) {
    const tutorials = this.selectedTutorialsData();
    const tutorialIndex = tutorials.findIndex((t) =>
      t.allExams.some((e: any) => e.id == id)
    );

    return this.getTutorialColorClasses(tutorialIndex === -1 ? 0 : tutorialIndex);
  }

  getAvailableExams(allExams: any[]) {
    if (!allExams) return [];
    const assignedIds = this.allAssignedExamsIds();
    return allExams.filter((exam: any) => !assignedIds.includes(Number(exam.id)));
  }

  onExamSelected(day: any, examId: any, select: any) {
    if (examId) {
      this.addExamToDay(day, examId);
      setTimeout(() => {
        select.writeValue(null);
      }, 0);
    }
  }

  drop(event: CdkDragDrop<number[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    // Update signal and formData
    this.generatedDays.set([...this.generatedDays()]);
    this.formData.days = this.generatedDays();
  }
}
