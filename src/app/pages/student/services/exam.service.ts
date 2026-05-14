import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  http = inject(HttpClient);

  getExamDetails(
    examId: number,
    tutorialId: number
  ): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('TutorialId', tutorialId)
      .set('ExamId', examId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetExamDetails`,
      { params }
    );
  }

  getExamTestQuestions(
    categoryId: number,
    examId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('ExamId', examId)
      .set('PageNumber', pageNumber)
      .set('PageSize', pageSize)
      .set('categoryId', categoryId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/DetectLevelExam/Questions`,
      { params }
    );
  }
  getExamQuestions(
    examId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('ExamId', examId)
      .set('PageNumber', pageNumber)
      .set('PageSize', pageSize);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetExamQuestions/pages`,
      { params }
    );
  }

  correctExam(correctionExam: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/CorrectExam`,
      correctionExam
    );
  }

  getAllStudentExamResults(info: any): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/GetAllStudentExamResults`,
      info
    );
  }

  getStudentTrailDetails(
    trailId: number,
    pageNumber: number,
    examId: number,
    filter?: 0 | 1 | 2
  ): Observable<ResponseHeader> {
    let params;
    if (filter === undefined) {
      params = new HttpParams()
        .set('trailId', trailId)
        .set('pageNumber', pageNumber)
        .set('examId', examId);
    } else {
      params = new HttpParams()
        .set('trailId', trailId)
        .set('pageNumber', pageNumber)
        .set('examId', examId)
        .set('filter', filter);
    }
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetStudentTrailDetails`,
      { params }
    );
  }
  getTrailDetailById(trailId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('trailId', trailId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetTrailDetailById`,
      { params }
    );
  }
  rediectToQuestion(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/RedirectQrCode`,
      info
    );
  }
  getQuestionAnswer(
    examId: number,
    questionId: number
  ): Observable<ResponseHeader> {
    let params = new HttpParams()
      .set('ExamId', examId)
      .set('QuestionId', questionId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetQuestionAnswer`,
      { params }
    );
  }

  favouriteQuestion(
    questionId: number,
    tutorialId: Number
  ): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/FavouriteQuestion?questionId=${questionId}&tutorialId=${tutorialId}`,
      {}
    );
  }
}
