import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  http = inject(HttpClient);
  constructor() {}
  SaveExam(examInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/SaveExam`,
      examInfo
    );
  }
  getAllExamsPerTeacherTutorials(teacherId: {
    teacherId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetAllExamsPerTeacherTutorials`,
      teacherId
    );
  }
  getExamsTutorials(teacherId: {
    teacherId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetExamsTutorials`,
      teacherId
    );
  }
  getExamById(examId: { examId: number }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetExamById`,
      examId
    );
  }
  deleteExam(examId: { examId: number }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/DeleteExam`,
      examId
    );
  }
  copyExam(copyExamData: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/CopyExam`,
      copyExamData
    );
  }
  examQuestionsIds(examId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/ExamQuestionsIds/${examId}`
    );
  }
}
