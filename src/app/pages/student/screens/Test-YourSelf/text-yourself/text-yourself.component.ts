import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TestYourselfService } from '../../../services/test-yourself.service';
import { NavbarComponent } from '../../../../../shared/components/navbar/navbar.component';
@Component({
  selector: 'app-text-yourself',
  standalone: true,
  imports: [NgClass, NgSelectModule, NavbarComponent],
  templateUrl: './text-yourself.component.html',
  styleUrl: './text-yourself.component.scss',
})
export class TextYourselfComponent {
  testYourselfService = inject(TestYourselfService);
  router = inject(Router);
  mainCategory: { id: number; name: string }[] = [
    {
      id: 1,
      name: 'قدرات',
    },
    {
      id: 2,
      name: 'تحصيلي',
    },
    {
      id: 3,
      name: 'موهبة',
    },
    {
      id: 4,
      name: 'قدرات بالانجليزي',
    },
  ];
  subCategory: { id: number; name: string }[] = [];
  tutorialsCategory: { id: number; name: string; examPrice: number }[] = [];
  examsTutorial: { id: number; name: string }[] = [];
  exam: any = null;
  isLoading = signal<boolean>(false);
  isLoading2 = signal<boolean>(false);
  isLoading3 = signal<boolean>(false);
  parentId: number | null = null;
  categoryId: number | null = null;
  tutorialId: number | null = null;
  examPrice: any;
  showSubOptions(mainQId: number) {
    this.parentId = mainQId;
    this.categoryId = null;
    this.tutorialId = null;
    this.exam = null;
    this.exam = null;
    this.isLoading.set(true);
    this.testYourselfService
      .getSubCategoriesByParentId(this.parentId)
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.subCategory = result;
            this.isLoading.update((v) => (v = false));
          } else {
            console.log('error');
            this.isLoading.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
  }
  handleSubOption(option: number) {
    this.categoryId = option;
    this.isLoading2.set(true);
    this.tutorialId = null;
    this.exam = null;
    this.testYourselfService
      .getTutorialsbyCategoryId(this.categoryId)
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.tutorialsCategory = result;
            this.isLoading2.update((v) => (v = false));
          } else {
            console.log('error');
            this.isLoading2.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading2.update((v) => (v = false));
        },
      });
  }
  getExams(tutorialId: number) {
    this.tutorialId = tutorialId;
    this.isLoading3.set(true);
    this.exam = null;
    this.testYourselfService.getExamsByTutorialId(this.tutorialId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.examsTutorial = result;
          this.examPrice = this.tutorialsCategory
            .filter((t) => t.id === tutorialId)
            .map((x) => x.examPrice);
          this.isLoading3.update((v) => (v = false));
        } else {
          console.log('error');
          this.isLoading3.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading3.update((v) => (v = false));
      },
    });
  }
  getExam(item: any): void {
    this.exam = item;
  }
  checkoutExam(): void {
    if (this.exam.isBought) {
      this.router.navigate(['/test-yourself/exam/', this.exam.id]);
    } else {
      this.router.navigate(['/checkoutExam/', this.exam.id]);
    }
  }
}
