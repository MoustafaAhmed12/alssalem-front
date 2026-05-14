import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  http = inject(HttpClient);
  constructor() {}
  saveTeacherTutorialDetails(tutorialInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/SaveTeacherTutorialDetails`,
      tutorialInfo
    );
  }
  getTeacherTutorials(teacherId: {
    teacherId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetTeacherTutorials`,
      teacherId
    );
  }
  getTeacherTutorialDetails(tutorialId: {
    tutorialId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/TeacherTutorialDetails`,
      tutorialId
    );
  }
  getTeacherTutorialsExams(tutorialId: {
    tutorialId: number;
  }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetTeacherTutorialsExams`,
      tutorialId
    );
  }
  // Videos
  uploadVideo(formData: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/UploadVideo`,
      formData
    );
  }
  getAllVideos(userId: { userId: number }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetAllVideos`,
      userId
    );
  }
  deleteVideo(videoId: { videoId: number }): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/DeleteVideo`,
      videoId
    );
  }

  getTextSuggestions(text: { text: string }): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetTextSuggestions`,
      { params: text }
    );
  }
  getVideosDropdown(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetVideosDropdown`
    );
  }

  getCategories(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetCategories`
    );
  }
  getAllCategoryExams(categoryId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/Category/Exams/${categoryId}`
    );
  }

  saveCategoryExams(categoryInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/DetectLevelExams/Categories`,
      categoryInfo
    );
  }
}
