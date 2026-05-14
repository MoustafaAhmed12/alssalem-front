import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  computed,
  signal,
  inject,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { ManagerAccountantService } from '../../manager-accountant.service';

interface Course {
  id: number;
  name: string;
  subscribeCount: number;
}

interface DashboardData {
  studentCount: number;
  subscribeCount: number;
  totalProcess: number;
  totalProfit: number;
}

@Component({
  selector: 'app-manager-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-home.component.html',
  styleUrl: './manager-home.component.scss',
})
export class ManagerHomeComponent implements OnInit, AfterViewInit {
  adminService = inject(ManagerAccountantService);
  @ViewChild('subscriptionsChart')
  subscriptionsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topCoursesChart')
  topCoursesChartRef!: ElementRef<HTMLCanvasElement>;

  dataCourse = signal<Course[]>([]);
  data = signal<DashboardData>({} as DashboardData);

  // Computed signals
  sortedCourses = computed(() =>
    [...this.dataCourse()].sort((a, b) => b.subscribeCount - a.subscribeCount)
  );

  subscriptionsChart!: any;
  topCoursesChart!: Chart;
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.getPaymentAnalysis();
    this.getTutorialAnalysis();
    // setImmediate(() => {
    //   this.initializeCharts();
    // });
  }

  getTutorialAnalysis(): void {
    this.adminService.getTutorialAnalysis().subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.dataCourse.set(result);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getPaymentAnalysis(year?: any): void {
    this.isLoading.set(true);
    this.adminService.getPaymentAnalysis(year).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.data.set(result);

          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }

  ngAfterViewInit(): void {
    // this.initializeCharts();
  }

  private initializeCharts() {
    this.createSubscriptionsChart();
    this.createTopCoursesChart();
  }

  private createSubscriptionsChart() {
    const ctx = this.subscriptionsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const courses = this.dataCourse();
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#06B6D4',
      '#84CC16',
      '#F97316',
      '#EC4899',
      '#6366F1',
      '#14B8A6',
      '#F59E0B',
    ];

    this.subscriptionsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: courses.map((course) => course.name),
        datasets: [
          {
            data: courses.map((course) => course.subscribeCount),
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const total = courses.reduce(
                  (sum, course) => sum + course.subscribeCount,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  private createTopCoursesChart() {
    const ctx = this.topCoursesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const topCourses = this.sortedCourses().slice(0, 6);

    this.topCoursesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topCourses.map((course) => this.truncateText(course.name, 20)),
        datasets: [
          {
            label: 'عدد الاشتراكات',
            data: topCourses.map((course) => course.subscribeCount),
            backgroundColor: [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#06B6D4',
            ],
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#E5E7EB',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  getPercentage(subscribeCount: number): string {
    const total = this.data().subscribeCount;
    return ((subscribeCount / total) * 100).toFixed(1);
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }
}
