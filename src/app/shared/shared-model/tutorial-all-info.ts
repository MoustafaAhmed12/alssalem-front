export interface Attachment {
  id: number;
  link: string;
  isDeleted: boolean;
}
export interface Exam {
  id: number;
  examName: string;
  examId: number;
  isDeleted: boolean;
}
export interface Detail {
  id: number;
  name: string;
  order: number;
  videoUrl: string;
  videoId: number;
  examId: number;
  isDeleted: boolean;
  attachmentName: string;
  attachmentLink: string;
}
export interface Unit {
  id: number;
  name: string;
  sortNumber: number;
  isDeleted: boolean;
  details: Detail[];
}
export interface TutorialAllInfo {
  id: number;
  name: string;
  units: Unit[];
  attachments: Attachment[];
}
export interface TutorialCard {
  id: number;
  name: string;
  isBought: boolean;
  priceBeforeDiscount: number;
  price: number;
  teacherName: string;
  subCategoryName: string;
  img: string;
  parentCategoryName: string;
  orderInScreen: number;
}
