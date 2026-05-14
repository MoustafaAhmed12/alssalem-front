import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}
  // for supervisior
  async exportTableToExcel(
    data: any[],
    filterState?: string,
    filterClassNo?: string,
    schoolName?: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    let title: string = '';
    if (filterClassNo && filterState) {
      title = `بيانات الطلاب - ${filterState} -  الفصل رقم ${filterClassNo}`;
    } else if (filterState) {
      title = `بيانات الطلاب - ${filterState}`;
    } else if (filterClassNo) {
      title = `بيانات الطلاب - الفصل رقم ${filterClassNo}`;
    } else if (schoolName) {
      title = `بيانات الطلاب -  ${schoolName}`;
    } else {
      title = 'بيانات الطلاب بالمدرسة';
    }

    // 👉 Define Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' }, // Dark blue background
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => {
      cell.style = titleStyle;
    });

    worksheet.mergeCells('A1:F1');

    // 👉 Calculate Stats
    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const studentCount = data.length;
    let totalAchievement = 0;
    let tutorialCount = 0;

    data.forEach((student) => {
      if (student.tutorials && student.tutorials.length > 0) {
        student.tutorials.forEach((t: any) => {
          totalAchievement += Math.round(
            (t.advancePercentage * t.successPrecentage) / 100,
          );
          tutorialCount++;
        });
      } else {
        tutorialCount++; // count the "no tutorials" row as 0%
      }
    });

    const avgAchievement =
      tutorialCount > 0 ? Math.round(totalAchievement / tutorialCount) : 0;

    // 👉 Summary Row
    const summaryRow = worksheet.addRow([
      `التاريخ: ${today}`,
      `عدد الطلاب: ${studentCount}`,
      `متوسط الإنجاز: ${avgAchievement}%`,
      '',
      '',
      '',
    ]);
    summaryRow.height = 40;
    summaryRow.eachCell((cell) => {
      cell.style = {
        ...cellStyle,
        font: { bold: true, size: 14, color: { argb: 'FF000000' } },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F2F2F2' },
        },
      };
    });
    worksheet.mergeCells('A2:B2');
    worksheet.mergeCells('C2:D2');
    worksheet.mergeCells('E2:F2');

    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'اسم المدرسة',
      'الصف',
      'رقم الفصل',
      'اسم الدورة',
      'نسبة الإنجاز',
    ]);

    headerRow.height = 40;
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });

    let currentRowIndex = 4; // Title(1) + Summary(2) + Header(3) + 1
    data.forEach((student, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290';

      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...cellStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      if (student.tutorials !== null && student.tutorials.length === 0) {
        const row = worksheet.addRow([
          student.name,
          student.schoolName,
          student.state,
          student.classNo || '',
          'ليس مشترك في دورات',
          '0%',
        ]);
        row.height = 30;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.style = studentRowStyleWithColor;
        });
        currentRowIndex++;
      } else {
        if (student.tutorials !== null && student.tutorials.length > 0) {
          student.tutorials.forEach((tutorial: any, tutorialIndex: number) => {
            const rowValues =
              tutorialIndex === 0
                ? [
                    student.name,
                    student.schoolName,
                    student.state,
                    student.classNo || '',
                    tutorial.tutorialName,
                    Math.round(
                      (tutorial.advancePercentage *
                        tutorial.successPrecentage) /
                        100,
                    ) + '%',
                  ]
                : [
                    '',
                    '',
                    '',
                    '',
                    tutorial.tutorialName,
                    Math.round(
                      (tutorial.advancePercentage *
                        tutorial.successPrecentage) /
                        100,
                    ) + '%',
                  ];
            const row = worksheet.addRow(rowValues);
            row.height = 50;

            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.style = studentRowStyleWithColor;
            });

            currentRowIndex++;
          });
        }

        if (student.tutorials !== null && student.tutorials.length > 1) {
          worksheet.mergeCells(
            currentRowIndex - student.tutorials.length,
            1,
            currentRowIndex - 1,
            1,
          );
          worksheet.mergeCells(
            currentRowIndex - student.tutorials.length,
            2,
            currentRowIndex - 1,
            2,
          );
          worksheet.mergeCells(
            currentRowIndex - student.tutorials.length,
            3,
            currentRowIndex - 1,
            3,
          );
          worksheet.mergeCells(
            currentRowIndex - student.tutorials.length,
            4,
            currentRowIndex - 1,
            4,
          );
        }
      }
    });

    worksheet.columns = [
      { width: 40 },
      { width: 40 },
      { width: 20 },
      { width: 15 },
      { width: 40 },
      { width: 15 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, title + '.xlsx');
  }

  // ─── Grade-level aggregated report ──────────────────────────────────────
  async exportGradeReport(
    data: { state: string; studentCount: number; avgAchievement: number }[],
    schoolName: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    const title = `تقرير أداء الصفوف - ${schoolName}`;

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '30244a' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => (cell.style = titleStyle));
    worksheet.mergeCells('A1:C1');

    // Summary row
    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const totalStudents = data.reduce((s, r) => s + r.studentCount, 0);
    const avgAll = data.length
      ? Math.round(data.reduce((s, r) => s + r.avgAchievement, 0) / data.length)
      : 0;
    const summaryRow = worksheet.addRow([
      `التاريخ: ${today}`,
      `عدد الطلاب: ${totalStudents}`,
      `متوسط الإنجاز: ${avgAll}%`,
    ]);
    summaryRow.height = 36;
    summaryRow.eachCell((cell) => {
      cell.style = {
        ...cellStyle,
        font: { bold: true, size: 14, color: { argb: 'FF000000' } },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F2F2F2' },
        },
      };
    });

    const headerRow = worksheet.addRow([
      'الصف',
      'عدد الطلاب',
      'متوسط نسبة الإنجاز',
    ]);
    headerRow.height = 40;
    headerRow.eachCell(
      { includeEmpty: true },
      (cell) => (cell.style = headerStyle),
    );

    data.forEach((row, index) => {
      const color = index % 2 === 0 ? 'e5a53f' : '36b290';
      const r = worksheet.addRow([
        row.state,
        row.studentCount,
        row.avgAchievement + '%',
      ]);
      r.height = 35;
      r.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = {
          ...cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } },
        };
      });
    });

    worksheet.columns = [{ width: 30 }, { width: 20 }, { width: 25 }];
    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      title + '.xlsx',
    );
  }

  // ─── Class-level aggregated report ──────────────────────────────────────
  async exportClassReport(
    data: { classNo: string; studentCount: number; avgAchievement: number }[],
    schoolName: string,
    grade: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    const title = `تقرير أداء الفصول - ${grade} - ${schoolName}`;

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '30244a' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => (cell.style = titleStyle));
    worksheet.mergeCells('A1:C1');

    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const totalStudents = data.reduce((s, r) => s + r.studentCount, 0);
    const avgAll = data.length
      ? Math.round(data.reduce((s, r) => s + r.avgAchievement, 0) / data.length)
      : 0;
    const summaryRow = worksheet.addRow([
      `التاريخ: ${today}`,
      `عدد الطلاب: ${totalStudents}`,
      `متوسط الإنجاز: ${avgAll}%`,
    ]);
    summaryRow.height = 36;
    summaryRow.eachCell((cell) => {
      cell.style = {
        ...cellStyle,
        font: { bold: true, size: 14, color: { argb: 'FF000000' } },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F2F2F2' },
        },
      };
    });

    const headerRow = worksheet.addRow([
      'رقم الفصل',
      'عدد الطلاب',
      'متوسط نسبة الإنجاز',
    ]);
    headerRow.height = 40;
    headerRow.eachCell(
      { includeEmpty: true },
      (cell) => (cell.style = headerStyle),
    );

    data.forEach((row, index) => {
      const color = index % 2 === 0 ? 'e5a53f' : '36b290';
      const r = worksheet.addRow([
        `فصل ${row.classNo}`,
        row.studentCount,
        row.avgAchievement + '%',
      ]);
      r.height = 35;
      r.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = {
          ...cellStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } },
        };
      });
    });

    worksheet.columns = [{ width: 25 }, { width: 20 }, { width: 25 }];
    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      title + '.xlsx',
    );
  }

  async exportTableToExcelSuperAverage(
    data: any[],
    filterState?: string,
    filterClassNo?: string,
    status?: 1 | 2,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    let titleParts: string[] =
      status === 2
        ? [`الطلاب لم يختبروا تحديد المستوي`]
        : [`درجات الطلاب في اختبار تحديد المستوي`];
    if (filterState) {
      titleParts.push(filterState);
    }

    if (filterClassNo) {
      titleParts.push(`الفصل رقم ${filterClassNo}`);
    }

    let title: string = titleParts.join(' - ');

    // 👉 Define Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' }, // Dark blue background
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => {
      cell.style = titleStyle;
    });

    worksheet.mergeCells('A1:F1');

    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'اسم المدرسة',
      'الصف',
      'رقم الفصل',
      'اسم القسم',
      'الدرجة',
    ]);

    headerRow.height = 40;
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });

    let currentRowIndex = 3;
    data.forEach((student, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290';

      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...cellStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      if (
        student.detecLevelExams !== null &&
        student.detecLevelExams.length === 0
      ) {
        const row = worksheet.addRow([
          student.name,
          student.schoolName,
          student.state,
          student.classNumber || '',
          'لا يوجد',
          '0%',
        ]);
        row.height = 30;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.style = studentRowStyleWithColor;
        });
        currentRowIndex++;
      } else {
        if (
          student.detecLevelExams !== null &&
          student.detecLevelExams.length > 0
        ) {
          student.detecLevelExams.forEach(
            (tutorial: any, tutorialIndex: number) => {
              const rowValues =
                tutorialIndex === 0
                  ? [
                      student.name,
                      student.schoolName,
                      student.state,
                      student.classNumber || '',
                      tutorial.categoryName,
                      tutorial.result.toFixed(1) + '%',
                    ]
                  : [
                      '',
                      '',
                      '',
                      '',
                      tutorial.categoryName,
                      tutorial.result.toFixed(1) + '%',
                    ];
              const row = worksheet.addRow(rowValues);
              row.height = 50;

              row.eachCell({ includeEmpty: true }, (cell) => {
                cell.style = studentRowStyleWithColor;
              });

              currentRowIndex++;
            },
          );
        }

        if (
          student.detecLevelExams !== null &&
          student.detecLevelExams.length > 1
        ) {
          worksheet.mergeCells(
            currentRowIndex - student.detecLevelExams.length,
            1,
            currentRowIndex - 1,
            1,
          );
          worksheet.mergeCells(
            currentRowIndex - student.detecLevelExams.length,
            2,
            currentRowIndex - 1,
            2,
          );
          worksheet.mergeCells(
            currentRowIndex - student.detecLevelExams.length,
            3,
            currentRowIndex - 1,
            3,
          );
        }
      }
    });

    worksheet.columns = [
      { width: 40 },
      { width: 40 },
      { width: 20 },
      { width: 15 },
      { width: 40 },
      { width: 15 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, title + '.xlsx');
  }

  async exportTableToExcelSuper(
    tutorialName: string,

    data: any[],
    filterState?: string,
    filterClassNo?: string,
    schoolName?: string,
    examName?: string,
    status?: 0 | 1 | 2 | 3 | null,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    let titleParts: string[] = [
      `دورة (${tutorialName}) - بيانات الطلاب في - ${examName}`,
    ];

    if (filterState) {
      titleParts.push(filterState);
    }

    if (filterClassNo) {
      titleParts.push(`الفصل رقم ${filterClassNo}`);
    }

    if (schoolName) {
      titleParts.push(schoolName);
    }

    if (status === 0) {
      titleParts.push('لم ينجحوا');
    } else if (status === 1) {
      titleParts.push('ناجحين');
    } else if (status === null) {
      titleParts.push('لم يحلوا');
    }

    let title: string = titleParts.join(' - ');

    // 👉 Define Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' }, // Dark blue background
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => {
      cell.style = titleStyle;
    });

    worksheet.mergeCells('A1:E1');

    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'اسم المدرسة',
      'الصف',
      'رقم الفصل',
      'حاله الاختبار',
    ]);

    headerRow.height = 40;
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });

    let currentRowIndex = 3;
    data.forEach((student, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290';
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...cellStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        student.firstName + ' ' + student.lastName,
        student.schoolName,
        student.grade,
        student.classNum,
        student.isSuccess === true
          ? 'ناجح'
          : student.isSuccess === false
            ? 'لم ينجح'
            : 'لم يتم حله',
      ]);
      row.height = 40;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = { ...cellStyle, ...studentRowStyleWithColor };
      });
      currentRowIndex++;
    });

    worksheet.columns = [
      { width: 40 },
      { width: 40 },
      { width: 30 },
      { width: 15 },
      { width: 40 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, title + '.xlsx');
  }

  async exportTableToExcelSuperNotJoin(data: any[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    let title: string = 'درجات الطلاب في اختبار تحديد المستوي';

    // 👉 Define Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' }, // Dark blue background
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => {
      cell.style = titleStyle;
    });

    worksheet.mergeCells('A1:E1');

    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'رقم الجوال',
      'اسم المدرسة',
      'الصف',
      'رقم الفصل',
    ]);

    headerRow.height = 40;
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });

    let currentRowIndex = 3;
    data.forEach((student, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290';
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...cellStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        student.name,
        student.phoneNumber,
        student.schoolName,
        student.state,
        student.classNumber,
      ]);
      row.height = 40;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = { ...cellStyle, ...studentRowStyleWithColor };
      });
      currentRowIndex++;
    });

    worksheet.columns = [
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 20 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, title + '.xlsx');
  }

  // for Promo Codes
  async exportTableToExcelPromoCodes(
    data: any[],
    fileName: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    // Define header style
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Define cell style
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Define row style for student rows with alternating colors
    const studentRowStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Add header row
    const headerRow = worksheet.addRow([
      'كود الخصم',
      'تاريخ البداية',
      'تاريخ النهاية',
      'نسبة الخصم',
      'عدد الاستخدام',
    ]);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 40; // Adjust this value as needed
    let currentRowIndex = 2; // Start from the second row to leave space for the header
    // Add rows with rowspan and colspan
    data.forEach((promoCode, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290'; // Alternate row colors
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...studentRowStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        promoCode.promoCode,
        promoCode.startDate,
        promoCode.endDate,
        promoCode.discountPrecentage + '%',
        promoCode.usageCount,
      ]);
      row.height = 30; // Increase row height for better readability
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = { ...cellStyle, ...studentRowStyleWithColor };
      });
      currentRowIndex++;
    });
    worksheet.columns = [
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }

  getStatusText(paymentType: string): string {
    switch (paymentType) {
      case 'Pending':
        return 'قيد التنفيذ';
      case 'PaymentReceived':
        return 'العملية نجحت';
      case 'PaymentFailed':
        return 'العملية فشلت';
      case 'NewPayment':
        return 'عملية جديدة';
      default:
        return 'غير محدد';
    }
  }

  getStatusClass(paymentType: string): string {
    switch (paymentType) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'PaymentReceived':
        return 'bg-green-100 text-green-800';
      case 'PaymentFailed':
        return 'bg-red-100 text-red-800';
      case 'NewPayment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  // for payment
  async exportTableToExcelPayment(
    data: any[],
    endDate?: string,
    fromDate?: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const total = data.reduce(
      (sum, student) =>
        sum +
        (student.paymentStatus === 'PaymentReceived' ? student.totalAmount : 0),
      0,
    );

    // 👉 Construct Dynamic Title
    let title = 'تقرير عمليات الدفع';
    if (fromDate && endDate) {
      title += ` | الفترة: ${fromDate} إلى ${endDate} | إجمالي المال: ${total}`;
    } else if (fromDate) {
      title += ` | من: ${fromDate}`;
    } else if (endDate) {
      title += ` | كل العمليات إلى: ${endDate} | إجمالي المال: ${total} ر.س`;
    }

    // 👉 Define Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' }, // Dark blue background
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 14 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => {
      cell.style = titleStyle;
    });
    worksheet.mergeCells('A1:F1');

    // Add header row
    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'اسم المدرسة',
      'رقم الجوال',
      'تاريخ الدفع',
      'حالة العملية',
      'مبلغ الكلي',
    ]);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 60;
    let currentRowIndex = 3;

    data.forEach((student, index) => {
      const rowColor =
        student.paymentStatus === 'PaymentReceived'
          ? '36b290'
          : student.paymentStatus === 'PaymentFailed'
            ? 'd9534f'
            : 'e5a53f';
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...cellStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        student.studentName,
        student.schoolName || '-',
        student.phone,
        student.paymentDate,
        this.getStatusText(student.paymentStatus),
        student.totalAmount,
      ]);
      row.height = 40;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = { ...cellStyle, ...studentRowStyleWithColor };
      });
      currentRowIndex++;
    });
    // Set column widths
    worksheet.columns = [
      { width: 40 },
      { width: 30 },
      { width: 25 },
      { width: 30 },
      { width: 15 },
      { width: 15 },
    ];
    // Generate and save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, 'تقرير عمليات الدفع' + '.xlsx');
  }
  // for Schools
  async exportTableToExcelSchools(
    data: any[],
    endDate?: string,
    fromDate?: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 👉 Construct Dynamic Title
    let title = 'إحصائيات الطلاب بالمدرسة';
    if (fromDate && endDate) {
      title += ` | الفترة: ${fromDate} إلى ${endDate}`;
    } else if (fromDate) {
      title += ` | من: ${fromDate}`;
    } else {
      title = title;
    }

    // 👉 Define Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 14 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => {
      cell.style = titleStyle;
    });
    worksheet.mergeCells('A1:D1');

    // Add header row
    const headerRow = worksheet.addRow([
      'اسم المدرسة',
      'عدد المشتركين',
      'عدد الغير المشتركين',
      'عدد الكلي',
    ]);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 60;
    let currentRowIndex = 3;

    data.forEach((student, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290';
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...cellStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        student.schoolName,
        student.subscribeCount,
        student.totalRegister - student.subscribeCount,
        student.totalRegister,
      ]);
      row.height = 40;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = { ...cellStyle, ...studentRowStyleWithColor };
      });
      currentRowIndex++;
    });
    // Set column widths
    worksheet.columns = [
      { width: 50 },
      { width: 35 },
      { width: 35 },
      { width: 35 },
    ];
    // Generate and save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, title + '.xlsx');
  }

  async exportTableToExcelStudentSchools(
    data: any[],
    endDate?: string,
    schools?: string[],
    fromDate?: string,
    total?: number,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    // 👉 Construct Dynamic Title
    let title = 'تقرير عمليات الدفع';
    if (schools?.length) {
      title += ` - المدارس: ${schools.join(', ')} | إجمالي المال: ${total}`;
    }
    if (fromDate && endDate) {
      title += ` | الفترة: ${fromDate} إلى ${endDate} | إجمالي المال: ${total}`;
    } else if (fromDate) {
      title += ` | من: ${fromDate} | إجمالي المال: ${total}`;
    } else if (endDate) {
      title += ` | كل العمليات إلى: ${endDate} | إجمالي المال: ${total} ر.س`;
    }
    // 👉 Define Styles
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 18 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' }, // Dark blue background
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleRow = worksheet.addRow([title]);
    titleRow.height = 60;
    titleRow.eachCell((cell) => {
      cell.style = titleStyle;
    });
    worksheet.mergeCells('A1:E1');
    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'رقم الجوال',
      'اسم المدرسة',
      'تاريخ عملية الدفع',
      'مبلغ الدفع',
    ]);
    headerRow.height = 60;

    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });
    let currentRowIndex = 3;

    data.forEach((student: any, index: number) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290';
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...cellStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        student.studentName,
        student.phone ? student.phone : '-',
        student.schoolName,
        student.lastPayment.split('T')[0],
        student.totalPayment,
      ]);
      row.height = 50;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = studentRowStyleWithColor;
      });
      currentRowIndex++;
    });
    worksheet.columns = [
      { width: 40 },
      { width: 40 },
      { width: 80 },
      { width: 30 },
      { width: 30 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, 'تقرير عمليات الدفع' + '.xlsx');
  }

  async exportTableToExcelStudent(
    data: any[],
    fileName: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    // Define header style
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Define cell style
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Define row style for student rows with alternating colors
    const studentRowStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Add header row
    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'اسم المدرسة',
      'الإيميل',
      'رقم الجوال',
    ]);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 40; // Adjust this value as needed
    let currentRowIndex = 2; // Start from the second row to leave space for the header
    // Add rows with rowspan and colspan
    data.forEach((student, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290'; // Alternate row colors
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...studentRowStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        `${student.firstName} ${student.lastName}`,
        student.schoolName,
        student.email,
        student.phoneNumber,
      ]);
      row.height = 30; // Increase row height for better readability
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = { ...cellStyle, ...studentRowStyleWithColor };
      });
      currentRowIndex++;
    });
    worksheet.columns = [
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }
  async exportTableToExcelStudentSub(
    data: any[],
    fileName: string,
  ): Promise<void> {
    console.log(data);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    // Define header style
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '30244a' },
      },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Define cell style
    const cellStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' }, size: 15 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Define row style for student rows with alternating colors
    const studentRowStyle: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FF000000' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
    // Add header row
    const headerRow = worksheet.addRow([
      'اسم الطالب',
      'اسم المدرسة',
      'الإيميل',
      'رقم الجوال',
    ]);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 40; // Adjust this value as needed
    let currentRowIndex = 2; // Start from the second row to leave space for the header
    // Add rows with rowspan and colspan
    data.forEach((student, index) => {
      const rowColor = index % 2 === 0 ? 'e5a53f' : '36b290'; // Alternate row colors
      const studentRowStyleWithColor: Partial<ExcelJS.Style> = {
        ...studentRowStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor },
        },
      };
      const row = worksheet.addRow([
        `${student.studentName} `,
        student.schoolName || '- ',
        student.email,
        student.phoneNumber || '-',
      ]);
      row.height = 30; // Increase row height for better readability
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = { ...cellStyle, ...studentRowStyleWithColor };
      });
      currentRowIndex++;
    });
    worksheet.columns = [
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }
}
