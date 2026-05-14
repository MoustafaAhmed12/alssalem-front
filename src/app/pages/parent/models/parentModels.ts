export interface StudentDetailsParent {
  id: number;
  name: string;
  classNo: string;
  state: string;
  tutorials: Tutorial[];
}
export interface Tutorial {
  id: number;
  tutorialName: string;
  advancePercentage: number;
}
