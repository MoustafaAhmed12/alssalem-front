import { Component, inject, OnInit, signal } from '@angular/core';
import { ArticleService } from '../../../dashboard/services/article.service';
import { PreserveNewlineWithSvgPipe } from '../../../../shared/Pipes/preserve-newline-with-svg.pipe';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from '../../../../shared/services/seo.service';
@Component({
  selector: 'app-article-student',
  standalone: true,
  imports: [PreserveNewlineWithSvgPipe, FormsModule],
  templateUrl: './article-student.component.html',
  styleUrl: './article-student.component.scss',
})
export class ArticleStudentComponent implements OnInit {
  articleService = inject(ArticleService);
  seoService = inject(SeoService);
  allArticle: { id: number; title: string }[] = [];
  article!: { id: number; title: string; content: string; imageUrl: string };
  isLoading = signal<boolean>(false);
  isLoadingOne = signal<boolean>(false);
  pageNumber: number = 1;
  pageSize: number = 20;
  keyWord: string = '';
  articleId: number = 0;

  ngOnInit() {
    this.seoService.setDynamicMeta({
      title: 'منصة السالم - مقالات | دليل شامل للقدرات والتحصيلي',
      description:
        'تعلم القدرات والتحصيلي مع منصة السالم. مقالات ودورات متكاملة لتحقيق أعلى الدرجات في الاختبارات.',
      url: 'https://alssalem.com/article',
    });
    this.seoService.setBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://alssalem.com/' },
      { name: 'المقالات', url: 'https://alssalem.com/article' },
    ]);
    this.getAllArticle(this.pageNumber, this.pageSize);
  }
  getAllArticle(pageNumber: number, pageSize: number, keyWord?: string): void {
    this.isLoading.set(true);
    this.articleService
      .getPublicArticles(pageNumber, pageSize, keyWord)
      .subscribe({
        next: ({ result, statusCode }) => {
          if (statusCode === 200) {
            this.isLoading.update((v) => (v = false));
            this.allArticle = result;
          }
        },
        error: (err) => {
          this.isLoading.update((v) => (v = false));
          console.log(err);
        },
      });
  }
  search(): void {
    this.getAllArticle(this.pageNumber, this.pageSize, this.keyWord);
  }
  getDetails(id: number): void {
    this.articleId = id;
    this.getArticle(this.articleId);
  }
  getArticle(id: number): void {
    this.isLoadingOne.set(true);
    this.articleService.getPublicArticleById(id).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.isLoadingOne.update((v) => (v = false));
          this.article = result;
          this.setSeoTags(this.article);
        }
      },
      error: (err) => {
        this.isLoadingOne.update((v) => (v = false));
        console.log(err);
      },
    });
  }

  setSeoTags(article: any) {
    const description = article.content
      ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
      : article.title;
    const url = window.location.href;

    this.seoService.setDynamicMeta({
      title: `${article.title} | مقالات السالم`,
      description: description,
      url: url,
      image: article.imageUrl || 'https://alssalem.com/assets/imgs/logo2.webp',
    });

    this.seoService.setBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://alssalem.com/' },
      { name: 'المقالات', url: 'https://alssalem.com/article' },
      { name: article.title, url: url },
    ]);
  }
}
