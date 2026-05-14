import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ParentService {
  http = inject(HttpClient);
  constructor() {}
  getAllParentStudents(parentId: {
    parentId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Parent/GetAllParentStudents`,
      parentId
    );
  }
  attachParentToStudent(studentReferenceKey: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Parent/AttachParentToStudent`,
      studentReferenceKey
    );
  }
  getStudentsTutorials(studentId: {
    studentId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Parent/GetStudentsTutorials`,
      studentId
    );
  }
}
