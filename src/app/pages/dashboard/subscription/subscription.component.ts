import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AppConfigService } from '../../../shared/services/app-config.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './subscription.component.html',
})
export class SubscriptionComponent implements OnInit {
  private toastr = inject(ToastrService);
  private appConfigService = inject(AppConfigService);
  private fb = inject(FormBuilder);
  isLoading = signal<boolean>(false);
  activeTab = signal<number>(0);

  subscriptions = signal<any[]>([]);

  schoolForm: FormGroup;
  // Using signals for file state as requested
  logoFile = signal<File | null>(null);
  logoPreview = signal<string | null>(null);

  partnerImages = signal<File[]>([]);
  partnerPreviews = signal<string[]>([]);
  currentDomain = signal<string | null>(null);

  constructor() {
    this.schoolForm = this.fb.group({
      domain: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      color1: ['#000000'],
      color2: ['#ffffff'],
      aboutus_title: [''],

      aboutus_desc: [''],
      islogowhite: [false],
      isactive: [false],
      token: ['123456789SECRET', Validators.required],
      logo: [null, Validators.required],
      images_partner: [null],
    });
  }

  ngOnInit(): void {
    this.getAllSubscriptions();
  }

  onLogoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.logoFile.set(file);
      this.schoolForm.patchValue({
        logo: file,
      });

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onPartnerImagesSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.partnerImages.set(files);
      this.schoolForm.patchValue({
        images_partner: files,
      });

      // Generate previews
      const previews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result as string);
          // Only update signal when all are processed to avoid jagged updates or just update incrementally if preferred,
          // but for simplicity and checking completion, we might just process all.
          // However, async nature means we should probably wait or update one by one.
          // Since it's UI, updating as we go is fine or waiting for all.
          // Let's simpler approach: unique readers.
          if (previews.length === files.length) {
            this.partnerPreviews.set(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  submit() {
    if (this.schoolForm.valid) {
      const formData = new FormData();
      formData.append('domain', this.schoolForm.get('domain')?.value);
      formData.append('name', this.schoolForm.get('name')?.value);
      formData.append(
        'description',
        this.schoolForm.get('description')?.value || ''
      );
      formData.append('color1', this.schoolForm.get('color1')?.value);
      formData.append('color2', this.schoolForm.get('color2')?.value);
      formData.append(
        'aboutus_title',
        this.schoolForm.get('aboutus_title')?.value || ''
      );
      formData.append(
        'aboutus_desc',
        this.schoolForm.get('aboutus_desc')?.value || ''
      );
      formData.append(
        'islogowhite',
        this.schoolForm.get('islogowhite')?.value ? '1' : '0'
      );
      formData.append(
        'isactive',
        this.schoolForm.get('isactive')?.value ? '1' : '0'
      );
      formData.append('token', this.schoolForm.get('token')?.value);

      const logo = this.logoFile();
      if (logo) {
        formData.append('logo', logo);
      }

      const partners = this.partnerImages();
      partners.forEach((file) => {
        formData.append('images_partner[]', file);
      });
      console.log(this.currentDomain());
      this.isLoading.set(true);
      this.appConfigService.storeSchool(formData).subscribe({
        next: ({ success }) => {
          if (success) {
            if (!this.currentDomain()) {
              this.createSub(this.schoolForm.get('domain')?.value);
            }
            this.toastr.success('تم إضافة الاشتراك بنجاح');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toastr.error('حدث خطأ أثناء إضافة الاشتراك');
        },
      });
    } else {
      this.schoolForm.markAllAsTouched();
    }
  }

  createSub(domain: string) {
    const formData = new FormData();
    formData.append('domain', domain);
    formData.append('token', this.schoolForm.get('token')?.value);

    this.appConfigService.deploySubDomain(formData).subscribe({
      next: ({ success }) => {
        if (success) {
          this.toastr.success('تم إضافة اضافة الدومين');
          this.schoolForm.reset();
          this.logoFile.set(null);
          this.logoPreview.set(null);
          this.partnerImages.set([]);
          this.partnerPreviews.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('SERVER ERROR:', err);
        console.error('ERROR BODY:', err.error);
        console.error('STATUS:', err.status);

        this.isLoading.set(false);
        this.toastr.error(
          err?.error?.message || 'حدث خطأ أثناء إضافة الاشتراك'
        );
        this.isLoading.set(false);
        this.toastr.error('حدث خطأ أثناء إضافة الاشتراك');
      },
    });
  }

  addSubscription() {
    this.activeTab.set(0);
    this.currentDomain.set(null);
    this.schoolForm.reset();
    this.logoFile.set(null);
    this.logoPreview.set(null);
    this.partnerImages.set([]);
    this.partnerPreviews.set([]);
  }

  onEdit(subscription: any) {
    this.activeTab.set(0);
    this.currentDomain.set(subscription.domain || null);

    this.schoolForm.patchValue({
      domain: subscription.domain,
      name: subscription.name,
      description: subscription.description,
      color1: subscription.colors.primary,
      color2: subscription.colors.secondary,
      aboutus_title: subscription.aboutus_title,
      aboutus_desc: subscription.aboutus_desc,
      islogowhite: subscription.islogowhite,
      isactive: subscription.isactive,
      token: subscription.token || '123456789SECRET',
    });
  }

  getAllSubscriptions() {
    this.appConfigService.getAllSubscriptions().subscribe({
      next: ({ success, data }) => {
        if (success) {
          this.subscriptions.set(data);
        }
      },
      error: (err) => {
        this.toastr.error('حدث خطأ أثناء جلب الإشتراكات');
      },
    });
  }

  onDelete(domain: string) {
    this.appConfigService.deleteSubDomain(domain).subscribe({
      next: ({ success }) => {
        if (success) {
          this.toastr.success('تم حذف الدومين');
          this.getAllSubscriptions();
        }
      },
      error: (err) => {
        this.toastr.error('حدث خطأ أثناء حذف الدومين');
      },
    });
  }
}
