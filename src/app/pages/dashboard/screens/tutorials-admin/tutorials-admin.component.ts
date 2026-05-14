import { Component, OnInit, inject } from '@angular/core';

import { CurrencyPipe } from '@angular/common';
import { TutorialAdmin } from '../../model/admin-model';
import { TutorialService } from '../../services/tutorial.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutorials-admin',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './tutorials-admin.component.html',
  styleUrl: './tutorials-admin.component.scss',
})
export class TutorialsAdminComponent implements OnInit {
  tutorialService = inject(TutorialService);
  allTutorials: TutorialAdmin[] = [];
  isLoading: boolean = false;
  tutorialId: number = 0;
  keyword: string = '';

  ngOnInit(): void {
    this.getAllTutorials();
  }

  getAllTutorials(): void {
    this.isLoading = true;
    this.tutorialService.getTutorials().subscribe({
      next: ({ result, statusCode, msg }) => {
        if (statusCode === 200) {
          this.allTutorials = result;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;

        console.log(err);
      },
    });
  }

  get filteredTutorials() {
    const searchTerm = this.keyword.toLowerCase().trim();
    return this.allTutorials.filter((tutorial) =>
      tutorial.name.toLowerCase().includes(searchTerm)
    );
  }
}
