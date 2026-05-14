import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../../../../authentication/services/auth.service';
import { TutorilsStudentsService } from '../../../../services/tutorils-students.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss',
})
export class AddCommentComponent implements OnInit {
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  tutorilsStudentsService = inject(TutorilsStudentsService);
  route = inject(ActivatedRoute);
  userId: number = 0;
  tutorialId: number = 0;
  comment: string = '';
  isLoading = signal<boolean>(false);
  userRating: number = 5;
  maxRating: number = 5;
  stars: number[] = [];
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.tutorialId = parseInt(params['tutorialId']);
    });
    this.stars = Array(this.maxRating).fill(0); // Initialize stars
    this.userId = this.authService.currentUser().userDto.id;
  }
  rate(value: number) {
    this.userRating = value;
  }
  onSubmit(): void {
    if (!this.comment) {
      this.toastr.error('من فضلك اضيف تعليق');
      return;
    }
    this.isLoading.set(true);
    const commentInfo = {
      comment: this.comment,
      userId: this.userId,
      tutorialId: this.tutorialId,
      rate: this.userRating,
    };
    this.tutorilsStudentsService.createTutorialComment(commentInfo).subscribe({
      next: ({ statusCode, msg }) => {
        if (statusCode === 200) {
          this.isLoading.update((v) => (v = false));
          this.toastr.success(msg);
          this.comment = '';
          this.userRating = 0;
        } else {
          this.isLoading.update((v) => (v = false));
          this.toastr.error(msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading.update((v) => (v = false));
      },
    });
  }
}
