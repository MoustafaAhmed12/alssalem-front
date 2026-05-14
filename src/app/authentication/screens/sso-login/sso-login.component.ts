import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sso-login',
  standalone: true,
  imports: [],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6 relative overflow-hidden font-['Alexandria']"
      dir="rtl"
    >
      <!-- Logo at top right -->
      <div
        class="absolute top-8 right-8 z-20 transform transition-transform duration-700 hover:scale-110"
      >
        <div class="w-24 h-24 lg:w-32 lg:h-32 relative">
          <div
            class="absolute inset-0 bg-blue-600/5 rounded-full blur-xl opacity-20"
          ></div>
          <img
            src="assets/imgs/logo2.webp"
            alt="Al-Salem Logo"
            class="relative w-full h-full object-contain drop-shadow-sm"
          />
        </div>
      </div>

      <!-- Background Decorations -->
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 2s"
      ></div>

      <div
        class="max-w-xl w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 lg:p-14 text-center border border-white/40 z-10"
      >
        <!-- Welcome Text -->
        <h1
          class="text-3xl lg:text-4xl font-black text-slate-800 mb-8 leading-tight"
        >
          <span class="block mb-5">أهلاً بك في منصة</span>
          <span
            class="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent block lg:inline-block py-2"
            >السالم التعليمية
          </span>
        </h1>

        <div class="space-y-6 mb-12">
          <p class="text-slate-600 text-xl leading-relaxed font-medium">
            نحن متحمسون جداً لبدء رحلتك التعليمية معنا! 🚀
          </p>
          <p class="text-slate-500 text-lg">
            بيئة تعليمية ذكية، صممنا كل تفصيلة فيها لتناسب طموحك وتساعدك على
            التفوق والنجاح.
          </p>
        </div>

        <!-- Status Indicator -->
        <div class="flex flex-col items-center pt-4">
          <div class="flex space-x-2 space-x-reverse mb-8">
            <div
              class="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"
            ></div>
            <div
              class="w-3 h-3 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"
            ></div>
            <div
              class="w-3 h-3 bg-primary/60 rounded-full animate-bounce"
            ></div>
          </div>

          <div
            class="inline-flex items-center px-8 py-4 bg-primary/5 text-primary rounded-full text-base font-bold shadow-sm border border-primary/10"
          >
            <span class="ml-3">جاري تحويلك للمنصة الآن...</span>
            <svg
              class="animate-spin h-5 w-5 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Footer Decoration -->
      <div
        class="absolute bottom-8 text-slate-400 text-xs tracking-widest uppercase font-medium"
      >
        Al-Salem Educational Platform © 2024
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      @keyframes pulse {
        0%,
        100% {
          opacity: 0.2;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(1.05);
        }
      }
      .animate-pulse {
        animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `,
  ],
})
export class SSOLoginComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const path = params['path'];
      if (token) {
        this.loginWithToken(token, path);
      } else {
        this.toastr.error('التوكين غير صالح');
        this.router.navigate(['/login']);
      }
    });
  }

  private loginWithToken(token: string, path?: string): void {
    this.authService.getStudentData(token).subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.isSuccess) {
          setTimeout(() => {
            if (path) {
              this.router.navigateByUrl(path);
            } else {
              this.router.navigate(['/']);
            }
          }, 2500);
        } else {
          this.toastr.error(res.msg || 'حدث خطأ أثناء تسجيل الدخول');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.toastr.error('حدث خطأ في الاتصال بالخادم');
        this.router.navigate(['/login']);
      },
    });
  }
}
