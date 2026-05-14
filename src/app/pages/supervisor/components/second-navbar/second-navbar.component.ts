import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../authentication/services/auth.service';
@Component({
  selector: 'app-second-navbar',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './second-navbar.component.html',
})
export class SecondNavbarComponent {
  authService = inject(AuthService);
  auth = inject(AuthService);
  isShow: boolean = false;
  menu_show_Profile = false;
  roleName = signal<string>('');
  constructor() {
    this.roleName.set(this.auth.currentUser().roleDto.roleName);
  }

  onShow() {
    this.isShow = !this.isShow;
  }
  menu_Profile() {
    this.menu_show_Profile = true;
  }
  menu_Profile_close() {
    this.menu_show_Profile = false;
  }
}
