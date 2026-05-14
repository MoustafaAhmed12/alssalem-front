import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-action-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './action-category.component.html',
})
export class ActionCategoryComponent implements OnInit {
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  service = inject(CategoryService);

  form: FormGroup;
  id: number = 0;

  parentCategories = [
    { id: 1, name: 'قدرات' },
    { id: 2, name: 'تحصيلي' },
    { id: 3, name: 'موهبة' },
    { id: 4, name: 'قدرات باللغة الإنجليزية' },
    // { id: 17, name: 'البرامج التقنية' },
  ];

  constructor() {
    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      parentCategoryId: [null, Validators.required],
      isVisibleToFront: [true],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.id = +params['id'];
        if (this.id !== 0) {
          this.getById(this.id);
        } else {
          this.form.get('id')?.setValue(0);
        }
      }
    });
  }

  getById(id: number) {
    this.service.getCateogryById(id).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.form.patchValue({
            id: result.id,
            name: result.name,
            parentCategoryId: result.parentId,
            isVisibleToFront: result.isVisibleToFront,
          });
        } else {
          this.toastr.error('حدث خطأ');
        }
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('حدث خطأ');
      },
    });
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.id === 0) {
        this.form.get('id')?.setValue(0);
      }
      let formData = {
        ...this.form.value,
        parentCategoryId: Number(this.form.get('parentCategoryId')?.value),
      };
      this.service.saveCategory(formData).subscribe({
        next: ({ statusCode }) => {
          if (statusCode === 200) {
            this.router.navigate(['/admin/categories']);
            this.toastr.success('تم الحفظ بنجاح');
          }
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('حدث خطأ');
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
