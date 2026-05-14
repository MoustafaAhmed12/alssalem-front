// import { NgClass, NgStyle } from '@angular/common';
// import {
//   ChangeDetectorRef,
//   Component,
//   OnInit,
//   ViewChild,
//   inject,
//   signal,
// } from '@angular/core';
// import {
//   FormArray,
//   NonNullableFormBuilder,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { TutorilsStudentsService } from '../../../services/tutorils-students.service';
// import { AuthService } from '../../../../../authentication/services/auth.service';
// import { ToastrService } from 'ngx-toastr';
// import { ActivatedRoute, Router } from '@angular/router';
// import {
//   animate,
//   state,
//   style,
//   transition,
//   trigger,
// } from '@angular/animations';
// import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
// import { CorrectionExamComponent } from './correction-exam/correction-exam.component';
// import { CorrectionExamService } from '../../../services/correction-exam.service';
// import { SettingsAdditionalExamComponent } from '../../additional-exam/settings-additional-exam/settings-additional-exam.component';
// import { Form, FormQuestion } from '../../../model/question-student';
// import { StartExamComponent } from './start-exam/start-exam.component';
// @Component({
//   selector: 'app-test-lesson',
//   standalone: true,
//   imports: [
//     ReactiveFormsModule,
//     CdTimerModule,
//     CorrectionExamComponent,
//     SettingsAdditionalExamComponent,
//     StartExamComponent,
//   ],
//   templateUrl: './test-lesson.component.html',
//   styleUrl: './test-lesson.component.scss',
//   animations: [
//     trigger('tabAnimation', [
//       state(
//         'tab1',
//         style({
//           opacity: 1,
//           transform: 'scale(1)',
//         })
//       ),
//       state(
//         'tab2',
//         style({
//           opacity: 1,
//           transform: 'scale(1)',
//         })
//       ),
//       state(
//         'tab3',
//         style({
//           opacity: 1,
//           transform: 'scale(1)',
//         })
//       ),
//       transition('* => *', [
//         style({ opacity: 0, transform: 'scale(0.8)' }),
//         animate('250ms ease-out'),
//       ]),
//     ]),
//   ],
// })
// export class TestLessonComponent implements OnInit {
//   tutorilsStudentsService = inject(TutorilsStudentsService);
//   correctionExamService = inject(CorrectionExamService);
//   fb = inject(NonNullableFormBuilder);
//   correctionForm!: Form;
//   cdr = inject(ChangeDetectorRef);
//   authService = inject(AuthService);
//   toastr = inject(ToastrService);
//   route = inject(ActivatedRoute);
//   router = inject(Router);
//   isAuth: boolean = false;
//   userId = signal<number>(0);
//   isLoading = signal<boolean>(false);
//   correctionLoading = signal<boolean>(false);
//   time: number = 0;
//   examId: number = 0;
//   examDetails: any;
//   correctionExamDetails: any;
//   currentPage: number = 0;
//   questionsPerPage: number = 1;
//   takeTime: number = 0;
//   timeInMin: string = '';
//   selectedTab: number = 2;
//   isPaused: boolean = false;
//   isOpenSettings: boolean = false;
//   @ViewChild('basicTimer', { static: false }) basicTimer!: CdTimerComponent;
//   startTime: number = 0;
//   isCountdown: boolean = false;
//   tabs = [
//     { label: 'قبل الاختبار' },
//     { label: 'ابدأ الاختبار' },
//     { label: 'إنهاء الاختبار' },
//   ];
//   ngOnInit(): void {
//     this.isAuth = this.authService.isAuth();
//     this.userId.set(this.authService.currentUser()?.userDto.id);
//     this.route.params.subscribe((params) => {
//       this.examId = +params['examId'];
//       if (this.examId) {
//         this.fetchStudentExam({
//           examId: this.examId,
//           userId: this.isAuth ? this.userId() : 0,
//         });
//       }
//     });
//     const cucreationDate = new Date();

