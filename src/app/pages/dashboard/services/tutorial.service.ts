import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TutorialService {
  http = inject(HttpClient);
  createTutorial(tutorialInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/CreateTutorial`,
      tutorialInfo
    );
  }
  getTutorials(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Tutorial/GetTutorials`
    );
  }
  getAllTeachers(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetAllTeachers`
    );
  }
  getQuestionTypes(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetQuestionTypes`
    );
  }
  getTutorialQuestionTypes(tutorialId: {
    tutorialId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetTutorialQuestionTypes`,
      tutorialId
    );
  }
  getTutorialById(tutorialId: {
    tutorialId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetTutorialById`,
      tutorialId
    );
  }
}
