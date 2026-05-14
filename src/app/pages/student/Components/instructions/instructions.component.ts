import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeUrlPipe } from '../../../../shared/Pipes/safe-url.pipe';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './instructions.component.html',
  styleUrl: './instructions.component.scss',
})
export class InstructionsComponent {
  route = inject(ActivatedRoute);
  id = signal<number>(0);
  isPlaying = signal<boolean>(false);

  constructor() {
    this.route.params.subscribe((params) => {
      this.id.set(parseInt(params['tutorialId']));
    });
  }

  getVideo(): string {
    if (this.id() === 3 || this.id() === 4) {
      return 'https://www.youtube.com/embed/8R3X0bm8B8k?si=WFbkAfCdlok2MhZA';
    }
    {
      return 'https://www.youtube.com/embed/-th4XulBIH0?si=TaqQcux60XK-BEdM';
    }
  }
}
