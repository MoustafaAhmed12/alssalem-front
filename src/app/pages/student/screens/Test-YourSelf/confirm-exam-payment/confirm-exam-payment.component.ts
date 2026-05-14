import { Component, inject, OnInit, signal } from '@angular/core';
import { TestYourselfService } from '../../../services/test-yourself.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../../../shared/components/navbar/navbar.component';
@Component({
  selector: 'app-confirm-exam-payment',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './confirm-exam-payment.component.html',
  styleUrl: './confirm-exam-payment.component.scss',
})
export class ConfirmExamPaymentComponent implements OnInit {
  testYourselfService = inject(TestYourselfService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  isLoading = signal<boolean>(false);
  isSuccess = signal<boolean>(false);
  ngOnInit() {
    this.route.params.subscribe((params) => {
      const orderId = parseInt(params['orderId']);
      this.fetchPaymentById(orderId);
    });
  }
  fetchPaymentById(paymentId: any): void {
    this.isLoading.set(true);
    this.testYourselfService.getExamPaymentResponse(paymentId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          if (result) {
            this.isSuccess.set(true);
            setTimeout(() => {
              this.router.navigate([`/test-yourself/exam/`, result]);
            }, 4000);
          } else {
            this.isSuccess.set(false);
          }
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
  goToTestYourself(): void {
    this.router.navigate([`/test-yourself`]);
  }
}
