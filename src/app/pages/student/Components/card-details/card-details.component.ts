import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainDetails } from '../../model/all-tutorial-details';

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss',
})
export class CardDetailsComponent {
  @Input() toCheckoutFn!: () => void;
  @Input() theMainDetails: MainDetails = {} as MainDetails;
  @Input() isLoading: boolean = false;
  toCheckout(): void {
    this.toCheckoutFn();
  }
}
