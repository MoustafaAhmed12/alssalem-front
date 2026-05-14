import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class PromoService {
  http = inject(HttpClient);
  // API for School
  generateRandomPromoCodes(promoCodeInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GenerateRandomPromoCodes`,
      promoCodeInfo
    );
  }
  updatePromoCode(promoCodeInfo: any): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/UpdatePromoCode`,
      promoCodeInfo
    );
  }
  getAllPromoCodes(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetAllPromoCodes`
    );
  }
  getPromoCodeById(id: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetPromoCodeById`,
      id
    );
  }
  deletePromoCode(promoCodeId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/DeletePromoCode`,
      promoCodeId
    );
  }
  ChangeActiveStatusPromoCode(
    activeStatus: boolean,
    promoCodeId: number[]
  ): Observable<ResponseHeader> {
    // query param
    const params = new HttpParams().set(
      'activeStatus',
      activeStatus.toString()
    );
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/PromoCodeChangeActiveStatus`,
      promoCodeId,
      { params }
    );
  }
  getAllTutorials(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetAllTutorials`
    );
  }

  // Oferrs
  addOffers(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Advertisment`,
      info
    );
  }
  getAllOffers(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Advertisments`
    );
  }
  getAllPromocodesName(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Promocodes/names`
    );
  }
  deleteOffer(id: number): Observable<ResponseHeader> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Advertisments/${id}`
    );
  }
}
