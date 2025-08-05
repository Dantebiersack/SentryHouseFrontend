import { Component, inject } from '@angular/core';
import { RoleForm } from '../../components/role-form/role-form';
import { RoleService } from '../../services/role';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleList } from '../../components/role-list/role-list';
import { AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Auth } from '../../services/auth';
import { RoleCreateRequest } from '../../interfaces/role-create-request';


@Component({
  selector: 'app-role',
  imports: [
    RoleForm,
    MatSelectModule,
    MatInputModule,
    RoleList,
    AsyncPipe,
    MatSnackBarModule,
  ],
  templateUrl: './role.html',
  styleUrl: './role.css'
})
export class Role {
  roleService = inject(RoleService);
  authService = inject(Auth);
  errorMessage = '';
  role: RoleCreateRequest = {} as RoleCreateRequest;
  roles$ = this.roleService.getRoles();
  users$ = this.authService.getAll();
  selectedUser: string = '';
  selectedRole: string = '';

  snackBar = inject(MatSnackBar);

  createRole(role: RoleCreateRequest) {
    this.roleService.createRole(role).subscribe({
      next: (response: { message: string }) => {
        this.roles$ = this.roleService.getRoles();
        this.snackBar.open('Role Created Successfully', 'Ok', {
          duration: 3000,
        });
      },
      error: (error: HttpErrorResponse) => {
        if (error.status == 400) {
          this.errorMessage = error.error;
        }
      },
    });
  }

  deleteRole(id: string) {
    this.roleService.delete(id).subscribe({
      next: (response) => {
        this.roles$ = this.roleService.getRoles();
        this.snackBar.open('Role Deleted Successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open(error.message, 'Close', {
          duration: 3000,
        });
      },
    });
  }

  assignRole() {
    this.roleService
      .assignRole(this.selectedUser, this.selectedRole)
      .subscribe({
        next: (response) => {
          this.roles$ = this.roleService.getRoles();
          this.snackBar.open('Role Assign Successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.snackBar.open(error.message, 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
