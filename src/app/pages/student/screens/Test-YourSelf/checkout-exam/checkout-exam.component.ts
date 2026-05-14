import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TestYourselfService } from '../../../services/test-yourself.service';
import { CurrencyPipe, NgClass } from '@angular/common';
import { NavbarComponent } from '../../../../../shared/components/navbar/navbar.component';
@Component({
  selector: 'app-checkout-exam',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, CurrencyPipe, NavbarComponent],
  templateUrl: './checkout-exam.component.html',
  styleUrl: './checkout-exam.component.scss',
})
export class CheckoutExamComponent implements OnInit {
  testYourselfService = inject(TestYourselfService);
  examDetails: any;
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  paymentForm!: FormGroup;
  isLoading = signal<boolean>(false);
  isLoading1 = signal<boolean>(false);
  isLoading2 = signal<boolean>(false);
  examId: number = 0;
  totalPrice: number = 0;
  currentDate: string = '';
  submitted: boolean = false;
  submitted2: boolean = false;
  ngOnInit() {
    // To Get Date Now
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because getMonth() returns 0-indexed month
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.currentDate = `${year}-${month}-${day}`;
    this.route.params.subscribe((params) => {
      this.examId = parseInt(params['id']);
      this.fetchExamById(this.examId);
    });
    this.paymentForm = this.fb.group({
      amount: [0],
      paymentDate: [currentDate],
      examId: [this.examId],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }
  onSubmitCreatePayment(): void {
    this.submitted2 = true;
    if (this.paymentForm.invalid) {
      this.toastr.error('تأكد من إدخال رقم الجوال');
      return;
    }
    this.isLoading2.set(true);
    this.testYourselfService
      .createExamPayment(this.paymentForm.value)
      .subscribe({
        next: ({ statusCode, result, msg }) => {
          if (statusCode === 200) {
            if (result === null) {
              this.router.navigate(['/test-yourself/exam/', this.examId]);
            } else {
              window.location.href = result;
            }
            this.isLoading2.update((v) => (v = false));
          } else {
            this.toastr.error(msg);
            this.isLoading2.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading2.update((v) => (v = false));
        },
      });
  }
  fetchExamById(examId: number): void {
    this.isLoading.set(true);
    this.testYourselfService.getExamDetailsForPayment(examId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          this.examDetails = result;
          this.paymentForm.get('amount')?.setValue(this.examDetails.price);
          this.isLoading.update((v) => (v = false));
        } else {
          this.toastr.error(msg);
          this.isLoading.update((v) => (v = false));
        }
      },
      error(err) {
        console.log(err);
      },
    });
  }
}
