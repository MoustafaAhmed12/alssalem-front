import { Component, Input, inject } from '@angular/core';
import { TutorialTeacher } from '../../../pages/instructor/model/teacher';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-card-tutorial',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './card-tutorial.component.html',
  styleUrl: './card-tutorial.component.scss',
})
export class CardTutorialComponent {
  @Input() tutorial!: TutorialTeacher;
  router = inject(Router);
  goToEditTutorial(tutorialId: any): void {
    this.router.navigate(['instructor/edit-tutorial', tutorialId], {
      queryParams: { lenUnits: this.tutorial.numberOfUnits },
    });
  }
}
