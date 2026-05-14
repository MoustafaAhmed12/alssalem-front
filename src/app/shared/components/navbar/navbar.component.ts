import { NgClass, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../authentication/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarItemComponent } from '../navbar-item/navbar-item.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../../services/app-config.service';
import { CategoryService } from '../../../pages/dashboard/services/category.service';

export interface Category {
  id: number;
  name: string;
  children?: Category[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NavbarItemComponent,
    NgClass,
    TranslatePipe,
    NgOptimizedImage,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  appConfigService = inject(AppConfigService);
  toastr = inject(ToastrService);
  router = inject(Router);
  translateService = inject(TranslateService);

  allCategories = signal<Category[]>([]);
  isAuth = signal<boolean>(false);
  currentUser = signal<any>(null);
  roleCode = signal<string>('');
  mobile_menu_show = signal<boolean>(false);
  menu_show_Profile = signal<boolean>(false);
  isScrolled = signal<boolean>(false);
  menu_show = signal<boolean>(false);
  showButton = signal<boolean>(false);

  isDarkMode = signal<boolean>(false);
  currentLang = signal<string>('ar');

  tutorailsFav: { id: number; name: string }[] = [
    {
      id: 1,
      name: 'دورة التأسيس ( كمي ) 2026',
    },
    {
      id: 2,
      name: 'دورة التأسيس ( لفظي ) 2026',
    },
    {
      id: 3,
      name: 'دورة التدريبات والنماذج ( لفظي ) 2026',
    },
    {
      id: 4,
      name: 'دورة التدريبات والنماذج ( كمي ) 2026',
    },
    {
      id: 5,
      name: 'دورة ال 100 % (رياضيات تأسيس )',
    },
    {
      id: 7,
      name: 'دورة ال 100 % ( فيزياء تأسيس )',
    },
  ];
  isLogoWhite = signal<boolean>(false);

  menu_button() {
    this.menu_show.update((v) => (v = true));
  }
  menu_button_close() {
    this.menu_show.update((v) => (v = false));
  }
  mobile_menu_button() {
    this.mobile_menu_show.update((v) => (v = !v));
  }
  menu_Profile() {
    this.menu_show_Profile.update((v) => (v = true));
  }
  menu_Profile_close() {
    this.menu_show_Profile.update((v) => (v = false));
  }
  mobile_menu_clase() {
    this.mobile_menu_show.update((v) => (v = false));
  }
  categoryService = inject(CategoryService);
  platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.isAuth.set(this.authService.isAuth());
    this.currentUser.set(this.authService.currentUser()?.userDto);
    this.roleCode.set(this.authService.currentUser()?.roleDto.roleCode);
    let isWhite = this.appConfigService.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);

    // Initialize Language
    if (isPlatformBrowser(this.platformId)) {
      const cachedLang = localStorage.getItem('lang') || 'ar';
      this.currentLang.set(cachedLang);
      this.translateService.use(cachedLang);

      const cachedCategories = localStorage.getItem('allCategories');
      if (cachedCategories) {
        this.allCategories.set(JSON.parse(cachedCategories));
      }
      this.fetchCategories();

      // Initialize Theme
      const cachedTheme = localStorage.getItem('theme');
      if (cachedTheme === 'dark') {
        this.isDarkMode.set(true);
        document.documentElement.classList.add('dark');
      }
    }
  }

  changeLang(lang: string) {
    this.currentLang.set(lang);
    this.translateService.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
      // Optional: Reload page or adjust direction if needed
      document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }

  toggleTheme() {
    this.isDarkMode.update((v) => !v);
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }

  fetchCategories() {
    this.categoryService.getCategoriesForStudent().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          if (isPlatformBrowser(this.platformId)) {
            const cachedCategories = localStorage.getItem('allCategories');
            const newCategories = JSON.stringify(res.result);
            if (cachedCategories !== newCategories) {
              localStorage.removeItem('allCategories');
              localStorage.setItem('allCategories', newCategories);
              this.allCategories.set(res.result);
            }
          } else {
            this.allCategories.set(res.result);
          }
        }
      },
      error: (err) => {
        console.error('Error fetching categories', err);
      },
    });
  }
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    this.isScrolled.update((v) => (v = scrollY > 1));
    this.showButton.update((v) => (v = scrollY > 100));
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
