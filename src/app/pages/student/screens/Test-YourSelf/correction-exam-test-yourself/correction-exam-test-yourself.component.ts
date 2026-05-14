import { DecimalPipe, NgClass } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormatTimePipe } from '../../../../../shared/Pipes/format-time.pipe';
Chart.register(...registerables);
@Component({
  selector: 'app-correction-exam-test-yourself',
  standalone: true,
  imports: [DecimalPipe, FormatTimePipe, NgClass, RouterLink],
  templateUrl: './correction-exam-test-yourself.component.html',
  styleUrl: './correction-exam-test-yourself.component.scss',
})
export class CorrectionExamTestYourselfComponent implements OnInit {
  @Input() correctionExamDetails!: any;
  @Input() totalQuestions: number = 0;
  route = inject(ActivatedRoute);
  router = inject(Router);
  examId: number = 0;
  array: any[] = [
    {
      step: 'نسبة النجاح',
      bgColor: '#36b290',
    },
    {
      step: 'لم ينجح ',
      bgColor: '#963c3d',
    },
  ];
  bgColors: string[] = [];
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.examId = parseInt(params['examId']);
    });
    this.array.map((o) => {
      this.bgColors.push(o.bgColor);
    });
    this.renderChart(this.bgColors);
  }
  renderChart(bgColors: any): void {
    const chart = new Chart('chart', {
      type: 'doughnut',
      data: {
        labels: ['نسبة النجاح', 'لم ينجح '],
        datasets: [
          {
            data: [
              this.correctionExamDetails
                ? this.correctionExamDetails.length === 1
                  ? this.correctionExamDetails[0].percentage
                  : this.correctionExamDetails[
                      this.correctionExamDetails.length - 1
                    ].percentage
                : 0,
              this.correctionExamDetails
                ? this.correctionExamDetails.length === 1
                  ? 100 - this.correctionExamDetails[0].percentage
                  : 100 -
                    this.correctionExamDetails[
                      this.correctionExamDetails.length - 1
                    ].percentage
                : 0,
            ],
            backgroundColor: bgColors,
          },
        ],
      },
      options: {
        backgroundColor: '#f00',
      },
    });
  }
}
