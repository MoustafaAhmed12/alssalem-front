import { inject, Injectable } from '@angular/core';
import { ResponseHeader } from '../../shared/shared-model/model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminExamService {
  http = inject(HttpClient);

  getAllVirtualExam(
    page: number,
    size: number = 10,
  ): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/ExamsAdmin/VirtualExams?pageNumber=${page}&PageSize=${size}`,
    );
  }
  deleteVirtualExam(examId: number): Observable<ResponseHeader> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/ExamsAdmin/VirtualExam/${examId}`,
    );
  }
  getAllVirtualExamQty(
    examId: number,
    page: number,
    size: number = 10,
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/ExamsAdmin/VirtualExamQuestions?examId=${examId}&pageNumber=${page}&PageSize=${size}`,
    );
  }
  createVirtualExam(data: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/ExamsAdmin/VirtualExam`,
      data,
    );
  }

  getAllTutorials(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/ExamsAdmin/AllTutorials`,
    );
  }
  getExamsByTutorial(tutorialId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/ExamsAdmin/ExamsByTutorial/${tutorialId}`,
    );
  }

  getVirtualExamById(examId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/ExamsAdmin/VirtualExam/${examId}`,
    );
  }

  updateVirtualExam(data: any): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/ExamsAdmin/VirtualExam`,
      data,
    );
  }
}
