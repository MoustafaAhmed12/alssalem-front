import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import '@mux/mux-player';
import { AuthService } from '../../../../../authentication/services/auth.service';
import { TeacherService } from '../../../services/teacher.service';
import { TitleScreenComponent } from '../../../../../shared/components/title-screen/title-screen.component';
@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, TitleScreenComponent],
  templateUrl: './video-upload.component.html',
  styleUrl: './video-upload.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VideoUploadComponent implements OnInit {
  @Output() fetchVideos: EventEmitter<any> = new EventEmitter<any>();
  authService = inject(AuthService);
  teacherService = inject(TeacherService);
  toastr = inject(ToastrService);
  isLoading: boolean = false;
  submitted: boolean = false;
  currentUser: any;
  fb = inject(FormBuilder);
  uploadForm!: FormGroup;
  videoFile: File | null = null;
  videoUrl!: string;
  ngOnInit() {
    this.currentUser = this.authService.currentUser().userDto;
    this.uploadForm = this.fb.group({
      videoFile: ['', [Validators.required]],
      teacherId: [this.currentUser.id],
      fileName: ['', [Validators.required]],
    });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.videoFile = input.files[0];
      this.uploadForm.patchValue({ videoFile: this.videoFile });
    }
  }
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.videoFile = files[0];
      this.uploadForm.patchValue({ videoFile: this.videoFile });
    }
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  onSubmit(): void {
    this.submitted = true;
    if (this.uploadForm.invalid) {
      this.toastr.error('تأكد من رفع الفيديو');
      return;
    }
    if (!this.videoUrl) {
      this.toastr.info('جاري تحميل الفيديو...');
    }
    if (this.uploadForm.valid && this.videoFile) {
      const formData = new FormData();
      formData.append('videoFile', this.videoFile);
      formData.append('teacherId', this.uploadForm.get('teacherId')?.value);
      formData.append('fileName', this.uploadForm.get('fileName')?.value);
      this.isLoading = true;
      this.teacherService.uploadVideo(formData).subscribe({
        next: ({ result, msg }) => {
          if (result) {
            this.fetchVideos.emit({ userId: this.currentUser.id });
            this.videoUrl = result;
            this.isLoading = false;
            this.toastr.success(msg);
          } else {
            this.isLoading = false;
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.log(err);
        },
      });
    }
  }
}
