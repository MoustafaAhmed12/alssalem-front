import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../../dashboard/services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../authentication/services/auth.service';
@Component({
  selector: 'app-comfirm-payment',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirm-payment.component.html',
  styleUrl: './confirm-payment.component.scss',
})
export class ComfirmPaymentComponent implements OnInit {
  authService = inject(AuthService);

  paymentService = inject(PaymentService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
  isLoading = signal<boolean>(false);
  isSuccess = signal<boolean>(false);
  tutorialId: number = 0;
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
          if (result.paymentStatus === 'PaymentReceived') {
            this.isSuccess.set(true);
            console.log(result);
            setTimeout(() => {
              this.router.navigate([`/thank-you/`, result.id]);
            }, 5000);
          } else {
            this.isSuccess.set(false);
          }
          this.tutorialId = result.details[0].tutorialId;
          this.isLoading.update((v) => (v = false));
        } else {
          this.isLoading.update((v) => (v = false));
          this.toastr.error(mag);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  goToTutorial(): void {
    this.router.navigate([`/tutorial/`, this.tutorialId]);
  }

  // toCheckout(): void {
  //   if (this.authService.isAuth() === true) {

  //       this.router.navigate([
  //         '/checkout',
  //         this.theMainDetails.id,
  //         {
  //           isPackage: false,
  //         },
  //       ]);

  //   } else {
  //     this.toastr.warning('يجب عليك تسجيل الدحول أولاً');
  //     this.router.navigate(['/login']);
  //   }
  // }
}
