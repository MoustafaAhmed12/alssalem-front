import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Units } from '../model/all-tutorial-details';
@Injectable({
  providedIn: 'root',
})
export class TutorilsStudentsService {
  http = inject(HttpClient);
  allUnits = signal<Units>({} as Units);
  
  getCustomCategoryTutorials(id: { id: number }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetCustomCategoryTutorials`,
      id
    );
  }
  getTutorialById(tutorialId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetTutorialById/${tutorialId}`
    );
  }
  getTutorialUnits(tutorialId: number): Observable<ResponseHeader> {
    return this.http
      .get<ResponseHeader>(
        `${environment.BASE_URL}/api/Student/GetTutorialUnits/${tutorialId}`
      )
      .pipe(
        tap((res: ResponseHeader) => {
          if (res.statusCode === 200) {
            this.allUnits.set(res.result);
          }
        })
      );
  }
  getUnitDetail(
    unitId: number,
    tutorialId: number
  ): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetUnitDetail/${unitId}/${tutorialId}`
    );
  }
  getTutorialAttachments(tutorialId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetTutorialAttachments/${tutorialId}`
    );
  }
  getStudentVideo(chapterIdAndUserId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetStudentVideo`,
      chapterIdAndUserId
    );
  }

  getStudentExam(examIdAndUserId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetStudentExam`,
      examIdAndUserId
    );
  }

  createTutorialComment(commentInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Tutorial/CreateTutorialComment`,
      commentInfo
    );
  }
  getTutorialComments(
    tutorialId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('TutorialId', tutorialId)
      .set('PageNumber', pageNumber)
      .set('PageSize', pageSize);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetTutorialComments`,
      { params }
    );
  }
  subscribeFreeTutorial(tutorialId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Payment/SubscribeFreeTutorial`,
      tutorialId
    );
  }
  bestSellingTutorials(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/Tutorials/BestSelling`
    );
  }
  getAllOffers(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/Advertisment`
    );
  }
}
