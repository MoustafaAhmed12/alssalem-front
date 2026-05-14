import { Component, inject, OnInit, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { AdminService } from '../../../pages/dashboard/services/admin.service';
import { Router, RouterLink } from '@angular/router';
import { AppConfigService } from '../../services/app-config.service';
import { TranslatePipe } from '@ngx-translate/core';
type Social = {
  id: number;
  name: string;
  logo: string;
  link: string;
};
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  adminService = inject(AdminService);
  appConfigService = inject(AppConfigService);
  isLoading: boolean = false;
  socialMedia: Social[] = [];
  router = inject(Router);
  showFooter = signal<boolean>(false);
  isMain = signal<boolean>(false);
  isLogoWhite = signal<boolean>(false);

  ngOnInit() {
    this.isMain.set(this.appConfigService.isMainDomain());
    let isWhite = this.appConfigService.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);
    this.fetchAllSocialMedia();
    if (this.router.url.includes('exam-mock')) {
      this.showFooter.set(false);
    } else {
      this.showFooter.set(true);
    }
  }
  fetchAllSocialMedia(): void {
    this.isLoading = true;
    this.adminService.getAllSocialMedia().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.socialMedia = result;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {},
    });
  }
}
