import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  authService = inject(Auth);
  user$ = this.authService.getAll();
}