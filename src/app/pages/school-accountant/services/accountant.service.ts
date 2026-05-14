import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AccountantService {
  http = inject(HttpClient);
  studentsPayments(
    toDate: any,
    schoolIds?: number[],
    fromDate?: any
  ): Observable<ResponseHeader> {
    let paramsObj: any = {
      FromDate: fromDate,
      ToDate: toDate,
      SchoolsIds: schoolIds,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== ''
      ) {
        if (Array.isArray(paramsObj[key])) {
          paramsObj[key].forEach((id: number) => {
            params = params.append('SchoolsIds', id);
          });
        } else {
          params = params.set(key, paramsObj[key]);
        }
      }
    });
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SchoolAccountants/studentsPayments`,
      { params }
    );
  }
  getSchools(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SchoolAccountants/schools`
    );
  }
}
