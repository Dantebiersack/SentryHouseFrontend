import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../interfaces/proveedor';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}proveedores`;

  constructor(private http: HttpClient) {}

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  crearProveedor(data: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, data);
  }

  editarProveedor(id: number, data: Proveedor): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }
}
