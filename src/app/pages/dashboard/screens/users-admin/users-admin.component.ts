import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { SystemUser } from '../../model/admin-model';

import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.scss',
})
export class UsersAdminComponent implements OnInit {
  adminService = inject(AdminService);
  toastr = inject(ToastrService);
  isLoading = signal<boolean>(false);
  allUser: SystemUser[] = [];
  _keyword: string = '';
  currentPage: number = 1;
  pageSize: number = 15;

  ngOnInit(): void {
    this.getAllUsers();
  }
  getAllUsers(): void {
    this.isLoading.set(true);
    this.adminService.getAllSystemUsers().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.allUser = result;
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

  get keyword(): string {
    return this._keyword;
  }

  set keyword(value: string) {
    this._keyword = value;
    this.currentPage = 1;
  }

  get filteredUsers(): SystemUser[] {
    const searchTerm = this.keyword.toLowerCase().trim();
    return this.allUser.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.roleName.toString().includes(searchTerm) ||
        user.email.toString().includes(searchTerm)
    );
  }

  get paginatedUsers(): SystemUser[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(newPage: number) {
    this.currentPage = newPage;
  }
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  getPageRange(): number[] {
    const rangeSize = 6;
    const start = Math.max(0, this.currentPage - Math.floor(rangeSize / 2));
    const end = Math.min(this.totalPages - 1, start + rangeSize - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
  }

  get totalCount(): number {
    return this.filteredUsers.length;
  }
  remove(userId: number): void {
    this.adminService
      .deleteSystemUser({
        userId: userId,
      })
      .subscribe({
        next: ({ statusCode, msg }) => {
          if (statusCode === 200) {
            this.getAllUsers();
            this.toastr.success(msg);
          } else {
            this.toastr.error(msg);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
