import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../../authentication/services/auth.service';
interface CourseData {
  id: number;
  endDate: string;
  startDate: string;
  name: string;
  isFinished: boolean;
  advancePercentage: number;
  successPercentage: number;
}
@Component({
  selector: 'app-profile-tutorials',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './profile-tutorials.component.html',
})
export class ProfileTutorialsComponent implements OnInit {
  profile = inject(ProfileService);
  authService = inject(AuthService);
  isLoading = signal<boolean>(false);
  id = signal<number>(0);
  route = inject(ActivatedRoute);
  Math = Math;
  courses = signal<CourseData[]>([]);
  isOpenAchievement = false;
  achievementData: any = null;
  constructor() {
    this.route.params.subscribe((p) => {
      this.id.set(+p['id']);
    });
  }

  ngOnInit() {
    const sId = this.authService.currentUser().userDto.id;
    if (this.id()) {
      this.getAllTutorials(this.id());
    } else {
      this.getAllTutorials(sId);
    }
  }

  getAllTutorials(id: number) {
    this.isLoading.set(true);
    this.profile.getStudentTutorials(id).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.courses.set(this.getLatestCourses(result));
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  getLatestCourses(courses: CourseData[]): CourseData[] {
    const courseMap = new Map<number, CourseData>();

    courses.forEach((course) => {
      const existing = courseMap.get(course.id);

      if (!existing) {
        // أول مرة يظهر الكورس
        courseMap.set(course.id, course);
      } else {
        // نقارن بين الـ endDate ونحتفظ بالأحدث
        const existingDate = new Date(existing.endDate).getTime();
        const currentDate = new Date(course.endDate).getTime();

        if (currentDate > existingDate) {
          courseMap.set(course.id, course);
        }
      }
    });

    return Array.from(courseMap.values());
  }

  // Computed statistics
  get completedCourses(): number {
    return this.courses().filter((course) => course.advancePercentage === 100)
      .length;
  }

  get ongoingCourses(): number {
    return this.courses().filter((course) => course.advancePercentage < 100)
      .length;
  }

  get totalCourses(): number {
    return this.courses().length;
  }

  get averageProgress(): number {
    const total = this.courses().reduce(
      (sum, course) => sum + course.advancePercentage,
      0
    );
    return this.round(total / this.courses().length);
  }

  get completionRate(): number {
    return this.round((this.completedCourses / this.totalCourses) * 100);
  }

  get activeCourses(): number {
    const now = new Date();
    return this.courses().filter((course) => {
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      return startDate <= now && endDate >= now;
    }).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 75) return 'text-blue-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }

  openAchievementPopup(course: any) {
    this.achievementData = {
      result: this.round(
        (course.successPercentage * course.advancePercentage) / 100
      ),
      advance: course.advancePercentage,
      success: course.successPercentage,
    };
    this.isOpenAchievement = true;
  }

  round(n: number): number {
    return Math.round(n * 10) / 10;
  }

  closeAchievementPopup() {
    this.isOpenAchievement = false;
  }
}
