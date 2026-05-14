import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-card-number',
  standalone: true,
  imports: [],
  templateUrl: './card-number.component.html',
  styleUrl: './card-number.component.scss',
})
export class CardNumberComponent {
  @Input() cart: any;
}
