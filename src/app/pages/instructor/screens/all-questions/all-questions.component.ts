import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { QuestionsService } from '../../services/questions.service';
import { NgClass } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ID_Name } from '../../../dashboard/model/admin-model';
import { RouterLink } from '@angular/router';
import { Data, QuestionData } from '../../model/questions';
import { SkillService } from '../../services/skill.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TeacherService } from '../../services/exams.service';
import { AuthService } from '../../../../authentication/services/auth.service';
@Component({
  selector: 'app-all-questions',
  standalone: true,
  imports: [NgClass, NgSelectModule, RouterLink],
  templateUrl: './all-questions.component.html',
  styleUrl: './all-questions.component.scss',
})
export class AllQuestionsComponent implements OnInit {
  questionsService = inject(QuestionsService);
  toastr = inject(ToastrService);
  skillService = inject(SkillService);
  teacherService = inject(TeacherService);
  authService = inject(AuthService);
  isLoading = signal<boolean>(false);
  allData: QuestionData = {} as QuestionData;
  allQuestions: Data[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;
  questionDifficulty: any = null;
  questionTypeId: number = 0;
  skillId: number = 0;
  searchText: string = '';
  private searchSubject = new Subject<string>();
  allQuestionTypes: ID_Name[] = [];
  allSkills: ID_Name[] = [];
  allExamsToFilter = signal<{ id: number; name: string }[]>([]);
  selectedExamsIds = signal<number[]>([]);
  currentUserId = signal<number>(0);
  ngOnInit() {
    this.currentUserId.set(this.authService.currentUser().userDto.id);
    this.getAllQuestion(
      this.pageSize,
      this.pageNumber,
      null,
      this.questionDifficulty,
      this.questionTypeId,
      this.skillId,
      this.searchText,
      this.selectedExamsIds()
    );
    this.fetchAllQuestionTypes();
    this.getAllSkills();
    this.fetchAllExamsForFilter({ teacherId: this.currentUserId() });

    // Setup text search with debounce
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((text) => {
        this.searchText = text;
        this.allQuestions = [];
        this.pageNumber = 1;
        this.getAllQuestion(
          this.pageSize,
          this.pageNumber,
          null,
          this.questionDifficulty,
          this.questionTypeId,
          this.skillId,
          this.searchText,
          this.selectedExamsIds()
        );
      });
  }
  getAllQuestion(
    pageSize: number,
    pageNumber: number,
    questionId?: number | null,
    questionDifficulty?: number,
    questionTypeId?: number,
    skillId?: number,
    text?: string,
    examsIds?: number[]
  ): void {
    this.isLoading.set(true);
    this.questionsService
      .getAllQuestion(
        pageSize,
        pageNumber,
        questionId,
        questionDifficulty,
        questionTypeId,
        skillId,
        text,
        examsIds
      )
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allData = res;
            this.allQuestions = [...this.allQuestions, ...this.allData.data];
            this.isLoading.update((v) => (v = false));
          } else {
            this.isLoading.update((v) => (v = false));
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading.update((v) => (v = false));
        },
      });
  }

  filterQuestionType(item: any) {
    this.questionTypeId = item?.id;
    this.allQuestions = [];
    this.pageNumber = 1;
    this.getAllQuestion(
      this.pageSize,
      this.pageNumber,
      null,
      this.questionDifficulty,
      this.questionTypeId,
      this.skillId,
      this.searchText,
      this.selectedExamsIds()
    );
  }
  filterSkillId(item: any) {
    this.skillId = item?.id;
    this.allQuestions = [];
    this.pageNumber = 1;
    this.getAllQuestion(
      this.pageSize,
      this.pageNumber,
      null,
      this.questionDifficulty,
      this.questionTypeId,
      this.skillId,
      this.searchText,
      this.selectedExamsIds()
    );
  }
  filterDifficulty(item: any) {
    this.questionDifficulty = item;
    this.allQuestions = [];
    this.pageNumber = 1;
    this.getAllQuestion(
      this.pageSize,
      this.pageNumber,
      null,
      this.questionDifficulty,
      this.questionTypeId,
      this.skillId,
      this.searchText,
      this.selectedExamsIds()
    );
  }
  handleSearch(e: any) {
    const questionId = Number(e.target.value);
    this.allQuestions = [];
    this.pageNumber = 1;
    this.getAllQuestion(
      this.pageSize,
      this.pageNumber,
      questionId,
      this.questionDifficulty,
      this.questionTypeId,
      this.skillId,
      this.searchText,
      this.selectedExamsIds()
    );
  }

  handleTextSearch(e: any) {
    const text = e.target.value;
    this.searchSubject.next(text);
  }
  removeQuestion(id: number): void {
    this.allQuestions = [];
    this.questionsService.deleteQestion(id).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.toastr.success(msg);
          this.pageNumber = 1;
          this.getAllQuestion(
            this.pageSize,
            this.pageNumber,
            null,
            this.questionDifficulty,
            this.questionTypeId,
            this.skillId,
            this.searchText,
            this.selectedExamsIds()
          );
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  fetchAllQuestionTypes(): void {
    this.questionsService.getTeacherQuestionTypes().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allQuestionTypes = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getAllSkills(): void {
    this.skillService.getSkills().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allSkills = result;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  fetchAllExamsForFilter(teacherId: any): void {
    this.teacherService.getAllExamsPerTeacherTutorials(teacherId).subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allExamsToFilter.set(
            result.map((exam: any) => ({
              id: exam.examId,
              name: exam.examName,
            }))
          );
        }
      },
    });
  }

  filterByExams(exams: any[]) {
    this.selectedExamsIds.set(exams.map((e) => e.id));
    this.allQuestions = [];
    this.pageNumber = 1;
    this.getAllQuestion(
      this.pageSize,
      this.pageNumber,
      null,
      this.questionDifficulty,
      this.questionTypeId,
      this.skillId,
      this.searchText,
      this.selectedExamsIds()
    );
  }
  isLoadingExport = signal<boolean>(false);

  async exportToExcel() {
    this.isLoadingExport.set(true);
    // Fetch a larger set/all data for export.
    // Note: Adjust pageSize as needed, currently setting to 1000 to capture likely all relevant data for typical usage.
    // If dataset is huge, might need multiple chunks or backend support.
    this.questionsService
      .getAllQuestion(
        1000,
        1,
        null,
        this.questionDifficulty,
        this.questionTypeId,
        this.skillId,
        this.searchText,
        this.selectedExamsIds()
      )
      .subscribe({
        next: async (res) => {
          if (res.statusCode === 200) {
            const dataToExport = res.data;

            // Determine file name based on skill or default
            let fileName = 'questions_export';
            if (this.skillId) {
              const selectedSkill = this.allSkills.find(
                (s) => s.id === this.skillId
              );
              if (selectedSkill) {
                fileName = selectedSkill.name;
              }
            }

            await this.generateExcel(dataToExport, fileName);
          }
          this.isLoadingExport.set(false);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('فشل تصدير البيانات');
          this.isLoadingExport.set(false);
        },
      });
  }

  async generateExcel(data: Data[], fileName: string) {
    const ExcelJS = await import('exceljs');
    const { saveAs } = await import('file-saver');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Questions');

    // Define columns manually
    worksheet.getColumn(1).width = 10; // ID
    worksheet.getColumn(2).width = 30; // Skill Name
    worksheet.getColumn(3).width = 50; // Exams
    worksheet.getColumn(4).width = 100; // Image

    // Style columns
    [1, 2, 3, 4].forEach((colWith) => {
      const col = worksheet.getColumn(colWith);
      col.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
    });

    // Add Header Manually at Row 1 using addRow
    const headerRow = worksheet.addRow(['ID', 'Skill Name', 'Exams', 'Image']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' },
    };

    // Filter valid data first
    const validData = data.filter((item) => item && item.id);

    for (const item of validData) {
      const examsStr = item.exams?.map((e) => e.name).join(' - ') || '';

      // Use array based addRow for deterministic column mapping
      const row = worksheet.addRow([item.id, item.skillName, examsStr]);

      if (item.image1Url) {
        row.height = 120;
        await this.embedImageInExcel(workbook, worksheet, row, item.image1Url);
      }
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Save file
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`);
  }

  async embedImageInExcel(
    workbook: any,
    worksheet: any,
    row: any,
    imageUrl: string
  ) {
    try {
      // Fetch image using proxy (remove domain to make it relative)
      const proxyUrl = imageUrl.replace('https://backend.alssalem.com', '');
      const response = await fetch(proxyUrl);

      // Validate response and content type
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.startsWith('image/')) {
        throw new Error('Invalid image response');
      }

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();

      // Get image extension
      const ext = imageUrl.split('.').pop()?.toLowerCase() || 'png';
      let imageId = workbook.addImage({
        buffer: buffer,
        extension: ext as 'jpeg' | 'png' | 'gif',
      });

      // Embed image in the 4th column (index 3) - Filling the cell
      worksheet.addImage(imageId, {
        tl: { col: 3, row: row.number - 1 } as any,
        br: { col: 4, row: row.number } as any,
        editAs: 'oneCell',
      });
    } catch (e) {
      console.error('Error fetching image for question', e);
      // Fallback: Write URL to cell if image fetch fails
      row.getCell(4).value = imageUrl;
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (
      this.bottomReached() &&
      !this.isLoading() &&
      this.allData?.hasNextPage
    ) {
      this.getAllQuestion(
        this.pageSize,
        ++this.pageNumber,
        null,
        this.questionDifficulty,
        this.questionTypeId,
        this.skillId,
        this.searchText,
        this.selectedExamsIds()
      );
    }
  }

  private bottomReached(): boolean {
    return (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 10
    );
  }
}
