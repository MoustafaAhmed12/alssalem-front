import {
  Component,
  inject,
  signal,
  effect,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeUrlPipe } from '../../../../shared/Pipes/safe-url.pipe';
// @ts-ignore
import Plyr from 'plyr';

@Component({
  selector: 'app-explain-video',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './explain-video.component.html',
  styleUrl: './explain-video.component.scss',
})
export class ExplainVideoComponent implements OnDestroy, OnInit {
  player: Plyr | undefined;
  route = inject(ActivatedRoute);
  videoId = signal<string>('');
  isPlaying = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.isPlaying()) {
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
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.videoId.set(params['id']);
    });
  }

  getThumbnailUrl(): string {
    return `https://img.youtube.com/vi/${this.videoId()}/hqdefault.jpg`;
  }

  getEmbedUrl(): string {
    return `https://www.youtube.com/embed/${this.videoId()}?origin=https://plyrio.com&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
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
