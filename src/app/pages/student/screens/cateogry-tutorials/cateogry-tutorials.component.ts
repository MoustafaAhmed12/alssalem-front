import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorilsStudentsService } from '../../services/tutorils-students.service';
import { CourseCardComponent } from './course-card/course-card.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TutorialCard } from '../../../../shared/shared-model/tutorial-all-info';
import { TranslatePipe } from '@ngx-translate/core';
import { SeoService } from '../../../../shared/services/seo.service';

@Component({
  selector: 'app-cateogry-tutorials',
  standalone: true,
  imports: [CourseCardComponent, CommonModule, TranslatePipe],
  templateUrl: './cateogry-tutorials.component.html',
  styleUrl: './cateogry-tutorials.component.scss',
})
export class CateogryTutorialsComponent implements OnInit {
  tutorilsStudentsService = inject(TutorilsStudentsService);
  route = inject(ActivatedRoute);
  toastr = inject(ToastrService);
  seoService = inject(SeoService);

  id: number = 0;
  tutorials: TutorialCard[] = [];
  subCategoryName: string = '';
  isLoading = signal<boolean>(false);

  categoryImages: { [key: string]: string } = {
    'قدرات كمي': './../../../../../assets/imgs/كمي.png',
    'قدرات لفظي': './../../../../../assets/imgs/لفظي.png',
    'تحصيلي رياضيات': './../../../../../assets/imgs/رياضيات.png',
    'تحصيلي فيزياء': './../../../../../assets/imgs/فيزياء.png',
    'تحصيلي كيمياء': './../../../../../assets/imgs/كيمياء.png',
    'تحصيلي أحياء': './../../../../../assets/imgs/احياء.png',
    كنجارو: './../../../../../assets/imgs/كنجارو.png',
    موهوب: './../../../../../assets/imgs/موهوب.png',
    'البرنامج الوطني للكشف عن الموهوبين':
      './../../../../../assets/imgs/برنامج.png',
    'أولمبياد الرياضيات': './../../../../../assets/imgs/اولبياد.png',
    Verbal: './../../../../../assets/imgs/verbal.png',
    Quantitative: './../../../../../assets/imgs/quan.png',
  };

  get currentCategoryImage(): string | null {
    return this.categoryImages[this.subCategoryName] || null;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = parseInt(params['cateogryId']);
      if (this.id) {
        this.fetchCustomCategoryTutorials({ id: this.id });
      }
    });
  }

  setSeoTags(categoryName: string) {
    const title = `دورات ${categoryName} | منصة السالم للقدرات والتحصيلي`;
    const description = `استكشف أفضل دورات ${categoryName} على منصة السالم التعليمية. تأسيس شامل وتدريبات مكثفة لمساعدتك على التفوق وتحقيق الدرجة النهائية.`;
    const url = window.location.href;
    const keywords = `${categoryName}, دورات قدرات, تحصيلي, منصة السالم, تدريب اونلاين, تجميعات ${categoryName}`;

    // 1. Dynamic Meta & Social
    this.seoService.setDynamicMeta({
      title: title,
      description: description,
      keywords: keywords,
      url: url,
      image: 'https://alssalem.com/assets/imgs/logo2.webp'
    });

    // 2. Breadcrumbs
    this.seoService.setBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://alssalem.com/' },
      { name: categoryName, url: url }
    ]);
  }

  preloadImages() {
    this.tutorials.forEach((q) => {
      if (q.img) {
        const img = new Image();
        img.src = q.img;
      }
    });
  }

  fetchCustomCategoryTutorials(id: { id: number }): void {
    this.isLoading.set(true);
    this.tutorilsStudentsService.getCustomCategoryTutorials(id).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.tutorials = result.sort(
            (a: any, b: any) => a.orderInScreen - b.orderInScreen,
          );
          this.preloadImages();
          this.subCategoryName = this.tutorials[0]?.subCategoryName || '';
          if (this.subCategoryName) {
            this.setSeoTags(this.subCategoryName);
          }
          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }
}
