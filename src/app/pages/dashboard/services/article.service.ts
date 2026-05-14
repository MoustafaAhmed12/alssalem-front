import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  http = inject(HttpClient);
  addArticle(articleInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/AddArticle`,
      articleInfo
    );
  }
  updateArticle(articleInfo: any): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Articles`,
      articleInfo
    );
  }
  getArticles(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/GetArticles`
    );
  }
  getArticleById(id: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Articles/${id}`
    );
  }
  deleteArticle(id: number): Observable<ResponseHeader> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/Articles/${id}`
    );
  }
  // public
  getPublicArticles(
    pageNumber: number,
    pageSize: number,
    keyWord?: string
  ): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('keyWord', keyWord || '');
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/Articles`,
      { params }
    );
  }
  getPublicArticleById(id: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/Articles/${id}`
    );
  }
}
