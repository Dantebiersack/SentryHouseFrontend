import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MateriaPrima } from '../interfaces/materia-prima';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MateriaPrimaService {
  private apiUrl = `${environment.apiUrl}MateriaPrima`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MateriaPrima[]> {
    return this.http.get<MateriaPrima[]>(this.apiUrl);
  }

  create(data: MateriaPrima): Observable<MateriaPrima> {
    return this.http.post<MateriaPrima>(this.apiUrl, data);
  }

  update(id: number, data: MateriaPrima): Observable<MateriaPrima> {
    return this.http.put<MateriaPrima>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}