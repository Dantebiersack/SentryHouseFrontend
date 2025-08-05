import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Role } from 'app/interfaces/role';

@Component({
  selector: 'app-role-list',
  imports: [MatIconModule],
  templateUrl: './role-list.html',
  styleUrl: './role-list.css'
})
export class RoleList {
   @Input({ required: true }) roles!: Role[] | null;
  @Output() deleteRole: EventEmitter<string> = new EventEmitter<string>();

  delete(id: string) {
    this.deleteRole.emit(id);
  }
}
