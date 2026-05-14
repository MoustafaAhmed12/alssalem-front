import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NavBarCourseComponent } from './nav-bar-course/nav-bar-course.component';
import { ContentOfCourseComponent } from '../course-page/content-of-course/content-of-course.component';
import { NavberServiceService } from '../../../../shared/services/navber-service.service';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { TutorilsStudentsService } from '../../services/tutorils-students.service';
import { Units } from '../../model/all-tutorial-details';
@Component({
  selector: 'app-course-layout',
  standalone: true,
  imports: [
    NgClass,
    NavBarCourseComponent,
    ContentOfCourseComponent,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './course-layout.component.html',
  styleUrl: './course-layout.component.scss',
})
export class CourseLayoutComponent implements OnInit, OnDestroy {
  tutorilsStudentsService = inject(TutorilsStudentsService);
  navberService = inject(NavberServiceService);
  allUnits: Units = {} as Units;
  route = inject(ActivatedRoute);
  isLoading = signal<boolean>(false);
  tutorialId: number = 0;
  isShow = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.tutorialId = parseInt(params['tutorialId']);
      this.getTutorialUnits(this.tutorialId);
    });
    this.navberService.hide();
  }
  show_menu(): void {
    this.isShow.set(!this.isShow());
  }
  handleItemClicked() {
    this.isShow.set(false);
  }

  ngOnDestroy() {
    this.navberService.display();
  }
  getTutorialUnits(tutorialId: number): void {
    this.isLoading.set(true);
    this.tutorilsStudentsService.getTutorialUnits(tutorialId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.allUnits = result;
          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
        }
      },
      error: ({ error }) => {
        this.isLoading.update((v) => (v = false));
      },
    });
  }
}
