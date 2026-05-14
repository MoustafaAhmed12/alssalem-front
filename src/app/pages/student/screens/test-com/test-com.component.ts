import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tutorial {
  id: number;
  endDate: string;
  startDate: string;
  name: string;
  isFinished: boolean;
  advancePercentage: number;
}

interface Exam {
  id: number;
  isSuccess: boolean;
  takenTimeInSec: number;
  percentage: number;
  name: string;
  passingPrecent: number;
  tutorialId: number;
  tutorialName: string;
  totalQuestions: number;
  creationDate: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  schoolName: string;
  classNo: number;
  referenceKey: string;
  tutorials: Tutorial[];
  exams: Exam[];
}

@Component({
  selector: 'app-app-test-com',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white shadow-lg border-b-4 border-[#36b290] relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Mobile menu button -->
            <div class="md:hidden">
              <button
                (click)="toggleMobileMenu()"
                class="text-gray-600 hover:text-[#36b290] focus:outline-none focus:text-[#36b290] p-2"
              >
                <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  @if (!isMobileMenuOpen) {
                  <path
                    fill-rule="evenodd"
                    d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
                  />
                  } @else {
                  <path
                    fill-rule="evenodd"
                    d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
                  />
                  }
                </svg>
              </button>
            </div>

            <!-- Logo -->
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-2xl font-bold text-[#36b290]">منصة قدرات</h1>
              </div>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4 space-x-reverse">
                @for (item of navItems; track item.name) {
                <a
                  href="#"
                  class="text-gray-700 hover:text-[#36b290] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {{ item.name }}
                </a>
                }
              </div>
            </div>

            <!-- User Menu -->
            <div class="flex items-center space-x-4 space-x-reverse">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  {{ student.firstName }} {{ student.lastName }}
                </p>
                <p class="text-xs text-gray-600">{{ student.state }}</p>
              </div>
              <button
                class="bg-[#e5a53f] hover:bg-[#d4941f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                تسجيل خروج
              </button>
            </div>
          </div>

          <!-- Mobile Navigation -->
          @if (isMobileMenuOpen) {
          <div class="md:hidden border-t border-gray-200 pt-4 pb-3 bg-white">
            <div class="flex flex-col space-y-1">
              @for (item of navItems; track item.name) {
              <a
                href="#"
                class="text-gray-700 hover:text-[#36b290] block px-3 py-2 rounded-md text-base font-medium"
              >
                {{ item.name }}
              </a>
              }
            </div>
          </div>
          }
        </div>
      </nav>

      <div class="flex">
        <!-- Sidebar -->
        <aside
          class="fixed inset-y-0 right-0 top-16 z-10 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
          [class.translate-x-0]="isSidebarOpen"
          [class.translate-x-full]="!isSidebarOpen"
        >
          <div class="h-full overflow-y-auto">
            <!-- Profile Section -->
            <div
              class="p-6 bg-gradient-to-br from-[#36b290] to-[#2a8f73] text-white"
            >
              <div class="text-center">
                <div
                  class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span class="text-2xl font-bold"
                    >{{ student.firstName.charAt(0)
                    }}{{ student.lastName.charAt(0) }}</span
                  >
                </div>
                <h3 class="font-semibold text-lg">
                  {{ student.firstName }} {{ student.lastName }}
                </h3>
                <p class="text-sm opacity-90">{{ student.schoolName }}</p>
                <p class="text-xs opacity-75">الفصل: {{ student.classNo }}</p>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="p-4 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900 mb-3">إحصائيات سريعة</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">إجمالي الدورات</span>
                  <span class="font-medium text-[#36b290]">{{
                    uniqueTutorials.length
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">الدورات المكتملة</span>
                  <span class="font-medium text-[#36b290]">{{
                    completedTutorials
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">إجمالي الاختبارات</span>
                  <span class="font-medium text-[#36b290]">{{
                    uniqueExams.length
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">معدل النجاح</span>
                  <span class="font-medium text-[#e5a53f]"
                    >{{ successRate }}%</span
                  >
                </div>
              </div>
            </div>

            <!-- Navigation Menu -->
            <nav class="py-4">
              @for (item of sidebarItems; track item.name) {
              <a
                href="#"
                [class]="
                  'flex items-center px-6 py-3 text-gray-700 hover:bg-[#36b290] hover:text-white transition-all duration-200 ' +
                  (activeSection === item.key
                    ? 'bg-[#36b290] text-white border-r-4 border-[#e5a53f]'
                    : '')
                "
                (click)="setActiveSection(item.key)"
              >
                <i class="ml-3 text-lg {{ item.icon }}"></i>
                <span>{{ item.name }}</span>
              </a>
              }
            </nav>
          </div>
        </aside>

        <!-- Mobile sidebar backdrop -->
        @if (isSidebarOpen) {
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-5 md:hidden"
          (click)="closeSidebar()"
        ></div>
        }

        <!-- Main Content -->
        <main class="flex-1 md:mr-64 bg-gray-50 min-h-screen">
          <div class="p-6">
            <!-- Mobile menu toggle -->
            <button
              class="md:hidden mb-4 p-2 bg-white rounded-lg shadow-sm"
              (click)="toggleSidebar()"
            >
              <svg
                class="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            <!-- Content based on active section -->
            @if (activeSection === 'stats') {
            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900">
                الإحصائيات والبيانات الأساسية
              </h2>

              <!-- Personal Info Card -->
              <div class="bg-white rounded-xl shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  البيانات الشخصية
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >الاسم الكامل</label
                    >
                    <p class="mt-1 text-sm text-gray-900">
                      {{ student.firstName }} {{ student.lastName }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >البريد الإلكتروني</label
                    >
                    <p class="mt-1 text-sm text-gray-900">
                      {{ student.email }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >المرحلة الدراسية</label
                    >
                    <p class="mt-1 text-sm text-gray-900">
                      {{ student.state }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >المدرسة</label
                    >
                    <p class="mt-1 text-sm text-gray-900">
                      {{ student.schoolName }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Performance Stats -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                  class="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#36b290]"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div
                        class="w-8 h-8 bg-[#36b290] rounded-lg flex items-center justify-center"
                      >
                        <span class="text-white text-sm">📚</span>
                      </div>
                    </div>
                    <div class="mr-4">
                      <p class="text-sm font-medium text-gray-600">
                        إجمالي الدورات
                      </p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ uniqueTutorials.length }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  class="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#e5a53f]"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div
                        class="w-8 h-8 bg-[#e5a53f] rounded-lg flex items-center justify-center"
                      >
                        <span class="text-white text-sm">✅</span>
                      </div>
                    </div>
                    <div class="mr-4">
                      <p class="text-sm font-medium text-gray-600">
                        الدورات المكتملة
                      </p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ completedTutorials }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  class="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div
                        class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center"
                      >
                        <span class="text-white text-sm">📋</span>
                      </div>
                    </div>
                    <div class="mr-4">
                      <p class="text-sm font-medium text-gray-600">
                        الاختبارات الناجحة
                      </p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ successfulExams }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  class="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div
                        class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
                      >
                        <span class="text-white text-sm">📊</span>
                      </div>
                    </div>
                    <div class="mr-4">
                      <p class="text-sm font-medium text-gray-600">
                        متوسط الدرجات
                      </p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ averageScore }}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            } @if (activeSection === 'tutorials') {
            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900">دوراتي</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (tutorial of uniqueTutorials; track tutorial.id) {
                <div
                  class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                      <h3 class="font-semibold text-gray-900 text-lg">
                        {{ tutorial.name }}
                      </h3>
                      @if (tutorial.isFinished) {
                      <span
                        class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        >مكتملة</span
                      >
                      } @else {
                      <span
                        class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        >جارية</span
                      >
                      }
                    </div>

                    <div class="space-y-3">
                      <div>
                        <div
                          class="flex justify-between items-center text-sm text-gray-600 mb-1"
                        >
                          <span>التقدم</span>
                          <span>{{ tutorial.advancePercentage }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div
                            class="h-2 rounded-full transition-all duration-300"
                            [class]="
                              tutorial.advancePercentage === 100
                                ? 'bg-green-500'
                                : 'bg-[#36b290]'
                            "
                            [style.width.%]="tutorial.advancePercentage"
                          ></div>
                        </div>
                      </div>

                      <div class="text-sm text-gray-600">
                        <p>
                          <span class="font-medium">تاريخ البدء:</span>
                          {{ formatDate(tutorial.startDate) }}
                        </p>
                        <p>
                          <span class="font-medium">تاريخ الانتهاء:</span>
                          {{ formatDate(tutorial.endDate) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                }
              </div>
            </div>
            } @if (activeSection === 'exams') {
            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900">الاختبارات</h2>
              <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          اسم الاختبار
                        </th>
                        <th
                          class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          الدورة
                        </th>
                        <th
                          class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          النتيجة
                        </th>
                        <th
                          class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          الحالة
                        </th>
                        <th
                          class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          التاريخ
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      @for (exam of uniqueExams; track exam.id +
                      exam.creationDate) {
                      <tr class="hover:bg-gray-50">
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {{ exam.name }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                          {{ exam.tutorialName }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            [class]="
                              exam.percentage >= exam.passingPrecent
                                ? 'text-green-600 font-medium'
                                : 'text-red-600 font-medium'
                            "
                          >
                            {{ exam.percentage | number : '1.1-1' }}%
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          @if (exam.isSuccess) {
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            نجح
                          </span>
                          } @else {
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            لم ينجح
                          </span>
                          }
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                          {{ formatDate(exam.creationDate) }}
                        </td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            } @if (activeSection === 'plan') {
            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900">خطتي الدراسية</h2>
              <div class="bg-white rounded-xl shadow-md p-6">
                <p class="text-gray-600 text-center py-12">
                  ستكون متاحة قريباً...
                </p>
              </div>
            </div>
            } @if (activeSection === 'favorites') {
            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900">الأسئلة المفضلة</h2>
              <div class="bg-white rounded-xl shadow-md p-6">
                <p class="text-gray-600 text-center py-12">
                  لا توجد أسئلة مفضلة بعد
                </p>
              </div>
            </div>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .text-right {
        text-align: right;
      }
      .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
        --tw-space-x-reverse: 1;
        margin-right: calc(1rem * var(--tw-space-x-reverse));
        margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
      }
      .z-5 {
        z-index: 5;
      }
    `,
  ],
})
export class TestComComponent {
  isMobileMenuOpen = false;
  isSidebarOpen = false;
  activeSection = 'stats';

  student: Student = {
    id: 4,
    firstName: 'راغب',
    lastName: 'أحمد',
    email: 'raged19996@gmail.com',
    phone: '1',
    state: 'الصف الثاني الثانوي',
    schoolName: 'السالم',
    classNo: 10,
    referenceKey: 'Student#29959370',
    tutorials: [
      {
        id: 23,
        endDate: '2025-01-22T16:41:35.813',
        startDate: '2025-01-15T16:41:35.813',
        name: 'بنك اسئلة',
        isFinished: true,
        advancePercentage: 100,
      },
      {
        id: 22,
        endDate: '2025-07-27T11:28:24.561',
        startDate: '2025-02-09T11:28:24.561',
        name: 'جديدة',
        isFinished: true,
        advancePercentage: 100,
      },
      {
        id: 18,
        endDate: '2025-03-28T00:00:00',
        startDate: '2025-03-02T00:00:00',
        name: 'التاسيس الشامل ( كمي )',
        isFinished: false,
        advancePercentage: 66.66666666666666,
      },
    ],
    exams: [
      {
        id: 15,
        isSuccess: true,
        takenTimeInSec: 7,
        percentage: 100,
        name: 'جديد',
        passingPrecent: 90,
        tutorialId: 23,
        tutorialName: 'بنك اسئلة',
        totalQuestions: 6,
        creationDate: '2025-02-12T14:02:25.668',
      },
      {
        id: 27,
        isSuccess: true,
        takenTimeInSec: 15,
        percentage: 100,
        name: 'اختبار اضافي',
        passingPrecent: 80,
        tutorialId: 23,
        tutorialName: 'بنك اسئلة',
        totalQuestions: 5,
        creationDate: '2025-02-20T21:05:50.85',
      },
      {
        id: 28,
        isSuccess: true,
        takenTimeInSec: 64,
        percentage: 96.875,
        name: 'اختبار تجريبي جديد',
        passingPrecent: 80,
        tutorialId: 23,
        tutorialName: 'بنك اسئلة',
        totalQuestions: 32,
        creationDate: '2025-02-18T15:36:07.005',
      },
      {
        id: 29,
        isSuccess: true,
        takenTimeInSec: 19,
        percentage: 90.9090909090909,
        name: 'اختبار الاعداد الصحيحة',
        passingPrecent: 80,
        tutorialId: 23,
        tutorialName: 'بنك اسئلة',
        totalQuestions: 11,
        creationDate: '2025-07-31T16:21:57.152',
      },
      {
        id: 22,
        isSuccess: true,
        takenTimeInSec: 5,
        percentage: 100,
        name: 'new',
        passingPrecent: 85,
        tutorialId: 22,
        tutorialName: 'جديدة',
        totalQuestions: 2,
        creationDate: '2025-02-17T21:59:32.478',
      },
      {
        id: 1,
        isSuccess: true,
        takenTimeInSec: 12,
        percentage: 100,
        name: 'تست',
        passingPrecent: 90,
        tutorialId: 18,
        tutorialName: 'التاسيس الشامل ( كمي )',
        totalQuestions: 4,
        creationDate: '0001-01-01T00:00:00',
      },
      {
        id: 2,
        isSuccess: false,
        takenTimeInSec: 19,
        percentage: 50,
        name: 'تست 2',
        passingPrecent: 90,
        tutorialId: 18,
        tutorialName: 'التاسيس الشامل ( كمي )',
        totalQuestions: 2,
        creationDate: '0001-01-01T00:00:00',
      },
    ],
  };

  navItems = [
    { name: 'الرئيسية', href: '#' },
    { name: 'قدرات', href: '#' },
    { name: 'اتصل بنا', href: '#' },
  ];

  sidebarItems = [
    { name: 'الإحصائيات والبيانات', key: 'stats', icon: '📊' },
    { name: 'دوراتي', key: 'tutorials', icon: '📚' },
    { name: 'خطتي', key: 'plan', icon: '📅' },
    { name: 'الأسئلة المفضلة', key: 'favorites', icon: '⭐' },
    { name: 'الاختبارات', key: 'exams', icon: '📋' },
  ];

  get uniqueTutorials(): Tutorial[] {
    const seen = new Set();
    return this.student.tutorials.filter((tutorial) => {
      if (seen.has(tutorial.id)) {
        return false;
      }
      seen.add(tutorial.id);
      return true;
    });
  }

  get uniqueExams(): Exam[] {
    const seen = new Set();
    return this.student.exams
      .filter((exam) => {
        const key = `${exam.id}-${exam.creationDate}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      );
  }

  get completedTutorials(): number {
    return this.uniqueTutorials.filter((t) => t.isFinished).length;
  }

  get successfulExams(): number {
    return this.uniqueExams.filter((e) => e.isSuccess).length;
  }

  get successRate(): number {
    const total = this.uniqueExams.length;
    if (total === 0) return 0;
    return Math.round((this.successfulExams / total) * 100);
  }

  get averageScore(): number {
    const scores = this.uniqueExams.map((e) => e.percentage);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString === '0001-01-01T00:00:00') return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
  }
}
