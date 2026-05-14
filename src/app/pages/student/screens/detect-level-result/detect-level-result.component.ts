import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../../authentication/services/auth.service';
import { ResponseHeader } from '../../../../shared/shared-model/model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartBar, faCheckCircle, faClock, faInfoCircle, faTrophy, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';

export interface DetectLevelResult {
  studentId: number;
  examId: number;
  category: string;
  result: number;
}

@Component({
  selector: 'app-detect-level-result',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './detect-level-result.component.html',
  styleUrl: './detect-level-result.component.scss'
})
export class DetectLevelResultComponent implements OnInit {
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  
  results = signal<DetectLevelResult[]>([]);
  isLoading = signal<boolean>(true);
  
  faChartBar = faChartBar;
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faInfoCircle = faInfoCircle;
  faTrophy = faTrophy;
  faExclamationTriangle = faExclamationTriangle;

  ngOnInit() {
    const userRole = this.authService.currentUser()?.roleDto?.roleName;
    if (userRole === 'طالب') {
      this.fetchResults(this.authService.currentUser().userDto.id);
    } else {
      this.route.params.subscribe((params) => {
        const studentId = +params['id'];
        if (studentId) {
          this.fetchResults(studentId);
        } else {
          this.isLoading.set(false);
        }
      });
    }
  }

  fetchResults(studentId: number) {
    this.isLoading.set(true);
    this.profileService.getStudentDetectLevelExams(studentId).subscribe({
      next: (res: ResponseHeader) => {
        if (res.isSuccess) {
          this.results.set(res.result);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getGradeColor(result: number): string {
    if (result >= 80) return '#10b981'; // Success Green
    if (result >= 50) return '#f59e0b'; // Warning Orange
    return '#ef4444'; // Danger Red
  }

  getBgColor(result: number): string {
    if (result >= 80) return 'bg-green-50';
    if (result >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  }

  getTextColor(result: number): string {
    if (result >= 80) return 'text-green-700';
    if (result >= 50) return 'text-yellow-700';
    return 'text-red-700';
  }

  getBorderColor(result: number): string {
    if (result >= 80) return 'border-green-200';
    if (result >= 50) return 'border-yellow-200';
    return 'border-red-200';
  }
}
