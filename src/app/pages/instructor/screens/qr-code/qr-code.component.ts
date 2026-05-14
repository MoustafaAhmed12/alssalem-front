import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { TeacherService } from '../../services/exams.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../../authentication/services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [ReactiveFormsModule, QRCodeModule, FormsModule, NgSelectModule],
  templateUrl: './qr-code.component.html',
  styles: `
    @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }

  .animate-slide-in {
    animation: slide-in 0.6s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.4s ease-out backwards;
  }

  /* Custom ng-select styling */
  ::ng-deep .custom-ng-select .ng-select-container {
    @apply border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 transition-all;
  }

  ::ng-deep .custom-ng-select .ng-select-container:hover {
    @apply border-indigo-300 bg-white;
  }

  ::ng-deep .custom-ng-select.ng-select-focused .ng-select-container {
    @apply border-indigo-500 bg-white ring-2 ring-indigo-200;
  }

  ::ng-deep .custom-ng-select .ng-value-label {
    @apply text-gray-800 font-semibold;
  }

  ::ng-deep .custom-ng-select .ng-placeholder {
    @apply text-gray-400;
  }
  `,
})
export class QrCodeComponent implements OnInit {
  fb = inject(FormBuilder);
  teacherService = inject(TeacherService);
  authService = inject(AuthService);
  qrForm!: FormGroup;
  @ViewChild('qrCodeCanvas', { static: false }) qrCodeCanvas!: ElementRef;
  urls: string[] = [];
  allIds: number[] = [];
  isLoading: boolean = false;
  isOneLink: boolean = false;
  isLogo: boolean = false;
  examsTutorials: { examId: number; examName: string }[] = [];
  selectedExam: number = 0;
  qrColor: string = '#36b290';
  qrLink: string = '';
  qrWidth: number = 60;

  collectedExams: { name: string; ids: number[] }[] = [];
  ngOnInit() {
    const currentUserId = this.authService.currentUser().userDto.id;
    this.qrForm = this.fb.group({
      examId: [null, [Validators.required]],
    });
    this.fetchAllExamsTutorials({ teacherId: currentUserId });
  }
  getExamId(item: any): void {
    this.selectedExam = item.examId;
    this.qrForm.get('examId')?.setValue(item.examId);
  }
  fetchAllExamsTutorials(teacherId: any): void {
    this.teacherService.getAllExamsPerTeacherTutorials(teacherId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.examsTutorials = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  generateLinks(): void {
    if (this.qrForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.teacherService.examQuestionsIds(this.qrForm.value.examId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allIds = result;
          const baseUrl: string = `https://alssalem.com/exam/${this.qrForm.value.examId}/question/`;
          this.urls = this.allIds.map((item: number) => `${baseUrl}${item}`);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  addToExportList(): void {
    if (!this.allIds || this.allIds.length === 0) return;

    const examId = this.qrForm.value.examId;
    const exam = this.examsTutorials.find((e) => e.examId === examId);

    if (exam) {
      // Check if already exists to avoid duplicates
      const exists = this.collectedExams.some((e) => e.name === exam.examName);
      if (!exists) {
        this.collectedExams.push({
          name: exam.examName,
          ids: [...this.allIds], // Store a copy
        });
      }
    }
  }

  exportCollectedExams(): void {
    if (this.collectedExams.length === 0) return;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    this.collectedExams.forEach((exam) => {
      // Create data for the sheet: header and rows
      const wsData = [
        ['Question ID'], // Header
        ...exam.ids.map((id) => [id]), // Rows
      ];

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

      // Sheet names cannot exceed 31 chars and cannot contain certain chars
      // We'll clean it up a bit just in case
      let safeName = exam.name.replace(/[\\/?*[\]]/g, '').substring(0, 31);

      // Ensure unique sheet names if duplicates exist after sanitization (unlikely but safe)
      let uniqueName = safeName;
      let counter = 1;
      while (wb.SheetNames.includes(uniqueName)) {
        uniqueName = `${safeName.substring(0, 28)}(${counter})`;
        counter++;
      }

      XLSX.utils.book_append_sheet(wb, ws, uniqueName);
    });

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Exams_List_${date}.xlsx`);
  }
  downloadQRCode(index: number) {
    const canvas = document
      .getElementById(`qrCodeCanvas-${index}`)
      ?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qrcode-${index + 1}.png`;
      link.click();
    }
  }
  downloadQRCodeOne() {
    const canvas = document
      .getElementById(`qrCodeCanvas`)
      ?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qrcode.png`;
      link.click();
    }
  }
  async downloadAllQRCodes() {
    const zip = new JSZip.default();
    for (let index = 0; index < this.urls.length; index++) {
      const canvas = document
        .getElementById(`qrCodeCanvas-${index}`)
        ?.querySelector('canvas');
      if (canvas) {
        const imageData = canvas
          .toDataURL('image/png')
          .replace('data:image/png;base64,', '');
        zip.file(`qrcode-${index + 1}.png`, imageData, { base64: true });
      }
    }
    // Generate the zip and download it
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'qr-codes.zip');
    });
  }
}
