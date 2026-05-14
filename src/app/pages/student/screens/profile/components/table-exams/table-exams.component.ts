import {
  Component,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatTimePipe } from '../../../../../../shared/Pipes/format-time.pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupervisorService } from '../../../../../supervisor/services/supervisor.service';
import { AuthService } from '../../../../../../authentication/services/auth.service';
import { ProfileService } from '../../../../services/profile.service';

interface TestAttempt {
  id: number;
  isSuccess: boolean;
  takenTimeInSec: number;
  percentage: number;
  name: string;
  passingPrecent: number;
  tutorialId: number;
  tutorialName: string;
  totalQuestions: number;
  creationDate: string;
}

interface GroupedTest {
  id: number;
  name: string;
  tutorialName: string;
  passingPrecent: number;
  firstAttempt: TestAttempt;
  bestAttempt: TestAttempt;
  improvement: number;
  totalAttempts: number;
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
  selector: 'app-table-exams',
  standalone: true,
  imports: [CommonModule, FormatTimePipe, RouterLink],
  templateUrl: './table-exams.component.html',
  styles: [],
})
export class TableExamsComponent implements OnChanges {
  exams = input<TestAttempt[]>([]);
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  supervisorService = inject(SupervisorService);
  route = inject(ActivatedRoute);
  groupedTests: GroupedTest[] = [];
  allResultDetails: ResultDetails[] = [];
  isLoading = signal<boolean>(false);
  isOpen = signal<boolean>(false);
  role: string = '';
  studentId: number = 0;
  isEmpty: boolean = false;
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

  ngOnChanges() {
    this.processTestData();
  }

  processTestData() {
    // Group tests by ID
    const testGroups = new Map<number, TestAttempt[]>();
    console.log(this.exams());
    this.exams().forEach((test) => {
      if (!testGroups.has(test.id)) {
        testGroups.set(test.id, []);
      }
      testGroups.get(test.id)!.push(test);
    });

    // Process each group
    this.groupedTests = [
      ...Array.from(testGroups.entries()).map(([id, attempts]) => {
        const uniqueAttempts = attempts
          .filter(
            (attempt, index, self) =>
              index ===
              self.findIndex(
                (a) =>
                  a.creationDate === attempt.creationDate &&
                  a.percentage === attempt.percentage
              )
          )
          .sort(
            (a, b) =>
              new Date(a.creationDate).getTime() -
              new Date(b.creationDate).getTime()
          );

        const firstAttempt = uniqueAttempts[0];
        const bestAttempt = uniqueAttempts.reduce((best, current) =>
          current.percentage > best.percentage ? current : best
        );

        return {
          id,
          name: firstAttempt.name,
          tutorialId: firstAttempt.tutorialId,
          tutorialName: firstAttempt.tutorialName,
          passingPrecent: firstAttempt.passingPrecent,
          firstAttempt,
          bestAttempt,
          improvement: Math.round(
            bestAttempt.percentage - firstAttempt.percentage
          ),
          totalAttempts: uniqueAttempts.length,
        };
      }),
    ];
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
    return this.groupedTests.filter((test) => test.bestAttempt.isSuccess)
      .length;
  }

  getAverageImprovement(): number {
    const improvements = this.groupedTests.map((test) => test.improvement);
    const average =
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    return Math.round(average);
  }

  getHighestScore(): number {
    const highest = Math.max(
      ...this.groupedTests.map((test) => test.bestAttempt.percentage)
    );
    return Math.round(highest);
  }
}
