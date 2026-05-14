import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  http = inject(HttpClient);
  // API for School
  SaveSchool(schoolInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/SaveSchool`,
      schoolInfo
    );
  }
  getSystemSchools(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/getallschools`
    );
  }
  getSchoolById(schoolId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetSchoolById`,
      schoolId
    );
  }
  deleteSchool(schoolId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/DeleteSchool`,
      schoolId
    );
  }
  suggestSchool(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/SuggestSchool`,
      info
    );
  }
  deleteSuggestSchool(schoolId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('id', schoolId);
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/SuggestedSchool`,
      { params }
    );
  }
  getSuggestedSchools(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/SuggestedSchools`
    );
  }
}
