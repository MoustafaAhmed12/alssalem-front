import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../dashboard/services/admin.service';
type Social = {
  id: number;
  name: string;
  logo: string;
  link: string;
};
@Component({
  selector: 'app-social',
  standalone: true,
  imports: [],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss',
})
export class SocialComponent implements OnInit {
  adminService = inject(AdminService);
  isLoading: boolean = false;
  socialMedia: Social[] = [];

  ngOnInit() {
    this.fetchAllSocialMedia();
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
