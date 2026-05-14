import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { IMAGE_CONFIG } from '@angular/common';
import {
  provideRouter,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import {
  HttpClient,
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './authentication/services/auth.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppConfigService } from './shared/services/app-config.service';

export function initializeAppFn(configService: AppConfigService) {
  return () =>
    new Promise((resolve) => {
      const hideLoader = () => {
        const loader = document.getElementById('app-loader');
        if (loader) {
          loader.style.setProperty('display', 'none', 'important');
          loader.remove(); // 🔥 نحذفه تماماً من الصفحة عشان ميفضلش موجود
        }
      };

      // If it's the main domain, we skip the API call for dynamic configuration
      if (configService.isMainDomain()) {
        hideLoader();
        resolve(true);
        return;
      }

      configService.getApiUrl().subscribe({
        next: () => {
          hideLoader();
          resolve(true);
        },
        error: () => {
          hideLoader();
          resolve(true);
        },
      });
    });
}

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (
  http: HttpClient,
) => new TranslateHttpLoader(http, './assets/i18n/', '.json');
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadingWarning: true,
      },
    },
    provideRouter(
      routes,
      withViewTransitions(),
      withRouterConfig({ onSameUrlNavigation: 'ignore' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideToastr({
      timeOut: 2000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing',
    }),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ]),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFn,
      deps: [AppConfigService],
      multi: true,
    },
    provideAnimations(),
  ],
};
