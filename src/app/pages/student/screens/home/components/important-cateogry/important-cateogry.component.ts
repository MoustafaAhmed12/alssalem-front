import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-important-cateogry',
  standalone: true,
  imports: [RouterLink, TranslatePipe, NgOptimizedImage],
  templateUrl: './important-cateogry.component.html',
  styleUrl: './important-cateogry.component.scss',
})
export class ImportantCateogryComponent {
  imgs: any[] = [
    {
      id: 1,
      name: 'qodrat',
      img: 'assets/imgs/c1.webp',
      alt: 'important cateogry',
      width: 512,
      height: 704,
    },
    {
      id: 2,
      name: 'tahsili',
      img: 'assets/imgs/c2.webp',
      alt: 'important cateogry',
      width: 512,
      height: 853,
    },
    // {
    //   id: 3,
    //   name: 'mohba',
    //   img: 'assets/imgs/c3.webp',
    //   alt: 'important cateogry',
    // },
    {
      id: 4,
      name: 'qodrat-anglyzy',
      img: 'assets/imgs/c4.webp',
      alt: 'important cateogry',
      width: 512,
      height: 704,
    },
    // {
    //   id: 17,
    //   name: 'digital',
    //   img: 'assets/imgs/c5.webp',
    //   alt: 'important cateogry',
    // },
  ];

  getAnimationType(index: number): string {
    const animations = [
      'fade-up',
      'fade-down',
      'fade-left',
      'zoom-in',
      'zoom-out',
    ];
    return animations[index % animations.length];
  }
}
