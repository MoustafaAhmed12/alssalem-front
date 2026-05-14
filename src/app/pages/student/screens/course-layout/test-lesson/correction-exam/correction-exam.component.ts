import { NgClass } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { FormatTimePipe } from '../../../../../../shared/Pipes/format-time.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CorrectionExam,
  QuestionTypeStatistic,
} from '../../../../model/question-student';
Chart.register(...registerables);
import confetti from 'canvas-confetti';
@Component({
  selector: 'app-correction-exam',
  standalone: true,
  imports: [FormatTimePipe, NgClass],
  templateUrl: './correction-exam.component.html',
  styleUrl: './correction-exam.component.scss',
})
export class CorrectionExamComponent implements OnInit, OnChanges {
  @Input() correctionExamDetails: CorrectionExam = {} as CorrectionExam;
  @Input() examName: string = '';
  @Input() takeTime: number = 0;
  route = inject(ActivatedRoute);
  allResultDetails: QuestionTypeStatistic[] = [];
  router = inject(Router);
  tutorialId: number = 0;
  examId: number = 0;
  isShow: boolean = false;
  isOpen = signal<boolean>(false);
  isEmpty: boolean = false;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['correctionExamDetails']) {
      this.allResultDetails = this.correctionExamDetails.questionTypeStatistics;
      this.isEmpty = this.allResultDetails.every(
        (item) => item.skillsStatistics.length === 0
      );
    }
  }

  ngOnInit() {
    this.route.url.subscribe(() => {
      const url = this.router.url;
      const tutorialIdMatch = /\/tutorial\/(\d+)\//.exec(url);
      if (tutorialIdMatch) {
        this.tutorialId = +tutorialIdMatch[1];
      }
    });
    this.route.params.subscribe((params) => {
      this.examId = parseInt(params['examId']);
    });
    this.renderChart();

    if (this.correctionExamDetails.isSuccess === true) {
      this.startConfettiAnimation();
      this.triggerConfetti();
    }
  }

  openPop(): void {
    this.isOpen.set(true);
  }
  close(): void {
    this.isOpen.set(false);
  }

  roundedNumber(num: number): number {
    return Math.round(num);
  }
  renderChart(): void {
    const chart = new Chart('chart', {
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
      options: {
        backgroundColor: '#f00',
      },
    });
  }

  startConfettiAnimation(): void {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['090', 'ff0', 'E89400', 'FFCA6C', 'FDFFB8'],
    };

    const interval = setInterval(() => {
      const timeLeft: number = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount: number = 150 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: this.randomInRange({ min: 0.1, max: 0.3 }),
          y: Math.random() - 0.2,
        },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: this.randomInRange({ min: 0.7, max: 0.9 }),
          y: Math.random() - 0.2,
        },
      });
    }, 250);
  }

  triggerConfetti(): void {
    confetti();
  }

  randomInRange({ min, max }: { min: number; max: number }): number {
    return Math.random() * (max - min) + min;
  }

  shoot(): void {
    confetti({
      // ...this.defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      // ...this.defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'],
    });
  }

  setTimeoutShoot(): void {
    setTimeout(() => this.shoot(), 0);
    setTimeout(() => this.shoot(), 100);
    setTimeout(() => this.shoot(), 200);
  }
}
