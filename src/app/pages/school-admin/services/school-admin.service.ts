import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResponseHeader } from '../../../shared/shared-model/model';

@Injectable({
  providedIn: 'root',
})
export class SchoolAdminService {
  http = inject(HttpClient);

  getDashboardData(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SchoolAdmin/Dashboard`
    );
  }

  getSchoolStudents(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/SchoolAdmin/Students/All`,
      data
    );
  }

  addSubscribe(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/SchoolAdmin/OpenTutorials`,
      info
    );
  }
  getTutorialsAndSchools(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SchoolAdmin/Students/Filter`
    );
  }
  getJoinStudents(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/SchoolAdmin/Students`,
      data
    );
  }
  lockTutorial(data: any): Observable<any> {
    return this.http.put<any>(
      `${environment.BASE_URL}/api/SchoolAdmin/LockTutorial`,
      data
    );
  }
}