//     this.correctionForm = this.fb.group({
//       id: [0],
//       userId: [this.isAuth ? this.userId() : 0],
//       examId: [0],
//       durationInMinutes: [0],
//       creationDate: [cucreationDate],
//       questions: this.fb.array<FormQuestion>([]),
//     });
//   }
//   get getQuestions() {
//     return this.correctionForm.get('questions') as FormArray;
//   }
//   onAnswerSelected(questionIndex: number, answerNumber: number) {
//     this.isPaused = false;
//     this.basicTimer.resume();
//     this.getQuestions.at(questionIndex).get('answer')?.setValue(answerNumber);
//   }
//   resetQuestions(): void {
//     while (this.getQuestions.length !== 0) {
//       this.getQuestions.removeAt(0);
//     }
//   }
//   fetchStudentExam(examIdAndUserId: any): void {
//     this.isLoading.set(true);
//     this.tutorilsStudentsService.getStudentExam(examIdAndUserId).subscribe({
//       next: ({ statusCode, result, msg }) => {
//         if (statusCode === 200) {
//           this.selectedTab = 0;
//           this.resetQuestions();
//           this.correctionForm.get('questions')?.reset();
//           this.examDetails = result;
//           this.time = this.examDetails.durationInMinutes;
//           this.convertMinutesToTime(this.examDetails.durationInMinutes);
//           result.questions.forEach((question: any) => {
//             this.getQuestions.push(
//               this.fb.group({
//                 id: [question.id],
//                 questionImage: [question.questionImage],
//                 questionImage2: [question.questionImage2],
//                 questionTypeId: [question.questionTypeId],
//                 answer: [question.answer],
//               })
//             );
//           });
//           this.isLoading.update((v) => (v = false));
//         } else {
//           this.isLoading.update((v) => (v = false));
//           this.toastr.error(msg);
//         }
//       },
//       error: (err) => {
//         console.log(err);
//         this.isLoading.update((v) => (v = false));
//       },
//     });
//   }
//   startTimer() {
//     if (this.time === 0) {
//       this.isCountdown = false;
//       this.startTime = 0;
//       this.basicTimer?.reset();
//       this.basicTimer?.start();
//     } else {
//       this.isCountdown = true;
//       this.startTime = this.time * 60;
//       this.basicTimer?.reset();
//       this.basicTimer?.start();
//     }
//   }
//   onComplete() {
//     this.toastr.info('تم إنتهاء الوقت المحدد');
//     this.onSubmit();
//     this.selectedTab = 2;
//     this.cdr.detectChanges();
//   }
//   toggleTimer(): void {
//     if (this.isPaused) {
//       this.basicTimer.resume();
//     } else {
//       this.basicTimer.stop();
//     }
//     this.isPaused = !this.isPaused;
//   }

//   selectTab(index: number) {
//     this.selectedTab = index;
//     if (index === 1) {
//       this.currentPage = 0;
//       this.startTimer();
//     }
//     if (index === 2) {
//       this.onSubmit();
//       this.getQuestions.reset();
//     }
//   }
//   onSubmit(): void {
//     if (this.time === 0) {
//       this.takeTime = this.basicTimer?.get()?.tick_count;
//     } else {
//       const newTime = this.time * 60;
//       this.takeTime = newTime - this.basicTimer?.get().tick_count;
//     }
//     this.correctionForm.get('durationInMinutes')?.setValue(this.takeTime);
//     this.correctionLoading.set(true);
//     this.correctionForm.get('examId')?.setValue(this.examId);
//     this.correctionExamService
//       .correctStudentExam(this.correctionForm.value)
//       .subscribe({
//         next: ({ statusCode, result, msg }) => {
//           if (statusCode === 200) {
//             this.correctionLoading.update((v) => (v = false));
//             this.correctionExamDetails = result;
//           } else {
//             this.toastr.error(msg);
//             this.correctionLoading.update((v) => (v = false));
//           }
//         },
//         error: (err) => {
//           console.log(err);
//           this.correctionLoading.update((v) => (v = false));
//         },
//       });
//   }
//   convertMinutesToTime(minutes: number): void {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     this.timeInMin = `${this.padZero(hours)}:${this.padZero(mins)}:00`;
//   }
//   padZero(num: number): string {
//     return num < 10 ? `0${num}` : `${num}`;
//   }
//   // Navigation
//   nextQuestion(): void {
//     if (this.currentPage < this.examDetails?.totalGrades) {
//       this.currentPage++;
//     }
//   }
//   prevQuestion(): void {
//     if (this.currentPage > 0) {
//       this.currentPage--;
//     }
//   }
//   get totalPages(): number {
//     return Math.ceil(this.examDetails?.totalGrades / this.questionsPerPage);
//   }
//   getPageRange(): number[] {
//     const rangeSize = 12;
//     const start = Math.max(0, this.currentPage - Math.floor(rangeSize / 2));
//     const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
//     return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
//   }
//   gotoPage(pageNum: number): void {
//     if (pageNum >= 1 && pageNum <= this.totalPages) {
//       this.currentPage = pageNum - 1;
//     }
//   }
//   navigateToTutorial() {
//     this.router.navigate(['../../'], { relativeTo: this.route });
//   }
// }
