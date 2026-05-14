import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tutorial {
  id: number;
  name: string;
  percent: number;
}

interface TrailResult {
  trailId: number;
  percentage: number;
  creationDate: string;
  timeTakenInSec: number;
  tutorials: Tutorial[];
}

@Component({
  selector: 'app-result-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-popup.component.html',
  styles: [],
})
export class ResultPopupComponent {
  result = input.required<TrailResult>();
  isOpen = signal(true);

  closePopup() {
    this.isOpen.set(false);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}د ${secs}ث` : `${secs}ث`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
