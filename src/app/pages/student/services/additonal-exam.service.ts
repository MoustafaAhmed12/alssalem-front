import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdditonalExamService {
  http = inject(HttpClient);

  getAllExamSkills(examId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/ExamSkills?examId=${examId}`,
    );
  }
  getRandomExam(
    tutorialId: number,
    skillsId: number[],
    isSkills: boolean,
    easyQuestionsPrecent: number,
    midumQuestionsPrecent: number,
    hardQuestionsPrecent: number,
    questionCount: number = 0,
  ): Observable<ResponseHeader> {
    let paramsObj: any = {
      TutorialId: tutorialId,
      SkillsId: isSkills ? skillsId : [],
      QuestionTypeIds: isSkills ? [] : skillsId,
      EasyQuestionsPrecent: easyQuestionsPrecent,
      MidumQuestionsPrecent: midumQuestionsPrecent,
      HardQuestionsPrecent: hardQuestionsPrecent,
      questionCount: questionCount,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== ''
      ) {
        if (Array.isArray(paramsObj[key])) {
          if (key === 'SkillsId') {
            paramsObj[key].forEach((id: number) => {
              params = params.append('SkillsId', id);
            });
          } else {
            paramsObj[key].forEach((id: number) => {
              params = params.append('QuestionTypeIds', id);
            });
          }
        } else {
          params = params.set(key, paramsObj[key]);
        }
      }
    });
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetRandomExam`,
      { params },
    );
  }

  correctQuickExam(examInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/CorrectQuickExam`,
      examInfo,
    );
  }
  reviewQuickExam(examInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/ReviewQuickExam`,
      examInfo,
    );
  }

  getNotPassedSkills(examId: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Student/GetNotPassedSkillsInExam?ExamId=${examId}`,
    );
  }
}
