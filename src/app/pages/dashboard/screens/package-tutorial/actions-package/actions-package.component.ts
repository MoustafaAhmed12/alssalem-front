import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CurrencyPipe, NgClass, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PackageTutorialService } from '../../../services/package-tutorial.service';
import { ID_Name } from '../../../model/admin-model';
export type FormAttachments = FormGroup<{
  id: FormControl;
  name: FormControl;
  link: FormControl;
}>;
@Component({
  selector: 'app-actions-package',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgClass, NgSelectModule, CurrencyPipe],
  templateUrl: './actions-package.component.html',
  styleUrl: './actions-package.component.scss',
})
export class ActionsPackageComponent implements OnInit {
  packageTutorialService = inject(PackageTutorialService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  packageId: number = 0;
  allTutorials: ID_Name[] = [];
  submitted = false;
  isLoading: boolean = false;
  previewImageUrl: string = '';
  base64Image: any = '';
  formData!: FormGroup;
  totalPriceBeforDiscount: number = 0;
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.packageId = parseInt(params['id']);
      if (this.packageId > 0) {
        this.fetchPackageById({
          packageId: this.packageId,
        });
      }
    });
    this.formData = this.fb.group({
      id: [this.packageId === 0 ? 0 : this.packageId],
      name: ['', [Validators.required]],
      tutorialId: [null, [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required]],
      img: null,
      tutorialAttachments: this.fb.array([this.generateAttachmentContent()]),
    });
    this.fetchAllTutorials();
  }
  get attachments(): FormArray {
    return this.formData.get('tutorialAttachments') as FormArray;
  }
  generateAttachmentContent(data?: {
    id: string;
    name: string;
    link: string;
  }): FormAttachments {
    return this.fb.group({
      id: [data?.id || 0],
      name: [data?.name || '', Validators.required],
      link: [
        data?.link || '',
        [Validators.required, Validators.pattern('https?://.+')],
      ],
    });
  }
  addRow(data?: { id: string; name: string; link: string }): void {
    if (data) {
      this.attachments.push(this.generateAttachmentContent(data));
    } else {
      this.attachments.push(this.generateAttachmentContent());
    }
  }
  removeRow(index: number): void {
    this.attachments.removeAt(index);
  }
  patchForm(data: { id: string; name: string; link: string }[]): void {
    this.attachments.clear();
    data.forEach((item) => {
      this.addRow(item);
    });
  }
  onSubmit() {
    this.submitted = true;
    if (this.formData.invalid) {
      return;
    }
    if (this.totalPriceBeforDiscount < this.formData.value.price) {
      this.toastr.info('تأكد أن سعر قبل الخصم اكبر من سعر البيع');
      return;
    }
    this.isLoading = true;
    this.packageTutorialService.savePackage(this.formData.value).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.router.navigateByUrl('/admin/package-tutorials');
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
  fetchPackageById(packageId: any): void {
    this.isLoading = true;
    this.packageTutorialService.getPackageById(packageId).subscribe({
      next: ({ statusCode, result, msg }) => {
        if (statusCode == 200) {
          const packageTutorial = result;
          this.patchForm(packageTutorial.attachements);
          this.previewImageUrl = packageTutorial.img;
          this.isLoading = false;
          this.formData.patchValue({
            id: packageTutorial.id,
            name: packageTutorial.name,
            tutorialId: packageTutorial.tutorials.map((t: any) => t.id),
            description: packageTutorial.description,
            price: packageTutorial.price,
            tutorialAttachmentIds: packageTutorial.attachements.map(
              (t: any) => t.id
            ),
            isActive: packageTutorial.isActive,
          });
          this.totalPriceBeforDiscount = packageTutorial.totalPrice;
        } else {
          this.toastr.error(msg);
          this.isLoading = false;
        }
      },
    });
  }
  // get All System Tutorials
  fetchAllTutorials(): void {
    this.packageTutorialService.getAllSystemTutorials().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allTutorials = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onFileSelected(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      reader.onload = () => {
        this.base64Image = reader.result;
        this.formData.get('img')?.patchValue(this.base64Image);
        this.previewImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  onSelectedTutorails(items: any) {
    this.totalPriceBeforDiscount = items.reduce(
      (accumulator: number, { price }: any) => {
        return accumulator + price;
      },
      0
    );
  }
}
