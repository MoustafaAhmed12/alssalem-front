import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CourseCardComponent } from '../cateogry-tutorials/course-card/course-card.component';
import { TutorialCard } from '../../../../shared/shared-model/tutorial-all-info';
import { TutorilsStudentsService } from '../../services/tutorils-students.service';
import { SeoService } from '../../../../shared/services/seo.service';
@Component({
  selector: 'app-best-tutorials',
  standalone: true,
  imports: [NgClass, CourseCardComponent],
  templateUrl: './best-tutorials.component.html',
  styleUrl: './best-tutorials.component.scss',
})
export class BestTutorialsComponent implements OnInit {
  tutorilsStudentsService = inject(TutorilsStudentsService);
  seoService = inject(SeoService);
  tutorials: TutorialCard[] = [];
  isLoading = signal<boolean>(false);
  ngOnInit() {
    this.seoService.setDynamicMeta({
      title: 'أفضل الدورات | منصة السالم التعليمية',
      description: 'استكشف أفضل الدورات التعليمية المتوفرة في منصة السالم لاختبارات القدرات والتحصيلي.',
      keywords: 'دورات القدرات, دورات التحصيلي, كورسات السالم, تعليم أونلاين',
      url: 'https://alssalem.com/best-tutorials',
      image: 'https://alssalem.com/assets/imgs/logo2.webp'
    });
    this.seoService.setBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://alssalem.com/' },
      { name: 'أفضل الدورات', url: 'https://alssalem.com/best-tutorials' }
    ]);
    this.bestSellingTutorials();
  }
  bestSellingTutorials(): void {
    this.isLoading.set(true);
    this.tutorilsStudentsService.bestSellingTutorials().subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.tutorials = result?.sort((a: any, b: any) =>
            a.id < b.id ? 1 : -1
          );
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
