import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../../authentication/services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-super-navbar',
  standalone: true,
  imports: [ RouterLink, NgIf],
  templateUrl: './super-navbar.component.html',
  styleUrl: './super-navbar.component.scss',
})
export class SuperNavbarComponent implements OnInit {
  authService = inject(AuthService);
  currentUser: any;
  role: any;
  menu_show_Profile: boolean = false;
  isMenuOpen: boolean = false;

  menu_Profile() {
    this.menu_show_Profile = true;
  }

  menu_Profile_close() {
    this.menu_show_Profile = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser().userDto;
    this.role = this.authService.currentUser().roleDto.roleName;
  }
}
