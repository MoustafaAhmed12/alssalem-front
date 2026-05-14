import { Component, inject, OnInit, signal } from '@angular/core';
import { SuperNavbarComponent } from '../../../parent/components/super-navbar/super-navbar.component';
import { SupervisorService } from '../../services/supervisor.service';
import { ExportService } from '../../../../shared/services/export.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RootExamData, StudentsExam } from '../../model/school.SchoolStudents';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-super-exam',
  standalone: true,
  imports: [NgSelectModule, RouterLink],
  templateUrl: './super-exam.component.html',
  styleUrl: './super-exam.component.scss',
})
export class SuperExamComponent implements OnInit {
  supervisorService = inject(SupervisorService);
  exportService = inject(ExportService);
  toastr = inject(ToastrService);
  allData: RootExamData = {} as RootExamData;
  allStudents: StudentsExam[] = [];
  allSchools: { id: number; name: string }[] = [];
  allTutorials: { id: number; name: string }[] = [];
  allExams: { id: number; name: string }[] = [];
  isLoading = signal<boolean>(false);
  pageNumber = signal<number>(1);
  pageSize: number = 50;
  schoolId: number | null = null;
  isSuccess: boolean | null = null;
  classNo: string = '';
  state: string = '';
  examId: number = 0;
  tutorialId: number = 0;
  tutorialName: string = '';
  status: 0 | 1 | 2 | 3 | null = 2;
  // keywork: string = '';
  totalPages = signal<number>(1);
  totalCount: number = 0;
  schoolName: string = '';
  examName: string = '';
  isExporting: boolean = false;
  classNumbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  ngOnInit(): void {
    this.toastr.info('يُرجي تحدد دورة ثم اختبار', '', { timeOut: 5000 });
    this.getAllTutorials();
    this.fetchAllSchools();
  }

  fliterState(item: string) {
    this.state = item;
    this.pageNumber.set(1);
    this.getSchoolStudents(
      this.pageNumber(),
      this.pageSize,
      this.schoolId,
      this.isSuccess,
      this.classNo,
      this.state,
      this.examId,
      this.tutorialId,
      this.status,
    );
  }
  fliterStatus(item: 0 | 1 | 2 | 3 | null) {
    if (item === 3) {
      this.status = null;
    } else {
      this.status = item;
    }
    this.pageNumber.set(1);
    this.getSchoolStudents(
      this.pageNumber(),
      this.pageSize,
      this.schoolId,
      this.isSuccess,
      this.classNo,
      this.state,
      this.examId,
      this.tutorialId,
      this.status,
    );
  }
  filterClassNo(item: string) {
    this.classNo = item;
    this.pageNumber.set(1);
    this.getSchoolStudents(
      this.pageNumber(),
      this.pageSize,
      this.schoolId,
      this.isSuccess,
      this.classNo,
      this.state,
      this.examId,
      this.tutorialId,
      this.status,
    );
  }
  filterSchool(item: { id: number; name: string }) {
    console.log(item);
    this.schoolId = item?.id;
    this.schoolName = item?.name;
    this.pageNumber.set(1);
    this.getSchoolStudents(
      this.pageNumber(),
      this.pageSize,
      this.schoolId,
      this.isSuccess,
      this.classNo,
      this.state,
      this.examId,
      this.tutorialId,
      this.status,
    );
  }

  filterExam(item: { id: number; name: string }) {
    this.examId = item?.id;
    this.examName = item?.name;
    this.pageNumber.set(1);
    if (this.examId) {
      this.getSchoolStudents(
        this.pageNumber(),
        this.pageSize,
        this.schoolId,
        this.isSuccess,
        this.classNo,
        this.state,
        this.examId,
        this.tutorialId,
        this.status,
      );
    }
  }
  filterTutorial(item: { id: number; name: string }) {
    this.allExams = [];
    this.tutorialName = item?.name;
    this.tutorialId = item?.id;
    this.getTutorialExams(this.tutorialId);
  }

  getSchoolStudents(
    pageNumber: number,
    pageSize: number,
    schoolId: number | null,
    isSuccess: boolean | null,
    classNo: string,
    state: string,
    examId: number,
    tutorialId: number,
    status: 0 | 1 | 2 | 3 | null,
  ): void {
    this.isLoading.set(true);
    this.supervisorService
      .getStudentExamsStatus(
        pageNumber,
        pageSize,
        schoolId,
        isSuccess,
        classNo,
        state,
        examId,
        tutorialId,
        status,
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allData = res;
            this.totalPages.set(this.allData.totalPages);
            this.allStudents = [...this.allData.data];
            this.isLoading.set(false);
            this.totalCount = this.allData.totalCount;
            this.getPageNumbers();
            if (this.isExporting) {
              this.exportService.exportTableToExcelSuper(
                this.tutorialName,
                this.allStudents,
                this.state,
                this.classNo,
                this.schoolName,
                this.examName,
                status,
              );
              this.isExporting = false;
            }
          } else {
            this.toastr.error('لا يوجد طلاب حالياً');
            this.allStudents = [];
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.set(false);
        },
      });
  }

  exportTable(): void {
    this.isExporting = true;
    this.getSchoolStudents(
      1,
      this.allData.totalCount,
      this.schoolId,
      this.isSuccess,
      this.classNo,
      this.state,
      this.examId,
      this.tutorialId,
      this.status,
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
  getTutorialExams(tutorialId: number): void {
    this.supervisorService.getTutorialExams(tutorialId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allExams = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getAllTutorials(): void {
    this.supervisorService.getAllTutorials().subscribe({
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

  Math = Math;
  itemsPerPage = signal(50);

  previousPage() {
    if (this.pageNumber() > 1) {
      this.pageNumber.set(this.pageNumber() - 1);
    }
  }

  nextPage() {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.set(this.pageNumber() + 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.pageNumber()) {
      this.pageNumber.set(page);
      this.getSchoolStudents(
        this.pageNumber(),
        this.pageSize,
        this.schoolId,
        this.isSuccess,
        this.classNo,
        this.state,
        this.examId,
        this.tutorialId,
        this.status,
      );
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.pageNumber();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(total);
      }
    }

    return pages;
  }

  // getVisiblePages(): number[] {
  //   const pages: number[] = [];
  //   const maxVisible = 5;
  //   const half = Math.floor(maxVisible / 2);

  //   let start = Math.max(1, this.pageNumber - half);
  //   let end = Math.min(this.totalPages, start + maxVisible - 1);

  //   if (end - start + 1 < maxVisible) {
  //     start = Math.max(1, end - maxVisible + 1);
  //   }

  //   for (let i = start; i <= end; i++) {
  //     pages.push(i);
  //   }

  //   return pages;
  // }

  // changePage(page: number) {
  //   if (page >= 1 && page <= this.totalPages() && page !== this.pageNumber()) {
  //     this.pageNumber.set(page);
  //     this.getSchoolStudents(
  //       this.pageNumber(),
  //       this.pageSize,
  //       this.schoolId,
  //       this.isSuccess,
  //       this.classNo,
  //       this.state,
  //       this.examId,
  //       this.tutorialId,
  //       this.status
  //     );
  //   }
  // }
}
