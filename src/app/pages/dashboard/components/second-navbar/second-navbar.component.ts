import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../authentication/services/auth.service';
import { AppConfigService } from '../../../../shared/services/app-config.service';
import { NavberServiceService } from '../../../../shared/services/navber-service.service';
@Component({
  selector: 'app-second-navbar',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './second-navbar.component.html',
})
export class SecondNavbarComponent {
  authService = inject(AuthService);
  appConfigService = inject(AppConfigService);
  navService = inject(NavberServiceService);
  auth = inject(AuthService);

  show_menu() {
    this.navService.toggleSidebar();
  }
  isShow: boolean = false;
  menu_show_Profile = false;
  roleName = signal<string>('');
  isLogoWhite = signal<boolean>(false);
  constructor() {
    this.roleName.set(this.auth.currentUser().roleDto.roleName);
    let isWhite = this.appConfigService.config()?.['islogowhite'];
    this.isLogoWhite.set(isWhite === '1' ? true : false);
  }

  onShow() {
    this.isShow = !this.isShow;
  }
  menu_Profile() {
    clearTimeout(this.menuTimeout);
    this.menu_show_Profile = true;
  }

  menuTimeout: any;
  menu_Profile_close() {
    this.menuTimeout = setTimeout(() => {
      this.menu_show_Profile = false;
    }, 200);
  }
}
