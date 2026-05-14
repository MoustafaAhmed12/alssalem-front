export interface SchoolSchoolStudents {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: StudentData[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StudentData {
  id: number;
  name: string;
  classNo: string;
  state: string;
  phoneNumber: string;
  email: string;
  schoolName: string;
  tutorials: Tutorial[];
}

export interface Tutorial {
  id: number;
  tutorialName: string;
  advancePercentage: number;
  successPrecentage: number;
  score: number;
}

export interface RootExamData {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: StudentsExam[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StudentsExam {
  id: number;
  firstName: string;
  lastName: string;
  grade: string;
  classNum: number;
  schoolName: any;
  isSuccess: boolean;
  maxDegree: number;
}

export interface VirtualExamAnalysis {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: Student[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Student {
  id: number;
  name: string;
  state: string;
  classNumber: string;
  examsResults: ExamsResult[];
}

export interface ExamsResult {
  virtualExamId: number;
  firstTrail: FirstTrail;
  bestTrail: BestTrail;
}

export interface FirstTrail {
  id: number;
  scorePercent: number;
  creationDate: string;
  numberOfCorrectQuestions: number;
  numberOfWrongQuestions: number;
  numberOfUnsolvedQuestions: number;
}

export interface BestTrail {
  id: number;
  scorePercent: number;
  creationDate: string;
  numberOfCorrectQuestions: number;
  numberOfWrongQuestions: number;
  numberOfUnsolvedQuestions: number;
}
