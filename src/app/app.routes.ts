import { Routes } from '@angular/router';
import { authGuard, authGuardLoggdIn } from './authentication/guard/auth.guard';
import { rolesGuard } from './shared/guard/roles.guard';
import { StudentGuard } from './authentication/guard/student.guard';

export const routes: Routes = [
  // Auth Pages
  {
    path: 'login',
    loadComponent: () =>
      import('./authentication/screens/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    canActivate: [authGuardLoggdIn],
    title: 'تسجل الدخول | السالم',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./authentication/screens/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
    canActivate: [authGuardLoggdIn],
    title: 'إعادة تعين كلمة المرور | السالم',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./authentication/screens/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    canActivate: [authGuardLoggdIn],
    title: 'التسجل | السالم',
  },
  {
    path: 'sso-login',
    loadComponent: () =>
      import('./authentication/screens/sso-login/sso-login.component').then(
        (m) => m.SSOLoginComponent,
      ),
    title: 'تسجيل الدخول | السالم',
  },
  {
    path: 'parent-register',
    loadComponent: () =>
      import('./authentication/screens/parent-register/parent-register.component').then(
        (m) => m.ParentRegisterComponent,
      ),
    canActivate: [authGuardLoggdIn],
    title: 'تسجيل ولي الأمر | السالم',
  },
  {
    path: 'thank-you/:orderId',
    loadComponent: () =>
      import('./pages/student/screens/thanks/thanks.component').then(
        (m) => m.ThanksComponent,
      ),
    title: 'مرحباً بك في منصة | السالم',
  },
  {
    path: 'confirm-payment/:orderId',
    loadComponent: () =>
      import('./pages/student/screens/comfirm-payment/confirm-payment.component').then(
        (m) => m.ComfirmPaymentComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'level-test',
    title: 'السالم للقدرات و التحصيلي - تحديد مستوي',
    loadComponent: () =>
      import('./pages/student/screens/profile/components/level-test/level-test.component').then(
        (m) => m.LevelTestComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'test-yourself/exam/:id',
    title: 'السالم للقدرات و التحصيلي - إختبر نفسك',
    loadComponent: () =>
      import('./pages/student/screens/Test-YourSelf/test-yourself-exam/test-yourself-exam.component').then(
        (m) => m.TestYourselfExamComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'checkoutExam/:id',
    title: 'السالم في القدرات و التحصيلي - أتمام عملية الدفع',
    loadComponent: () =>
      import('./pages/student/screens/Test-YourSelf/checkout-exam/checkout-exam.component').then(
        (m) => m.CheckoutExamComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'confirm-exam-payment/:orderId',
    loadComponent: () =>
      import('./pages/student/screens/Test-YourSelf/confirm-exam-payment/confirm-exam-payment.component').then(
        (m) => m.ConfirmExamPaymentComponent,
      ),
  },
  {
    path: 'question/:id/:slug',
    loadComponent: () =>
      import('./pages/student/question/question.component').then(
        (m) => m.QuestionComponent,
      ),
  },
  {
    path: 'test-yourself/exam/:examId',
    loadComponent: () =>
      import('./pages/student/screens/Test-YourSelf/revision-yourself/revision-yourself.component').then(
        (m) => m.RevisionYourselfComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'page/:pageNum',
        loadComponent: () =>
          import('./pages/student/screens/Test-YourSelf/revision-yourself/revision-exam-yourself/revision-exam-yourself.component').then(
            (m) => m.RevisionExamYourselfComponent,
          ),
      },
    ],
  },
  {
    path: 'exam/:examId/question/:qId',
    loadComponent: () =>
      import('./pages/student/screens/redirect-to-question/redirect-to-question.component').then(
        (m) => m.RedirectToQuestionComponent,
      ),
    canActivate: [authGuard],
  },
  // Student Pages
  {
    path: 'profile',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        title: 'السالم في القدرات و التحصيلي - الملف الشخصي',
        loadComponent: () =>
          import('./pages/student/screens/profile/student-profile/student-profile.component').then(
            (m) => m.StudentProfileComponent,
          ),
      },
      {
        path: 'plan',
        title: 'السالم في القدرات و التحصيلي - خطة الطالب',
        loadComponent: () =>
          import('./pages/student/screens/profile/components/study-plan/study-plan.component').then(
            (m) => m.StudyPlanComponent,
          ),
      },
      {
        path: 'tutorials',
        title: 'السالم في القدرات و التحصيلي - الملف الشخصي',
        loadComponent: () =>
          import('./pages/student/screens/profile-tutorials/profile-tutorials.component').then(
            (m) => m.ProfileTutorialsComponent,
          ),
      },
      {
        path: 'exams',
        title: 'السالم في القدرات و التحصيلي - الملف الشخصي',
        loadComponent: () =>
          import('./pages/student/screens/profile-exams/profile-exams.component').then(
            (m) => m.ProfileExamsComponent,
          ),
      },
      {
        path: 'exams-category',
        title: 'السالم في القدرات و التحصيلي - الملف الشخصي',
        loadComponent: () =>
          import('./pages/student/screens/exams-category-profile/exams-category-profile.component').then(
            (m) => m.ExamsCategoryProfileComponent,
          ),
      },
      {
        path: 'detect-level-result',
        title: 'السالم في القدرات و التحصيلي - نتيجة تحديد المستوي',
        loadComponent: () =>
          import('./pages/student/screens/detect-level-result/detect-level-result.component').then(
            (m) => m.DetectLevelResultComponent,
          ),
      },
      {
        path: 'questions',
        title: 'السالم في القدرات و التحصيلي - الملف الشخصي',
        loadComponent: () =>
          import('./pages/student/screens/profile-questions/profile-questions.component').then(
            (m) => m.ProfileQuestionsComponent,
          ),
      },
      {
        path: 'settings',
        title: 'السالم في القدرات و التحصيلي - الملف الشخصي',
        loadComponent: () =>
          import('./pages/student/screens/profile/components/settings-profile/settings-profile.component').then(
            (m) => m.SettingsProfileComponent,
          ),
        canDeactivate: [StudentGuard],
      },
    ],
  },
  {
    path: '',
    title: 'السالم للقدرات و التحصيلي - السالم في القدرات و التحصيلي',
    canActivate: [rolesGuard],
    loadComponent: () =>
      import('./layouts/lay-student/lay-student.component').then(
        (m) => m.LayStudentComponent,
      ),
    children: [
      {
        path: '',
        title: 'السالم للقدرات و التحصيلي - السالم في القدرات و التحصيلي',
        loadComponent: () =>
          import('./pages/student/screens/home/home.component').then(
            (m) => m.HomeComponent,
          ),
      },
      {
        path: 'cateogry/:name',
        title: 'السالم في القدرات و التحصيلي - الاقسام',
        loadComponent: () =>
          import('./pages/student/screens/sub-cateogry/sub-cateogry.component').then(
            (m) => m.SubCateogryComponent,
          ),
      },
      {
        path: 'video/:id',
        title: 'السالم في القدرات و التحصيلي - شرح المنصة',
        loadComponent: () =>
          import('./pages/student/screens/explain-video/explain-video.component').then(
            (m) => m.ExplainVideoComponent,
          ),
      },
      {
        path: 'exams',
        title: 'السالم في القدرات و التحصيلي - الاختبارات المحاكية',
        children: [
          {
            path: 'category/:id',
            loadComponent: () =>
              import('./pages/student/screens/exams-category/exams-category.component').then(
                (m) => m.ExamsCategoryComponent,
              ),
          },
          {
            path: 'category/:id/exam-mock/:examId',
            loadComponent: () =>
              import('./pages/student/screens/exam-mock/exam-mock.component').then(
                (m) => m.ExamMockComponent,
              ),
          },
          {
            path: 'revision',
            loadComponent: () =>
              import('./pages/student/screens/exam-mock-revision/exam-mock-revision.component').then(
                (m) => m.ExamMockRevisionComponent,
              ),
          },
        ],
      },
      {
        path: 'cateogry-tutorials',
        title: 'السالم في القدرات و التحصيلي - الدورات',
        children: [
          {
            path: ':cateogryId',
            loadComponent: () =>
              import('./pages/student/screens/cateogry-tutorials/cateogry-tutorials.component').then(
                (m) => m.CateogryTutorialsComponent,
              ),
          },
        ],
      },
      {
        path: 'tutorial',
        title: 'السالم في القدرات و التحصيلي - الدورات',
        children: [
          {
            path: ':tutorialId',
            loadComponent: () =>
              import('./pages/student/screens/course-page/course-page.component').then(
                (m) => m.CoursePageComponent,
              ),
          },
          {
            path: ':tutorialId',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/student/screens/course-layout/course-layout.component').then(
                    (m) => m.CourseLayoutComponent,
                  ),
                children: [
                  {
                    path: 'lesson/:id',
                    loadComponent: () =>
                      import('./pages/student/screens/course-layout/video-lesson/video-lesson.component').then(
                        (m) => m.VideoLessonComponent,
                      ),
                  },
                  {
                    path: 'exam/:examId',
                    loadComponent: () =>
                      import('./pages/student/screens/course-layout/test-lesson/start-exam/start-exam.component').then(
                        (m) => m.StartExamComponent,
                      ),
                  },
                  {
                    path: 'exam/:examId/additional-settings',
                    title:
                      'السالم للاختبارات الإضافية - إعدادات الاختبار المخصص',
                    loadComponent: () =>
                      import('./pages/student/screens/additional-exam/settings-additional-exam/settings-additional-exam.component').then(
                        (m) => m.SettingsAdditionalExamComponent,
                      ),
                  },
                  {
                    path: 'exam/:examId',
                    children: [
                      {
                        path: 'result-answers/:trailId',
                        loadComponent: () =>
                          import('./pages/student/screens/course-layout/test-lesson/result-answers/result-answers.component').then(
                            (m) => m.ResultAnswersComponent,
                          ),
                        canActivate: [authGuard],
                        children: [
                          {
                            path: 'page/:pageNum',
                            loadComponent: () =>
                              import('./pages/student/screens/course-layout/test-lesson/result-answers/review-answers/review-answers.component').then(
                                (m) => m.ReviewAnswersComponent,
                              ),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'package',
        title: 'السالم في القدرات و التحصيلي - البكدج',
        children: [
          {
            path: ':packageId',
            loadComponent: () =>
              import('./pages/student/screens/package-page/package-page.component').then(
                (m) => m.PackagePageComponent,
              ),
          },
        ],
      },
      {
        path: 'checkout/:id',
        title: 'السالم في القدرات و التحصيلي - أتمام عملية الدفع',
        loadComponent: () =>
          import('./pages/student/screens/checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile/plan/:id',
        title: 'السالم في القدرات و التحصيلي - خطة الطالب',
        loadComponent: () =>
          import('./pages/student/screens/profile/plan-study-form/plan-study-form.component').then(
            (m) => m.PlanStudyFormComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'about-us',
        title: 'السالم في القدرات و التحصيلي - من نحن؟',
        loadComponent: () =>
          import('./pages/student/screens/about-us/about-us.component').then(
            (m) => m.AboutUsComponent,
          ),
      },
      {
        path: 'article',
        title: 'السالم في القدرات و التحصيلي - المقالات',
        loadComponent: () =>
          import('./pages/student/screens/article-student/article-student.component').then(
            (m) => m.ArticleStudentComponent,
          ),
      },
      {
        path: 'best-tutorials',
        title: 'السالم في القدرات و التحصيلي - دورات مُميزة',
        loadComponent: () =>
          import('./pages/student/screens/best-tutorials/best-tutorials.component').then(
            (m) => m.BestTutorialsComponent,
          ),
      },
    ],
  },
  /// school-admin
  {
    path: 'school-admin',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    children: [
      {
        path: '',
        title: 'لوحة تحكم أدمن المدرسة - السالم',
        loadComponent: () =>
          import('./pages/school-admin/screens/dashoard-school-admin/dashoard-school-admin.component').then(
            (m) => m.DashoardSchoolAdminComponent,
          ),
      },
      {
        path: 'students',
        title: 'لوحة تحكم أدمن المدرسة - السالم',
        loadComponent: () =>
          import('./pages/school-admin/screens/schools-students/schools-students.component').then(
            (m) => m.SchoolsStudentsComponent,
          ),
      },
      {
        path: 'join-students',
        title: 'لوحة تحكم أدمن المدرسة - السالم',
        loadComponent: () =>
          import('./pages/school-admin/screens/join-students/join-students.component').then(
            (m) => m.JoinStudentsComponent,
          ),
      },
    ],
  },
  // ManagerAccountant
  {
    path: 'manager-accountant',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    children: [
      {
        path: '',
        title: 'لوحة تحكم - السالم',
        loadComponent: () =>
          import('./pages/manager-accountant/screens/manager-home/manager-home.component').then(
            (m) => m.ManagerHomeComponent,
          ),
      },
      {
        path: 'payment',
        title: 'لوحة تحكم / تقرير عمليات الدفع - السالم',
        loadComponent: () =>
          import('./pages/dashboard/payment-report/payment-report.component').then(
            (m) => m.PaymentReportComponent,
          ),
      },
    ],
  },
  // أدمن الإختبارات
  {
    path: 'admin-exam',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    children: [
      {
        path: '',
        title: 'لوحة تحكم - أدمن الإختبارات - السالم',
        loadComponent: () =>
          import('./pages/admin-exam/screens/all-category-exams/all-category-exams.component').then(
            (m) => m.AllCategoryExamsComponent,
          ),
      },
      {
        path: 'create',
        title: 'لوحة تحكم - أدمن الإختبارات - السالم',
        loadComponent: () =>
          import('./pages/admin-exam/screens/category-exams/category-exams.component').then(
            (m) => m.CategoryExamsComponent,
          ),
      },
      {
        path: 'edit/:id',
        title: 'تعديل اختبار محاكي - السالم',
        loadComponent: () =>
          import('./pages/admin-exam/screens/category-exams/category-exams.component').then(
            (m) => m.CategoryExamsComponent,
          ),
      },
      {
        path: 'view/:id',
        title: 'لوحة تحكم - أدمن الإختبارات - السالم',
        loadComponent: () =>
          import('./pages/admin-exam/screens/exam-questions-viewer/exam-questions-viewer.component').then(
            (m) => m.ExamQuestionsViewerComponent,
          ),
      },
    ],
  },
  // Admin Pages
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    children: [
      {
        path: '',
        title: 'لوحة تحكم - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/admin-home/admin-home.component').then(
            (m) => m.AdminHomeComponent,
          ),
      },
      {
        path: 'categories',
        title: 'لوحة تحكم / الأقسام - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/categories-admin/categories-admin.component').then(
            (m) => m.CategoriesAdminComponent,
          ),
      },
      {
        path: 'action-category/:id',
        title: 'لوحة تحكم / الأقسام - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/action-category/action-category.component').then(
            (m) => m.ActionCategoryComponent,
          ),
      },
      {
        path: 'users',
        title: 'لوحة تحكم / المستخدمين - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/users-admin/users-admin.component').then(
            (m) => m.UsersAdminComponent,
          ),
      },
      {
        path: 'users',
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/dashboard/screens/users-admin/components/container-actions/container-actions.component').then(
                (m) => m.ContainerActionsComponent,
              ),
          },
        ],
      },
      {
        path: 'student',
        title: 'لوحة تحكم / الطلاب - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/student-admin/student-admin.component').then(
            (m) => m.StudentAdminComponent,
          ),
      },
      {
        path: 'school',
        title: 'لوحة تحكم / المدارس - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/school-admin/school-admin.component').then(
            (m) => m.SchoolAdminComponent,
          ),
      },
      {
        path: 'subscription',
        title: 'لوحة تحكم / الإشتراكات - السالم',
        loadComponent: () =>
          import('./pages/dashboard/subscription/subscription.component').then(
            (m) => m.SubscriptionComponent,
          ),
      },
      {
        path: 'tutorial',
        title: 'لوحة تحكم / الدورات - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/tutorials-admin/tutorials-admin.component').then(
            (m) => m.TutorialsAdminComponent,
          ),
      },
      {
        path: 'tutorial',
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/dashboard/screens/tutorials-admin/Components/actions-tutorial/actions-tutorial.component').then(
                (m) => m.ActionsTutorialComponent,
              ),
          },
        ],
      },
      {
        path: 'package-tutorials',
        title: 'لوحة تحكم / الدورات - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/package-tutorial/package-tutorial.component').then(
            (m) => m.PackageTutorialComponent,
          ),
      },
      {
        path: 'package-tutorials',
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/dashboard/screens/package-tutorial/actions-package/actions-package.component').then(
                (m) => m.ActionsPackageComponent,
              ),
          },
        ],
      },
      {
        path: 'payment',
        title: 'لوحة تحكم / عمليات الدفع - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/payment-admin/payment-admin.component').then(
            (m) => m.PaymentAdminComponent,
          ),
      },
      {
        path: 'student-register',
        title: 'لوحة تحكم / تسجيل الطلاب - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/student-register/student-register.component').then(
            (m) => m.StudentRegisterComponent,
          ),
      },
      {
        path: 'payment-report',
        title: 'لوحة تحكم / تقرير عمليات الدفع - السالم',
        loadComponent: () =>
          import('./pages/dashboard/payment-report/payment-report.component').then(
            (m) => m.PaymentReportComponent,
          ),
      },
      {
        path: 'comments',
        title: 'لوحة تحكم / جميع التعليقات - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/comments-admin/comments-admin.component').then(
            (m) => m.CommentsAdminComponent,
          ),
      },
      {
        path: 'article',
        title: 'لوحة تحكم / جميع المقالات - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/article-admin/article-admin.component').then(
            (m) => m.ArticleAdminComponent,
          ),
      },
      {
        path: 'article',
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/dashboard/screens/actions-article/actions-article.component').then(
                (m) => m.ActionsArticleComponent,
              ),
            title: 'لوحة تحكم / تعديل مقال - السالم',
          },
          {
            path: '0',
            title: 'لوحة تحكم / اضافة مقال - السالم',
            loadComponent: () =>
              import('./pages/dashboard/screens/actions-article/actions-article.component').then(
                (m) => m.ActionsArticleComponent,
              ),
          },
        ],
      },
      {
        path: 'promo-code',
        title: 'لوحة تحكم / اكواد الخصم - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/promo-codes/promo-codes.component').then(
            (m) => m.PromoCodesComponent,
          ),
      },
      {
        path: 'social-media',
        title: 'لوحة تحكم / وسائل التواصل - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/social-media/social-media.component').then(
            (m) => m.SocialMediaComponent,
          ),
      },
      {
        path: 'feedback',
        title: 'لوحة تحكم / اراء الطلاب - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/feedback-admin/feedback-admin.component').then(
            (m) => m.FeedbackAdminComponent,
          ),
      },
      {
        path: 'offers',
        title: 'لوحة تحكم / عروض - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/offers/offers.component').then(
            (m) => m.OffersComponent,
          ),
      },
      {
        path: 'suggest-school',
        loadComponent: () =>
          import('./pages/dashboard/screens/suggest-school/suggest-school.component').then(
            (m) => m.SuggestSchoolComponent,
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./pages/dashboard/screens/statistics/statistics.component').then(
            (m) => m.StatisticsComponent,
          ),
        title: 'لوحة تحكم / إحصائيات - السالم',
      },
      {
        path: 'online-users',
        title: 'لوحة تحكم / المتصلين الان - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/online-users/online-users.component').then(
            (m) => m.OnlineUsersComponent,
          ),
      },
    ],
  },
  // Teacher
  {
    path: 'instructor',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    children: [
      {
        path: '',
        title: 'لوحة تحكم- المدرس / الدورات - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/tutorial-teacher/tutorial-teacher.component').then(
            (m) => m.TutorialTeacherComponent,
          ),
      },
      {
        path: 'videos',
        title: 'لوحة تحكم- المدرس / الفيديوهات - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/all-videos/all-videos.component').then(
            (m) => m.AllVideosComponent,
          ),
      },
      {
        path: 'cateogry-exams',
        title: 'لوحة تحكم- المدرس / امتحانات الخطة - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/cateogry-exams/cateogry-exams.component').then(
            (m) => m.CateogryExamsComponent,
          ),
      },
      {
        path: 'edit-tutorial',
        title: 'لوحة تحكم- المدرس / اضافة درس - السالم',
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/instructor/screens/edit-tutorial/edit-tutorial.component').then(
                (m) => m.EditTutorialComponent,
              ),
          },
        ],
      },
      {
        path: 'exams',
        title: 'لوحة تحكم- المدرس / امتحانات - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/exams/exams.component').then(
            (m) => m.ExamsComponent,
          ),
      },
      {
        path: 'exams',
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/instructor/screens/actions-exam/actions-exam.component').then(
                (m) => m.ActionsExamComponent,
              ),
          },
          {
            path: '0',
            title: 'لوحة تحكم- المدرس / اضافة امتحان - السالم',
            loadComponent: () =>
              import('./pages/instructor/screens/actions-exam/actions-exam.component').then(
                (m) => m.ActionsExamComponent,
              ),
          },
        ],
      },
      {
        path: 'add-questions',
        title: 'لوحة تحكم- المدرس / بنك الأسئلة - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/add-questions/add-questions.component').then(
            (m) => m.AddQuestionsComponent,
          ),
      },
      {
        path: 'questions',
        title: 'لوحة تحكم- المدرس / بنك الأسئلة - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/all-questions/all-questions.component').then(
            (m) => m.AllQuestionsComponent,
          ),
      },
      {
        path: 'question/:id',
        title: 'لوحة تحكم- المدرس / تعديل سؤال - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/edit-question/edit-question.component').then(
            (m) => m.EditQuestionComponent,
          ),
      },
      {
        path: 'questions-type',
        title: 'لوحة تحكم - المدرس / نوع الأسئلة - السالم',
        loadComponent: () =>
          import('./pages/dashboard/screens/question-types/question-types.component').then(
            (m) => m.QuestionTypesComponent,
          ),
      },
      {
        path: 'skill-type',
        title: 'لوحة تحكم - المدرس / نوع الأسئلة - السالم',
        loadComponent: () =>
          import('./pages/instructor/screens/skill-type/skill-type.component').then(
            (m) => m.SkillTypeComponent,
          ),
      },
      {
        path: 'qr-code',
        loadComponent: () =>
          import('./pages/instructor/screens/qr-code/qr-code.component').then(
            (m) => m.QrCodeComponent,
          ),
      },
      {
        path: 'random-exam',
        loadComponent: () =>
          import('./pages/instructor/screens/random-exam/random-exam.component').then(
            (m) => m.RandomExamComponent,
          ),
      },
    ],
  },
  // school-accountant
  {
    path: 'school-accountant',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    children: [
      {
        path: '',
        title: 'لوحة تحكم- المحاسب - السالم',
        loadComponent: () =>
          import('./pages/school-accountant/accountant-home/accountant-home.component').then(
            (m) => m.AccountantHomeComponent,
          ),
      },
    ],
  },
  // Supervisor Pages
  {
    path: 'super',
    loadComponent: () =>
      import('./layouts/lay-admin/lay-admin.component').then(
        (m) => m.LayAdminComponent,
      ),
    title: ' مشرف المدرسة - السالم',
    canActivate: [authGuard, rolesGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/supervisor/screens/super/super.component').then(
            (m) => m.SuperComponent,
          ),
      },
      {
        path: 'roadmaps',
        loadComponent: () =>
          import('./pages/supervisor/screens/roadmaps-management/roadmaps-list/roadmaps-list.component').then(
            (m) => m.RoadmapsListComponent,
          ),
      },
      {
        path: 'roadmaps/create',
        loadComponent: () =>
          import(
            './pages/supervisor/screens/roadmaps-management/create-roadmap/create-roadmap.component'
          ).then((m) => m.CreateRoadmapComponent),
      },
      {
        path: 'roadmaps/edit/:id',
        loadComponent: () =>
          import(
            './pages/supervisor/screens/roadmaps-management/create-roadmap/create-roadmap.component'
          ).then((m) => m.CreateRoadmapComponent),
      },
      {
        path: 'active-status-students',
        loadComponent: () =>
          import('./pages/supervisor/screens/active-status-students/active-status-students.component').then(
            (m) => m.ActiveStatusStudentsComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/supervisor/screens/reports-management/reports-management.component').then(
            (m) => m.ReportsManagementComponent,
          ),
      },
      {
        path: 'teacher-reports',
        loadComponent: () =>
          import('./pages/supervisor/screens/teacher-reports/teacher-reports.component').then(
            (m) => m.TeacherReportsComponent,
          ),
      },
      {
        path: 'general-reports',
        loadComponent: () =>
          import('./pages/supervisor/screens/general-reports/general-reports.component').then(
            (m) => m.GeneralReportsComponent,
          ),
      },
      {
        path: 'principal-reports',
        loadComponent: () =>
          import('./pages/supervisor/screens/principal-reports/principal-reports.component').then(
            (m) => m.PrincipalReportsComponent,
          ),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/supervisor/screens/home-supervisor/home-supervisor.component').then(
            (m) => m.HomeSupervisorComponent,
          ),
      },
      {
        path: 'average-exams',
        loadComponent: () =>
          import('./pages/supervisor/screens/average-exams/average-exams.component').then(
            (m) => m.AverageExamsComponent,
          ),
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./pages/supervisor/screens/super-exam/super-exam.component').then(
            (m) => m.SuperExamComponent,
          ),
      },
      {
        path: 'review-answers',
        loadComponent: () =>
          import('./pages/supervisor/screens/review-exam-answers/review-exam-answers.component').then(
            (m) => m.ReviewExamAnswersComponent,
          ),
      },
      {
        path: 'virtual-exams',
        loadComponent: () =>
          import('./pages/supervisor/screens/super-virtual-exam/super-virtual-exam.component').then(
            (m) => m.SuperVirtualExamComponent,
          ),
      },
    ],
  },

  // student View
  {
    path: 'supervisor/:id',
    loadComponent: () =>
      import('./layouts/lay-super/lay-super.component').then(
        (m) => m.LaySuperComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'supervisor/profile/plan/:id',
    loadComponent: () =>
      import('./pages/supervisor/screens/student-plan/student-plan.component').then(
        (m) => m.StudentPlanComponent,
      ),
  },
  {
    path: 'supervisor/profile-student/:id',
    loadComponent: () =>
      import('./pages/supervisor/screens/tutorial-statistics/tutorial-statistics.component').then(
        (m) => m.TutorialStatisticsComponent,
      ),
  },
  {
    path: 'supervisor/settings/:id',
    title: 'تعديل بيانات الطالب | السالم',
    loadComponent: () =>
      import('./pages/student/screens/profile/components/settings-profile/settings-profile.component').then(
        (m) => m.SettingsProfileComponent,
      ),
    canActivate: [authGuard],
  },
  // parent Pages
  {
    path: 'parent',
    loadComponent: () =>
      import('./pages/parent/screens/home-parent/home-parent.component').then(
        (m) => m.HomeParentComponent,
      ),
    title: ' ولي الأمر - السالم',
    canActivate: [authGuard, rolesGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/pagenotfound/pagenotfound.component').then(
        (m) => m.PagenotfoundComponent,
      ),
  },
];
