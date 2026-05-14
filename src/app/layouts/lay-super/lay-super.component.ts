import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SecondNavbarComponent } from '../../pages/supervisor/components/second-navbar/second-navbar.component';
import { AuthService } from '../../authentication/services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faBorderAll,
  faFilePen,
  faMapMarkedAlt,
} from '@fortawesome/free-solid-svg-icons';
import { NgClass } from '@angular/common';
import { ProfileTutorialsComponent } from '../../pages/student/screens/profile-tutorials/profile-tutorials.component';
import { ProfileExamsComponent } from '../../pages/student/screens/profile-exams/profile-exams.component';
import { StudentProfileComponent } from '../../pages/student/screens/profile/student-profile/student-profile.component';
import { StudyPlanComponent } from '../../pages/student/screens/profile/components/study-plan/study-plan.component';
import { SettingsProfileComponent } from '../../pages/student/screens/profile/components/settings-profile/settings-profile.component';
import { ExamsCategoryProfileComponent } from '../../pages/student/screens/exams-category-profile/exams-category-profile.component';
import { AppConfigService } from '../../shared/services/app-config.service';
import { DetectLevelResultComponent } from '../../pages/student/screens/detect-level-result/detect-level-result.component';
@Component({
  selector: 'app-lay-super',
  standalone: true,
  imports: [
    SecondNavbarComponent,
    FontAwesomeModule,
    StudyPlanComponent,
    StudentProfileComponent,
    ProfileTutorialsComponent,
    ProfileExamsComponent,
    ExamsCategoryProfileComponent,
    NgClass,
    SettingsProfileComponent,
    DetectLevelResultComponent,
  ],
  templateUrl: './lay-super.component.html',
  styleUrl: './lay-super.component.scss',
})
export class LaySuperComponent {
  appConfigService = inject(AppConfigService);
  route = inject(ActivatedRoute);
  id = signal<number>(0);
  constructor() {
    this.route.params.subscribe((p) => {
      this.id.set(+p['id']);
    });
  }
  authService = inject(AuthService);
  currentUser: any;
  role: string = '';
  isShow: boolean = false;
  show_menu(): void {
    this.isShow = !this.isShow;
  }
  activeTab = signal<number>(1);
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser().userDto;
    this.role = this.authService.currentUser().roleDto.roleName;
  }
  itemsSuperStudent: any = [
    {
      lable: 'نظرة عامة',
      link: 1,
      icon: faHome,
    },
    {
      lable: 'الدورات',
      link: 2,
      icon: faBorderAll,
    },
    {
      lable: 'خطتي',
      link: 3,
      icon: faMapMarkedAlt,
    },
    {
      lable: 'الاختبارات',
      link: 4,
      icon: faFilePen,
    },
    {
      lable: 'الاختبارات المحاكية',
      link: 5,
      icon: faFilePen,
    },
    {
      lable: 'تحديد المستوي',
      link: 6,
      icon: faFilePen,
    },
  ];

  changeTab(id: number): void {
    this.activeTab.set(id);
    this.show_menu();
  }

  get itemsForRole() {
    if (
      this.role === 'مشرف مدرسة' ||
      this.role === 'أدمن' ||
      this.role === 'ولي أمر'
    ) {
      return this.itemsSuperStudent;
    }
    return [];
  }
}
