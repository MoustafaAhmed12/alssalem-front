import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../../../shared/services/seo.service';
import { ContentOfCourseComponent } from './content-of-course/content-of-course.component';
import { NgClass } from '@angular/common';
import { TutorilsStudentsService } from '../../services/tutorils-students.service';
import { AuthService } from '../../../../authentication/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommentsStudentComponent } from '../cateogry-tutorials/comments-student/comments-student.component';
import {
  AllComment,
  Attachment,
  MainDetails,
  Units,
} from '../../model/all-tutorial-details';
import { PreserveNewlineWithSvgPipe } from '../../../../shared/Pipes/preserve-newline-with-svg.pipe';
import { SafeUrlPipe } from '../../../../shared/Pipes/safe-url.pipe';
import { CardDetailsComponent } from '../../Components/card-details/card-details.component';
import { InstructionsComponent } from '../../Components/instructions/instructions.component';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [
    ContentOfCourseComponent,
    CommentsStudentComponent,
    SafeUrlPipe,
    PreserveNewlineWithSvgPipe,
    CardDetailsComponent,
    InstructionsComponent,
    NgClass,
    TranslatePipe,
  ],
  templateUrl: './course-page.component.html',
  styleUrl: './course-page.component.scss',
})
export class CoursePageComponent implements OnInit {
  tutorilsStudentsService = inject(TutorilsStudentsService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  seoService = inject(SeoService);
  isAuth = signal<boolean>(false);
  isVideoOpen: boolean = false;
  userId = signal<number>(0);
  isLoading = signal<boolean>(false);
  isLoadingFree = signal<boolean>(false);
  isLoadingUnits = signal<boolean>(false);
  isLoadingAtt = signal<boolean>(false);
  tutorialId: number = 0;
  theMainDetails: MainDetails = {} as MainDetails;
  allUnits: Units = {} as Units;
  comments = signal<AllComment>({} as AllComment);
  AllComments: AllComment[] = [];
  pageNumber: number = 1;
  hasNext: boolean = false;
  allAttachments: Attachment[] = [];
  isError: boolean = false;
  tabs = [
    { label: 'coursePage.overview' },
    { label: 'coursePage.curriculum' },
    { label: 'coursePage.courseFiles' },
  ];

  selectedTab = 1;
  ngOnInit(): void {
    this.isAuth.set(this.authService.isAuth());
    this.userId.set(this.authService.currentUser()?.userDto.id);
    this.route.params.subscribe((params) => {
      this.tutorialId = parseInt(params['tutorialId']);
      this.getTutorialById(this.tutorialId);
    });
    this.selectedTab = 1;
  }

  selectTab(index: number) {
    this.selectedTab = index;
    if (this.selectedTab === 2) {
      this.getTutorialAttachments(this.tutorialId);
    }
  }
  getTutorialById(tutorialId: number): void {
    this.isLoading.set(true);
    this.tutorilsStudentsService.getTutorialById(tutorialId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.isLoading.update((v) => (v = false));
          this.theMainDetails = result;
          this.setSeoTags(this.theMainDetails);
          this.getTutorialUnits(this.theMainDetails.id);
          this.selectedTab = 1;
        } else {
          this.isLoading.update((v) => (v = false));
          this.toastr.error(msg);
        }
      },
      error: ({ error }) => {
        this.toastr.error(error.msg, '', { timeOut: 20000 });
        this.authService.logout();
        this.isLoading.update((v) => (v = false));
      },
    });
  }
  getTutorialAttachments(tutorialId: number): void {
    this.isLoadingAtt.set(true);
    this.tutorilsStudentsService.getTutorialAttachments(tutorialId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.isLoadingAtt.update((v) => (v = false));
          this.allAttachments = result;
        } else {
          this.isLoadingAtt.update((v) => (v = false));
          this.isError = true;
        }
      },
      error: ({ error }) => {
        this.isLoadingAtt.update((v) => (v = false));
      },
    });
  }
  getTutorialUnits(tutorialId: number): void {
    this.isLoadingUnits.set(true);
    this.tutorilsStudentsService.getTutorialUnits(tutorialId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.allUnits = result;
          this.getTutorialComments(tutorialId, this.pageNumber, 15);
          this.isLoadingUnits.update((v) => (v = false));
        } else {
          this.toastr.error(msg);
          this.isLoadingUnits.update((v) => (v = false));
        }
      },
    });
  }

  loadPage(page: number): void {
    this.pageNumber = page;
    this.getTutorialComments(this.tutorialId, this.pageNumber, 8);
  }
  getTutorialComments(
    tutorialId: number,
    pageNumber: number,
    pageSize: number,
  ): void {
    this.tutorilsStudentsService
      .getTutorialComments(tutorialId, pageNumber, pageSize)
      .subscribe({
        next: ({ statusCode, result, msg }) => {
          if (statusCode === 200) {
            this.comments.set(result);
            this.hasNext = this.comments().hasNext;
            this.AllComments.push(this.comments());
          } else {
            this.toastr.error(msg);
          }
        },
      });
  }

  getMoreComments(): void {
    this.getTutorialComments(this.tutorialId, +this.pageNumber, 8);
  }

  subscribeFreeTutorial(tutorialId: number): void {
    this.isLoadingFree.set(true);
    this.tutorilsStudentsService.subscribeFreeTutorial(tutorialId).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          window.location.reload();
          this.isLoadingFree.update((v) => (v = false));
        } else {
          this.isLoadingFree.update((v) => (v = false));
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingFree.update((v) => (v = false));
      },
    });
  }

  toCheckout(): void {
    if (this.isAuth() === true) {
      if (this.theMainDetails.price === 0) {
        this.subscribeFreeTutorial(this.tutorialId);
      } else {
        this.router.navigate([
          '/checkout',
          this.theMainDetails.id,
          {
            isPackage: false,
          },
        ]);
      }
    } else {
      this.toastr.warning('يجب عليك تسجيل الدخول أولاً');
      this.router.navigate(['/login']);
    }
  }

  setSeoTags(details: MainDetails): void {
    const descriptionText = details.description
      ? details.description
          .replace(/<[^>]*>?/gm, '')
          .replace(/\n/g, ' ')
          .substring(0, 160) + '...'
      : `تفاصيل دورة ${details.name} مقدمة من الأستاذ ${details.teacherName}`;

    const title = `${details.name} | ${details.teacherName} | منصة السالم`;
    const imageUrl = details.img || 'https://alssalem.com/assets/imgs/logo2.webp';
    const url = window.location.href;
    const keywords = `${details.name}, ${details.categoryName}, ${details.parentCategory}, ${details.teacherName}, دورة، تعليم، كورسات، منصة السالم`;

    // 1. Dynamic Meta & Open Graph
    this.seoService.setDynamicMeta({
      title: title,
      description: descriptionText,
      keywords: keywords,
      image: imageUrl,
      url: url,
    });

    // 2. Set Breadcrumbs
    this.seoService.setBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://alssalem.com/' },
      { name: details.categoryName, url: `https://alssalem.com/cateogry/${details.categoryName}` },
      { name: details.name, url: url }
    ]);

    // 3. Detailed Course Schema
    const courseSchema = this.seoService.generateCourseSchema({
      name: details.name,
      description: descriptionText,
      url: url,
      image: imageUrl,
      price: details.price,
      instructorName: details.teacherName
    });

    this.seoService.setStructuredData(courseSchema, 'course-jsonld');
  }
}
