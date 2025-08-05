import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Servicio } from '../interfaces/servicio-interface';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
    private apiUrl = `${environment.apiUrl}Servicios`;

    constructor(private http: HttpClient) { }

    getServicios(): Observable<Servicio[]> {
        return this.http.get<Servicio[]>(this.apiUrl);
    }

    addServicio(servicio: Servicio): Observable<Servicio> {
        return this.http.post<Servicio>(this.apiUrl, servicio);
    }

    updateServicio(id: number, servicio: Servicio): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, servicio);
    }

    deleteServicio(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
