import { Component, inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, Form, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RoleService } from '../../services/role';
import { Observable } from 'rxjs';
import { Role } from '../../interfaces/role';
import { AsyncPipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ValidationError } from 'app/interfaces/validation-error';
import { RegisterRequest } from 'app/interfaces/register-request';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    RouterLink,
    ReactiveFormsModule,
    AsyncPipe
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  roleService = inject(RoleService);
  authService = inject(Auth);
  matSnackbar = inject(MatSnackBar);
  roles$!: Observable<Role[]>;
  fb = inject(FormBuilder);
  registerForm!: FormGroup;
  passwordHide = true;
  confirmPasswordHide = true;
  router = inject(Router);
  errors!: ValidationError[];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      Fullname: ['', [Validators.required]],
      roles: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
      { validators: this.passwordMatchValidator });

    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });

    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.registerForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });



    this.roles$ = this.roleService.getRoles();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password !== confirmPassword ? { passwordMismatch: true } : null;
  }


  register() {
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log(response);

        this.matSnackbar.open(response.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
        });
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        if (err!.status === 400) {
          this.errors = err!.error;
          this.matSnackbar.open('Validations error', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
        }
      },
      complete: () => console.log('Register success'),
    });
  }
}
