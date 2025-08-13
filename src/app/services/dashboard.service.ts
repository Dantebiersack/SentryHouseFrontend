import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Ajusta si usas environments


export interface DashboardSummaryResponse {
  rango: { from: string; to: string };
  kpis: {
    subtotal: number;
    iva: number;
    total: number;
    cantidadVentas: number;
    ventasHoy: number;
    ventasSemana: number;
    ventasMes: number;
  };
  series: { porDia: { fecha: string; total: number }[] };
  topServicios: { servicioId: number; servicio: string; cantidad: number; importe: number }[];
  porEstado: { estado: string; cantidad: number; total: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getSummary(from?: string, to?: string): Observable<DashboardSummaryResponse> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<DashboardSummaryResponse>(`${environment.apiUrl}Ventas/dashboard/summary`, { params });
  }
}
