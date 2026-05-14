import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { SchoolAdminService } from '../../services/school-admin.service';
import { ToastrService } from 'ngx-toastr';

Chart.register(...registerables);

interface School {
  id: number;
  name: string;
  count: number;
}

interface Tutorial {
  id: number;
  name: string;
}

interface DashboardData {
  totalStudents: number;
  totalAllowedStudents: number;
  allowedStudents: number;
  schools: School[];
  tutorials: Tutorial[];
}

@Component({
  selector: 'app-dashoard-school-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashoard-school-admin.component.html',
})
export class DashoardSchoolAdminComponent implements OnInit {
  schoolAdminService = inject(SchoolAdminService);
  toastr = inject(ToastrService);
  @ViewChild('schoolsChart', { static: false })
  schoolsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('studentsChart', { static: false })
  studentsChartRef!: ElementRef<HTMLCanvasElement>;

  data: DashboardData = {} as DashboardData;
  isLoading = signal<boolean>(false);

  private schoolsChart!: Chart;
  private studentsChart!: Chart;

  ngOnInit(): void {
    this.getDashboardData();
  }
  getDashboardData(): void {
    this.isLoading.set(true);
    this.schoolAdminService.getDashboardData().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.data = result;

          // خليه بعد شوية صغيرين علشان Angular يرنـدر الكانڤاس
          setTimeout(() => {
            this.createCharts();
          });
        } else {
          this.toastr.error('حدث خطأ أثناء جلب بيانات لوحة التحكم', 'خطأ');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
        this.toastr.error('حدث خطأ أثناء جلب بيانات لوحة التحكم', 'خطأ');
      },
    });
  }

  private createCharts(): void {
    this.createSchoolsChart();
    this.createStudentsChart();
  }

  private createSchoolsChart(): void {
    console.log(this.schoolsChartRef);
    const ctx = this.schoolsChartRef.nativeElement.getContext('2d');

    console.log(ctx);

    if (ctx) {
      const config: ChartConfiguration = {
        type: 'doughnut' as ChartType,
        data: {
          labels: this.data.schools.map((school) => school.name),
          datasets: [
            {
              data: this.data.schools.map((school) => school.count),
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
              ],
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              rtl: true,
              labels: {
                font: {
                  family: 'Arial, sans-serif',
                },
                padding: 20,
              },
            },
          },
        },
      };

      this.schoolsChart = new Chart(ctx, config);
    }
  }

  private createStudentsChart(): void {
    const ctx = this.studentsChartRef.nativeElement.getContext('2d');

    if (ctx) {
      const config: ChartConfiguration = {
        type: 'bar' as ChartType,
        data: {
          labels: [
            'إجمالي الطلاب',
            'الطلاب المسموح',
            'الطلاب المشتركين',
            'العدد المتبقي',
          ],
          datasets: [
            {
              label: 'عدد الطلاب',
              data: [
                this.data.totalStudents,
                this.data.totalAllowedStudents,
                this.data.allowedStudents,
                this.data.totalAllowedStudents - this.data.allowedStudents,
              ],
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                '#f00',
              ],
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                '#f00',
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  family: 'Arial, sans-serif',
                },
              },
            },
            x: {
              ticks: {
                font: {
                  family: 'Arial, sans-serif',
                },
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      };

      this.studentsChart = new Chart(ctx, config);
    }
  }

  getSchoolPercentage(count: number): number {
    return Math.round((count / this.data.totalStudents) * 100);
  }

  getAcceptanceRate(): number {
    return Math.round(
      (this.data.allowedStudents / this.data.totalStudents) * 100
    );
  }

  getAverageStudentsPerSchool(): number {
    return Math.round(this.data.totalStudents / this.data.schools.length);
  }
}
