import { inject, Injectable } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class SkillService {
  http = inject(HttpClient);
  getSkills(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(`${environment.BASE_URL}/api/Skill`);
  }
  addSkill(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Skill`,
      info
    );
  }
  updateSkill(info: any): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/Skill`,
      info
    );
  }
  deleteStSkill(id: number): Observable<ResponseHeader> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/Skill/${id}`
    );
  }
  getAllSkillByQuestionTypeId(id: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Skill/questionTypeId/${id}`
    );
  }
}
