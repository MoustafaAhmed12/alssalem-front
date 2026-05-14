import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { AdminService } from '../../../../../dashboard/services/admin.service';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-opinions',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './opinions.component.html',
  styleUrl: './opinions.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OpinionsComponent implements OnInit {
  adminService = inject(AdminService);
  isLoading: boolean = false;
  feedbacks: any[] = [];

  ngOnInit() {
    this.fetchAllFeedback();
  }

  fetchAllFeedback(): void {
    this.isLoading = true;
    this.adminService.getAllFeedback().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200 && result) {
          this.feedbacks = result;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching feedbacks:', err);
      },
    });
  }
}
