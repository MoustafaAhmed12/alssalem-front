import { Component, inject, OnInit, signal } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { SecondNavbarComponent } from '../../components/second-navbar/second-navbar.component';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { AdminService } from '../../services/admin.service';
Chart.register(...registerables);
import { NgSelectModule } from '@ng-select/ng-select';
import { NgClass } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../authentication/services/auth.service';
import { SubAdminService } from '../../services/sub-admin.service';
export interface PaymentAnalysis {
  totalProfit: number;
  totalProcess: number;
  studentCount: number;
  subscribeCount: number;
  series: Series;
}
export interface Series {
  studentCount: number[];
  subscribeCount: number[];
  totalProfit: number[];
}
@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [NgSelectModule, TitleScreenComponent, NgClass, RouterLink],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss',
})
export class AdminHomeComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  subAdminService = inject(SubAdminService);
  isLoading = signal<boolean>(false);
  isLoading1 = signal<boolean>(false);
  isShow: boolean = false;
  bgColors: string[] = ['#36b290', '#963c3d'];
  tutorialsName: string[] = [];
  studentsNumber: number[] = [];
  studentCount: number[] = [];
  subscribeCount: number[] = [];
  totalProfit: number[] = [];
  months: string[] = [];
  paymentAnalysis!: PaymentAnalysis;
  myChart: Chart | undefined;
  chartData: any = {};
  chartId = 'myChart';
  role: string = '';
  ngOnInit() {
    this.role = this.authService.currentUser().roleDto.roleName;
    this.getPaymentAnalysis();
    this.getTutorialAnalysis();
  }
  ngOnDestroy(): void {
    if (this.myChart) {
      this.myChart.destroy();
    }
  }
  renderChart(lables: any[], data: any[]): void {
    const myChart = new Chart('chart', {
      type: 'bar',
      data: {
        labels: lables,
        datasets: [
          {
            data: data,
            label: 'عدد الطلاب',
            backgroundColor: ['#36b290', '#e5a53f', '#30244a', '#7dc5ad'],
          },
        ],
      },
    });
  }
  getTutorialAnalysis(): void {
    if (this.role == 'أدمن') {
      this.adminService.getTutorialAnalysis().subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            result.map((t: any) => {
              this.tutorialsName.push(t.name);
              this.studentsNumber.push(t.subscribeCount);
            });
            this.renderChart(this.tutorialsName, this.studentsNumber);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.subAdminService.getTutorialAnalysis().subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            result.map((t: any) => {
              this.tutorialsName.push(t.name);
              this.studentsNumber.push(t.subscribeCount);
            });
            this.renderChart(this.tutorialsName, this.studentsNumber);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
  getPaymentAnalysis(year?: any): void {
    this.isLoading.set(true);
    if (this.role == 'أدمن') {
      this.adminService.getPaymentAnalysis(year).subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.paymentAnalysis = result;
            result.series.studentCount.map((n: any) => {
              this.studentCount.push(n.count);
              const month = n.month;
              this.months.push(month);
              this.months = Array.from(
                new Set(this.months.map((num) => num.toString()))
              );
            });
            result.series.subscribeCount.map((n: any) => {
              this.subscribeCount.push(n.count);
            });
            result.series.totalProfit.map((n: any) => {
              this.totalProfit.push(n.totalProfit);
            });
            if (this.myChart) {
              this.myChart.destroy();
            }
            this.myChart = new Chart('myChart', {
              type: 'bar',
              data: {
                labels: this.months,
                datasets: [
                  {
                    data:
                      result.series.studentCount.length > 0
                        ? this.studentCount
                        : [0],
                    label: 'عدد الطلاب',
                    backgroundColor: ['#36b290'],
                  },
                  {
                    data:
                      result.series.subscribeCount.length > 0
                        ? this.subscribeCount
                        : [0],
                    label: 'عدد الطلبات',
                    backgroundColor: ['#e5a53f'],
                  },
                  {
                    data:
                      result.series.totalProfit.length > 0
                        ? this.totalProfit
                        : [0],
                    label: 'إجمالي المال',
                    backgroundColor: ['#30244a'],
                  },
                ],
              },
            });
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
    } else {
      this.subAdminService.getPaymentAnalysis(year).subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.paymentAnalysis = result;
            result.series.studentCount.map((n: any) => {
              this.studentCount.push(n.count);
              const month = n.month;
              this.months.push(month);
              this.months = Array.from(
                new Set(this.months.map((num) => num.toString()))
              );
            });
            result.series.subscribeCount.map((n: any) => {
              this.subscribeCount.push(n.count);
            });
            result.series.totalProfit.map((n: any) => {
              this.totalProfit.push(n.totalProfit);
            });
            if (this.myChart) {
              this.myChart.destroy();
            }
            this.myChart = new Chart('myChart', {
              type: 'bar',
              data: {
                labels: this.months,
                datasets: [
                  {
                    data:
                      result.series.studentCount.length > 0
                        ? this.studentCount
                        : [0],
                    label: 'عدد الطلاب',
                    backgroundColor: ['#36b290'],
                  },
                  {
                    data:
                      result.series.subscribeCount.length > 0
                        ? this.subscribeCount
                        : [0],
                    label: 'عدد الطلبات',
                    backgroundColor: ['#e5a53f'],
                  },
                  {
                    data:
                      result.series.totalProfit.length > 0
                        ? this.totalProfit
                        : [0],
                    label: 'إجمالي المال',
                    backgroundColor: ['#30244a'],
                  },
                ],
              },
            });
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
  }
  onSeletedYear(year: any): void {
    this.getPaymentAnalysis(year);
  }
  handleShow(): void {
    this.isShow = !this.isShow;
  }
}
