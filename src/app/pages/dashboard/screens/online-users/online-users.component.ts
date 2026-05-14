import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { AdminService } from '../../services/admin.service';
import { UserTrackerService } from '../../../../shared/services/user-tracker.service';
import { RouterLink } from '@angular/router';

export interface OnlineUser {
  id: number;
  name: string;
  email: string;
  roleName: string;
  phone: string;
}

@Component({
  selector: 'app-online-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleScreenComponent, RouterLink],
  templateUrl: './online-users.component.html',
  styleUrl: './online-users.component.scss',
})
export class OnlineUsersComponent implements OnInit {
  adminService = inject(AdminService);
  userTrackerService = inject(UserTrackerService);

  users = signal<OnlineUser[]>([]);
  searchText = signal<string>('');
  selectedRole = signal<string>('All');
  isLoading = signal<boolean>(false);

  // Define known roles for mapping and filtering
  roles = [
    { id: 'All', name: 'الكل' },
    { id: 'student', name: 'طالب' },
    { id: 'parent', name: 'ولي أمر' },
    { id: 'school_admin', name: 'مشرف مدرسة' },
    { id: 'others', name: 'أخرى' },
  ];

  constructor() {
    effect(() => {
      const count = this.userTrackerService.onlineUsersCount();
      // Fetch users whenever the count changes
      this.getOnlineUsers(true);
    });
  }

  // Helper to map API roleName to Display Name (Arabic)
  getRoleDisplayName(roleName: string): string {
    // Since API returns Arabic names now, we might not need extensive mapping,
    // but we can keep it for safety or normalization if needed.
    return roleName;
  }

  // Statistics
  stats = computed(() => {
    const allUsers = this.users();
    const stats: any = {
      total: allUsers.length,
      student: 0,
      parent: 0,
      school_admin: 0,
      others: 0,
    };

    allUsers.forEach((u) => {
      // Normalize to handle potential whitespace or small variations
      const r = u.roleName?.trim();

      if (r === 'طالب') stats.student++;
      else if (r === 'ولي أمر') stats.parent++;
      else if (r === 'مشرف مدرسة') stats.school_admin++;
      else stats.others++;
    });

    return stats;
  });

  // Filtered Users
  filteredUsers = computed(() => {
    let result = this.users();
    const search = this.searchText().toLowerCase();
    const role = this.selectedRole(); // 'All', 'student', 'parent', 'school_admin', 'others'

    // Filter by Role
    if (role !== 'All') {
      result = result.filter((u) => {
        const r = u.roleName?.trim();

        if (role === 'student') return r === 'طالب';
        if (role === 'parent') return r === 'ولي أمر';
        if (role === 'school_admin') return r === 'مشرف مدرسة';

        if (role === 'others') {
          // Anything NOT these three
          return r !== 'طالب' && r !== 'ولي أمر' && r !== 'مشرف مدرسة';
        }
        return false;
      });
    }

    // Filter by Search
    if (search) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search),
      );
    }

    return result;
  });

  ngOnInit() {
    this.userTrackerService.startConnection();
    // Initial fetch handled by effect or manual call if needed,
    // but effect will run initially.
    // However, strictly speaking, we might want an explict first load with spinner.
    this.getOnlineUsers();
  }

  getOnlineUsers(isBackground: boolean = false) {
    if (!isBackground) {
      this.isLoading.set(true);
    }
    this.adminService.getOnlineUsers().subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.result) {
          this.users.set(res.result);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  setRole(roleId: string) {
    this.selectedRole.set(roleId);
  }
}
