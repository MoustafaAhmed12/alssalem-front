import { Component, inject, OnInit, signal } from '@angular/core';
import { PackageTutorialService } from '../../../dashboard/services/package-tutorial.service';
import { ToastrService } from 'ngx-toastr';
import {
  CommonModule,
  CurrencyPipe,
  DecimalPipe,
  NgClass,
} from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PreserveNewlineWithSvgPipe } from '../../../../shared/Pipes/preserve-newline-with-svg.pipe';
import { AuthService } from '../../../../authentication/services/auth.service';
import { SeoService } from '../../../../shared/services/seo.service';
@Component({
  selector: 'app-package-page',
  standalone: true,
  imports: [NgClass, PreserveNewlineWithSvgPipe, RouterLink, DecimalPipe],
  templateUrl: './package-page.component.html',
  styleUrl: './package-page.component.scss',
})
export class PackagePageComponent implements OnInit {
  packageTutorialService = inject(PackageTutorialService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  seoService = inject(SeoService);
  packageDetails: any;
  packageId: number = 0;
  isLoading = signal<boolean>(false);
  pdfSupported: boolean = false;
  allNotBought: boolean = false;
  ngOnInit() {
    const currentUserId = this.authService.currentUser()?.userDto.id;
    const isAuth = this.authService.isAuth();
    this.route.params.subscribe((params) => {
      this.packageId = parseInt(params['packageId']);
      if (this.packageId && isAuth === true) {
        this.fetchPackageById({
          packageId: this.packageId,
          userId: currentUserId,
        });
      }
      if (isAuth === false) {
        this.fetchPackageById({
          packageId: this.packageId,
          userId: 0,
        });
      }
    });
  }
  fetchPackageById(packageIdAndUserId: any): void {
    this.isLoading.set(true);
    this.packageTutorialService.getPackageById(packageIdAndUserId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          this.packageDetails = result;
          this.allNotBought = result.tutorials.every(
            (item: any) => item.isBought === false
          );
          this.setSeoTags(this.packageDetails);
          this.isLoading.update((v) => (v = false));
        } else {
          this.toastr.error(msg);
          this.isLoading.update((v) => (v = false));
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }

  setSeoTags(details: any) {
    const title = `${details.name} | باقات منصة السالم التعليمية`;
    const description = `وفر أكثر مع باقة ${details.name}. تشمل مجموعة مختارة من الدورات التدريبية المتميزة في القدرات والتحصيلي لتضمن لك أفضل النتائج.`;
    const url = window.location.href;

    this.seoService.setDynamicMeta({
      title: title,
      description: description,
      url: url,
      image: 'https://alssalem.com/assets/imgs/logo2.webp'
    });

    this.seoService.setBreadcrumbSchema([
      { name: 'الرئيسية', url: 'https://alssalem.com/' },
      { name: 'باقاتنا', url: url }
    ]);
  }
  navigateToDestination() {
    const queryParams = {
      isPackage: true,
    };
    this.router.navigate(['/checkout', this.packageDetails.id], {
      queryParams: queryParams,
    });
  }

  getTutorialsForSub(): any[] {
    return this.packageDetails.tutorials.filter((t: any) => !t.isBought);
  }
}
