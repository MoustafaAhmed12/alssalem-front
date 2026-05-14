import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class NavberServiceService {
  showNavBar: BehaviorSubject<boolean>;
  sidebarShow = signal<boolean>(false);

  constructor() {
    this.showNavBar = new BehaviorSubject(true);
  }

  toggleSidebar() {
    this.sidebarShow.update((s) => !s);
  }

  hide() {
    this.showNavBar.next(false);
  }
  display() {
    this.showNavBar.next(true);
  }
}
