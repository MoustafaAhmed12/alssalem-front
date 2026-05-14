import { Component, inject, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-actions-article',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './actions-article.component.html',
  styleUrl: './actions-article.component.scss',
})
export class ActionsArticleComponent implements OnInit {
  articleService = inject(ArticleService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);
  toastr = inject(ToastrService);
  articleId: number = 0;
  submitted = false;
  isLoading: boolean = false;
  previewImageUrl: string = '';
  base64Image: any = '';
  formData!: FormGroup;
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.articleId = parseInt(params['id']);
      if (this.articleId > 0) {
        this.fetchArticleById(this.articleId);
      }
    });
    this.formData = this.formBuilder.group({
      id: [this.articleId === 0 ? 0 : this.articleId],
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      imageBase64: [''],
    });
  }
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      this.convertToBase64(file);
    }
  }
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.convertToBase64(files[0]);
    }
  }
  convertToBase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const imgbase = reader.result;
      this.formData.get('imageBase64')?.patchValue(imgbase);
      this.previewImageUrl = reader.result as string;
    };
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  removeImage(): void {
    this.formData.get('imageBase64')?.patchValue(null);
    this.previewImageUrl = '';
  }
  onSubmit() {
    this.submitted = true;
    if (this.formData.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.articleId === 0) {
      this.articleService.addArticle(this.formData.value).subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading = false;
            this.router.navigateByUrl('/admin/article');
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
    } else {
      this.articleService.updateArticle(this.formData.value).subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.toastr.success(msg);
            this.isLoading = false;
            this.router.navigateByUrl('/admin/article');
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
  fetchArticleById(articleId: number): void {
    this.isLoading = true;
    this.articleService.getArticleById(articleId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          const article = result as {
            id: number;
            title: string;
            content: string;
            imageUrl: string;
          };
          this.previewImageUrl = article.imageUrl;
          this.isLoading = false;
          this.formData.patchValue({
            id: article.id,
            title: article.title,
            content: article.content,
            imageBase64: article.imageUrl,
          });
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
    });
  }
}
