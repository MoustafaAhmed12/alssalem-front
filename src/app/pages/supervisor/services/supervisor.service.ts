import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SupervisorService {
  http = inject(HttpClient);
  getSchoolStudents(
    pageNumber: number,
    pageSize: number,
    keyWord: string | null,
    state: string | null,
    classNumber: string | null,
    schoolId: number | null,
    tutorialsIds: number[] | null = null,
    descending: boolean = true,
    orderBy: number | null = 0,
  ): Observable<any> {
    const body = {
      pageNumber,
      pageSize,
      keyWord,
      state,
      classNumber,
      schoolId,
      tutorialsIds: tutorialsIds?.length ? tutorialsIds : null,
      descending,
      orderBy: orderBy ?? 0,
    };
    return this.http.post<any>(
      `${environment.BASE_URL}/api/SuperVisor/GetSchoolStudents`,
      body,
    );
  }
  exportExcel(userId: any): Observable<ResponseHeader> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('userId', userId);
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}//api/SuperVisor/ExportExcel`,
      { headers: headers, params: params },
    );
  }
  sendStudentsEmail(info: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/SendStudentsEmail`,
      info,
    );
  }

  getResultDetailsSuper(
    examId: number,
    userId: number,
  ): Observable<ResponseHeader> {
    const params = new HttpParams().set('ExamId', examId).set('UserId', userId);
    return this.http.get<any>(
      `${environment.BASE_URL}/api/SuperVisor/HighTrail`,
      { params },
    );
  }
  getAllShools(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/Schools`,
    );
  }
  getTutorialExams(tutorialId: number): Observable<ResponseHeader> {
    let params;
    if (tutorialId !== undefined) {
      params = new HttpParams().set('tutorialId', tutorialId);
    }
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/GetTutorialExams/tutorialId`,
      { params },
    );
  }
  getAllTutorials(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/GetAllTutorials`,
    );
  }

  getStudentExamsStatus(
    PageNumber: number,
    PageSize: number,
    SchoolId: number | null,
    IsSuccess: boolean | null,
    ClassNum: string,
    Grade: string,
    ExamId: number,
    TutorialId: number,
    Status: 0 | 1 | 2 | 3 | null,
  ): Observable<any> {
    let paramsObj: any = {
      PageNumber,
      PageSize,
      SchoolId,
      IsSuccess,
      ClassNum,
      Grade,
      ExamId,
      TutorialId,
      Status,
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
      `${environment.BASE_URL}/api/SuperVisor/GetStudentExamsStatus`,
      { params },
    );
  }

  getTotalSchoolStudents(
    keyWord: string,
    state: string,
    classNumber: string,
    schoolId: number | null,
    categoriesIds: number[] | null = null,
    tutorialsIds: number[] | null = null,
  ): Observable<ResponseHeader> {
    let paramsObj: any = {
      KeyWord: keyWord,
      State: state,
      ClassNumber: classNumber,
      SchoolId: schoolId,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== '' &&
        paramsObj[key] !== 0
      ) {
        params = params.set(key, paramsObj[key]);
      }
    });

    if (categoriesIds && categoriesIds.length > 0) {
      categoriesIds.forEach((id) => {
        params = params.append('CategoriesIds', id.toString());
      });
    }

    if (tutorialsIds && tutorialsIds.length > 0) {
      tutorialsIds.forEach((id) => {
        params = params.append('TutorialsIds', id.toString());
      });
    }

    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/GetTotalSchoolStudents`,
      { params },
    );
  }

  schoolsProgressAnalysis(
    tutorailId: number,
    schoolId: number | null = null,
    state: string | null = null,
    classNumber: string | null = null,
  ): Observable<ResponseHeader> {
    let params = new HttpParams().set('TutorialId', tutorailId);
    if (schoolId) {
      params = params.set('SchoolId', schoolId);
    }
    if (state) {
      params = params.set('State', state);
    }
    if (classNumber) {
      params = params.set('ClassNumber', classNumber);
    }
    return this.http.get<any>(
      `${environment.BASE_URL}/api/SuperVisor/SchoolsProgressAnalysis`,
      { params },
    );
  }
  myRoadMaps(userId: number): Observable<ResponseHeader> {
    return this.http.get<any>(
      `${environment.BASE_URL}/api/SuperVisor/RoadMaps/${userId}`,
    );
  }
  oneRoadMaps(userId: number, roadMapId: number): Observable<ResponseHeader> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('roadMapId', roadMapId);
    return this.http.get<any>(
      `${environment.BASE_URL}/api/SuperVisor/RoadMaps`,
      { params },
    );
  }

  averageDetectLevelExamResults(data: any): Observable<ResponseHeader> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/SuperVisor/AverageDetectLevelExamResults`,
      data,
    );
  }
  getExamDoneStudents(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/SuperVisor/DetectLevelExam/Details`,
      data,
    );
  }
  getExamNotStudents(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/SuperVisor/DetectLevelExam/NotIn`,
      data,
    );
  }
  getVirtualExams(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.BASE_URL}/api/SuperVisor/VirtualExam/Analysis`,
      data,
    );
  }

  getSchoolStudentsByActiveStatus(data: {
    pageNumber: number;
    pageSize: number;
    keyWord: string | null;
    state: string | null;
    classNumber: string | null;
    schoolId: number | null;
    unActiveStudents: number | null;
  }): Observable<any> {
    let params = new HttpParams();
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (
        (value !== null && value !== undefined && value !== '') ||
        key === 'unActiveStudents'
      ) {
        params = params.set(key, value);
      }
    });

    return this.http.get<any>(
      `${environment.BASE_URL}/api/SuperVisor/GetSchoolStudentsByActiveStatus`,
      { params },
    );
  }

  getStudentBestTryDetails(
    userId: number,
    examId: number,
    pageNumber: number,
    pageSize: number = 20,
    status: number | null = null,
  ): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId)
      .set('examId', examId)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (status !== null) {
      params = params.set('filter', status);
    }

    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/GetStudentBestTryDetails`,
      { params },
    );
  }

  getStudentVirtualExams(categoryId: number): Observable<any> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Student/VirtualExams`,
      { params },
    );
  }

  getSuperVisorRoadMaps(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/SuperVisorRoadMpas`,
    );
  }

  createRoadMap(data: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/CreateRoadMap`,
      data,
    );
  }
  getOneRoadMap(id: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/SuperVisorRoadMpas/${id}`,
    );
  }

  updateRoadMap(data: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/UpdateRoadMap`,
      data,
    );
  }

  deleteRoadMap(id: number): Observable<ResponseHeader> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/SuperVisor/SuperVisorRoadMpas/${id}`,
    );
  }
}
