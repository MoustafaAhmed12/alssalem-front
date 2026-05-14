import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MultiLangService {
  translate = inject(TranslateService);
  private readonly LNAG: string = 'LANG';
  fontClass: string = 'font-arabic';
  currenLang = signal<string>(localStorage.getItem(this.LNAG) ?? 'ar');
  constructor() {
    effect(() => {
      localStorage.setItem(this.LNAG, this.currenLang());
      this.translate.use(this.currenLang());
    });
    this.setDirection(this.currenLang());
    this.setFontClass(this.currenLang());
  }
  updateLang(lang: string): void {
    if (lang === 'ar') {
      this.currenLang.set('ar');
    } else {
      this.currenLang.set('en');
    }
    this.setDirection(lang);
    this.setFontClass(lang);
  }

  setFontClass(lang: string) {
    const html = document.documentElement;
    const body = document.body;
    html.classList.remove('font-arabic', 'font-english');
    body.classList.remove('font-arabic', 'font-english');
    if (lang === 'ar') {
      this.fontClass = 'font-arabic';
    } else {
      this.fontClass = 'font-english';
    }

    html.classList.add(this.fontClass);
  }
  private setDirection(lang: string) {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }
}
