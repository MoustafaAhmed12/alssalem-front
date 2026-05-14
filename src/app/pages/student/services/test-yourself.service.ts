import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TestYourselfService {
  http = inject(HttpClient);
  getSubCategoriesByParentId(parentId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('parentId', parentId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/GetSubCategoriesByParentId`,
      { params }
    );
  }
  getTutorialsbyCategoryId(categoryId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/GetTutorialsbyCategoryId`,
      { params }
    );
  }
  getExamsByTutorialId(tutorialId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('tutorialId', tutorialId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/GetExamsByTutorialId`,
      { params }
    );
  }
  getExamByUser(examId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('examId', examId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/GetExamByUser`,
      { params }
    );
  }
  createExamPayment(paymantInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Payment/CreateExamPayment`,
      paymantInfo
    );
  }
  getExamDetailsForPayment(examId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('examId', examId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/GetExamDetailsForPayment`,
      { params }
    );
  }
  getExamPaymentResponse(paymentId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('paymentId', paymentId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetExamPaymentResponse`,
      { params }
    );
  }
  clearTrailSolutions(trackingId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('trackingId', trackingId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/ClearTrailSolutions`,
      { params }
    );
  }
  getExamDetails(examId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('examId', examId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/GetExamDetails`,
      { params }
    );
  }
  getExamQuestionReview(
    examId: number,
    pageNumber: number
  ): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('ExamId', examId)
      .set('PageNumber', pageNumber);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/GetExamQuestionReview`,
      { params }
    );
  }
  correctExam(formData: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/CorrectExam`,
      formData
    );
  }
  trackingSolve(formData: any): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/TestYourSelf/TrackingSolve`,
      formData
    );
  }
}
