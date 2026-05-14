import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reports-management',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports-management.component.html',
})
export class ReportsManagementComponent {
  reports = [
    {
      title: 'المعلم',
      icon: 'assets/imgs/reports/teacher-icon.png',
      illustration: 'assets/imgs/reports/teacher.png',
      description:
        'قم بإنشاء تقارير تفصيلية عن طلابك، وتابع سير مستوى التحصيل الأكاديمي، بدقة لكل طالب فردياً أو مجموعة أو فصل دراسي.',
      buttonText: 'عرض التقارير',
      color: 'blue',
      route: '/super/teacher-reports',
    },
    {
      title: 'مدير المدرسة',
      icon: 'assets/imgs/reports/principal-icon.png',
      illustration: 'assets/imgs/reports/principal.png',
      description:
        'تابع الأداء العام للمدرسة وقم بتحليل مستويات الطلاب في مختلف المراحل الدراسية، وفصولها، لاتخاذ قرارات تطوير فعالة.',
      buttonText: 'عرض التقارير',
      color: 'green',
      route: '/super/principal-reports',
    },
    {
      title: 'المشرف العام',
      icon: 'assets/imgs/reports/supervisor-icon.png',
      illustration: 'assets/imgs/reports/supervisor.png',
      description:
        'راقب أداء المدارس وقم بتحليلات النتائج بالتفصيل لاتخاذ قرارات استراتيجية واضحة.',
      buttonText: 'عرض التقارير',
      color: 'orange',
      route: '/super/general-reports',
    },
  ];
}
