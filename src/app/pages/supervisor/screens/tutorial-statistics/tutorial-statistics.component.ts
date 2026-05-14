import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../../../authentication/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SuperNavbarComponent } from '../../../parent/components/super-navbar/super-navbar.component';
import { TableExamsComponent } from '../../../student/screens/profile/components/table-exams/table-exams.component';
import { CardNumberComponent } from '../../../student/screens/profile/components/card-number/card-number.component';
import { TableTutorialsComponent } from '../../../student/screens/profile/components/table-tutorials/table-tutorials.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { ProfileService } from '../../../student/services/profile.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  examInfo,
  ProfileInfo,
  tutorialInfo,
} from '../../../student/model/profile';
import { SettingsProfileComponent } from '../../../student/screens/profile/components/settings-profile/settings-profile.component';
import { SupervisorService } from '../../services/supervisor.service';
@Component({
  selector: 'app-tutorial-statistics',
  standalone: true,
  imports: [
    SuperNavbarComponent,
    CardNumberComponent,
    TableTutorialsComponent,
    TableExamsComponent,
    NgClass,
    SettingsProfileComponent,
    RouterLink,
  ],
  templateUrl: './tutorial-statistics.component.html',
  styleUrl: './tutorial-statistics.component.scss',
})
export class TutorialStatisticsComponent implements OnInit {
  profileService = inject(ProfileService);
  supervisorService = inject(SupervisorService);
  clipboard = inject(Clipboard);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  isLoading = signal<boolean>(false);
  userId = signal<number>(0);
  profileDetails!: ProfileInfo;
  allTutorials: tutorialInfo[] = [];
  stillTutorials: tutorialInfo[] = [];
  finishTutorials: tutorialInfo[] = [];
  allExams: examInfo[] = [];
  successExams: examInfo[] = [];
  failExams: examInfo[] = [];
  cartNumber: any = [];
  showTable: boolean = false;
  isOpen: boolean = false;
  examTutorial: any = [];
  examTutorialSuss: any = [];
  examTutorialF: any = [];
  tutorialId: number = 0;
  allTuorialsNames: any = [];
  role: string = '';
  tabs = [
    {
      id: 0,
      title: 'دوراتي',
      subTabs: [
        { title: 'الكل' },
        { title: 'جاري التعلم' },
        { title: 'تم الانتهاء' },
      ],
    },
    {
      id: 4,
      title: 'خطتي',
      subTabs: [],
    },
    {
      id: 1,
      title: 'الاختبارات',
      subTabs: [{ title: 'الكل' }, { title: 'ناجح' }, { title: 'لم ينجح ' }],
    },
    {
      id: 2,
      title: 'الإعدادات',
      subTabs: [{ title: 'إعدادات الحساب' }],
    },
  ];
  ngOnInit() {
    this.role = this.authService.currentUser().roleDto.roleName;
    this.route.params.subscribe((params) => {
      this.userId.set(parseInt(params['id']));
    });
    this.getProfileInfo(this.userId());
  }
  getProfileInfo(id: any): void {
    this.isLoading.set(true);
    this.profileService.getProfileInfo(id).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.profileDetails = result;
          this.allTutorials = result.tutorials;
          const tutorialIds = this.allTutorials.map((t) => t.id);
          this.allTuorialsNames = this.allTutorials.map((t) => {
            return { title: t.name };
          });

          this.allExams = result.exams;
          this.successExams = this.allExams.filter(
            (ex) => ex.isSuccess === true
          );
          this.failExams = this.allExams.filter((ex) => ex.isSuccess === false);
          tutorialIds.forEach((tutorialId) => {
            const examTutorial = this.allExams.filter(
              (e) => e.tutorialId === tutorialId
            );
            const numOfSussExam = examTutorial.filter(
              (e) => e.isSuccess === true
            ).length;
            const all = examTutorial.length;
            const progressForExams = all > 0 ? (numOfSussExam / all) * 100 : 0;
            this.allTutorials = this.allTutorials.map((item) =>
              item.id === tutorialId
                ? { ...item, progressExam: progressForExams }
                : item
            );
          });
          this.allTutorials = [
            ...new Map(
              this.allTutorials.map((item) => [item.id, item])
            ).values(),
          ];
          this.stillTutorials = this.allTutorials.filter(
            (tu) => tu.advancePercentage > 0 && tu.advancePercentage < 100
          );
          this.finishTutorials = this.allTutorials.filter(
            (tu) => tu.advancePercentage === 100
          );
          this.cartNumber = [
            {
              id: 0,
              label: 'الدورات المشترك بها',
              number: this.allTutorials?.length,
            },
            {
              id: 1,
              label: 'الدورات الجارية',
              number: this.stillTutorials?.length,
            },
            {
              id: 2,
              label: 'الدورات المُكتملة',
              number: this.finishTutorials.length,
            },
            {
              id: 2,
              label: 'الاختبارات المُكتملة',
              number: this.allExams.length,
            },
            {
              id: 2,
              label: 'الاختبارات المٌجتازة',
              number: this.successExams.length,
            },
          ];
          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }
  getTab(tab: number) {
    this.selectedTab = this.tabs[tab];
    this.selectedSubTab = this.selectedTab.subTabs[0];
    window.scrollTo(0, 0);
  }
  copyText(text: string) {
    this.clipboard.copy(text);
    this.toastr.success('تم نسخ الرقم التعريفي');
  }
  selectedTutorial(id: number): void {
    this.showTable = true;
    this.tutorialId = id;
    this.examTutorial = this.allExams.filter((e) => e.tutorialId === id);
    this.examTutorialSuss = this.examTutorial.filter(
      (e: any) => e.isSuccess === true
    );
    this.examTutorialF = this.examTutorial.filter(
      (e: any) => e.isSuccess === false
    );
  }
  selectedTab = this.tabs[0];
  selectedSubTab = this.selectedTab.subTabs[0];
  selectTab(tab: any) {
    this.selectedTab = tab;
    this.selectedSubTab = tab.subTabs[0];
    if (tab.id === 1) {
      this.isOpen = true;
    } else {
      this.isOpen = false;
      this.showTable = false;
    }
  }
  selectSubTab(subTab: any) {
    this.selectedSubTab = subTab;
  }
}
