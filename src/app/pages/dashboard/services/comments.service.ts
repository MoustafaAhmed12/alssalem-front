import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  http = inject(HttpClient);
  constructor() {}
  getAllComments(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetAllComments`
    );
  }
  updateCommentApproval(commentInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Admin/UpdateCommentApproval`,
      commentInfo
    );
  }
}
