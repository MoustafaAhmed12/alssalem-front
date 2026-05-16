import { Component, inject, OnInit, signal } from '@angular/core';
import { SupervisorService } from '../../../services/supervisor.service';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roadmaps-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roadmaps-list.component.html',
})
export class RoadmapsListComponent implements OnInit {
  superService = inject(SupervisorService);
  toastr = inject(ToastrService);
  roadmaps = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.fetchRoadMaps();
  }

  fetchRoadMaps(): void {
    this.isLoading.set(true);
    this.superService.getSuperVisorRoadMaps().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.roadmaps.set(result);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  deleteRoadMap(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذه الخطة؟')) {
      this.isLoading.set(true);
      this.superService.deleteRoadMap(id).subscribe({
        next: ({ statusCode }) => {
          if (statusCode === 200) {
            this.toastr.success('تم حذف الخطة بنجاح');
            this.fetchRoadMaps();
          } else {
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('حدث خطأ أثناء الحذف');
          this.isLoading.set(false);
        },
      });
    }
  }
}
