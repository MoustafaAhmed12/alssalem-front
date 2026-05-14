import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-features',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FeaturesComponent implements AfterViewInit {
  ngAfterViewInit() {
    const swiperEl = document.querySelector('.mySwiper') as any;
    Object.assign(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 10,
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 1,
          spaceBetween: 40,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 50,
        },
      },
    });
    swiperEl.initialize();
  }
}
