import {
  Component,
  signal,
  OnDestroy,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppConfigService } from '../../../../../../shared/services/app-config.service';
import { TranslatePipe } from '@ngx-translate/core';

interface Partner {
  id: number;
  name: string;
  logo: string;
  width?: number;
  height?: number;
}

@Component({
  selector: 'app-success-partners',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './success-partners.component.html',
  styles: [
    `
      :host {
        display: block;
        direction: rtl;
      }

      ::ng-deep .swiper-pagination-bullet-active {
        background: #2563eb;
        width: 32px;
        border-radius: 6px;
      }

      ::ng-deep .swiper-pagination-bullet:hover {
        transform: scale(1.2);
      }
    `,
  ],
})
export class SuccessPartnersComponent implements AfterViewInit, OnDestroy {
  app = inject(AppConfigService);
  partnerSchools = signal<string[]>([]);
  partners = signal<Partner[]>([
    {
      id: 1,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s1.png',
      width: 310,
      height: 225,
    },
    {
      id: 2,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s2.png',
      width: 310,
      height: 225,
    },
    {
      id: 3,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s3.webp',
      width: 300,
      height: 300,
    },
    {
      id: 4,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s4.png',
      width: 1096,
      height: 361,
    },
    {
      id: 5,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s5.svg',
      width: 231,
      height: 64,
    },
    {
      id: 6,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s6.png',
      width: 1417,
      height: 797,
    },
    {
      id: 7,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s7.png',
      width: 3326,
      height: 497,
    },
    {
      id: 8,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s8.png',
      width: 301,
      height: 80,
    },
    {
      id: 9,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s9.png',
      width: 301,
      height: 80,
    },
    {
      id: 10,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s10.png',
      width: 301,
      height: 80,
    },
    {
      id: 11,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s11.png',
      width: 301,
      height: 80,
    },
    {
      id: 12,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s12.png',
      width: 301,
      height: 80,
    },
    {
      id: 13,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s13.png',
      width: 301,
      height: 80,
    },
    {
      id: 14,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s14.png',
      width: 301,
      height: 80,
    },
    {
      id: 15,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s15.png',
      width: 301,
      height: 80,
    },
    {
      id: 16,
      name: 'شركاء النجاح',
      logo: 'assets/parters/s16.png',
      width: 301,
      height: 80,
    },
  ]);
  isMain = signal<boolean>(false);
  constructor() {
    if (this.app.config()?.['images_partner'] === undefined) {
      this.isMain.set(true);
    } else {
      this.partnerSchools.set(this.app.config()?.['images_partner'] || []);
    }
  }

  ngAfterViewInit() {
    const swiperEl = document.querySelector('.mySwiper2') as any;
    const swiperEl2 = document.querySelector('.mySwiper3') as any;

    if (swiperEl) {
      const slidesCount = this.partners().length;
      Object.assign(swiperEl, {
        slidesPerView: 3,
        spaceBetween: 20,
        loop: slidesCount >= 4, // Loop requires more slides than slidesPerView

        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          type: 'bullets',
        },

        breakpoints: {
          640: { slidesPerView: 2, spaceBetween: 30 },
          768: { slidesPerView: 2, spaceBetween: 30 },
          1024: { slidesPerView: 2, spaceBetween: 40 },
          1280: { slidesPerView: 3, spaceBetween: 40 },
        },
      });
      swiperEl.initialize();
    }

    if (swiperEl2) {
      const slidesCount = this.partnerSchools().length;
      Object.assign(swiperEl2, {
        slidesPerView: 2,
        spaceBetween: 20,
        loop: slidesCount >= 3,

        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          type: 'bullets',
        },

        breakpoints: {
          640: { slidesPerView: 2, spaceBetween: 30 },
          768: { slidesPerView: 2, spaceBetween: 30 },
          1024: { slidesPerView: 2, spaceBetween: 40 },
          1280: { slidesPerView: 2, spaceBetween: 40 },
        },
      });
      swiperEl2.initialize();
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
