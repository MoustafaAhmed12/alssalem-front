import { FormArray, FormControl, FormGroup } from '@angular/forms';
export type QuestionForm = FormGroup<{
  questions: FormArray<FormQuestion>;
}>;
export type FormQuestion = FormGroup<{
  image1: FormControl;
  image2: FormControl;
  answerUrl: FormControl;
  text: FormControl;
  correctChoice: FormControl;
  difficulty: FormControl;
  questionTypeId: FormControl;
  skillId: FormControl;
  answer1: FormControl;
  answer2: FormControl;
  answer3: FormControl;
  answer4: FormControl;
  answer5: FormControl;
  keyWord: FormControl;
  slug: FormControl;
}>;
export interface QuestionData {
  statusCode: number;
  isSuccess: boolean;
  message: any;
  data: Data[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface Data {
  id: number;
  image1Url: string;
  image2Url: any;
  answerUrl: string;
  text: any;
  correctChoice: number;
  difficulty: number;
  questionTypeId: any;
  questionTypeName: any;
  teacherId: number;
  skillName: string;
  exams: { id: number; name: string }[];
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
}
