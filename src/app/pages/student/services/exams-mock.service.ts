import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamsMockService {
  http = inject(HttpClient);
  getAllVirtualExam(categoryId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/VirtualExams?categoryId=${categoryId}`,
    );
  }
  getVirtualExam(examId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/VirtualExam/${examId}`,
    );
  }
  getAllVirtualExamQty(
    examId: number,
    page: number,
    size: number = 20,
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/VirtualExamQuestions?examId=${examId}&pageNumber=${page}&PageSize=${size}`,
    );
  }

  correctExam(correctionExam: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/VirtualExam/Correct`,
      correctionExam,
    );
  }

  getVirtualExamRevision(data: {
    trailId: number;
    pageNumber: number;
    pageSize: number;
    filter?: number | null;
  }): Observable<any> {
    let url = `${environment.BASE_URL}/api/Student/VirtualExam/Trails/Revision?trailId=${data.trailId}&pageNumber=${data.pageNumber}&PageSize=${data.pageSize}`;
    if (data.filter !== undefined && data.filter !== null) {
      url += `&filter=${data.filter}`;
    }
    return this.http.get<any>(url);
  }
}
