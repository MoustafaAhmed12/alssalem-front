import { Component, inject, signal, OnInit } from '@angular/core';
import { SeoService } from '../../../../shared/services/seo.service';
import { AppConfigService } from '../../../../shared/services/app-config.service';
import { PreserveNewlineWithSvgPipe } from '../../../../shared/Pipes/preserve-newline-with-svg.pipe';
@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [PreserveNewlineWithSvgPipe],
  templateUrl: './about-us.component.html',
})
export class AboutUsComponent implements OnInit {
  appConfigService = inject(AppConfigService);
  seoService = inject(SeoService);
  isLogoWhite = signal<boolean>(false);

  ngOnInit() {
    this.seoService.setDynamicMeta({
      title: 'من نحن | منصة السالم التعليمية',
      description: 'تعرف على قصة منصة السالم وأهدافها في تطوير مهارات الطلاب في اختبارات القدرات والتحصيلي.',
      keywords: 'عن المنصة, من نحن, السالم التعليمية, أهدافنا',
      url: 'https://alssalem.com/about-us',
      image: 'https://alssalem.com/assets/imgs/logo2.webp'
    });
    this.seoService.setHreflangTags('https://alssalem.com/about-us');
    this.seoService.setBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://alssalem.com/' },
      { name: 'من نحن', url: 'https://alssalem.com/about-us' }
    ]);
  }

  constructor() {
    let isWhite = this.appConfigService.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);
  }
}
