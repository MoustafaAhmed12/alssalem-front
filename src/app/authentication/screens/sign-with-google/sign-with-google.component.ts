import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { environment } from '../../../../environments/environment';
import { Location, NgClass } from '@angular/common';
import { NavigationService } from '../../../shared/services/navigation.service';
@Component({
  selector: 'app-sign-with-google',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sign-with-google.component.html',
  styleUrl: './sign-with-google.component.scss',
})
export class SignWithGoogleComponent implements OnInit {
  navigationService = inject(NavigationService);
  roleCode: string = '';
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  router = inject(Router);
  Location = inject(Location);
  isOpen: boolean = false;
  isLoading = signal<boolean>(false);
  clientId: string = environment.clientId;
  ngOnInit() {
    this.initializeGoogleSignIn();
  }
  initializeGoogleSignIn() {
    loadGapiInsideDOM().then(() => {
      gapi.load('auth2', () => {
        const auth2 = gapi.auth2.init({
          client_id: this.clientId,
          cookie_policy: 'single_host_origin',
        });
      });
    });
  }
  closePop(): void {
    this.isOpen = false;
  }
  onOpen(): void {
    this.isOpen = true;
  }
  getRole(roleCode: string): void {
    if (roleCode) {
      this.isOpen = false;
      this.onGoogleSignInClick(roleCode);
    }
  }
  onGoogleSignInClick(roleCode: string): void {
    this.isLoading.set(true);
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(
      (googleUser) => {
        const credential = googleUser.getAuthResponse().id_token;
        this.sendCrednetialsToBackend(credential, roleCode);
        this.isLoading.update((v) => (v = false));
      },
      (error) => {
        this.isLoading.update((v) => (v = false));
      }
    );
  }
  sendCrednetialsToBackend(credential: string, roleCode: string) {
    this.isLoading.set(true);
    this.authService.googleLogin(credential, roleCode).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode === 200) {
          const roleDto = result.roleDto;
          if (roleDto.roleName === 'طالب') {
            const previousUrl = this.navigationService.getPreviousUrl();

            if (previousUrl) {
              this.router.navigateByUrl(previousUrl);
            } else {
              this.router.navigate(['/']);
            }
          } else {
            this.router.navigateByUrl('/parent');
          }
          this.isLoading.update((v) => (v = false));
          this.authService.setIsAuth(true);
          this.toastr.success(msg);
        } else {
          this.isLoading.update((v) => (v = false));
          this.authService.setIsAuth(false);
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err.error.msg, 'عفواً');
        this.isLoading.update((v) => (v = false));
      },
    });
  }
}
