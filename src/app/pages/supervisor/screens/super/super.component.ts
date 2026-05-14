import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SupervisorService } from '../../services/supervisor.service';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { PackageTutorialService } from '../../../dashboard/services/package-tutorial.service';
import { SchoolPopupComponent } from '../../components/school-popup/school-popup.component';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface Data {
  totalStudentsCount: number;
  unActiveStudentCount: number;
  subscribedStudentCount: number;
  tutotrials: tutotrials[];
}

type tutotrials = {
  id: number;
  tutorialName: string;
  advancePercentage: number;
  successPrecentage: number;
  categoryName: string;
};

@Component({
  selector: 'app-super',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, SchoolPopupComponent],
  templateUrl: './super.component.html',
  styleUrl: './super.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-80px)' }),
        animate(
          '0.7s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
    trigger('fadeInUpDelay', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(80px)' }),
        animate(
          '0.7s 0.3s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class SuperComponent implements OnInit {
  supervisorService = inject(SupervisorService);
  packageTutorialService = inject(PackageTutorialService);
  toastr = inject(ToastrService);
  router = inject(Router);
  allSchools: { id: number; name: string }[] = [];
  allTutorials: ID_Name[] = [];

  allDetails: Data = {} as Data;
  allData: tutotrials[] = [];
  isLoading = signal<boolean>(false);
  classNumbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  classNo: string = '';
  state: string = '';
  schoolId: number = 0;
  schoolName: string = '';
  keywork: string = '';
  tutorialId: number = 0;
  schoolsData: any;
  isPopupVisible = signal<boolean>(false);
  isLoadingSchool = signal<boolean>(false);
  educationalCategories: { id: number; name: string }[] = [
    { id: 1, name: 'قدرات' },
    { id: 2, name: 'تحصيلي' },
    { id: 3, name: 'قدرات بالانجليزي' },
    { id: 4, name: 'موهبة' },
  ];
  selectedCategories: number[] = [];
  isExporting = signal<boolean>(false);

  ngOnInit() {
    this.getSchoolStudents(
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.selectedCategories,
    );
  }

  searchName(): void {
    // This will now work with the groupedData getter automatically
  }

  get groupedData() {
    const groups: { [key: string]: tutotrials[] } = {};
    const filtered = this.allData.filter((item) =>
      item.tutorialName.toLowerCase().includes(this.keywork.toLowerCase()),
    );

    filtered.forEach((item) => {
      const cat = item.categoryName || 'غير مصنف';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  }

  navigateToStudents(status: number | null): void {
    this.router.navigate(['/super/active-status-students'], {
      queryParams: {
        schoolId: this.schoolId || null,
        state: this.state || null,
        classNumber: this.classNo || null,
        keyWord: this.keywork || null,
        unActiveStudents: status,
      },
    });
  }

  getSchoolDetails(item: { id: number }): void {
    this.isPopupVisible.set(true);
    this.schoolsProgressAnalysis(item.id);
  }

  hidePopup() {
    this.isPopupVisible.set(false);
  }

  schoolsProgressAnalysis(tutorailId: number): void {
    this.isLoadingSchool.set(true);
    this.supervisorService
      .schoolsProgressAnalysis(
        tutorailId,
        this.schoolId,
        this.state,
        this.classNo,
      )
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            console.log(result);
            this.schoolsData = result;
            this.isLoadingSchool.set(false);
          } else {
            this.allData = [];
            this.isLoadingSchool.set(false);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoadingSchool.set(false);
        },
      });
  }

  getSchoolStudents(
    keywork: string,
    state: string,
    classNo: string,
    schoolId: number,
    categoriesIds: number[] | null = null,
  ): void {
    this.isLoading.set(true);
    this.supervisorService
      .getTotalSchoolStudents(keywork, state, classNo, schoolId, categoriesIds)
      .subscribe({
        next: ({ statusCode, result }) => {
          if (statusCode === 200) {
            this.allDetails = result;
            this.allData = result.tutotrials;
            this.isLoading.set(false);

            this.fetchAllSchools();
          } else {
            this.allData = [];
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.set(false);
        },
      });
  }

  filterCategories(items: any[]) {
    this.selectedCategories = items.map((i) => i.id);
    this.getSchoolStudents(
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.selectedCategories,
    );
  }

  fliterState(item: string) {
    this.state = item;
    this.getSchoolStudents(
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.selectedCategories,
    );
  }

  filterClassNo(item: string) {
    this.classNo = item;
    this.getSchoolStudents(
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.selectedCategories,
    );
  }

  filterSchool(item: { id: number; name: string }) {
    this.schoolId = item?.id;
    this.schoolName = item?.name;
    this.getSchoolStudents(
      this.keywork,
      this.state,
      this.classNo,
      this.schoolId,
      this.selectedCategories,
    );
  }

  fetchAllSchools(): void {
    this.supervisorService.getAllShools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSchools = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  round(num: number): number {
    return Math.round(num);
  }

  calculateAchievement(item: tutotrials): number {
    return Math.round((item.advancePercentage * item.successPrecentage) / 100);
  }

  getCategoryTheme(index: number) {
    const themes = [
      {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        icon: 'bg-emerald-600',
        border: 'border-emerald-100',
        gradient: 'from-emerald-600 to-emerald-500',
      },
      {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        icon: 'bg-amber-600',
        border: 'border-amber-100',
        gradient: 'from-amber-600 to-amber-500',
      },
      {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-600',
        border: 'border-blue-100',
        gradient: 'from-blue-600 to-blue-500',
      },
      {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-600',
        border: 'border-purple-100',
        gradient: 'from-purple-600 to-purple-500',
      },
      {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        icon: 'bg-rose-600',
        border: 'border-rose-100',
        gradient: 'from-rose-600 to-rose-500',
      },
    ];
    return themes[index % themes.length];
  }

  async exportToExcel(): Promise<void> {
    if (this.isExporting()) return;

    // Validation: Must select school if more than 1 exists
    if (this.allSchools.length > 1 && !this.schoolId) {
      this.toastr.warning('الرجاء اختيار مدرسة أولاً لتصدير التقرير');
      return;
    }

    this.isExporting.set(true);

    try {
      const workbook = new ExcelJS.Workbook();

      // Define colors
      const primaryColor = '36b290';
      const secondaryColor = 'e5a53f';

      // Determine School Name
      let targetSchoolName = this.schoolName;
      if (!targetSchoolName && this.allSchools.length === 1) {
        targetSchoolName = this.allSchools[0].name;
      }

      // ============ Sheet 1: Report ============
      const dataSheet = workbook.addWorksheet('التقرير الشامل', {
        pageSetup: {
          paperSize: 9,
          orientation: 'portrait',
          margins: {
            left: 0.7,
            right: 0.7,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3,
          },
        },
      });
      dataSheet.views = [{ showGridLines: false, rightToLeft: true }];

      let currentRow = 1;

      // --- 0. Platform Title (Main Brand) ---
      dataSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const platformTitle = dataSheet.getCell(`A${currentRow}`);
      platformTitle.value = 'منصة السالم التعليمية';
      platformTitle.font = {
        size: 22,
        bold: true,
        color: { argb: 'FF36b290' }, // Primary Color Text
      };
      platformTitle.alignment = { vertical: 'middle', horizontal: 'center' };
      platformTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' }, // White Background
      };
      // Add a bottom border to separate branding
      platformTitle.border = {
        bottom: { style: 'medium', color: { argb: 'FF36b290' } },
      };
      dataSheet.getRow(currentRow).height = 45;
      currentRow += 2;

      // --- 1. Header Information ---
      dataSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const titleCell = dataSheet.getCell(`A${currentRow}`);
      titleCell.value = 'التقرير الإحصائي للمدرسة';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + primaryColor },
      };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      dataSheet.getRow(currentRow).height = 35;
      currentRow += 2;

      // School Name
      dataSheet.getCell(`A${currentRow}`).value = 'اسم المدرسة:';
      dataSheet.getCell(`A${currentRow}`).font = { bold: true };
      dataSheet.getCell(`B${currentRow}`).value = targetSchoolName || '---';
      currentRow++;

      // Grade (if selected)
      if (this.state) {
        dataSheet.getCell(`A${currentRow}`).value = 'الصف الدراسي:';
        dataSheet.getCell(`A${currentRow}`).font = { bold: true };
        dataSheet.getCell(`B${currentRow}`).value = this.state;
        currentRow++;
      }

      // Class Number (if selected)
      if (this.classNo) {
        dataSheet.getCell(`A${currentRow}`).value = 'الفصل:';
        dataSheet.getCell(`A${currentRow}`).font = { bold: true };
        dataSheet.getCell(`B${currentRow}`).value = this.classNo;
        currentRow++;
      }

      // Courses Count
      dataSheet.getCell(`A${currentRow}`).value = 'عدد الدورات المفتوحة:';
      dataSheet.getCell(`A${currentRow}`).font = { bold: true };
      dataSheet.getCell(`B${currentRow}`).value = `${this.allData.length} دورة`;
      currentRow++;

      // Date
      dataSheet.getCell(`A${currentRow}`).value = 'تاريخ إصدار التقرير:';
      dataSheet.getCell(`A${currentRow}`).font = { bold: true };
      dataSheet.getCell(`B${currentRow}`).value = new Date().toLocaleDateString(
        'ar-EG',
      );
      currentRow += 2;

      // --- 2. Introduction ---
      dataSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const introTitle = dataSheet.getCell(`A${currentRow}`);
      introTitle.value = 'مقدمة التقرير';
      introTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      introTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + secondaryColor },
      };
      introTitle.alignment = { vertical: 'middle', horizontal: 'center' };
      dataSheet.getRow(currentRow).height = 25;
      currentRow++;

      dataSheet.mergeCells(`A${currentRow}:C${currentRow + 2}`);
      const introText = dataSheet.getCell(`A${currentRow}`);
      introText.value = `يهدف هذا التقرير إلى عرض مستوى تفاعل طلاب مدرسة (${targetSchoolName || '---'}) مع منصة السالم التعليمية، وقياس مدى الالتزام والمشاركة في المحتوى التعليمي، وذلك لدعم اتخاذ القرار وتحسين العملية التعليمية.`;
      introText.alignment = {
        vertical: 'top',
        horizontal: 'right',
        wrapText: true,
      };
      introText.font = { size: 11 };
      currentRow += 4;

      // --- 3. Statistics Table ---
      dataSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const statsTitle = dataSheet.getCell(`A${currentRow}`);
      statsTitle.value = 'الإحصائيات التفصيلية';
      statsTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      statsTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + secondaryColor },
      };
      statsTitle.alignment = { vertical: 'middle', horizontal: 'center' };
      dataSheet.getRow(currentRow).height = 25;
      currentRow++;

      // Table Headers
      const headers = ['اسم الدورة', 'نسبة الإنجاز (%)'];
      const headerRow = dataSheet.getRow(currentRow);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + primaryColor },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      dataSheet.getRow(currentRow).height = 25;
      currentRow++;

      // Table Data
      this.allData.forEach((item, index) => {
        const row = dataSheet.getRow(currentRow);
        const rowData = [
          item.tutorialName,
          this.round(this.calculateAchievement(item)),
        ];

        rowData.forEach((value, colIndex) => {
          const cell = row.getCell(colIndex + 1);
          cell.value = value;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          if (index % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF5F5F5' },
            };
          }
        });
        row.height = 20;
        currentRow++;
      });
      currentRow += 2;

      // --- 4. Recommendations ---
      dataSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const recTitle = dataSheet.getCell(`A${currentRow}`);
      recTitle.value = 'توصيات عامة';
      recTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      recTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + secondaryColor },
      };
      recTitle.alignment = { vertical: 'middle', horizontal: 'center' };
      dataSheet.getRow(currentRow).height = 25;
      currentRow++;

      const recommendations = [
        '1. إلزام الطلاب بأداء الاختبارات الدورية.',
        '2. متابعة الطلاب منخفضي الأداء بخطط علاجية.',
        '3. ربط التقييم المدرسي بنتائج الاختبارات الإلكترونية.',
      ];

      recommendations.forEach((rec) => {
        dataSheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const cell = dataSheet.getCell(`A${currentRow}`);
        cell.value = rec;
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        currentRow++;
      });
      currentRow += 2;

      // --- 5. Conclusion ---
      dataSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const concTitle = dataSheet.getCell(`A${currentRow}`);
      concTitle.value = 'خاتمة التقرير';
      concTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      concTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + secondaryColor },
      };
      concTitle.alignment = { vertical: 'middle', horizontal: 'center' };
      dataSheet.getRow(currentRow).height = 25;
      currentRow++;

      dataSheet.mergeCells(`A${currentRow}:C${currentRow + 2}`);
      const concText = dataSheet.getCell(`A${currentRow}`);
      concText.value =
        'تؤكد منصة السالم التعليمية التزامها الكامل بدعم المدرسة والطلاب، من خلال تقديم أدوات قياس دقيقة وتقارير دورية تسهم في رفع مستوى التحصيل الأكاديمي وتحقيق أفضل النتائج التعليمية.';
      concText.alignment = {
        vertical: 'top',
        horizontal: 'right',
        wrapText: true,
      };
      concText.font = { size: 11 };

      // Set column widths
      dataSheet.getColumn(1).width = 50;
      dataSheet.getColumn(2).width = 25;
      dataSheet.getColumn(3).width = 25;

      // ============ Sheet 2: Charts ============
      const chartSheet = workbook.addWorksheet('الرسوم البيانية', {
        pageSetup: {
          paperSize: 9,
          orientation: 'portrait',
          margins: {
            left: 0.25,
            right: 0.25,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3,
          },
        },
      });
      chartSheet.views = [{ showGridLines: false, rightToLeft: true }];

      // Sheet Header
      chartSheet.mergeCells('A1:E1');
      const chartTitle = chartSheet.getCell('A1');
      chartTitle.value = 'تفاصيل الدورات - الرسوم البيانية';
      chartTitle.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
      chartTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + primaryColor },
      };
      chartTitle.alignment = { vertical: 'middle', horizontal: 'center' };
      chartSheet.getRow(1).height = 40;

      // Load Chart.js dynamically once
      const ChartModule = await import('chart.js/auto');
      const Chart = ChartModule.default;

      // Iterate through data and create charts
      let chartRow = 3;

      for (const item of this.allData) {
        // 1. Tutorial Name
        chartSheet.mergeCells(`A${chartRow}:E${chartRow}`);
        const nameCell = chartSheet.getCell(`A${chartRow}`);
        nameCell.value = item.tutorialName;
        nameCell.font = { size: 14, bold: true, color: { argb: 'FF000000' } };
        nameCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEFEFEF' },
        };
        nameCell.alignment = { vertical: 'middle', horizontal: 'center' };
        chartSheet.getRow(chartRow).height = 30;
        chartRow++;

        // 2. Title for Percentage
        const progressTitleCell = chartSheet.getCell(`C${chartRow}`);
        progressTitleCell.value = `نسبة الإنجاز: ${this.round(this.calculateAchievement(item))}%`;
        progressTitleCell.font = {
          bold: true,
          size: 14,
          color: { argb: 'FF' + primaryColor },
        };
        progressTitleCell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };

        chartSheet.getRow(chartRow).height = 30;
        chartRow++;

        // 3. Generate Image
        const progressImg = await this.generateSinglePieChart(
          Chart,
          this.round(this.calculateAchievement(item)),
          '#36b290',
        );
        const progressId = workbook.addImage({
          base64: progressImg,
          extension: 'png',
        });
        chartSheet.addImage(progressId, {
          tl: { col: 2, row: chartRow - 1 },
          ext: { width: 200, height: 200 },
        });

        for (let i = 0; i < 10; i++) {
          chartSheet.getRow(chartRow + i).height = 20;
        }

        chartRow += 11;
      }

      chartSheet.getColumn(1).width = 5;
      chartSheet.getColumn(2).width = 25;
      chartSheet.getColumn(3).width = 5;
      chartSheet.getColumn(4).width = 25;
      chartSheet.getColumn(5).width = 5;

      // Ensure RTL views are applied at the very end
      dataSheet.views = [
        {
          state: 'normal',
          rightToLeft: true,
          showGridLines: false,
        },
      ];
      chartSheet.views = [
        { state: 'normal', rightToLeft: true, showGridLines: false },
      ];

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `تقرير_${targetSchoolName || 'المدرسة'}_${new Date().toLocaleDateString('ar-EG')}.xlsx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error(err);
    } finally {
      this.isExporting.set(false);
    }
  }

  private async generateSinglePieChart(
    ChartClass: any,
    value: number,
    color: string,
  ): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('');
        return;
      }

      const remaining = 100 - value;

      const chart = new ChartClass(ctx, {
        type: 'doughnut',
        data: {
          labels: ['المحقق', 'المتبقي'],
          datasets: [
            {
              data: [value, remaining],
              backgroundColor: [color, '#e0e0e0'],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: false,
          animation: false,
          cutout: '60%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
      });

      setTimeout(() => {
        const base64Image = canvas.toDataURL('image/png').split(',')[1];
        chart.destroy();
        resolve(base64Image);
      }, 100);
    });
  }
}
