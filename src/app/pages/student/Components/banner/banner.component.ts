import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TutorilsStudentsService } from '../../services/tutorils-students.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../authentication/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BannerComponent implements OnInit {
  tutorilsStudentsService = inject(TutorilsStudentsService);
  router = inject(Router);
  toastr = inject(ToastrService);
  authService = inject(AuthService);
  allOffers: {
    id: number;
    text: string;
    imageUrl: string;
    promoCode: string;
    tutorialId: number;
    packageId: number;
  }[] = [];
  isLoading: boolean = false;

  showPopup = signal<boolean>(false);

  ngOnInit() {
    this.getAllOffers();
  }
  getAllOffers(): void {
    this.isLoading = true;
    this.tutorilsStudentsService.getAllOffers().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allOffers = result;
          this.isLoading = false;
          setTimeout(() => {
            this.showPopup.set(true);
          }, 1500);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  toCheckout(id: number, packageId: number, code: string): void {
    if (this.authService.isAuth()) {
      this.router.navigate([
        '/checkout',
        packageId ? packageId : id,
        {
          isPackage: packageId ? true : false,
          code: code,
        },
      ]);
    } else {
      this.toastr.warning('يجب عليك تسجيل الدخول أولاً');
      this.router.navigate(['/login']);
    }
  }

  hideBanner() {
    this.showPopup.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const isInsideDropdown = targetElement.closest('#organization');
    if (!isInsideDropdown) {
      this.showPopup.set(false);
    }
  }
}
