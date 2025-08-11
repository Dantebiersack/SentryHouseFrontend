import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { VentasService } from '../../services/ventas.service';
import { ServiciosService } from '../../services/servicios.service';
import { Auth } from '../../services/auth';

import { EstadoVenta, Venta, VentaDetailDto, VentaCreateDto } from '../../interfaces/venta';
import { Servicio } from '../../interfaces/servicio-interface';
import { UserDetail } from 'app/interfaces/user-detail';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ventas.html',
})
export class Ventas implements OnInit {
  private ventasSrv = inject(VentasService);
  private serviciosSrv = inject(ServiciosService);
  private auth = inject(Auth);

  EstadoVenta = EstadoVenta;

  // Cliente seleccionado (id para backend)
  usuarioId = '';

  // Catálogo de servicios
  servicios = signal<Servicio[]>([]);

  // Listado de ventas
  ventas = signal<Venta[]>([]);

  // Editor / Detalle
  editorAbierto = signal(false);
  ventaIdActual = signal<number | null>(null);
  detalle = signal<VentaDetailDto | null>(null);

  // Líneas (nueva venta)
  lineas = signal<Array<{ servicioId: number | null; cantidad: number; precioUnitario: number; ivaPorcentaje: number }>>([]);

  // Fecha
  fechaISO = new Date().toISOString();

  // Autocomplete clientes
  clientes = signal<UserDetail[]>([]);
  clienteQuery = signal<string>('');
  showSug = false;

  clientesFiltrados = computed(() => {
    const q = (this.clienteQuery() || '').trim().toLowerCase();
    if (!q) return [];
    return this.clientes()
      .filter(u =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
  });

  onClienteInput(value: string) {
    this.clienteQuery.set(value);
    this.usuarioId = '';       // invalidamos selección hasta que elijan uno
    this.showSug = true;
  }

  selectCliente(u: UserDetail) {
    this.usuarioId = String(u.id);
    this.clienteQuery.set(`${u.fullName} - ${u.email}`);
    this.showSug = false;
  }

  onBlurCliente() {
    // Espera a que se dispare mousedown en <li>
    setTimeout(() => (this.showSug = false), 150);
  }

  // Totales para la vista previa de líneas
  totales = computed(() => {
    const sub = this.lineas().reduce((s, li) => s + this.calcSub(li), 0);
    const iva = this.lineas().reduce((s, li) => s + this.calcIva(li), 0);
    return { subtotal: sub, iva, total: sub + iva };
  });

  ngOnInit(): void {
    // Catálogos
    this.serviciosSrv.getServicios().subscribe(s => this.servicios.set(s));
    // Clientes (rol = 2)
    this.auth.getClients().subscribe(list => this.clientes.set(list));
  }

  // Listado
  cargarVentasUsuario(): void {
    if (!this.usuarioId) { alert('Selecciona un cliente.'); return; }
    this.ventasSrv.obtenerVentasPorUsuario(this.usuarioId).subscribe(v => this.ventas.set(v));
  }

  // Editor
  nuevaVenta(): void {
    this.editorAbierto.set(true);
    this.ventaIdActual.set(null);
    this.detalle.set(null);
    this.lineas.set([]);
    this.fechaISO = new Date().toISOString();
    if (!this.usuarioId) {
      setTimeout(() => alert('Selecciona un cliente antes de crear la venta.'), 0);
    }
  }

  cerrarEditor(): void {
    this.editorAbierto.set(false);
    this.ventaIdActual.set(null);
    this.detalle.set(null);
    this.lineas.set([]);
  }

  abrirDetalle(id: number): void {
    this.editorAbierto.set(true);
    this.ventaIdActual.set(id);
    this.ventasSrv.getVenta(id).subscribe(d => this.detalle.set(d));
  }

  // Líneas
  agregarLinea(): void {
    this.lineas.update(arr => [...arr, { servicioId: null, cantidad: 1, precioUnitario: 0, ivaPorcentaje: 0.16 }]);
  }
  removerLinea(i: number): void {
    this.lineas.update(arr => arr.filter((_, idx) => idx !== i));
  }
  updateLinea(i: number, patch: Partial<{ servicioId: number | null; cantidad: number; precioUnitario: number; ivaPorcentaje: number }>): void {
    this.lineas.update(arr => {
      const copy = arr.slice();
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  }

  calcSub(li: { cantidad: number; precioUnitario: number; }): number { return (Number(li.cantidad)||0) * (Number(li.precioUnitario)||0); }
  calcIva(li: { cantidad: number; precioUnitario: number; ivaPorcentaje: number; }): number { return this.calcSub(li) * (Number(li.ivaPorcentaje)||0); }
  calcTotal(li: { cantidad: number; precioUnitario: number; ivaPorcentaje: number; }): number { return this.calcSub(li) + this.calcIva(li); }

  crearVenta(): void {
    if (!this.usuarioId) { alert('Selecciona un cliente.'); return; }
    if (this.lineas().length === 0) { alert('Agrega al menos una línea.'); return; }

    const dto: VentaCreateDto = {
      usuarioId: this.usuarioId,
      lineas: this.lineas()
        .filter(li => li.servicioId && li.cantidad > 0)
        .map(li => ({
          servicioId: li.servicioId!,
          cantidad: Number(li.cantidad),
          precioUnitario: li.precioUnitario || undefined,
          ivaPorcentaje: li.ivaPorcentaje || undefined
        }))
    };

    this.ventasSrv.crearVenta(dto).subscribe(res => {
      alert('Venta creada: #' + res.id);
      this.abrirDetalle(res.id);
      this.cargarVentasUsuario();
    });
  }

  // Estados
  estadoLabel(e?: EstadoVenta): string {
    if (e === undefined || e === null) return '—';
    switch (e) {
      case EstadoVenta.Borrador: return 'Borrador';
      case EstadoVenta.Confirmada: return 'Confirmada';
      case EstadoVenta.Cancelada: return 'Cancelada';
      case EstadoVenta.Entregada: return 'Entregada';
      default: return '—';
    }
  }

  badgeClass(e?: EstadoVenta): string {
    if (e === EstadoVenta.Confirmada) return 'bg-blue-100 text-blue-700';
    if (e === EstadoVenta.Entregada) return 'bg-green-100 text-green-700';
    if (e === EstadoVenta.Cancelada) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }

  puedeConfirmar(): boolean {
    const d = this.detalle();
    return !!d && d.estado === EstadoVenta.Borrador;
  }
  puedeEntregar(): boolean {
    const d = this.detalle();
    return !!d && (d.estado === EstadoVenta.Confirmada);
  }
  puedeCancelar(): boolean {
    const d = this.detalle();
    return !!d && (d.estado === EstadoVenta.Borrador || d.estado === EstadoVenta.Confirmada);
  }

  cambiarEstadoDetalle(accion: 'confirmar'|'entregar'|'cancelar'): void {
    const id = this.ventaIdActual();
    const d = this.detalle();
    if (!id || !d) return;

    const target =
      accion === 'confirmar' ? EstadoVenta.Confirmada :
      accion === 'entregar'  ? EstadoVenta.Entregada  :
      EstadoVenta.Cancelada;

    this.ventasSrv.cambiarEstado(id, target).subscribe(() => {
      this.ventasSrv.getVenta(id).subscribe(det => this.detalle.set(det));
      this.cargarVentasUsuario();
    });
  }
}
