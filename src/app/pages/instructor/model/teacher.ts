import { FormArray, FormControl, FormGroup } from '@angular/forms';
export interface Video {
  id: number;
  name: string;
  uploadedAt: string;
  link: string;
}
export interface TutorialTeacher {
  id: number;
  name: string;
  categoryName: string;
  teacherName: string;
  priceBeforeDiscount: number;
  price: number;
  durationInWeeks: number;
  img: string;
  isEnabled: boolean;
  numberOfUnits: number;
}
export interface ExamTable {
  examId: number;
  examName: string;
  tutorialName: string;
  questionsNumber: number;
}
interface Answer {
  id: number;
  name: string;
  isRight: boolean;
}
interface Question {
  id: number;
  questionImage: string;
  questionTypeId: number;
  answers: Answer[];
}
export interface ExamInfo {
  id: number;
  name: string;
  durationInMinutes: number;
  totalGrades: number;
  passingPrecent: number;
  tutorialId: number;
  questionsId: number[];
}
export type FormAnswer = FormGroup<{
  id: FormControl;
  name: FormControl;
  isRight: FormControl;
}>;
export type FormQuestion = FormGroup<{
  id: FormControl;
  questionImage: FormControl;
  questionImage2: FormControl;
  text: FormControl;
  questionTypeId: FormControl;
  isDeleted: FormControl;
  answers: FormArray<FormAnswer>;
}>;
export type Form = FormGroup<{
  id: FormControl;
  name: FormControl;
  passingPrecent: FormControl;
  durationInMinutes: FormControl;
  totalGrades: FormControl;
  tutorialId: FormControl;
  questions: FormArray<FormQuestion>;
}>;
