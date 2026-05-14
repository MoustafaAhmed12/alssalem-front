import { Component } from '@angular/core';
import { SideBarComponent } from '../../pages/dashboard/components/side-bar/side-bar.component';
import { SecondNavbarComponent } from '../../pages/dashboard/components/second-navbar/second-navbar.component';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-lay-admin',
  standalone: true,
  imports: [RouterOutlet, SideBarComponent, SecondNavbarComponent],
  templateUrl: './lay-admin.component.html',
})
export class LayAdminComponent {}
