import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  http = inject(HttpClient);
  constructor() {}
  SaveSystemUsers(userInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/SaveSystemUsers`,
      userInfo,
    );
  }
  getAllSystemUsers(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetAllSystemUsers`,
    );
  }
  getUserById(userId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetUserById`,
      userId,
    );
  }
  deleteSystemUser(userId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/DeleteSystemUser`,
      userId,
    );
  }
  getSystemRoles(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetSystemRoles`,
    );
  }
  getStudentTutorials(info: any): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Admin/GetStudentTutorials`,
      info,
    );
  }
  studentExamResult(
    StartDate: string,
    EndDate: string,
  ): Observable<ResponseHeader> {
    let paramsObj: any = {
      StartDate,
      EndDate,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== ''
      ) {
        params = params.set(key, paramsObj[key]);
      }
    });
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/StudentExamResult/Analysis`,
      { params },
    );
  }
  getRegisterAnalyasis(
    PageNumber: number,
    PageSize: number,
    StartDate: string,
    EndDate: string,
    KeyWord: string,
  ): Observable<any> {
    let paramsObj: any = {
      PageNumber,
      PageSize,
      StartDate,
      EndDate,
      KeyWord,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== ''
      ) {
        params = params.set(key, paramsObj[key]);
      }
    });
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Admin/NewRegisterAnalyasis/pages`,
      { params },
    );
  }
  getStudentNotJoin(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetAllUnsubscribe`,
    );
  }
  saveSocialMedia(formData: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/SaveSocialMedia`,
      formData,
    );
  }
  getAllSocialMedia(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetAllSocialMedia`,
    );
  }
  deleteSocialMedia(id: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/DeleteSocialMedia`,
      id,
    );
  }
  getTutorialAnalysis(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/TutorialAnalysis`,
    );
  }
  getPaymentAnalysis(year?: any): Observable<ResponseHeader> {
    if (year === undefined) {
      year = '';
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('year', year);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/PaymentAnalysis`,
      { headers: headers, params: params },
    );
  }
  saveFeedbacks(info: string): Observable<ResponseHeader> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const raw = JSON.stringify(info);
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Feedbacks`,
      raw,
      { headers: headers },
    );
  }
  getAllFeedback(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/AdminFeedback`,
    );
  }
  deleteFeedback(id: any): Observable<any> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Feedbacks/${id}`,
    );
  }
  deleteParentStudentSubscribe(studentId: number): Observable<ResponseHeader> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/DeleteParentStudentSubscribe/${studentId}`,
    );
  }
  lockStudentTutorials(info: any): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/LockStudentTutorials`,
      info,
    );
  }
  lockAllTutorials(ids: number[]): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/lock-all-tutorials`,
      ids,
    );
  }
  SendEmailForStudents(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/SendEmailForStudents`,
      info,
    );
  }
  tutorialNames(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Tutorials/names`,
    );
  }

  addSubscribe(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/AddSubscribe`,
      info,
    );
  }
  studentsCreate(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Students/Create`,
      info,
    );
  }

  deleteAccounts(ids: number[]): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/Profile/DeleteAccounts`,
      ids,
    );
  }

  getOnlineUsers(): Observable<any> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Admin/GetOnlineUsers`,
    );
  }

  getFreeSubscriptionStudents(
    PageNumber: number,
    PageSize: number,
    SchoolIds: number[] = [],
    KeyWord: string = '',
  ): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', PageNumber.toString())
      .set('PageSize', PageSize.toString());

    if (SchoolIds && SchoolIds.length > 0) {
      SchoolIds.forEach((id) => {
        params = params.append('SchoolIds', id.toString());
      });
    }

    if (KeyWord) {
      params = params.set('KeyWord', KeyWord);
    }

    return this.http.get<any>(
      `${environment.BASE_URL}/api/Admin/GetFreeSubscriptionStudents`,
      { params },
    );
  }
}
