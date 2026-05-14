import { Component, Input, OnInit, inject } from '@angular/core';
import { StudentDetailsParent } from '../../models/parentModels';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-card-student',
  standalone: true,
  imports: [DecimalPipe, NgClass, RouterLink],
  templateUrl: './card-student.component.html',
  styleUrl: './card-student.component.scss',
})
export class CardStudentComponent {
  @Input() student!: StudentDetailsParent;

  ngOnInit() {
    const uniqueData = this.student.tutorials.filter(
      (item: any, index: number, self: any) =>
        index === self.findIndex((t: any) => t.id === item.id)
    );

    this.student = { ...this.student, tutorials: uniqueData };
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getAverageProgress(): number {
    if (!this.student?.tutorials?.length) return 0;
    const total = this.student.tutorials.reduce(
      (sum, tutorial) => sum + tutorial.advancePercentage,
      0
    );
    return Math.round(total / this.student.tutorials.length);
  }

  getProgressStatus(percentage: number): string {
    if (percentage === 100) return 'مكتملة';
    if (percentage >= 50) return 'قيد التقدم';
    return 'لم تبدأ';
  }

  getCompletedTutorials(): number {
    return this.student.tutorials.filter((t) => t.advancePercentage === 100)
      .length;
  }

  getInProgressTutorials(): number {
    return this.student.tutorials.filter(
      (t) => t.advancePercentage > 0 && t.advancePercentage < 100
    ).length;
  }

  getNotStartedTutorials(): number {
    return this.student.tutorials.filter((t) => t.advancePercentage === 0)
      .length;
  }
}
