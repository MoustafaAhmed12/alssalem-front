import {
  Component,
  inject,
  OnInit,
  Renderer2,
  Inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Meta,
  Title,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { QuestionsService } from '../../instructor/services/questions.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../authentication/services/auth.service';
import { ToastrService } from 'ngx-toastr';

declare var google: any;

export interface Root2 {
  id: number;
  answerUrl: string;
  correctChoice: number;
  difficulty: number;
  image1Url: string;
  image2Url: any;
  answer1: any;
  answer2: any;
  answer3: any;
  answer4: any;
  answer5: any;
  questionTypeId: number;
  skillId: number;
  keyWord?: string;
  slug?: string;
  text?: string;
  questionTypeName: string;
  skillName: string;
  isEnglish: boolean;
}

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
})
export class QuestionComponent implements OnInit {
  route = inject(ActivatedRoute);
  questionsService = inject(QuestionsService);
  titleService = inject(Title);
  metaService = inject(Meta);
  renderer = inject(Renderer2);
  private _document = inject(DOCUMENT);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  sanitizer = inject(DomSanitizer);

  mainQuestion: any;
  similarQuestions: any[] = [];
  isLoading = true;
  selectedChoice: number | null = null;
  isCorrect: boolean | null = null;
  id: number = 0;
  private schemaScript: HTMLScriptElement | null = null;
  showVideoPopup = signal<boolean>(false);

  ngOnInit(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: environment.clientId,
        callback: (resp: any) => {
          this.handleGoogleLogin(resp);
        },
      });
      google.accounts.id.prompt();
    }

    this.route.params.subscribe((params) => {
      this.id = +params['id'];
      if (this.id) {
        this.fetchQuestionExamples(this.id);
      }
    });
  }

  fetchQuestionExamples(id: number): void {
    this.isLoading = true;
    this.selectedChoice = null; // Reset selection on new question load
    this.isCorrect = null;

    this.questionsService.getPublicQuestionExamples(id).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200 && result?.length) {
          this.mainQuestion = result.find((q: any) => q.id === id) || result[0]; // Filter out the main question from similar questions
          this.similarQuestions = result.filter(
            (q: any) => q.id !== this.mainQuestion.id,
          );

          this.updateSEOTags();
          this.updateSchema();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  updateSEOTags(): void {
    if (!this.mainQuestion) return;

    // دالة لتنظيف النص من أي تاجات HTML أو مسافات زائدة
    const cleanText = (text: string) => {
      if (!text) return '';
      return text
        .replace(/<[^>]*>/g, '') // إزالة تاجات HTML
        .replace(/&nbsp;/g, ' ') // استبدال المسافات غير القابلة للكسر
        .replace(/\s+/g, ' ') // تقليل المسافات المتعددة لمسافة واحدة
        .trim();
    };

    const cleanQuestionText = cleanText(this.mainQuestion.text);
    const title = cleanQuestionText || 'منصة السالم التعليمية';

    const description = cleanQuestionText
      ? `حل سؤال: ${cleanQuestionText.substring(0, 160)}...`
      : 'شرح وحل أسئلة القدرات والتحصيلي بالتفصيل على منصة السالم التعليمية';

    const keywords =
      this.mainQuestion.keyWord || 'تعليم, اسئلة, اختبارات, قدرات, تحصيلي';
    const url = `https://alssalem.com/question/${this.mainQuestion.id}/${
      this.mainQuestion.slug || ''
    }`;
    const image =
      this.mainQuestion.image1Url ||
      this.mainQuestion.image2Url ||
      'https://alssalem.com/assets/images/logo.png';

    // تحديث العنوان والكلمات الدليلية
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

    // Canonical URL
    let link: HTMLLinkElement =
      this._document.querySelector("link[rel='canonical']") ||
      this.renderer.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    if (!link.parentNode) {
      this.renderer.appendChild(this._document.head, link);
    }

    // Open Graph tags (للفيسبوك والواتساب وتليجرام)
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({
      property: 'og:description',
      content: description,
    });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ property: 'og:image', content: image });

    // Twitter Card tags
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: description,
    });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
  }

  updateSchema(): void {
    if (!this.mainQuestion) return;

    // Use actual answer text if available, otherwise generic
    const getAnswerText = (index: number) => {
      const key = `answer${index}` as keyof typeof this.mainQuestion;
      const val = this.mainQuestion[key];
      if (val) return val;

      const choices = this.mainQuestion.isEnglish
        ? ['A', 'B', 'C', 'D']
        : ['أ', 'ب', 'ج', 'د'];
      return (
        choices[index - 1] ||
        (this.mainQuestion.isEnglish ? `Choice ${index}` : `الخيار ${index}`)
      );
    };

    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Quiz',
      name: this.mainQuestion.text,
      about: {
        '@type': 'Thing',
        name: this.mainQuestion.keyWord || 'Education',
      },
      hasPart: [
        {
          '@type': 'Question',
          name: this.mainQuestion.text,
          eduQuestionType: 'Multiple choice',
          acceptedAnswer: {
            '@type': 'Answer',
            text: getAnswerText(this.mainQuestion.correctChoice),
            position: this.mainQuestion.correctChoice,
          },
          suggestedAnswer: [1, 2, 3, 4]
            .filter((n) => n !== this.mainQuestion.correctChoice)
            .map((n) => ({
              '@type': 'Answer',
              text: getAnswerText(n),
              position: n,
            })),
        },
      ],
    };

    // Remove old script if exists
    if (this.schemaScript) {
      this.renderer.removeChild(this._document.head, this.schemaScript);
    }

    // Create and append new script
    this.schemaScript = this.renderer.createElement('script');
    this.schemaScript!.type = 'application/ld+json';
    this.schemaScript!.text = JSON.stringify(schema);
    this.renderer.appendChild(this._document.head, this.schemaScript);
  }

  onSelectChoice(choice: number): void {
    // If already selected, do nothing (or allow re-selection if desired)
    // Here we lock it after first selection as per "don't show answer until he chooses"
    if (this.selectedChoice !== null) return;

    this.selectedChoice = choice;
    this.isCorrect = choice === this.mainQuestion.correctChoice;
  }

  openVideoPopup(): void {
    this.showVideoPopup.set(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeVideoPopup(): void {
    this.showVideoPopup.set(false);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  getVideoEmbedUrl(url: string): SafeResourceUrl {
    if (!url) return '';

    let videoUrl = url;

    // YouTube URL conversion
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    // Google Drive URL conversion
    else if (url.includes('drive.google.com')) {
      const fileId = url.match(/[-\w]{25,}/)?.[0];
      videoUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

  handleGoogleLogin(response: any) {
    if (response.credential) {
      this.authService.googleLogin(response.credential, 'student').subscribe({
        next: ({ statusCode, result, msg }) => {
          if (statusCode === 200) {
            this.authService.setIsAuth(true);
            this.toastr.success('تم تسجيل الدخول بنجاح', 'مرحباً بك');
            // Reload the page to reflect the logged-in state
            window.location.reload();
          } else {
            this.toastr.error(msg || 'حدث خطأ أثناء تسجيل الدخول');
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('فشل تسجيل الدخول', 'خطأ');
        },
      });
    }
  }
}
