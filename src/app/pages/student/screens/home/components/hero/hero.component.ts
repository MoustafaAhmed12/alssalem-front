import {
  Component,
  OnInit,
  inject,
  signal,
  OnDestroy,
  effect,
} from '@angular/core';
// @ts-ignore
import Plyr from 'plyr';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../../authentication/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { SafeUrlPipe } from '../../../../../../shared/Pipes/safe-url.pipe';
import { AppConfigService } from '../../../../../../shared/services/app-config.service';
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgClass, RouterLink, TranslatePipe, SafeUrlPipe],
  templateUrl: './hero.component.html',
})
export class HeroComponent implements OnInit, OnDestroy {
  player: Plyr | undefined;

  appConfigService = inject(AppConfigService);
  authService = inject(AuthService);
  isAuth = signal<boolean>(false);
  openVideo = signal<boolean>(false);
  isPlaying = signal<boolean>(false);
  name = signal<string>('');
  description = signal<string>('');
  isMain = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.openVideo()) {
        setTimeout(() => {
          this.initPlyr();
        }, 100);
      } else {
        if (this.player) {
          this.player.destroy();
          this.player = undefined;
        }
      }
    });
  }

  ngOnInit() {
    this.isAuth.set(this.authService.isAuth());
    this.name.set(this.appConfigService.config()?.['name'] || '');
    this.isMain.set(this.appConfigService.isMainDomain());
    this.description.set(this.appConfigService.config()?.['description'] || '');
  }
  scrollToPosition() {
    window.scrollTo({
      top: 1500,
      behavior: 'smooth',
    });
  }
  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const offset = window.innerWidth < 768 ? 60 : 80;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  extractYouTubeId(): string {
    const regExp = /(?:youtube\.com.*(?:v=|\/embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = 'https://youtu.be/2cvP5rqGHFs'.match(regExp);
    return match ? match[1] : '';
  }

  getThumbnailUrl(): string {
    const videoId = this.extractYouTubeId();
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  getEmbedUrl(): string {
    const videoId = this.extractYouTubeId();
    return `https://www.youtube.com/embed/${videoId}?origin=https://plyrio.com&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
  }

  initPlyr() {
    const element = document.getElementById('plyr-player') as HTMLElement;
    if (element) {
      this.player = new Plyr(element, {
        controls: [
          'play-large',
          'restart',
          'rewind',
          'play',
          'fast-forward',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        settings: ['captions', 'quality', 'speed', 'loop'],
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
    }
  }
}
