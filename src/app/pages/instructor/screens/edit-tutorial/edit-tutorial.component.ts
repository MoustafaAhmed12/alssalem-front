import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TeacherService } from '../../services/teacher.service';
import { CommonModule } from '@angular/common';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import {
  Detail,
  TutorialAllInfo,
  Unit,
} from '../../../../shared/shared-model/tutorial-all-info';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  Form,
  FormAttachments,
  FormUnit,
  FormUnitContent,
} from '../../model/form-edit-tutorial';
import { ID_Name } from '../../../dashboard/model/admin-model';
@Component({
  selector: 'app-edit-tutorial',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TitleScreenComponent,
    NgSelectModule,
  ],
  templateUrl: './edit-tutorial.component.html',
  styleUrl: './edit-tutorial.component.scss',
})
export class EditTutorialComponent implements OnInit {
  fb = inject(NonNullableFormBuilder);
  teacherService = inject(TeacherService);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  tutorialDetails: any;
  tutorialId: number = 0;
  totalUnits: number = 1;
  submitted: boolean = false;
  tutorialForm!: Form;
  examsTutorials: ID_Name[] = [];
  allVideos: ID_Name[] = [];
  unitId = signal<number>(0);
  isLoading = signal<boolean>(false);
  ngOnInit() {
    this.route.queryParams.subscribe((query) => {
      this.unitId.set(parseInt(query['lenUnits']));
    });
    this.route.params.subscribe((params) => {
      this.tutorialId = parseInt(params['id']);
      this.fetchTeacherTutorialDetails({ tutorialId: this.tutorialId });
      this.fetchTeacherTutorialsExams({ tutorialId: this.tutorialId });
      this.fetchVideosDropdown();
    });
    this.tutorialForm = this.fb.group({
      id: [0],
      name: [null],
      attachments: this.fb.array([this.generateAttachmentContent()]),
      units:
        this.unitId() === 0
          ? this.fb.array<FormUnit>([this.generateUnit()])
          : this.fb.array<FormUnit>([]),
    });
  }
  // units
  get getUnits() {
    return this.tutorialForm.get('units') as FormArray;
  }
  generateUnit(): FormUnit {
    return this.fb.group({
      id: [0],
      name: [''],
      sortNumber: [''],
      detailsRequests: this.fb.array<FormUnitContent>([
        this.generateUnitContent(),
      ]),
      isDeleted: [false],
    });
  }
  addUnit(): void {
    this.getUnits.push(this.generateUnit());
    this.totalUnits = this.getUnits.value.length;
  }
  removeUnit(unitIndex: number): void {
    this.getUnits.at(unitIndex).get('isDeleted')?.setValue(true);
    const totalFilter = this.getUnits.controls.filter(
      (q) => !q.get('isDeleted')?.value
    ).length;
    this.totalUnits = totalFilter;
  }
  generateUnitContent(): FormUnitContent {
    return this.fb.group({
      id: [0],
      name: [''],
      order: [0],
      videoUrl: [''],
      videoId: [null],
      examId: [null],
      isDeleted: [false],
      attachmentName: [null],
      attachmentLink: [null],
    });
  }
  addUnitContent(unitIndex: number): void {
    this.tutorialForm.controls.units
      .at(unitIndex)
      ?.controls?.detailsRequests.push(this.generateUnitContent());
  }
  removeUnitContent(unitIndex: number, contentIndex: number): void {
    this.tutorialForm.controls.units
      .at(unitIndex)
      ?.controls?.detailsRequests.at(contentIndex)
      .get('isDeleted')
      ?.setValue(true);
  }
  onSelectVideo(item: any, unitIndex: number, contentIndex: number): void {
    if (item !== undefined) {
      this.tutorialForm.controls.units
        .at(unitIndex)
        ?.controls?.detailsRequests?.at(contentIndex)
        .get('videoUrl')
        ?.disable();
    } else {
      this.tutorialForm.controls.units
        .at(unitIndex)
        ?.controls?.detailsRequests?.at(contentIndex)
        .get('videoUrl')
        ?.enable();
    }
  }
  // For Attachments
  get attachments(): FormArray {
    return this.tutorialForm.get('attachments') as FormArray;
  }
  generateAttachmentContent(data?: {
    id: string;
    name: string;
    link: string;
  }): FormAttachments {
    return this.fb.group({
      id: [data?.id || 0],
      name: [data?.name || '', Validators.required],
      link: [
        data?.link || '',
        [Validators.required, Validators.pattern('https?://.+')],
      ],
    });
  }
  addRow(data?: { id: string; name: string; link: string }): void {
    if (data) {
      this.attachments.push(this.generateAttachmentContent(data));
    } else {
      this.attachments.push(this.generateAttachmentContent());
    }
  }
  removeRow(index: number): void {
    this.attachments.removeAt(index);
  }
  patchForm(data: { id: string; name: string; link: string }[]): void {
    this.attachments.clear();
    data.forEach((item) => {
      this.addRow(item);
    });
  }
  //////////////////////////
  fetchTeacherTutorialDetails(tutorialId: { tutorialId: number }): void {
    this.isLoading.set(true);
    this.teacherService.getTeacherTutorialDetails(tutorialId).subscribe({
      next: ({ result, statusCode, msg }) => {
        if (statusCode === 200) {
          this.tutorialDetails = result as TutorialAllInfo;
          this.patchForm(this.tutorialDetails.attachments);
          this.tutorialDetails.units.forEach((unit: Unit) => {
            const details = unit.details.map((detail: Detail) => {
              return this.fb.group({
                id: [detail.id],
                name: [detail.name],
                order: [detail.order],
                videoUrl: [
                  { value: detail.videoUrl, disabled: !!detail.videoId },
                ],
                videoId: [detail.videoId],
                examId: [detail.examId],
                isDeleted: [detail.isDeleted],
                attachmentName: [detail.attachmentName],
                attachmentLink: [detail.attachmentLink],
              });
            });
            this.getUnits.push(
              this.fb.group({
                id: [unit.id],
                name: [unit.name],
                sortNumber: [unit.sortNumber],
                isDeleted: [unit.isDeleted],
                detailsRequests: this.fb.array(details),
              })
            );
          });
          this.isLoading.update((v) => (v = false));
        } else {
          this.toastr.error(msg);
          this.isLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        this.isLoading.update((v) => (v = false));
        console.log(err);
      },
    });
  }
  onSubmit(): void {
    this.submitted = true;
    this.tutorialForm.get('id')?.setValue(this.tutorialDetails.id);
    this.tutorialForm.get('name')?.setValue(this.tutorialDetails.name);
    if (this.tutorialForm.invalid) {
      this.toastr.error('تأكد ان جيمع البيانات مُدخلة');
      return;
    }
    this.isLoading.set(true);
    this.teacherService
      .saveTeacherTutorialDetails(this.tutorialForm.value)
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading.update((v) => (v = false));
            this.router.navigateByUrl('/instructor');
          } else {
            this.toastr.error(msg);
            this.isLoading.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
  }
  fetchTeacherTutorialsExams(teacherId: any): void {
    this.teacherService.getTeacherTutorialsExams(teacherId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.examsTutorials = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  fetchVideosDropdown(): void {
    this.teacherService.getVideosDropdown().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allVideos = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
