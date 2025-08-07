import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../interfaces/venta';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  
  private ventasUrl = `${environment.apiUrl}Ventas/usuario`;

  constructor(private http: HttpClient) {}

  obtenerVentasPorUsuario(usuarioId: string): Observable<Venta[]> {
   
    return this.http.get<Venta[]>(`${this.ventasUrl}/${usuarioId}`);
  }
}

