import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  http = inject(HttpClient);
  // CheckOut Api
  createPayment(paymentInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Payment/create-payment`,
      paymentInfo
    );
  }
  getAllPayments(
    PageNumber: number,
    PageSize: number,
    StartDate: string,
    EndDate: string,
    KeyWord: string,
    SchoolsIds: number[],
    Status: number | null
  ): Observable<any> {
    let paramsObj: any = {
      PageNumber,
      PageSize,
      StartDate,
      EndDate,
      KeyWord,
      SchoolsIds,
      Status,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== ''
      ) {
        if (paramsObj[key] !== null && paramsObj[key] !== undefined) {
          if (Array.isArray(paramsObj[key])) {
            paramsObj[key].forEach((id: number) => {
              params = params.append(key, id);
            });
          } else {
            params = params.set(key, paramsObj[key]);
          }
        }
      }
    });
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Payment/GetPayments`,
      { params }
    );
  }

  checkPaymentStatus(orderId: number): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/api/Payment/status?orderId=${orderId}`
    );
  }
  getPaymentById(paymentId: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('paymentId', paymentId);
    return this.http.post(
      `${environment.BASE_URL}/api/Public/GetPaymentById`,
      null,
      { headers: headers, params: params }
    );
  }
  getPromoCodeByPromoCode(promoCodeInfo: any): Observable<any> {
    return this.http.post(
      `${environment.BASE_URL}/api/Public/GetPromoCodeByPromoCode`,
      promoCodeInfo
    );
  }

  tutorialDetails(id: number): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/api/Student/Order/TutorialDetails/${id}`
    );
  }
  packageDetails(id: number): Observable<any> {
    return this.http.get(
      `${environment.BASE_URL}/api/Student/Order/PackageDetails/${id}`
    );
  }
}
