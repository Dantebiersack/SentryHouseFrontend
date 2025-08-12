// src/app/services/compras.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CompraCreateDto, CompraDetailDto, CompraLiteDto,
  CompraUpdateDto, CompraDetalleCreateDto, EstadoCompra
} from '../interfaces/compra';
import { environment } from 'environments/environment';

interface CreateCompraResponse { id: number }

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private apiUrl = environment.apiUrl + 'comprasproveedores';

  constructor(private http: HttpClient) {}

  getCompras(opts?: {
    status?: EstadoCompra | null;
    proveedorId?: number | null;
    from?: string | null;  // 'YYYY-MM-DD'
    to?: string | null;    // 'YYYY-MM-DD'
    page?: number;
    pageSize?: number;
  }): Observable<CompraLiteDto[]> {
    let params = new HttpParams();
    if (opts?.status !== undefined && opts?.status !== null) params = params.set('status', String(opts.status));
    if (opts?.proveedorId) params = params.set('proveedorId', String(opts.proveedorId));
    if (opts?.from) params = params.set('from', opts.from);
    if (opts?.to) params = params.set('to', opts.to);
    if (opts?.page) params = params.set('page', String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    return this.http.get<CompraLiteDto[]>(this.apiUrl, { params });
  }

  getCompra(id: number): Observable<CompraDetailDto> {
    return this.http.get<CompraDetailDto>(this.apiUrl + '/' + id);
  }

  crearCompra(dto: CompraCreateDto): Observable<CreateCompraResponse> {
    return this.http.post<CreateCompraResponse>(this.apiUrl, dto);
  }

  actualizarCompra(id: number, dto: CompraUpdateDto): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/' + id, dto);
  }

  agregarDetalle(id: number, dto: CompraDetalleCreateDto): Observable<void> {
    return this.http.post<void>(this.apiUrl + '/' + id + '/detalles', dto);
  }

  editarDetalle(id: number, detalleId: number, dto: CompraDetalleCreateDto): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/' + id + '/detalles/' + detalleId, dto);
  }

  eliminarDetalle(id: number, detalleId: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/' + id + '/detalles/' + detalleId);
  }

  cambiarEstado(id: number, estado: EstadoCompra): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/' + id + '/estado', { estado });
  }

  recibir(id: number): Observable<void> {
    return this.http.post<void>(this.apiUrl + '/' + id + '/recibir', {});
  }

  eliminarCompra(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/' + id);
  }
}
