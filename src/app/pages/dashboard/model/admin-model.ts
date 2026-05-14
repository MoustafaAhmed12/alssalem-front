export interface SystemUser {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  roleName: string;
  action: string;
  isLocked: boolean;
}
export interface GetUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  expireDate: string;
  password: string;
  roleId: number;
  studentsCount: number;
  schoolId?: number[];
  tutorialsIds?: number[];
}
export interface FollowingStudents {
  id: number;
  referenceKey: string;
  firstName: string;
  lastName: string;
}
[];
export interface ID_Name {
  id: number;
  name: string;
}

export interface TutorialAdmin {
  id: number;
  price: number;
  name: string;
  categoryName: string;
  teacherName: string;
  isEnabled: boolean;
}

export interface CategoryInfo {
  id: number;
  name: string;
  isVisibleToFront: boolean;
}
export interface Tutorial {
  id: number;
  name: string;
  price: number;
  priceBeforeDiscount: number;
  durationInWeeks: number;
  fakeStudentsEnrolled: number;
  description: string;
  img: string;
  categoryId: number;
  teacherId: number;
  isEnabled: boolean;
  isBuyAgain: boolean;
  choicesCount: number;
  isEnglish: boolean;
  examPrice: number;
  additionalQuestionsExamCount: number;
  isAdditonalExamEnabled: boolean;
  // questionTypeIds: number[];
}
export interface Comment {
  id: number;
  comment: string;
  studentName: string;
  tutorialName: string;
}

export interface AllDataStudent {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: StudentsDetail[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StudentsDetail {
  studentName: string;
  userId: number;
  phoneNumber: string;
  nationalId: string;
  email: string;
  schoolName: string;
  state: string;
  classNo: string;
  details: TutorialsDetail[];
}

export interface TutorialsDetail {
  id: number;
  tutorialId: number;
  tutorialName: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export interface AllRegisterAnalyasis {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: RegisterAnalyasis[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface RegisterAnalyasis {
  schoolName: string;
  subscribeCount: number;
  totalRegister: number;
}
export interface ExamAnalyasis {
  successCount: number;
  failCount: number;
  totalCount: number;
  studentsCount: number;
  subscribersCount: number;
  activeSubscribersCount: number;
}

export interface AllPaymentInfo {
  totalAmount: number;
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: PaymentRecord[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// interface PaymentRecord {
//   id: number;
//   studentName: string;
//   schoolName: string;
//   paymentDate: string;
//   totalAmount: number;
//   phone: string;
//   paymentStatus: number;
// }

export interface PaymentRecord {
  id: number;
  studentName: string;
  schoolName?: string;
  paymentDate: string;
  totalAmount: number;
  phone: string;
  paymentStatus: number;
}

export interface FreeSubscriptionStudent {
  id: number;
  name: string;
  schoolName?: string;
  freeTutorials: ID_Name[];
}

export interface AllFreeSubscriptionStudents {
  statusCode: number;
  isSuccess: boolean;
  message: string | null;
  data: FreeSubscriptionStudent[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
