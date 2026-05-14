import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class PackageTutorialService {
  http = inject(HttpClient);
  constructor() {}
  savePackage(packageInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/SavePackage`,
      packageInfo
    );
  }
  getPackages(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/PackageTutorials/GetPackages`
    );
  }
  getPackageByName(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetPackageByName`
    );
  }
  getPackageById(packageIdAndUserId: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/PackageTutorials/GetPackageById`,
      packageIdAndUserId
    );
  }
  getAllSystemTutorials(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/PackageTutorials/GetAllSystemTutorials`
    );
  }
  activateAndDeActivatePackage(packageId: {
    packageId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/ActivateAndDeActivatePackage`,
      packageId
    );
  }
  getAllPackages(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/Packages`
    );
  }
}
