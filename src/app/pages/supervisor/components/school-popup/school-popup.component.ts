import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { FormsModule } from '@angular/forms';

interface SchoolData {
  schoolName: string;
  schoolId: number;
  advancedPercent: number;
  successPercent: number;
}

@Component({
  selector: 'app-school-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './school-popup.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-50px)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class SchoolPopupComponent implements OnInit {
  @Input() schoolsData: SchoolData[] = [];
  @Input() isVisible: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() tutorialName: string = '';
  @Output() closeEvent = new EventEmitter<void>();
  expandedSchools: Set<number> = new Set();
  sortDirection: 'asc' | 'desc' = 'desc';
  showSummaryDetails: boolean = false;
  @Input() schoolIdFilter: string = '';
  @Input() stateFilter: string = '';
  @Input() classNoFilter: string = '';

  ngOnInit() {
    // Add escape key listener
    document.addEventListener('keydown', this.onEscapeKey.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.onEscapeKey.bind(this));
  }

  onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isVisible) {
      this.closePopup();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  closePopup() {
    this.closeEvent.emit();
  }

  get filteredSchools(): SchoolData[] {
    if (!this.schoolIdFilter) return this.schoolsData;
    return this.schoolsData.filter((s) =>
      s.schoolId.toString().includes(this.schoolIdFilter)
    );
  }

  getAverageAdvanced(): number {
    const schools = this.filteredSchools;
    if (schools.length === 0) return 0;
    const total = schools.reduce(
      (sum, school) => sum + school.advancedPercent,
      0
    );
    return Math.round(total / schools.length);
  }

  getAverageSuccess(): number {
    const schools = this.filteredSchools;
    if (schools.length === 0) return 0;
    const total = schools.reduce(
      (sum, school) => sum + school.successPercent,
      0
    );
    return Math.round(total / schools.length);
  }

  getPerformanceLabel(advancedPercent: number): string {
    if (advancedPercent >= 40) return 'ممتاز';
    if (advancedPercent >= 25) return 'جيد جداً';
    if (advancedPercent >= 15) return 'جيد';
    return 'يحتاج تحسين';
  }

  getPerformanceBadgeClass(advancedPercent: number): string {
    if (advancedPercent >= 40) return 'bg-green-100 text-green-800';
    if (advancedPercent >= 25) return 'bg-blue-100 text-blue-800';
    if (advancedPercent >= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  calculateAchievement(school: SchoolData): number {
    return Math.round((school.advancedPercent * school.successPercent) / 100);
  }

  getAverageAchievement(): number {
    const schools = this.filteredSchools;
    if (schools.length === 0) return 0;
    return Math.round((this.getAverageAdvanced() * this.getAverageSuccess()) / 100);
  }

  toggleSummaryDetails() {
    this.showSummaryDetails = !this.showSummaryDetails;
  }

  toggleSchoolDetails(schoolId: number) {
    if (this.expandedSchools.has(schoolId)) {
      this.expandedSchools.delete(schoolId);
    } else {
      this.expandedSchools.add(schoolId);
    }
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  get sortedSchoolsData(): SchoolData[] {
    return [...this.filteredSchools].sort((a, b) => {
      const valA = this.calculateAchievement(a);
      const valB = this.calculateAchievement(b);
      return this.sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }

  async exportData() {
    if (this.schoolsData.length === 0) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('تفاصيل المدارس');
      worksheet.views = [{ rightToLeft: true }];

      // Styles
      const headerFill: ExcelJS.Fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2D9455' },
      };
      const headerFont: Partial<ExcelJS.Font> = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
      };

      // Header row 1: Merge for Tutorial Name
      const nameRow = worksheet.addRow(['تقرير أداء المدارس لـ: ' + this.tutorialName]);
      nameRow.font = { size: 14, bold: true };
      worksheet.mergeCells(`A1:D1`);
      nameRow.getCell(1).alignment = { horizontal: 'center' };

      // Header row 2: Merge for Date
      const dateRow = worksheet.addRow(['تاريخ التقرير: ' + this.getCurrentDate()]);
      worksheet.mergeCells(`A2:D2`);
      dateRow.getCell(1).alignment = { horizontal: 'center' };

      if (this.stateFilter) {
        const stateRow = worksheet.addRow(['الصف: ' + this.stateFilter]);
        worksheet.mergeCells(`A${worksheet.rowCount}:D${worksheet.rowCount}`);
        stateRow.getCell(1).alignment = { horizontal: 'center' };
      }

      if (this.classNoFilter) {
        const classRow = worksheet.addRow(['الفصل: ' + this.classNoFilter]);
        worksheet.mergeCells(`A${worksheet.rowCount}:D${worksheet.rowCount}`);
        classRow.getCell(1).alignment = { horizontal: 'center' };
      }

      worksheet.addRow([]); // Blank row

      // Table Header - Simplified to only show achievement
      const headerRow = worksheet.addRow([
        'م',
        'اسم المدرسة',
        'نسبة الإنجاز %',
        'الحالة',
      ]);

      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Data Rows
      this.sortedSchoolsData.forEach((school, index) => {
        const achievement = this.calculateAchievement(school);
        const row = worksheet.addRow([
          index + 1,
          school.schoolName,
          achievement + '%',
          this.getPerformanceLabel(school.advancedPercent),
        ]);

        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // Columns widths
      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 45;
      worksheet.getColumn(3).width = 20;
      worksheet.getColumn(4).width = 20;

      // Generate Buffer and Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `تقرير_نسبة_إنجاز_مدارس_${this.tutorialName}_${new Date().toLocaleDateString('ar-EG')}.xlsx`);
    } catch (error) {
      console.error('Export Error:', error);
    }
  }
}
