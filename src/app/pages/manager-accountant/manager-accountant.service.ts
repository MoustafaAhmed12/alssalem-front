import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../shared/shared-model/model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ManagerAccountantService {
  http = inject(HttpClient);
  getTutorialAnalysis(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/ManagerAccountant/TutorialAnalysis`
    );
  }
  getAllPayments(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/ManagerAccountant/GetPayments`
    );
  }
  getPaymentAnalysis(year?: any): Observable<ResponseHeader> {
    if (year === undefined) {
      year = '';
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('year', year);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/ManagerAccountant/PaymentAnalysis`,
      { headers: headers, params: params }
    );
  }
}
