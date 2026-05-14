import { Component } from '@angular/core';
import { StudentJoinComponent } from './student-join/student-join.component';
import { StudentNotjoinComponent } from './student-notjoin/student-notjoin.component';
import { StudentFreeSubscriptionComponent } from './student-free-subscription/student-free-subscription.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-student-admin',
  standalone: true,
  imports: [
    NgClass,
    StudentJoinComponent,
    StudentNotjoinComponent,
    StudentFreeSubscriptionComponent,
  ],
  templateUrl: './student-admin.component.html',
  styleUrl: './student-admin.component.scss',
})
export class StudentAdminComponent {
  tab: string = 'tab1';
  total: number = 0;
  selectTab(tab: string) {
    this.tab = tab;
  }
}
