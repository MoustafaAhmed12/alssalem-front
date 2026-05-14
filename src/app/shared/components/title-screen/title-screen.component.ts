import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-title-screen',
  standalone: true,
  imports: [],
  templateUrl: './title-screen.component.html',
  styleUrl: './title-screen.component.scss',
})
export class TitleScreenComponent {
  @Input() title: string = '';
}
