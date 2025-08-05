import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  showCurrentPassword = true;
  showNewPassword = true;
  newPassword!: string;
  currentpassword!: string;
  Auth = inject(Auth);
  router = inject(Router);
  matSnackBar = inject(MatSnackBar);

  ChangePassword() {
    this.Auth.changePassword({
      email: this.Auth.getUserDetail()?.email,
      newPassword: this.newPassword,
      currentPassword: this.currentpassword,
    }).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.matSnackBar.open(response.message, 'Close', {
            duration: 5000,
          });
          this.Auth.logout();
          this.router.navigate(['/login']);
        } else {
          this.matSnackBar.open(response.message, 'Close', {
            duration: 3000,
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.matSnackBar.open(err.error.message, 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
