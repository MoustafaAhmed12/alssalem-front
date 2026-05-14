import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SupervisorService } from '../../services/supervisor.service';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { PackageTutorialService } from '../../../dashboard/services/package-tutorial.service';
import { RouterLink } from '@angular/router';
import { ExportService } from '../../../../shared/services/export.service';
export interface Data {
  categoryId: number;
  categoryName: string;
  schoolsResults: SchoolsResult[];
}

export interface AllDataStudent {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: DataJoinStudent[];
  totalPages: number;
  pageSize: number;
  pageCount: number;
  currentPage: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SchoolsResult {
  schoolId: number;
  schoolName: string;
  average: number;
}

type DataFilter = {
  categoriesIds?: number[] | null;
  state: string;
  schoolId: number[] | null;
  classNumber: string;
  pageNumber: number;
  pageSize: number;
};

export interface DataJoinStudent {
  id: number;
  name: string;
  classNumber: string;
  state: string;
  schoolId: any;
  schoolName: any;
  detecLevelExams: DetecLevelExam[];
}

export interface DetecLevelExam {
  categoryId: number;
  categoryName: string;
  examId: number;
  examName: string;
  result: number;
}

export interface NotTest {
  id: number;
  name: string;
  classNumber?: string;
  schoolId?: number;
  schoolName?: string;
  state?: string;
  phoneNumber?: string;
}

@Component({
  selector: 'app-average-exams',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, RouterLink],
  templateUrl: './average-exams.component.html',
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
export class AverageExamsComponent implements OnInit {
  exportService = inject(ExportService);
  supervisorService = inject(SupervisorService);
  packageTutorialService = inject(PackageTutorialService);
  allSchools: { id: number; name: string }[] = [];
  allTutorials: ID_Name[] = [];
  allData: AllDataStudent = {} as AllDataStudent;
  allStudentJoin: DataJoinStudent[] = [];
  allStudentNotJoin: NotTest[] = [];
  avageExam: Data[] = [];
  isLoading = signal<boolean>(false);
  classNumbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  dataFilter: DataFilter = {} as DataFilter;
  tabs = signal<{ id: number; name: string }[]>([
    { id: 1, name: 'إحصائيات' },
    { id: 2, name: 'أكملوا الاختبار' },
    { id: 3, name: 'الطلاب لم تموا الاختبار' },
  ]);
  activeTab = signal<number>(1);
  mainSections: { id: number; name: string }[] = [
    {
      id: 5,
      name: 'قدرات كمي',
    },
    {
      id: 6,
      name: 'قدرات لفظي',
    },

    {
      id: 7,
      name: 'رياضيات',
    },
    {
      id: 9,
      name: 'كيمياء',
    },
    {
      id: 8,
      name: 'فيزياء',
    },
    {
      id: 10,
      name: 'أحياء',
    },
  ];
  showSchool: boolean = false;
  showEmail: boolean = false;
  showNum: boolean = false;
  isExporting: boolean = false;
  ngOnInit() {
    this.fetchAllSchools();
    this.dataFilter.pageNumber = 1;
    this.dataFilter.pageSize = 30;
    this.getSchoolStudents(this.dataFilter);
  }

  setActive(id: number) {
    this.activeTab.set(id);
    if (this.activeTab() === 1) {
      this.getSchoolStudents(this.dataFilter);
    } else if (this.activeTab() === 2) {
      this.getExamDoneStudents(this.dataFilter);
    } else {
      delete this.dataFilter.categoriesIds;
      this.getExamNotStudents(this.dataFilter);
    }
  }

  getSchoolStudents(dataFilter: DataFilter): void {
    this.isLoading.set(true);
    this.supervisorService.averageDetectLevelExamResults(dataFilter).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.avageExam = result;
          this.isLoading.set(false);
        } else {
          this.avageExam = [];
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  getExamDoneStudents(dataFilter: DataFilter): void {
    this.isLoading.set(true);
    this.supervisorService.getExamDoneStudents(dataFilter).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.allData = res;
          this.allStudentJoin = [...this.allData.data];
          this.allStudentJoin = this.allStudentJoin.sort((a, b) => b.id - a.id);
          this.isLoading.set(false);
          if (this.isExporting) {
            this.exportService.exportTableToExcelSuperAverage(
              this.allStudentJoin,
              this.dataFilter.state,
              this.dataFilter.classNumber,
              1,
            );
            this.isExporting = false;
          }
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }
  getExamNotStudents(dataFilter: DataFilter): void {
    this.isLoading.set(true);
    this.supervisorService.getExamNotStudents(dataFilter).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.allData = res;
          this.allStudentNotJoin = [...this.allData.data];
          this.allStudentNotJoin = this.allStudentNotJoin.sort(
            (a, b) => b.id - a.id,
          );
          if (this.isExporting) {
            this.exportService.exportTableToExcelSuperNotJoin(
              this.allStudentNotJoin,
            );
            this.isExporting = false;
          }
          this.isLoading.set(false);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  get totalPages(): number {
    return Math.ceil(this.allData.totalCount / this.dataFilter.pageSize);
  }
  getPageRange(): number[] {
    const rangeSize = 6;
    const start = Math.max(
      0,
      this.dataFilter.pageNumber - Math.floor(rangeSize / 2),
    );
    const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }

  changePage(page: number) {
    if (
      page >= 1 &&
      page <= this.totalPages &&
      page !== this.dataFilter.pageNumber
    ) {
      this.dataFilter.pageNumber = page;
      if (this.activeTab() === 1) {
        this.getExamDoneStudents(this.dataFilter);
      }
      if (this.activeTab() === 2) {
        delete this.dataFilter.categoriesIds;
        this.getExamNotStudents(this.dataFilter);
      }
    }
  }

  fliterState(item: string) {
    this.dataFilter.state = item;
    if (this.activeTab() === 1) {
      this.getSchoolStudents(this.dataFilter);
    } else if (this.activeTab() === 2) {
      this.getExamDoneStudents(this.dataFilter);
    } else {
      this.dataFilter.categoriesIds = null;
      delete this.dataFilter.categoriesIds;
      this.getExamNotStudents(this.dataFilter);
    }
  }

  filterClassNo(item: string) {
    this.dataFilter.classNumber = item;
    if (this.activeTab() === 1) {
      this.getSchoolStudents(this.dataFilter);
    } else if (this.activeTab() === 2) {
      this.getExamDoneStudents(this.dataFilter);
    } else {
      this.getExamNotStudents(this.dataFilter);
    }
  }
  filterSchool(item: { id: number; name: string }[]) {
    if (item) {
      this.dataFilter.schoolId = item.map((school) => school.id);
      if (this.activeTab() === 1) {
        this.getSchoolStudents(this.dataFilter);
      } else if (this.activeTab() === 2) {
        this.getExamDoneStudents(this.dataFilter);
      } else {
        this.getExamNotStudents(this.dataFilter);
      }
    } else {
      this.dataFilter.schoolId = null;
      if (this.activeTab() === 1) {
        this.getSchoolStudents(this.dataFilter);
      } else if (this.activeTab() === 2) {
        this.getExamDoneStudents(this.dataFilter);
      } else {
        delete this.dataFilter.categoriesIds;
        this.getExamNotStudents(this.dataFilter);
      }
    }
  }
  filterCate(item: { id: number; name: string }[]) {
    if (item) {
      this.dataFilter.categoriesIds = item.map((school) => school.id);
      if (this.activeTab() === 1) {
        this.getSchoolStudents(this.dataFilter);
      }
      if (this.activeTab() === 2) {
        this.getExamDoneStudents(this.dataFilter);
      }
    } else {
      this.dataFilter.categoriesIds = null;
      if (this.activeTab() === 1) {
        this.getSchoolStudents(this.dataFilter);
      }
      if (this.activeTab() === 2) {
        this.getExamDoneStudents(this.dataFilter);
      }
    }
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

  getTotalSchools(): number {
    return this.avageExam.reduce(
      (total, category) => total + category.schoolsResults.length,
      0,
    );
  }

  round(num: number): number {
    return Math.round(num);
  }

  getOverallAverage(): number {
    const allAverages = this.avageExam.flatMap((category) =>
      category.schoolsResults.map((school: any) => school.average),
    );

    if (allAverages.length === 0) return 0;

    const sum = allAverages.reduce((total, avg) => total + avg, 0);
    return Math.round(sum / allAverages.length);
  }

  getScoreClass(score: number): string {
    if (score >= 80) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else if (score >= 60) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    } else if (score >= 40) {
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    } else {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
  }

  getProgressBarClass(score: number): string {
    if (score >= 80) {
      return 'bg-gradient-to-r from-green-400 to-green-600';
    } else if (score >= 60) {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    } else if (score >= 40) {
      return 'bg-gradient-to-r from-orange-400 to-orange-600';
    } else {
      return 'bg-gradient-to-r from-red-400 to-red-600';
    }
  }

  exportTable(): void {
    this.isExporting = true;
    this.dataFilter.pageNumber = 1;
    this.dataFilter.pageSize = this.allData.totalCount;
    if (this.activeTab() === 2) {
      this.getExamDoneStudents(this.dataFilter);
    }
    if (this.activeTab() === 3) {
      delete this.dataFilter.categoriesIds;
      this.getExamNotStudents(this.dataFilter);
    }
  }
}
