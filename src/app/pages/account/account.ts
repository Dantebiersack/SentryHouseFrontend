import { Component,inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  imports: [ CommonModule ],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account {
  authService = inject(Auth);
  accountDetail$ = this.authService.getDetail();
}
