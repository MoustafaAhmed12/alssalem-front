import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@Component({
  selector: 'app-side-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './side-item.component.html',
  styleUrl: './side-item.component.scss',
})
export class SideItemComponent {
  @Input() lable: string = '';
  @Input() link: string = '';
  @Input() icon: any;
}
