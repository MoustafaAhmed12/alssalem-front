import { FormArray, FormControl, FormGroup } from '@angular/forms';
export type FormUnitContent = FormGroup<{
  id: FormControl;
  name: FormControl;
  order: FormControl;
  videoUrl: FormControl;
  videoId: FormControl;
  examId: FormControl;
  isDeleted: FormControl;
  attachmentName: FormControl;
  attachmentLink: FormControl;
}>;
export type FormUnit = FormGroup<{
  id: FormControl;
  name: FormControl;
  sortNumber: FormControl;
  isDeleted: FormControl;
  detailsRequests: FormArray<FormUnitContent>;
}>;
export type FormAttachments = FormGroup<{
  id: FormControl;
  name: FormControl;
  link: FormControl;
}>;
export type Form = FormGroup<{
  id: FormControl;
  name: FormControl;
  attachments: FormArray<FormAttachments>;
  units: FormArray<FormUnit>;
}>;
