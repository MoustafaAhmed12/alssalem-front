import { Component, inject, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturesComponent } from './components/features/features.component';
import { ImportantCateogryComponent } from './components/important-cateogry/important-cateogry.component';
import { PackageSectionComponent } from './components/package-section/package-section.component';
import { OpinionsComponent } from './components/opinions/opinions.component';
import { SuccessPartnersComponent } from './components/success-partners/success-partners.component';
import { BannerComponent } from '../../Components/banner/banner.component';
import { SocialComponent } from '../../Components/social/social.component';
import { ProfileService } from '../../services/profile.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../authentication/services/auth.service';
import { AppConfigService } from '../../../../shared/services/app-config.service';
import { SeoService } from '../../../../shared/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesComponent,
    ImportantCateogryComponent,
    PackageSectionComponent,
    OpinionsComponent,
    SuccessPartnersComponent,
    BannerComponent,
    SocialComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  app = inject(AppConfigService);
  seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.setDynamicMeta({
      title: 'قدرات وتحصيلي | منصة السالم التعليمية - طريقك نحو الـ 100',
      description: 'منصة السالم التعليمية هي منصتك الأولى في السعودية للحصول على درجة 100% في اختبارات القدرات والتحصيلي. نقدم أفضل دورات التأسيس وأحدث تجميعات القدرات والتحصيلي.',
      keywords: 'قدرات, تحصيلي, قدرات وتحصيلي, منصة السالم, السالم التعليمية, اختبار القدرات, اختبار التحصيلي',
      url: 'https://alssalem.com/',
      image: 'https://alssalem.com/assets/imgs/logo2.webp'
    });
    this.seoService.setHreflangTags('https://alssalem.com/');
  }
}
