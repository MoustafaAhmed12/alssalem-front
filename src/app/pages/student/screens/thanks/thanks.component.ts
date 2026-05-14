import { Component, inject, OnInit, signal } from '@angular/core';
import { PaymentService } from '../../../dashboard/services/payment.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
export interface Root {
  id: number;
  studentName: string;
  schoolName: string;
  paymentDate: string;
  amount: number;
  discount: number;
  totalAmount: number;
  phone: string;
  details: Detail[];
}

export interface Detail {
  id: number;
  tutorialId: number;
  tutorialName: string;
  amount: number;
}

@Component({
  selector: 'app-thanks',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './thanks.component.html',
  styleUrl: './thanks.component.scss',
})
export class ThanksComponent implements OnInit {
  paymentService = inject(PaymentService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  isLoading = signal<boolean>(false);
  studentData = signal<Root>({} as Root);
  ngOnInit() {
    this.route.params.subscribe((params) => {
      const orderId = parseInt(params['orderId']);
      this.fetchPaymentById(orderId);
    });
  }
  fetchPaymentById(paymentId: any): void {
    this.isLoading.set(true);
    this.paymentService.getPaymentById(paymentId).subscribe({
      next: ({ statusCode, result, mag }) => {
        if (statusCode === 200) {
          this.studentData.set(result);
          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  goToTutorial(tutorialId: number): void {
    console.log(tutorialId);
    this.router.navigate([`/tutorial/`, tutorialId]);
  }
}
