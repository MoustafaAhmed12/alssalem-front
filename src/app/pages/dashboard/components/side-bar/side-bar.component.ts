import { NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../../authentication/services/auth.service';
import { SideItemComponent } from '../side-item/side-item.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faBorderAll,
  faUsersCog,
  faUserGraduate,
  faSchool,
  faMoneyBill1Wave,
  faQuestionCircle,
  faPlusCircle,
  faUserCircle,
  faGear,
  faComments,
  faFilePen,
  faCode,
  faQrcode,
  faBookmark,
  faSkating,
  faAward,
  faStarHalfAlt,
  faMapMarkedAlt,
  faSubscript,
} from '@fortawesome/free-solid-svg-icons';
import { SidebarMobileComponent } from '../sidebar-mobile/sidebar-mobile.component';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../../../shared/services/app-config.service';
import { NavberServiceService } from '../../../../shared/services/navber-service.service';

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nationalId: any;
}
@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    NgClass,
    SideItemComponent,
    SidebarMobileComponent,
    FontAwesomeModule,
    RouterLink,
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent implements OnInit {
  app = inject(AppConfigService);
  authService = inject(AuthService);
  navService = inject(NavberServiceService);
  currentUser = signal<UserDto>({} as UserDto);
  role: string = '';

  show_menu(): void {
    this.navService.toggleSidebar();
  }
  isLogoWhite = signal<boolean>(false);
  constructor() {
    let isWhite = this.app.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);
  }
  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser().userDto);
    this.role = this.authService.currentUser().roleDto.roleName;
  }
  itemsAdminExam: any = [
    {
      lable: 'الاختبارات المحاكية',
      link: '/admin-exam',
      icon: faHome,
    },
    {
      lable: 'اضافة اختبار محاكي',
      link: '/admin-exam/create',
      icon: faHome,
    },
  ];
  itemsAdmin: any = [
    {
      lable: 'لوحة التحكم',
      link: '/admin',
      icon: faHome,
    },
    {
      lable: 'المتصلين الان',
      link: '/admin/online-users',
      icon: faUserCircle,
    },
    {
      lable: 'الأقسام',
      link: '/admin/categories',
      icon: faBorderAll,
    },
    {
      lable: 'الدورات',
      link: '/admin/tutorial',
      icon: faBorderAll,
    },
    {
      lable: 'المستخدمين',
      link: '/admin/users',
      icon: faUsersCog,
    },
    {
      lable: 'الطلاب',
      link: '/admin/student',
      icon: faUserGraduate,
    },
    {
      lable: 'تسجيل الطلاب',
      link: '/admin/student-register',
      icon: faUserGraduate,
    },
    {
      lable: 'إحصائيات',
      link: '/admin/statistics',
      icon: faStarHalfAlt,
    },

    {
      lable: 'تقرير الدفع',
      link: '/admin/payment-report',
      icon: faMoneyBill1Wave,
    },
    {
      lable: 'عمليات الدفع',
      link: '/admin/payment',
      icon: faMoneyBill1Wave,
    },
    {
      lable: 'أكواد الخصم',
      link: '/admin/promo-code',
      icon: faCode,
    },
    {
      lable: 'بكدج الدورات',
      link: '/admin/package-tutorials',
      icon: faBorderAll,
    },
    {
      lable: 'المقالات',
      link: '/admin/article',
      icon: faBookmark,
    },
    {
      lable: 'التعليقات',
      link: '/admin/comments',
      icon: faComments,
    },
    {
      lable: 'المدرسة',
      link: '/admin/school',
      icon: faSchool,
    },
    {
      lable: 'الإشتراكات',
      link: '/admin/subscription',
      icon: faSubscript,
    },
    {
      lable: 'وسائل التواصل',
      link: '/admin/social-media',
      icon: faPlusCircle,
    },
    {
      lable: 'أراء الطلاب',
      link: '/admin/feedback',
      icon: faPlusCircle,
    },
    {
      lable: 'العروض',
      link: '/admin/offers',
      icon: faAward,
    },
    {
      lable: 'المدارس المقترحة',
      link: '/admin/suggest-school',
      icon: faSchool,
    },
  ];
  itemsStudent: any = [
    {
      lable: 'معلوماتي',
      link: '/profile',
      icon: faHome,
    },
    {
      lable: 'الدورات',
      link: '/profile/tutorials',
      icon: faBorderAll,
    },
    {
      lable: 'خطتي',
      link: '/profile/plan',
      icon: faMapMarkedAlt,
    },
    {
      lable: 'الأسئلة المفضلة',
      link: '/profile/questions',
      icon: faQuestionCircle,
    },
    {
      lable: 'الاختبارات',
      link: '/profile/exams',
      icon: faFilePen,
    },
    {
      lable: 'الاختبارات المحاكية',
      link: '/profile/exams-category',
      icon: faFilePen,
    },
    {
      lable: 'تحديد المستوي',
      link: '/profile/detect-level-result',
      icon: faFilePen,
    },
  ];
  itemsSchoolAdmin: any = [
    {
      lable: 'لوحة التحكم',
      link: '/school-admin',
      icon: faHome,
    },
    {
      lable: 'طلاب غير مشتركين',
      link: '/school-admin/students',
      icon: faUsersCog,
    },
    {
      lable: 'المشتركين',
      link: '/school-admin/join-students',
      icon: faUserGraduate,
    },
  ];
  itemsSuperSchool: any = [
    {
      lable: 'لوحة التحكم',
      link: '/super',
      icon: faHome,
    },
    {
      lable: 'الإدارة والتقارير',
      link: '/super/reports',
      icon: faBorderAll,
    },
    {
      lable: 'متابعة الطلاب',
      link: '/super/students',
      icon: faUsersCog,
    },
    {
      lable: 'متابعة الاختبارات',
      link: '/super/exams',
      icon: faFilePen,
    },
    {
      lable: 'تحديد مستوي',
      link: '/super/average-exams',
      icon: faUserGraduate,
    },
    {
      lable: 'الاختبارات المحاكية',
      link: '/super/virtual-exams',
      icon: faFilePen,
    },
    {
      lable: 'إدارة الخطط',
      link: '/super/roadmaps',
      icon: faMapMarkedAlt,
    },
  ];
  itemsSubAdmin: any = [
    {
      lable: 'لوحة التحكم',
      link: '/admin',
      icon: faHome,
    },
    {
      lable: 'عمليات الدفع',
      link: '/admin/payment',
      icon: faMoneyBill1Wave,
    },
    {
      lable: 'الطلاب',
      link: '/admin/student',
      icon: faUserGraduate,
    },
  ];
  itemsAccountant: any = [
    {
      lable: 'لوحة التحكم',
      link: '/school-accountant',
      icon: faHome,
    },
  ];
  itemsManagerAccountant: any = [
    {
      lable: 'لوحة التحكم',
      link: '/manager-accountant',
      icon: faHome,
    },
    {
      lable: 'عمليات الدفع',
      link: '/manager-accountant/payment',
      icon: faMoneyBill1Wave,
    },
  ];
  itemsTeacher: any = [
    {
      lable: 'الدورات',
      link: '/instructor',
      icon: faBorderAll,
    },
    {
      lable: 'الامتحانات الخطة',
      link: '/instructor/cateogry-exams',
      icon: faFilePen,
    },
    {
      lable: 'الامتحانات',
      link: '/instructor/exams',
      icon: faFilePen,
    },
    {
      lable: 'اضافة امتحان',
      link: '/instructor/exams/0',
      icon: faPlusCircle,
    },
    {
      lable: 'امتحان عشوائي',
      link: '/instructor/random-exam',
      icon: faPlusCircle,
    },
    {
      lable: 'بنك الأسئلة',
      link: '/instructor/questions',
      icon: faQuestionCircle,
    },
    {
      lable: 'اضافة اسئلة',
      link: '/instructor/add-questions',
      icon: faPlusCircle,
    },
    {
      lable: 'نوع الأسئلة',
      link: '/instructor/questions-type',
      icon: faQuestionCircle,
    },
    {
      lable: 'المهارات',
      link: '/instructor/skill-type',
      icon: faSkating,
    },
    {
      lable: ' الفيديوهات',
      link: '/instructor/videos',
      icon: faPlusCircle,
    },
    {
      lable: 'الباركود',
      link: '/instructor/qr-code',
      icon: faQrcode,
    },
  ];
  itemsShortTeacher: any = [
    {
      lable: 'الدورات',
      link: '/instructor',
      icon: faBorderAll,
    },
    {
      lable: 'الامتحانات الخطة',
      link: '/instructor/cateogry-exams',
      icon: faFilePen,
    },
    {
      lable: 'الامتحانات',
      link: '/instructor/exams',
      icon: faFilePen,
    },
    {
      lable: 'اضافة امتحان',
      link: '/instructor/exams/0',
      icon: faPlusCircle,
    },
    {
      lable: 'بنك الأسئلة',
      link: '/instructor/questions',
      icon: faQuestionCircle,
    },
    {
      lable: 'اضافة اسئلة',
      link: '/instructor/add-questions',
      icon: faPlusCircle,
    },
    {
      lable: 'نوع الأسئلة',
      link: '/instructor/questions-type',
      icon: faQuestionCircle,
    },
  ];

  get itemsForRole() {
    if (this.role === 'أدمن') {
      return this.itemsAdmin;
    }
    if (this.role === 'أدمن الإختبارات') {
      return this.itemsAdminExam;
    }
    if (this.role === 'مشرف مدرسة') {
      return this.itemsSuperSchool;
    }
    if (this.role === 'أدمن المدرسة') {
      return this.itemsSchoolAdmin;
    }
    if (this.role === 'مدرس') {
      return this.currentUser().email === 'digital@alssalem.com'.trim()
        ? this.itemsShortTeacher
        : this.itemsTeacher;
    }
    if (this.role === 'محاسب المدرسة') {
      return this.itemsAccountant;
    }
    if (this.role === 'المدير المالى') {
      return this.itemsManagerAccountant;
    }
    if (this.role === 'طالب') {
      return this.itemsStudent;
    }
    return [];
  }
}
