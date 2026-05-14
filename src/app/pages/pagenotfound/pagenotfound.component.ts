import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
@Component({
  selector: 'app-pagenotfound',
  standalone: true,
  imports: [],
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.scss',
})
export class PagenotfoundComponent {
  location = inject(Location);
  goBack(): void {
    this.location.back();
  }
}
