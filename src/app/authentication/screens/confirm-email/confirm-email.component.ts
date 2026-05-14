// import { Component, OnInit, inject, signal } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// import {
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
// import { NgClass } from '@angular/common';
// @Component({
//   selector: 'app-confirm-email',
//   standalone: true,
//   imports: [ReactiveFormsModule, NgClass],
//   templateUrl: './confirm-email.component.html',
//   styleUrl: './confirm-email.component.scss',
// })
// export class ConfirmEmailComponent implements OnInit {
//   route = inject(ActivatedRoute);
//   router = inject(Router);
//   authService = inject(AuthService);
//   fb = inject(FormBuilder);
//   toastr = inject(ToastrService);
//   submitted: boolean = false;
//   isLoading: boolean = false;
//   formData!: FormGroup;
//   email = signal<string>('');
//   ngOnInit() {
//     this.route.queryParams.subscribe((query) => {
//       this.email.set(query['email']);
//     });
//     this.formData = this.fb.group({
//       otp: ['', Validators.required],
//     });
//   }
//   onSubmit(): void {
//     this.submitted = true;
//     if (this.formData.invalid) {
//       return;
//     }
//     const otp = parseInt(this.formData.get('otp')?.value);
//     this.isLoading = true;
//     this.authService.checkEmailConfirmOtp(this.email(), otp).subscribe({
//       next: (res: boolean) => {
//         if (res === true) {
//           this.isLoading = false;
//           this.toastr.success('رقم التحقق صحيح');
//           this.router.navigate(['/login']);
//         } else {
//           this.isLoading = false;
//           this.toastr.error('رقم التحقق غير صحيح');
//         }
//       },
//       error: (err: any) => {
//         this.isLoading = false;
//         this.toastr.error('حدث خطأً ما');
//       },
//     });
//   }
// }
