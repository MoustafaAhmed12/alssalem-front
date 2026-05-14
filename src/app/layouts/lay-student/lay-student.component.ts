import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { NavberServiceService } from '../../shared/services/navber-service.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-lay-student',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './lay-student.component.html',
  styleUrl: './lay-student.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayStudentComponent implements OnDestroy, AfterViewInit {
  NavberService = inject(NavberServiceService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  showNavbar = signal<boolean>(true);
  subscription!: Subscription;
  showFooter = signal<boolean>(true);
  whatsappLink = signal<string>('');

  value: number = 1;
  constructor() {
    this.subscription = this.NavberService.showNavBar.subscribe((value) => {
      this.showNavbar.set(value);
    });
    if (this.router.url.includes('exam-mock')) {
      this.showFooter.set(false);
    }
    // Set WhatsApp link with phone number and message
    const phoneNumber = '966574756068'; // Remove spaces and + for WhatsApp API
    const message = encodeURIComponent('أريد الانضمام لدورة على المنصة');
    this.whatsappLink.set(`https://wa.me/${phoneNumber}?text=${message}`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.value = -1;
      this.cdr.detectChanges();
    });
  }
}
