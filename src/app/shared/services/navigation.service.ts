import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private previousUrl: string | null = null;
  private currentUrl: string | null = null;
  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.currentUrl && !this.currentUrl.includes('/login')) {
          this.previousUrl = this.currentUrl;
        }
        this.currentUrl = event.url;
      }
    });
  }
  public getPreviousUrl(): string | null {
    return this.previousUrl;
  }
}
