import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta, VentaCreateDto, VentaDetailDto, EstadoVenta } from '../interfaces/venta';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private base = `${environment.apiUrl}Ventas`; // ej. https://tuapi/api/Ventas

  constructor(private http: HttpClient) {}

  // Ya lo usas hoy:
  obtenerVentasPorUsuario(usuarioId: string): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.base}/usuario/${usuarioId}`);
  }

  // Nuevos para el módulo:
  crearVenta(dto: VentaCreateDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base, dto);
  }

  getVenta(id: number): Observable<VentaDetailDto> {
    return this.http.get<VentaDetailDto>(`${this.base}/${id}`);
  }

  cambiarEstado(id: number, estado: EstadoVenta): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/estado`, { estado });
  }
}
