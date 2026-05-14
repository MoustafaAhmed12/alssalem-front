import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TutorialCard } from '../../../../../shared/shared-model/tutorial-all-info';
@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-card.component.html',
})
export class CourseCardComponent {
  @Input() tutorial!: TutorialCard;
  router = inject(Router);
  goToTutorial(tutorialId: any): void {
    this.router.navigate([`tutorial/`, tutorialId]);
  }
}
