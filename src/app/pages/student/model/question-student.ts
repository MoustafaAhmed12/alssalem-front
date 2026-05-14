export interface CorrectionExam {
  id: number;
  name: string;
  totalCount: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  emptyQuestionsCount: number;
  isSuccess: boolean;
  precent: number;
  questionTypeStatistics: QuestionTypeStatistic[];
}

export interface QuestionTypeStatistic {
  id: number;
  name: string;
  precent: number;
  skillsStatistics: SkillsStatistic[];
}

export interface SkillsStatistic {
  id: number;
  name: string;
  precent: number;
}

export interface MainDetailsExam {
  id: number;
  isEnglish: boolean;
  choicesCount: number;
  isAdditonalExamEnabled: boolean;
  hasPrviousTrail: boolean;
  durationInMinutes: number;
  passingPrecent: number;
  questionsCount: number;
  name: string;
}

export interface Root {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  questions: Question[];
}

export interface Question {
  id: number;
  image1Url: string;
  image2Url: string;
  text: string;
  skillName: string;
  questionType: string;

  difficulty: number;
  isFavourite: boolean;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
}

export interface StudentExamResults {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: DataResult[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DataResult {
  id: number;
  numberOfTotalQuestionsQuestions: number;
  numberOfAnsweredQuestions: number;
  numberOfCorrectQuestions: number;
  numberOfWrongQuestions: number;
  numberOfEmptyQuestions: number;
  takenTime: number;
  percentage: number;
  passingPrecent: number;
  creationDate: string;
}
