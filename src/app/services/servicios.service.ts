import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Servicio } from '../interfaces/servicio-interface';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cotizacion } from '../interfaces/cotizacion'; 
import { User } from '../interfaces/user-detail';
import { AuthResponse } from '../interfaces/auth-response';

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

    getServicioDetalle(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}/detalle`);
    }
    setMateriales(id: number, materiales: Array<{ materiaPrimaId: number; cantidadRequerida: number; unidad?: string }>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/materiales`, materiales);
    }

    setCotizacion(id: number, materiales: Array<{ materiaPrimaId: number; cantidadRequerida: number; unidad?: string }>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/materiales`, materiales);
    }

    // Nuevo método para enviar una cotización
    crearCotizacion(cotizacion: Cotizacion): Observable<Cotizacion> {
        // La URL para las cotizaciones es 'api/Cotizaciones'
        const cotizacionesUrl = `${environment.apiUrl}Cotizaciones`;
        return this.http.post<Cotizacion>(cotizacionesUrl, cotizacion);
    }

    // Nuevo método para crear un usuario
    crearUsuario(user: User): Observable<AuthResponse> {
        const crearUserURL = `${environment.apiUrl}Account/register`;
        return this.http.post<AuthResponse>(crearUserURL, user);
    }
}
