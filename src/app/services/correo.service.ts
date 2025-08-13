import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Correo} from '../interfaces/correo';
import {CorreoConfirmacion} from '../interfaces/correoConfirmacion';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {
  private apiUrl = `${environment.apiUrl}Email`; // La URL base del controlador de correo

  constructor(private http: HttpClient) {}

  // Nuevo método para enviar correo de cotización
  enviarCorreoCotizacion(datosCorreo: Correo): Observable<any> {
    const url = `${this.apiUrl}/enviarCorreoCotizacion`;
    return this.http.post<any>(url, datosCorreo);
  }

  enviarCorreoConfirmacion(datosCorreo: CorreoConfirmacion): Observable<any> {
    const url = `${this.apiUrl}/enviarCorreo`;
    return this.http.post<any>(url, datosCorreo);
  }
}