import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-nav-bar-course',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav-bar-course.component.html',
  styleUrl: './nav-bar-course.component.scss',
})
export class NavBarCourseComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  cateogryId: number = 0;
  tutorialId: number = 0;
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.tutorialId = parseInt(params['tutorialId']);
    });
  }
  toTurorial(): void {
    if (this.router.url.includes('exam-mock')) {
      window.history.back();
    } else {
      this.router.navigate([`/tutorial/${this.tutorialId}`]);
    }
  }
}
