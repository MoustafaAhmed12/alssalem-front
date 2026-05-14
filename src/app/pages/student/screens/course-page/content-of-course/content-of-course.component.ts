import { Location, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { UnitChapter, Units } from '../../../model/all-tutorial-details';
import { TutorilsStudentsService } from '../../../services/tutorils-students.service';
@Component({
  selector: 'app-content-of-course',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './content-of-course.component.html',
  styleUrl: './content-of-course.component.scss',
})
export class ContentOfCourseComponent
  implements OnChanges, OnInit, AfterViewInit
{
  router = inject(Router);
  tutorilsStudentsService = inject(TutorilsStudentsService);
  // @Input() allUnits: Units = {} as Units;
  allUnits = input.required<Units>();
  @Input() isOpen: boolean = false;
  @Output() itemClicked = new EventEmitter<boolean>();
  unitChapter: UnitChapter[] = [];
  route = inject(ActivatedRoute);
  location = inject(Location);
  tutorialId: number = 0;
  isLoading = signal<boolean>(false);
  activeUnitId = signal<number>(0);
  idLesson: string | null = '';
  idexam: string | null = '';

  onClick() {
    this.itemClicked.emit();
  }

  ngOnChanges(): void {
    this.route.params.subscribe((p) => {
      this.tutorialId = +p['tutorialId'];
    });

    console.log(this.allUnits());
    this.route.queryParams.subscribe((params) => {
      const unitId = params['unitId'] ? +params['unitId'] : null;
      if (!unitId) {
        this.activeUnitId.set(this.allUnits().units[0].id);
        this.unitChapter = this.allUnits().firstUnitChapters;

      } else {
        if (unitId === this.allUnits().units[0].id) {
          this.activeUnitId.set(this.allUnits().units[0].id);
          this.unitChapter = this.allUnits().firstUnitChapters;

        } else {
          this.activeUnitId.set(unitId);
          this.getUnitDetail(this.activeUnitId(), this.tutorialId);
        }
      }
    });

    this.route.params.subscribe((params) => {
      this.tutorialId = parseInt(params['tutorialId']);
      console.log(params);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.extractNumberFromURL(this.location.path());
      let element;
      if (this.idexam) {
        element = document.getElementById('item-' + this.idexam);
      } else {
        element = document.getElementById('chapter-' + this.idLesson);
      }
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }, 100);
  }

  ngOnInit() {}

  extractNumberFromURL(url: string) {
    const examMatch = url.match(/exam\/(\d+)/);
    const lessonMatch = url.match(/lesson\/(\d+)/);

    if (examMatch) {
      this.idexam = examMatch[1];
    } else if (lessonMatch) {
      this.idLesson = lessonMatch[1];
    }
  }

  getUnitDetail(unitId: number, tutorialId: number): void {
    this.isLoading.set(true);
    this.tutorilsStudentsService.getUnitDetail(unitId, tutorialId).subscribe({
      next: ({ statusCode, result }) => {
        if (statusCode === 200) {
          this.isLoading.update((v) => (v = false));
          this.unitChapter = result;
        } else {
          this.isLoading.update((v) => (v = false));
        }
      },
      error: ({ error }) => {
        this.isLoading.update((v) => (v = false));
      },
    });
  }

  toggleUnit(unitId: number) {
    if (this.activeUnitId() === unitId) {
      this.activeUnitId.set(unitId);
    } else {
      this.activeUnitId.set(unitId);
      setTimeout(() => {
        const unitElement = document.getElementById(`unit-${unitId}`);
        if (unitElement) {
          const offsetTop =
            unitElement.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: offsetTop - 350,
            behavior: 'smooth',
          });
        }
      }, 200);
      if (this.activeUnitId() !== this.allUnits().units[0].id) {
        this.getUnitDetail(unitId, this.tutorialId);
      } else {
        this.unitChapter = this.allUnits().firstUnitChapters;

      }
    }
  }
}
