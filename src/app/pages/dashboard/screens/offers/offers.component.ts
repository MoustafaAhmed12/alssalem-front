import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { ToastrService } from 'ngx-toastr';
import { PromoService } from '../../services/promo.service';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [NgSelectModule, ReactiveFormsModule, TitleScreenComponent, NgClass],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss',
})
export class OffersComponent implements OnInit {
  toastr = inject(ToastrService);
  promoService = inject(PromoService);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  isDelete: boolean = false;
  isLoading: boolean = false;
  isopen: boolean = false;
  formData!: FormGroup;
  allOffers: {
    id: number;
    text: string;
    imageUrl: string;
    promoCodeName: string;
  }[] = [];
  previewImageUrl: string = '';
  allPromoCodes: { id: number; name: string }[] = [];
  ngOnInit(): void {
    this.formData = this.fb.group({
      text: [''],
      imageBase64: [null],
      promoCodeId: [null],
    });
    this.getAllPromocodesName();
    this.getAllOffers();
  }

  onSubmit() {
    this.isLoading = true;
    this.promoService.addOffers(this.formData.value).subscribe({
      next: ({ msg, statusCode }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.isLoading = false;
          this.isopen = false;
          this.previewImageUrl = '';
          this.getAllOffers();
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

  getAllOffers(): void {
    this.promoService.getAllOffers().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allOffers = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getAllPromocodesName(): void {
    this.promoService.getAllPromocodesName().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allPromoCodes = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  remove(offerId: number): void {
    this.isDelete = true;
    this.promoService.deleteOffer(offerId).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.getAllOffers();
          this.isDelete = false;
          this.toastr.success(msg);
        } else {
          this.toastr.error(msg);
          this.isDelete = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isDelete = false;
      },
    });
  }

  convertToBase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const imgbase = reader.result;
      this.formData.get('imageBase64')?.patchValue(imgbase);
      this.previewImageUrl = reader.result as string;
    };
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.convertToBase64(files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      this.convertToBase64(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  hideModel(): void {
    this.isopen = false;
  }
  showModel(): void {
    this.formData.reset();
    this.isopen = true;
  }
}
