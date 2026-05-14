import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { SeoService } from '../../../../shared/services/seo.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit } from '@angular/core';
@Component({
  selector: 'app-sub-cateogry',
  standalone: true,
  imports: [NgClass, RouterLink, TranslatePipe],
  templateUrl: './sub-cateogry.component.html',
  styleUrl: './sub-cateogry.component.scss',
})
export class SubCateogryComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  seoService = inject(SeoService);
  qudrates: any;
  digital: any;
  tahselis: any;
  qudrateEng: any;
  mawhooba: any;
  name: string = '';

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.name = params['name'];
      this.setSeoTags();
    });
  }

  setSeoTags() {
    let title = 'الأقسام | منصة السالم';
    let description = 'تصفح أقسام منصة السالم التعليمية للقدرات والتحصيلي.';
    let keywords = 'أقسام التعليم, قدرات, تحصيلي, السالم';

    if (this.name === 'qodrat') {
      title = 'قسم القدرات (كمي ولفظي) | منصة السالم';
      description =
        'تدرب على قسم القدرات الكمي واللفظي مع منصة السالم. حل تجميعات، شروحات فيديو، واختبارات محاكية.';
      keywords = 'قدرات كمي, قدرات لفظي, اختبار القدرات, تجميعات قدرات';
    } else if (this.name === 'tahsili') {
      title = 'قسم التحصيلي (علمي) | منصة السالم';
      description =
        'استعد لاختبار التحصيلي في (الرياضيات، الفيزياء، الكيمياء، الأحياء) مع أقوى الشروحات والتجميعات الحصرية.';
      keywords =
        'تحصيلي علمي, رياضيات تحصيلي, فيزياء تحصيلي, كيمياء تحصيلي, أحياء تحصيلي';
    }

    this.seoService.setDynamicMeta({
      title: title,
      description: description,
      keywords: keywords,
      url: `https://alssalem.com/cateogry/${this.name}`,
      image: 'https://alssalem.com/assets/imgs/logo2.webp',
    });
    this.seoService.setHreflangTags(
      `https://alssalem.com/cateogry/${this.name}`,
    );
  }

  constructor() {
    this.route.params.subscribe((params) => {
      this.name = params['name'];
    });
    this.digital = [
      {
        id: 18,
        name: 'digital',
        img: 'assets/imgs/digital/digital1.webp',
      },
      {
        id: 19,
        name: 'digital',
        img: 'assets/imgs/digital/digital2.webp',
      },
    ];
    this.qudrates = [
      {
        id: 5,
        name: 'qodrat',
        img: 'assets/imgs/qodrat/kami.webp',
      },
      {
        id: 6,
        name: 'qodrat',
        img: 'assets/imgs/qodrat/lafzi.webp',
      },
    ];
    this.tahselis = [
      {
        id: 7,
        name: 'tahsili',
        img: 'assets/imgs/tahsili/math.webp',
      },
      {
        id: 8,
        name: 'tahsili',
        img: 'assets/imgs/tahsili/physics.webp',
      },
      {
        id: 9,
        name: 'tahsili',
        img: 'assets/imgs/tahsili/chimestry.webp',
      },
      {
        id: 10,
        name: 'tahsili',
        img: 'assets/imgs/tahsili/bio.webp',
      },
    ];
    this.qudrateEng = [
      {
        id: 11,
        name: 'qodrat-anglyzy',
        img: 'assets/imgs/قدرات انجليزى/Verbal.png',
      },
      {
        id: 12,
        name: 'qodrat-anglyzy',
        img: 'assets/imgs/قدرات انجليزى/Quantitative.png',
      },
    ];
    this.mawhooba = [
      {
        id: 13,
        name: 'mohba',
        img: 'assets/imgs/موهبة/kangaro.png',
      },
      {
        id: 14,
        name: 'mohba',
        img: 'assets/imgs/موهبة/mawhoob.png',
      },
      {
        id: 16,
        name: 'mohba',
        img: 'assets/imgs/موهبة/olimbics.png',
      },
      {
        id: 15,
        name: 'mohba',
        img: 'assets/imgs/موهبة/mawhobeen.png',
      },
    ];
    if (this.name === 'qodrat') {
      // SEO now handled in ngOnInit/setSeoTags
    }
    if (this.name === 'tahsili') {
      // SEO now handled in ngOnInit/setSeoTags
    }
  }
  goToProductDetail(courseId: string): void {
    this.router.navigate(['/courses', courseId]);
  }
}
