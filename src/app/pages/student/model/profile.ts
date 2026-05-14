export interface ProfileInfo {
  id: number;
  firstName: string;
  lastName: string;
  referenceKey: string;
  state: string;
  birthDate: any;
  email: string;
  phone: string;
  schoolName: string;
  classNo: any;
  schoolId: any;
  isGoogleSign: boolean;
}
export interface tutorialInfo {
  id: number;
  endDate: string;
  startDate: string;
  name: string;
  isFinished: boolean;
  advancePercentage: number;
  progressExam: number;
}
export interface examInfo {
  id: number;
  isSuccess: boolean;
  takenTimeInSec: number;
  percentage: number;
  name: string;
  tutorialName: string;
  creationDate: string;
  tutorialId: number;
  passingPrecent: number;
  totalQuestions: number;
}

export interface FavouriteQuestion {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  hasNext: boolean;
  questions: Question[];
}

export interface Question {
  questionId: number;
  image1Url: string;
  image2Url: any;
  answerUrl: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  text: any;
  isEnglish: boolean;
  choicesCount: number;
  correctChoice: number;
  difficulty: number;
}
