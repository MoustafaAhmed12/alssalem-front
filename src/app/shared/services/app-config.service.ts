import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface AppConfig {
  success: boolean;
  data: any;
}
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  http = inject(HttpClient);
  isMainDomain = signal<boolean>(
    window.location.hostname === 'alssalem.com' ||
      window.location.hostname === 'www.alssalem.com',
  );
  configLoaded = signal<boolean>(false);
  config = signal<any | null>(null);

  private readonly DEFAULT_CONFIG: AppConfig = {
    success: true,
    data: {
      domain: 'alssalem.com',
      name: 'منصة السالم التعليمية',
      description: 'تأسيس من البداية و تدريب حتى الإتقان',
      logo: 'default-logo.png',
      address: 'default-address',
      isLogoWhite: false,
      isActive: true,
      isactive: '1',
      aboutus_desc: '',
      aboutus_title: '',
      colors: {
        primary: '#36b290',
        secondary: '#e5a53f',
      },
    },
  };

  constructor() {
    // if (this.isMainDomain()) {
    if (this.isMainDomain()) {
      this.setConfig(this.DEFAULT_CONFIG);
    }
  }

  getApiUrl(): Observable<AppConfig> {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    if (this.isMainDomain()) {
      this.configLoaded.set(false);
      return of(this.DEFAULT_CONFIG);
    }

    this.configLoaded.set(true);
    return this.http
      .get<AppConfig>(
        `${environment.School_URL}/get-data.php?domain=${subdomain}&token=123456789SECRET`,
      )
      .pipe(
        tap((config: AppConfig) => {
          this.configLoaded.set(false);
          this.setConfig(config);
        }),
        catchError((err) => {
          this.configLoaded.set(false);
          // في حالة فشل التحميل، يتم التوجيه للمنصة الرئيسية
          // window.location.href = 'https://alssalem.com/';
          this.setConfig(this.DEFAULT_CONFIG);
          return throwError(() => err);
        }),
      );
  }
  setConfig(config: AppConfig): void {
    if (config.data.isactive !== '1' && !this.isMainDomain()) {
      window.location.href = 'https://alssalem.com/';
      return;
    }
    this.config.set(config.data);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', config.data.colors.primary);
    root.style.setProperty('--color-secondary', config.data.colors.secondary);
  }
  storeSchool(data: any): Observable<AppConfig> {
    return this.http.post<AppConfig>(
      `${environment.School_URL}/set-data.php`,
      data,
    );
  }
  getAllSubscriptions(): Observable<AppConfig> {
    return this.http.get<AppConfig>(
      `${environment.School_URL}/get-data-all.php?token=123456789SECRET`,
    );
  }
  deploySubDomain(form: any): Observable<AppConfig> {
    return this.http.post<AppConfig>(
      `${environment.School_URL}/create-subdomain.php`,
      form,
    );
  }
  deleteSubDomain(domain: string): Observable<AppConfig> {
    return this.http.delete<AppConfig>(
      `${environment.School_URL}/delete-subdomain.php?domain=${domain}&token=123456789SECRET`,
    );
  }
}
