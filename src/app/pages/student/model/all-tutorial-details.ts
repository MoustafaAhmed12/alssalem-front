export interface MainDetails {
  id: number;
  name: string;
  priceBeforeDiscount: number;
  price: number;
  durationInWeeks: number;
  numberOfStudents: number;
  chaptersCount: number;
  examsCount: number;
  description: string;
  img: string;
  categoryName: string;
  parentCategory: string;
  teacherName: string;
  isOpen: boolean;
  subscribe: Subscribe;
}

export interface Subscribe {
  studentProgressPrecent: number;
  startDate: string;
  endDate: string;
  lastExamId: number;
}

export interface Units {
  units: { id: number; name: string }[];
  firstUnitChapters: UnitChapter[];
  isSubscribed: boolean;
  tutorialName: string;
}

export interface UnitChapter {
  id: number;
  name: string;
  exam: {
    id: number;
    name: string;
    isSuccess: boolean;
  };
}

export interface Attachment {
  id: number;
  name: string;
  link: any;
}
export interface AllComment {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  comments: Comment[];
}

export interface Comment {
  id: number;
  comment: string;
  userId: number;
  userName: string;
  createdAt: string;
  rate: number;
}
