import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SupervisorService } from '../../../services/supervisor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './create-roadmap.component.html',
  styleUrl: './create-roadmap.component.scss'
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
    { id: 4, name: 'الصف الثالث المتوسط' }
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
    days: [] as any[]
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
    { id: 6, name: 'السبت' }
  ];
  holidays = signal<number[]>([]);
  examsPerDay = signal<number>(1);
  startDate = signal<string>(new Date().toISOString().split('T')[0]);

  generatedDays = signal<any[]>([]);

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
      }
    });
  }

  fetchTutorials() {
    this.superService.getAllTutorials().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) this.allTutorials.set(result);
      }
    });
  }

  onTutorialsChange(tutorials: any[]) {
    if (!tutorials) {
      this.selectedTutorialsData.set([]);
      return;
    }

    const currentData = this.selectedTutorialsData();
    const newTutorialIds = tutorials.map(t => t.id);

    // Filter out removed tutorials
    const filteredData = currentData.filter((d: any) => newTutorialIds.includes(d.id));

    // Add new tutorials
    const addedTutorials = tutorials.filter((t: any) => !currentData.some((d: any) => d.id === t.id));

    addedTutorials.forEach((tutorial: any) => {
      this.superService.getTutorialExams(tutorial.id).subscribe({
        next: ({ result, statusCode }) => {
          if (statusCode === 200) {
            this.selectedTutorialsData.update(data => [
              ...data,
              {
                id: tutorial.id,
                name: tutorial.name,
                allExams: result,
                selectedExamsIds: []
              }
            ]);
          }
        }
      });
    });

    if (addedTutorials.length === 0) {
      this.selectedTutorialsData.set(filteredData);
    }
  }

  toggleSelectAll(tutorialId: number) {
    this.selectedTutorialsData.update(data => {
      return data.map((t: any) => {
        if (t.id === tutorialId) {
          const allIds = t.allExams.map((e: any) => e.id);
          const isAllSelected = t.selectedExamsIds.length === allIds.length;
          return {
            ...t,
            selectedExamsIds: isAllSelected ? [] : allIds
          };
        }
        return t;
      });
    });
  }

  toggleHoliday(dayId: number) {
    if (this.holidays().includes(dayId)) {
      this.holidays.set(this.holidays().filter(h => h !== dayId));
    } else {
      this.holidays.set([...this.holidays(), dayId]);
    }
  }

  nextStep() {
    if (this.currentStep() < 3) {
      if (this.currentStep() === 2) {
        this.distributeExams();
      }
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  distributeExams() {
    const exams = [...this.selectedExamsIds()];
    if (exams.length === 0) return;

    const days: any[] = [];
    let currentDate = new Date(this.startDate());
    const holidayIndices = this.holidays();
    const countPerDay = this.examsPerDay();

    let examIndex = 0;
    while (examIndex < exams.length) {
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday...
      
      // Map JS day (0-Sun) to our weekDays (if needed, but usually 0 is Sun in both if we match)
      // Actually weekDays is 0-Sun, 1-Mon... JS is 0-Sun.
      
      const isHoliday = holidayIndices.includes(dayOfWeek);
      
      const dayEntry = {
        date: currentDate.toISOString(),
        examsIds: [] as number[]
      };

      if (!isHoliday) {
        for (let i = 0; i < countPerDay && examIndex < exams.length; i++) {
          dayEntry.examsIds.push(exams[examIndex]);
          examIndex++;
        }
      }
      
      days.push(dayEntry);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.generatedDays.set(days);
    this.formData.days = days;
  }

  submit() {
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
    return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  }

  getExamName(id: number) {
    for (const t of this.selectedTutorialsData()) {
      const exam = t.allExams.find((e: any) => e.id === id);
      if (exam) return exam.name;
    }
    return 'اختبار';
  }
}
