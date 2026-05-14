import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  http = inject(HttpClient);

  getStudentInfo(id: number): Observable<ResponseHeader> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${environment.BASE_URL}/api/Public/Profile`, {
      headers: headers,
      params: params,
    });
  }

  getProfileInfo(id: number): Observable<ResponseHeader> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${environment.BASE_URL}/api/Public/Profile`, {
      headers: headers,
      params: params,
    });
  }
  updateProfile(userBody: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/UpdateProfile`,
      userBody
    );
  }

  updateUserPassword(userBody: any): Observable<ResponseHeader> {
    return this.http.put<any>(
      `${environment.BASE_URL}/api/Admin/UpdateUserPassword`,
      userBody
    );
  }
  getfavouriteQuestions(
    pageNumber: number,
    pageSize: number,
    tutorialId: number
  ): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('tutorialId', tutorialId);
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/FavouriteQuestions`,
      { params }
    );
  }
  getResultDetails(examId: number, userId: number): Observable<ResponseHeader> {
    const params = new HttpParams().set('ExamId', examId).set('UserId', userId);
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/HighTrailDetails`,
      { params }
    );
  }
  tutorialsOfFavourite(): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/TutorialsOfFavourite`
    );
  }
  getDetectLevelExams(): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/Categories/GetDetectLevelExams`
    );
  }
  suggestedRoadMap(data: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/SuggestedRoadMap`,
      data
    );
  }
  saveRoadMap(data: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/RoadMap`,
      data
    );
  }
  detectLevelExam(data: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/DetectLevelExam/Result/Save`,
      data
    );
  }
  myRoadMaps(): Observable<ResponseHeader> {
    return this.http.get<any>(`${environment.BASE_URL}/api/Student/RoadMaps`);
  }
  oneRoadMaps(id: number): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/RoadMaps/${id}`
    );
  }

  addRoadMapScience(formData: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/RoadMaps/Custom/Science`,
      formData
    );
  }
  addRoadMap(formData: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/RoadMaps/Custom`,
      formData
    );
  }
  getCustomCategoryTutorials(data: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/Student/GetCustomCategoryTutorials`,
      data
    );
  }
  categoriesQuestionCount(): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/CategoriesQuestionCount`
    );
  }

  updateRoadMap(formData: any): Observable<ResponseHeader> {
    return this.http.put<any>(
      `${environment.BASE_URL}/api/Student/RoadMap/Update`,
      formData
    );
  }

  deleteRoadMap(id: number): Observable<ResponseHeader> {
    return this.http.delete<any>(
      `${environment.BASE_URL}/api/Student/RoadMaps/RoadMap/${id}`
    );
  }
  getStudentTutorials(id: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/Profile/Tutorials/${id}`
    );
  }
  getStudentExams(id: number): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Public/Profile/Exams/${id}`
    );
  }
  getStudentDetectLevelExams(studentId: number): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/GetStudentDetectLevelExams/${studentId}`
    );
  }
  getVirtualExams(): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/VirtualExam/Trails`
    );
  }
  getVirtualExamsBy(id: number): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/SuperVisor/VirtualExam/Trails/${id}`
    );
  }
}
