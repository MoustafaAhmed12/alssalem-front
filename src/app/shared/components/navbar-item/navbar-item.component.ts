import { NgClass } from '@angular/common';
import { Component, input, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Category } from '../navbar/navbar.component';
@Component({
  selector: 'app-navbar-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './navbar-item.component.html',
  styleUrl: './navbar-item.component.scss',
})
export class NavbarItemComponent {
  category = input<Category>({} as Category);
  menu_show = signal<boolean>(false);

  menu_button() {
    this.menu_show.set(true);
  }
  menu_button_close() {
    this.menu_show.set(false);
  }
}
