import { Component, inject, signal } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../../authentication/services/auth.service';
import { SupervisorService } from '../../../supervisor/services/supervisor.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormatTimePipe } from '../../../../shared/Pipes/format-time.pipe';
import { DatePipe, NgClass } from '@angular/common';
export interface Root2 {
  id: number;
  name: string;
  tutorialId: number;
  tutorialName: string;
  questionsCount: number;
  passingPercent: number;
  isSuccess: boolean;
  unitId?: number;
  firstTrail: FirstTrail;
  bestTrail: BestTrail;
}

export interface FirstTrail {
  percentage: number;
  timeTakenInSec: number;
  creationDate: string;
}

export interface BestTrail {
  percentage: number;
  timeTakenInSec: number;
  creationDate: string;
}

export interface ResultDetails {
  name: string;
  precentage: number;
  skillsAnalysis: SkillsAnalysi[];
}

export interface SkillsAnalysi {
  name: string;
  precentage: number;
}

@Component({
  selector: 'app-profile-exams',
  standalone: true,
  imports: [RouterLink, FormatTimePipe, DatePipe, NgClass],
  templateUrl: './profile-exams.component.html',
  styleUrl: './profile-exams.component.scss',
})
export class ProfileExamsComponent {
  profile = inject(ProfileService);
  isLoading = signal<boolean>(false);
  Math = Math;

  exams = signal<Root2[]>([]);
  filteredTests = signal<Root2[]>([]);
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  supervisorService = inject(SupervisorService);
  route = inject(ActivatedRoute);
  allResultDetails: ResultDetails[] = [];
  isOpen = signal<boolean>(false);
  role: string = '';
  studentId: number = 0;
  isEmpty: boolean = false;
  courses: { id: number; name: string }[] = [];
  tutorialId = signal<number>(0);

  constructor() {
    this.role = this.authService.currentUser().roleDto.roleName;
    if (
      this.role === 'أدمن' ||
      this.role === 'مشرف مدرسة' ||
      this.role === 'ولي أمر'
    ) {
      this.route.params.subscribe((param) => {
        this.studentId = +param['id'];
      });
    } else {
      this.studentId = this.authService.currentUser().userDto.id;
    }
  }

  ngOnInit() {
    this.getStudentExams();
  }

  getStudentExams() {
    this.isLoading.set(true);
    this.profile.getStudentExams(this.studentId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.exams.set(result);
          this.filteredTests.set(this.exams());
          const uniqueCourses = new Map<number, string>();
          this.exams().forEach((test) => {
            if (!uniqueCourses.has(test.tutorialId)) {
              uniqueCourses.set(test.tutorialId, test.tutorialName);
            }
          });

          this.courses = Array.from(uniqueCourses, ([id, name]) => ({
            id,
            name,
          }));
          // this.processTestData();
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  filterByCourse(courseId: number) {
    this.tutorialId.set(courseId);
    let arr = this.exams().filter((test) => test.tutorialId === courseId);

    this.filteredTests.set(arr);
  }

  openPop(examId: number) {
    this.isOpen.set(true);
    this.getResultDetails(examId);
  }

  getResultDetails(examId: number): void {
    this.isLoading.set(true);
    if (
      this.role === 'أدمن' ||
      this.role === 'مشرف مدرسة' ||
      this.role === 'ولي أمر'
    ) {
      this.supervisorService
        .getResultDetailsSuper(examId, this.studentId)
        .subscribe({
          next: ({ statusCode, result }) => {
            if (statusCode === 200) {
              this.isLoading.update((v) => (v = false));
              this.allResultDetails = result;
              this.isEmpty = this.allResultDetails.every(
                (item) => item.skillsAnalysis.length === 0
              );
            }
          },
          error: (err) => {
            console.log(err);
            this.isLoading.update((v) => (v = false));
          },
        });
    } else {
      this.profileService.getResultDetails(examId, this.studentId).subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.isLoading.update((v) => (v = false));
            this.allResultDetails = result;
            this.allResultDetails = result;
            this.isEmpty = this.allResultDetails.every(
              (item) => item.skillsAnalysis.length === 0
            );
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
    }
  }

  round(number: number): number {
    return Math.round(number);
  }

  getScoreClass(percentage: number, passingScore: number): string {
    if (percentage >= passingScore) {
      return 'bg-green-100 text-green-800';
    } else if (percentage >= passingScore * 0.7) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getSuccessfulTests(): number {
    return this.filteredTests().filter(
      (test) => test.bestTrail.percentage > test.passingPercent
    ).length;
  }

  getAverageImprovement(): number {
    const improvements = this.filteredTests().map((test) =>
      this.Math.round(test.bestTrail.percentage - test.firstTrail.percentage)
    );
    const average =
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    return Math.round(average);
  }

  getHighestScore(): number {
    const highest = Math.max(
      ...this.filteredTests().map((test) => test.bestTrail.percentage)
    );
    return Math.round(highest);
  }
}
