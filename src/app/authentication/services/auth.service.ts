import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, ResponseHeader } from '../../shared/shared-model/model';
import { MultiLangService } from '../../shared/services/multi-lang.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  toastr = inject(ToastrService);
  multiLangService = inject(MultiLangService);
  // Varibles
  currentUser = signal<CurrentUser>({} as CurrentUser);
  isAuth = signal<boolean>(false);
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly IS_AUTH = 'IS_AUTH';
  private readonly CURRENT_USER = 'CURRENT_USER';
  constructor(private router: Router) {
    const savedIsAuth = localStorage.getItem(this.IS_AUTH);
    this.isAuth.set(savedIsAuth ? JSON.parse(savedIsAuth) : false);
    const savedCurrentUser = localStorage.getItem(this.CURRENT_USER);
    this.currentUser.set(
      savedCurrentUser ? JSON.parse(savedCurrentUser) : null,
    );
  }
  /// All Funs.
  // Login Fun.
  googleLogin(credential: any, roleCode: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams()
      .set('credential', credential)
      .set('roleCode', roleCode);
    return this.http
      .get<any>(`${environment.BASE_URL}/api/Authentication/googleLogin`, {
        headers: headers,
        params: params,
      })
      .pipe(
        tap((res: any) => {
          if (res.statusCode === 200) {
            this.doLoggedUser(res.result.token, res.result);
          }
        }),
      );
  }
  // Login Fun.
  loginUser(userBody: {
    email: string;
    phone: string;
    password: string;
  }): Observable<ResponseHeader> {
    return this.http
      .post<ResponseHeader>(
        `${environment.BASE_URL}/api/Authentication/Login`,
        userBody,
      )
      .pipe(
        tap((res: any) => {
          if (res.statusCode === 200) {
            this.doLoggedUser(res.result.token, res.result);
          }
        }),
      );
  }
  // fun to store token of the user in localStorage and user data
  private doLoggedUser(token: string, userData: any) {
    this.setToken(token);
    this.setCurrentUser(userData);
  }
  getToken(): string {
    return localStorage.getItem(this.JWT_TOKEN) || '';
  }
  private setToken(token: string): void {
    localStorage.setItem(this.JWT_TOKEN, token);
  }
  // Is LoggedIn
  setIsAuth(isAuth: boolean): void {
    this.isAuth.set(isAuth);
    localStorage.setItem(this.IS_AUTH, JSON.stringify(isAuth));
  }
  // Current User
  setCurrentUser(userData: any): void {
    if (userData) {
      this.currentUser.set(userData);
      localStorage.setItem(this.CURRENT_USER, JSON.stringify(userData));
    }
  }
  // LogOut Fun.
  logout() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.CURRENT_USER);
    this.setIsAuth(false);
    this.router.navigateByUrl('/login');
    this.multiLangService.updateLang('ar');
    // this.toastr.success('تم تسجيل الخروج بنجاح');
  }
  // Register Fun.
  createUser(userBody: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Authentication/Register`,
      userBody,
    );
  }
  sendConfirmationEmail(email: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('email', email);
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Authentication/SendConfirmationEmail`,
      null,
      { headers: headers, params: params },
    );
  }
  forgetPassword(data: any): Observable<any> {
    return this.http.put<any>(
      `${environment.BASE_URL}/api/Authentication/ForgetPassword`,
      data,
    );
  }
  checkEmailConfirmOtp(email: string, otp: string): Observable<ResponseHeader> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Authentication/CheckEmailConfirmOtp`,
      { headers: headers, params: params },
    );
  }
  checkRegisterData(email: string, phone: string): Observable<ResponseHeader> {
    const params = new HttpParams().set('email', email).set('phone', phone);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Authentication/CheckRegisterData`,
      { params },
    );
  }
  // Register Fun.
  registerParent(userBody: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Parent/RegisterParent`,
      userBody,
    );
  }

  // Get Student Data for SSO
  getStudentData(token: string): Observable<any> {
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`,
    // });
    return this.http
      .get<any>(
        `${environment.BASE_URL}/api/PartnerUsers/sso/external-login?token=${token}`,
      )
      .pipe(
        tap((res: any) => {
          if (res.statusCode === 200 && res.isSuccess) {
            this.doLoggedUser(res.result.token, res.result);
            this.setIsAuth(true);
          }
        }),
      );
  }
}
