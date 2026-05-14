import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
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
import { ParentService } from '../../services/parent.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-attach-parent-to-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attach-parent-to-student.component.html',
  styleUrl: './attach-parent-to-student.component.scss',
})
export class AttachParentToStudentComponent implements OnInit {
  @Input() parentId: number = 0;
  @Output() fetchParentstds: EventEmitter<any> = new EventEmitter<any>();
  formBuilder = inject(FormBuilder);
  ParentService = inject(ParentService);
  toastr = inject(ToastrService);
  formData!: FormGroup;
  isLoading: boolean = false;
  submitted: boolean = false;
  modal: boolean = false;
  ngOnInit() {
    this.formData = this.formBuilder.group({
      parentUserId: [''],
      studentReferenceKey: ['', [Validators.required]],
    });
  }
  showModal(): void {
    this.formData.reset();
    this.modal = true;
  }
  hideModal(): void {
    this.modal = false;
  }
  onSubmit() {
    this.submitted = true;
    if (this.formData.invalid) {
      return;
    }
    this.formData.controls['parentUserId'].setValue(this.parentId);
    this.isLoading = true;
    this.ParentService.attachParentToStudent(this.formData.value).subscribe({
      next: ({ msg, statusCode }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.fetchParentstds.emit({ parentId: this.parentId });
          this.modal = false;
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
}
