import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tutorialInfo } from '../../../../model/profile';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-table-tutorials',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './table-tutorials.component.html',
  styleUrl: './table-tutorials.component.scss',
})
export class TableTutorialsComponent {
  @Input() tutorials!: tutorialInfo[];
  roundedNumber(num: number): number {
    return Math.round(num);
  }
}
