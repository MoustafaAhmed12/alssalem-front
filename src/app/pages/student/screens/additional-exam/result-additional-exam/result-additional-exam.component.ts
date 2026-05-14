import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { FormatTimePipe } from '../../../../../shared/Pipes/format-time.pipe';
import { ResultExam } from '../../../model/additional-exam';
Chart.register(...registerables);
@Component({
  selector: 'app-result-additional-exam',
  standalone: true,
  imports: [NgClass, FormatTimePipe],
  templateUrl: './result-additional-exam.component.html',
  styleUrl: './result-additional-exam.component.scss',
})
export class ResultAdditionalExamComponent implements OnChanges {
  @Input() correctionExamDetails: ResultExam = {} as ResultExam;
  chart!: Chart<'doughnut', number[], string>;
  @ViewChild('chart') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['correctionExamDetails']) {
      this.renderChart();
    }
  }
  roundedNumber(num: number): number {
    return Math.round(num);
  }
  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found');
      return;
    }

    const config: ChartConfiguration<'doughnut', number[], string> = {
      type: 'doughnut',
      data: {
        labels: ['نسبة النجاح', 'لم ينجح '],
        datasets: [
          {
            data: [
              this.correctionExamDetails.precent,
              100 - this.correctionExamDetails.precent,
            ],
            backgroundColor: ['#36b290', '#963c3d'],
          },
        ],
      },
      options: {},
    };

    this.chart = new Chart(ctx, config);
  }
}
