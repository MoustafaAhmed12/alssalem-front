import { Component, inject, OnInit, signal } from '@angular/core';
import { SupervisorService } from '../../../services/supervisor.service';
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
}
