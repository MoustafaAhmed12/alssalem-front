import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CorrectionExamService {
  http = inject(HttpClient);
  correctStudentExam(correctionExam: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/CorrectStudentExam`,
      correctionExam
    );
  }
  getAllStudentExamResults(ExamIdAndUserId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetAllStudentExamResults`,
      ExamIdAndUserId
    );
  }
}
