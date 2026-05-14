import { inject, Injectable } from '@angular/core';
import { ResponseHeader } from '../../../shared/shared-model/model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  http = inject(HttpClient);
  saveQestion(questionsInfo: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/Questions`,
      questionsInfo,
    );
  }
  updateQestion(questionsInfo: any): Observable<ResponseHeader> {
    return this.http.put<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/Questions`,
      questionsInfo,
    );
  }
  getTeacherQuestionTypes(): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/GetTeacherQuestionTypes`,
    );
  }
  saveQuestionTypes(questionTypeName: any): Observable<ResponseHeader> {
    return this.http.post<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/SaveQuestionTypes`,
      questionTypeName,
    );
  }
  getAllQuestion(
    pageSize: number,
    pageNumber: number,
    questionId?: any,
    questionDifficulty?: any,
    questionTypeId?: any,
    skillId?: any,
    text?: string,
    examsIds?: number[],
  ): Observable<any> {
    let paramsObj: any = {
      PageNumber: pageNumber,
      PageSize: pageSize,
      QuestionDifficulty: questionDifficulty,
      QuestionTypeId: questionTypeId,
      SkillId: skillId,
      QuestionId: questionId,
      Text: text,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== 0
      ) {
        params = params.set(key, paramsObj[key]);
      }
    });

    if (examsIds && examsIds.length > 0) {
      examsIds.forEach((id) => {
        params = params.append('ExamsIds', id.toString());
      });
    }

    return this.http.get<any>(
      `${environment.BASE_URL}/api/Teacher/Questions/Pages`,
      { params },
    );
  }
  deleteQestion(id: number): Observable<ResponseHeader> {
    return this.http.delete<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/Questions/${id}`,
    );
  }
  getQestion(id: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/Questions/${id}`,
    );
  }
  handleSearch(e: any) {
    const questionId = Number(e.target.value);
    this.getAllQuestionForExam(questionId);
  }
  getAllQuestionForExam(
    questionId?: any,
    questionTypeId?: any,
    skillId?: any,
    questionDifficulty?: any,
  ): Observable<ResponseHeader> {
    let paramsObj: any = {
      Id: questionId,
      QuestionTypeId: questionTypeId,
      SkillId: skillId,
      Difficulty: questionDifficulty,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (
        paramsObj[key] !== null &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== 0
      ) {
        params = params.set(key, paramsObj[key]);
      }
    });
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Teacher/ExamQuestionsFilter`,
      { params },
    );
  }

  getRandomExam(
    EasyCount: number,
    MediumCount: number,
    HardCount: number,
    QuestionsTypesIds?: any,
    SkillsIds?: any,
  ): Observable<any> {
    let paramsObj: any = {
      EasyCount: EasyCount,
      MediumCount: MediumCount,
      HardCount: HardCount,
      QuestionsTypesIds: QuestionsTypesIds,
      SkillsIds: SkillsIds,
    };
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (paramsObj[key] !== null && paramsObj[key] !== undefined) {
        if (Array.isArray(paramsObj[key])) {
          paramsObj[key].forEach((id: number) => {
            params = params.append(key, id);
          });
        } else {
          params = params.set(key, paramsObj[key]);
        }
      }
    });
    return this.http.get<any>(
      `${environment.BASE_URL}/api/Teacher/GetRandomExam`,
      { params },
    );
  }

  getPublicQuestionExamples(id: number): Observable<ResponseHeader> {
    return this.http.get<ResponseHeader>(
      `${environment.BASE_URL}/api/Public/questionExamples/${id}`,
    );
  }
}
