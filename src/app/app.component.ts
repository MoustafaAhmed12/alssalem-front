import { Component, inject, effect, signal, OnInit } from '@angular/core';
import { AuthService } from './authentication/services/auth.service';
import { UserTrackerService } from './shared/services/user-tracker.service';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AppConfigService } from './shared/services/app-config.service';
import { AiAssistantComponent } from './shared/components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AiAssistantComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);
  userTrackerService = inject(UserTrackerService);
  appConfigService = inject(AppConfigService);

  constructor() {
    effect(() => {
      if (this.authService.isAuth()) {
        this.userTrackerService.startConnection();
      } else {
        this.userTrackerService.stopConnection();
      }
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const fragment = this.router.parseUrl(this.router.url).fragment;
        if (!fragment) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        }
      }
    });
  }
}
