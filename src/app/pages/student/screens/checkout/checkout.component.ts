import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../../authentication/services/auth.service';
import { PaymentService } from '../../../dashboard/services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

interface PackageDetails {
  id: number;
  name: string;
  price: number;
  tutorials: Tutorial[];
}

interface Tutorial {
  id: number;
  name: string;
  price: number;
}

interface PromoDetails {
  promoCode: string;
  id: number;
  isPrecent: boolean;
  startDate: string;
  endDate: string;
  tutorialId: any;
  discountPercentage: number;
  freeTutorials: string[];
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  paymentService = inject(PaymentService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  packageDetails: PackageDetails = {} as PackageDetails;
  tutorialDetails: Tutorial = {} as Tutorial;
  freeTutorials: string[] = [];
  amount: number = 0;
  dicountInPrice: number = 0;
  phone: string = '';
  userId: number = 0;
  isLoading = signal<boolean>(false);
  isLoading2 = signal<boolean>(false);
  location = inject(Location);
  id: number = 0;
  promoCode: string = '';
  totalPrice: number = 0;
  currentDate!: Date;
  isPackage: boolean = false;
  tutorialsIds: number[] = [];
  tutorials: { tutorialId: number; amount: number }[] = [];

  ngOnInit() {
    // To Get Date Now
    this.currentDate = new Date();
    // const year = currentDate.getFullYear();
    // const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    // const day = currentDate.getDate().toString().padStart(2, '0');
    // this.currentDate = `${year}-${month}-${day}`;
    this.userId = this.authService.currentUser().userDto.id;

    this.isPackage = Boolean(
      this.route.snapshot.queryParamMap.get('isPackage')
    );
    this.route.params.subscribe((params) => {
      this.id = +params['id'];
      const code = params['code'];
      this.isPackage = JSON.parse(params['isPackage']);
      if (code) {
        this.promoCode = code;
      }
    });
    if (this.isPackage) {
      this.fetchPackageById(this.id);
    } else {
      this.fetchTutorialById(this.id);
    }
  }
  onSubmitCreatePayment(): void {
    if (!this.phone) {
      this.toastr.error('تأكد من إدخال رقم الجوال');
      return;
    }
    this.isLoading2.set(true);
    const info = {
      userId: this.userId,
      amount: this.amount,
      discount: this.dicountInPrice,
      paymentDate: this.currentDate,
      promoCode: this.promoCode.toUpperCase(),
      tutorials: this.tutorials,
      phone: this.phone,
    };
    this.paymentService.createPayment(info).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          this.isLoading2.update((v) => (v = false));
          if (result === null) {
            if (this.isPackage) {
              this.router.navigate(['/package/', this.id]);
            } else {
              this.router.navigate(['/tutorial/', this.id]);
            }
            this.toastr.success(msg);
          } else {
            window.location.href = result;
          }
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

  onSubmitPromoCode(): void {
    if (!this.promoCode) {
      this.toastr.error('تأكد من إدخال الكود');
      return;
    }
    this.isLoading.set(true);
    const obj = {
      promoCode: this.promoCode,
      tutorialsIds: this.isPackage ? this.tutorialsIds : [this.id],
    };
    this.paymentService.getPromoCodeByPromoCode(obj).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          const promo = result as PromoDetails;
          this.freeTutorials = promo.freeTutorials;
          const dicount = promo.discountPercentage;
          if (promo.isPrecent) {
            if (this.isPackage) {
              const temp = this.packageDetails.price * (dicount / 100);
              this.totalPrice = this.packageDetails.price - temp;
              this.dicountInPrice = temp;
            } else {
              const temp = this.tutorialDetails.price * (dicount / 100);
              this.totalPrice = this.tutorialDetails.price - temp;
              this.dicountInPrice = temp;
            }
          } else {
            if (this.isPackage) {
              this.dicountInPrice = this.packageDetails.price - dicount;
              this.totalPrice = dicount;
            } else {
              this.dicountInPrice = this.tutorialDetails.price - dicount;
              this.totalPrice = dicount;
            }
          }
          this.isLoading.update((v) => (v = false));
        } else {
          this.toastr.error('لم يتم العثور على رمز ترويجي');
          this.isLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }

  fetchTutorialById(tutorialId: number): void {
    this.isLoading.set(true);
    this.paymentService.tutorialDetails(tutorialId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          this.tutorialDetails = result;
          this.amount = this.tutorialDetails.price;
          this.tutorials = [
            {
              tutorialId: this.tutorialDetails.id,
              amount: this.amount,
            },
          ];
          this.isLoading.update((v) => (v = false));
          if (this.promoCode) {
            this.onSubmitPromoCode();
          }
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
  fetchPackageById(packageId: any): void {
    this.isLoading.set(true);
    this.paymentService.packageDetails(packageId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          this.packageDetails = result;
          this.amount = this.packageDetails.price;
          this.tutorialsIds = this.packageDetails.tutorials.map(
            (t: any) => t.id
          );
          this.tutorials = this.packageDetails.tutorials.map((t: any) => ({
            tutorialId: t.id,
            amount: t.price,
          }));
          this.isLoading.update((v) => (v = false));
          if (this.promoCode) {
            this.onSubmitPromoCode();
          }
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
  activeIndex = -1;
  toggleItem(index: number) {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }
}
