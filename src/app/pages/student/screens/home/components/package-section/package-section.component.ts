import { Component, inject, OnInit, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PackageTutorialService } from '../../../../../dashboard/services/package-tutorial.service';
import { PackageInfo } from '../../../../../../shared/shared-model/package-model';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-package-section',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, TranslatePipe],
  templateUrl: './package-section.component.html',
  styleUrl: './package-section.component.scss',
})
export class PackageSectionComponent implements OnInit {
  packageTutorialService = inject(PackageTutorialService);
  isLoading = signal<boolean>(false);
  allPackage: PackageInfo[] = [];
  ngOnInit() {
    this.fetchAllPackages();
  }
  fetchAllPackages(): void {
    this.isLoading.set(true);
    this.packageTutorialService.getAllPackages().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allPackage = result;
          this.isLoading.set(false);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.log(err);
      },
    });
  }
}
