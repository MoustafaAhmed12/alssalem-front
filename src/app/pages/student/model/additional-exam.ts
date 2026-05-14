import { FormArray, FormControl, FormGroup } from '@angular/forms';
export type Form = FormGroup<{
  questions: FormArray<FormQuestion>;
}>;
export type FormQuestion = FormGroup<{
  id: FormControl;
  image1Url: FormControl;
  image2Url: FormControl;
  text: FormControl;
  answer: FormControl;
  isFavourite: FormControl;
}>;

export type Exam = {
  isEnglish: boolean;
  choicesCount: number;
  questions: {
    id: number;
    image1Url: string;
    image2Url: string;
    text: string;
  }[];
};

export interface ResultExam {
  precent: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  takenTime: number;
  questionsLength: number;
  questionsTypesPrecent: QuestionsTypesPrecent[];
}

export interface QuestionsTypesPrecent {
  name: string;
  precent: number;
}

export interface ReviewExam {
  questions: Questions[];
  choicesCount: number;
  isEnglish: boolean;
}

type Questions = {
  id: number;
  image1Url: any;
  image2Url: any;
  text: any;
  answerUrl: string;
  correctChoice: number;
  difficulty: number;
  choice: number;
  isFavourite: boolean;
};
