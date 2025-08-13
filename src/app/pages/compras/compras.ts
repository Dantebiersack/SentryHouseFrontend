import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

import { ComprasService } from '../../services/compras.service';
import { MateriaPrimaService } from '../../services/materia-prima';
import { ProveedoresService } from '../../services/proveedores.service';

import { EstadoCompra, CompraLiteDto, CompraDetailDto, CompraDetalleCreateDto } from '../../interfaces/compra';
import { MateriaPrima } from '../../interfaces/materia-prima';
import { Proveedor } from '../../interfaces/proveedor';


@Component({
  selector: 'app-compras',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './compras.html',
  styleUrl: './compras.css'
})
export class Compras implements OnInit {
  EstadoCompra = EstadoCompra;

  private comprasSrv = inject(ComprasService);
  private materiasSrv = inject(MateriaPrimaService);
  private proveedoresSrv = inject(ProveedoresService);
  private fb = inject(FormBuilder);

  // Listado
  compras = signal<CompraLiteDto[]>([]);
  proveedores = signal<Proveedor[]>([]);
  filtros = {
    estado: null as EstadoCompra | null,
    proveedorId: null as number | null,
    from: null as string | null,
    to: null as string | null
  };

  // Editor
  mostrarEditor = signal(false);
  compraIdActual = signal<number | null>(null);
  compraDetalle = signal<CompraDetailDto | null>(null);

  form = this.fb.group({
    proveedorId: [null as number | null, Validators.required],
    fecha: [this.hoyISO(), Validators.required],
    numeroDocumento: [''],
    notas: ['']
  });

  // Crear antes de guardar
  materias = signal<MateriaPrima[]>([]);
  lineas = signal<Array<{ materiaPrimaId: number | null; cantidad: number; precioUnitario: number; ivaPorcentaje: number }>>([]);
  totales = computed(() => {
    const subtotal = this.lineas().reduce((s, li) => s + this.calcSub(li), 0);
    const iva = this.lineas().reduce((s, li) => s + this.calcIva(li), 0);
    return { subtotal, iva, total: subtotal + iva };
  });

  // Para agregar desde el servidor cuando ya existe compra
  nuevaLinea: CompraDetalleCreateDto = { materiaPrimaId: null as any, cantidad: 1, precioUnitario: 0, ivaPorcentaje: 0.16 };

  ngOnInit(): void {
    this.cargarProveedores();
    this.cargarMaterias();
    this.cargarCompras();
  }

  hoyISO(): string {
    const d = new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().substring(0, 10);
  }

  cargarCompras(): void {
    this.comprasSrv.getCompras({
      status: this.filtros.estado,
      proveedorId: this.filtros.proveedorId,
      from: this.filtros.from,
      to: this.filtros.to,
      page: 1,
      pageSize: 50
    }).subscribe(data => this.compras.set(data));
  }

  cargarProveedores(): void {
    this.proveedoresSrv.getProveedores().subscribe(data => this.proveedores.set(data));
  }

  cargarMaterias(): void {
    this.materiasSrv.getAll().subscribe(data => this.materias.set(data));
  }

  nuevaCompra(): void {
    this.mostrarEditor.set(true);
    this.compraIdActual.set(null);
    this.compraDetalle.set(null);
    this.form.reset({ proveedorId: null, fecha: this.hoyISO(), numeroDocumento: '', notas: '' });
    this.lineas.set([]);
  }

  cerrarEditor(): void {
    this.mostrarEditor.set(false);
    this.compraIdActual.set(null);
    this.compraDetalle.set(null);
    this.form.reset();
  }

  abrirDetalle(id: number): void {
    this.mostrarEditor.set(true);
    this.compraIdActual.set(id);
    this.comprasSrv.getCompra(id).subscribe(det => this.compraDetalle.set(det));
    this.form.disable(); // encabezado solo editable con botón "Actualizar" si quieres permitirlo
  }

  bloquearEdicionEncabezado(): boolean {
    const det = this.compraDetalle();
    return det ? (det.estado === EstadoCompra.Recibida || det.estado === EstadoCompra.Cancelada) : false;
  }

  bloquearCierre(): boolean {
    const det = this.compraDetalle();
    return !det || det.estado === EstadoCompra.Recibida || det.estado === EstadoCompra.Cancelada;
  }

  agregarLinea(): void {
    this.lineas.update(arr => [...arr, { materiaPrimaId: null, cantidad: 1, precioUnitario: 0, ivaPorcentaje: 0.16 }]);
  }
  removerLinea(i: number): void {
    this.lineas.update(arr => arr.filter((_, idx) => idx !== i));
  }
  updateLinea(i: number, patch: Partial<{ materiaPrimaId: number | null; cantidad: number; precioUnitario: number; ivaPorcentaje: number }>): void {
    this.lineas.update(arr => {
      const copy = arr.slice();
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  }
  calcSub(li: { cantidad: number; precioUnitario: number; }): number { return (Number(li.cantidad) || 0) * (Number(li.precioUnitario) || 0); }
  calcIva(li: { cantidad: number; precioUnitario: number; ivaPorcentaje: number; }): number {
    return this.calcSub(li) * (Number(li.ivaPorcentaje) || 0);
  }
  calcTotal(li: { cantidad: number; precioUnitario: number; ivaPorcentaje: number; }): number {
    return this.calcSub(li) + this.calcIva(li);
  }

  crearCompra(): void {
  if (this.form.invalid || this.lineas().length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Completa proveedor/fecha y agrega al menos una línea.',
      confirmButtonColor: '#16a34a'
    });
    this.form.markAllAsTouched();
    return;
  }
  const raw = this.form.getRawValue();
  const dto = {
    proveedorId: raw.proveedorId!,
    fecha: raw.fecha ? raw.fecha + 'T00:00:00Z' : undefined,
    numeroDocumento: raw.numeroDocumento || undefined,
    notas: raw.notas || undefined,
    detalles: this.lineas()
      .filter(li => li.materiaPrimaId && li.cantidad > 0 && li.precioUnitario >= 0)
      .map(li => ({
        materiaPrimaId: li.materiaPrimaId!,
        cantidad: Number(li.cantidad),
        precioUnitario: Number(li.precioUnitario),
        ivaPorcentaje: li.ivaPorcentaje ?? 0.16
      }))
  };
  this.comprasSrv.crearCompra(dto).subscribe(res => {
    Swal.fire({
      icon: 'success',
      title: '¡Compra creada!',
      text: `Compra creada: #${res.id}`,
      confirmButtonColor: '#16a34a'
    });
    this.abrirDetalle(res.id);
    this.cargarCompras();
  });
}

  guardarEncabezado(): void {
    // alias de crearCompra si quisieras separar botón de "Guardar compra"
    this.crearCompra();
  }

  actualizarEncabezado(): void {
  const id = this.compraIdActual();
  if (!id) return;
  const raw = this.form.getRawValue();
  const dto = {
    fecha: raw.fecha ? raw.fecha + 'T00:00:00Z' : undefined,
    numeroDocumento: raw.numeroDocumento || undefined,
    notas: raw.notas || undefined
  };
  this.comprasSrv.actualizarCompra(id, dto).subscribe(() => {
    Swal.fire({
      icon: 'success',
      title: 'Encabezado actualizado.',
      confirmButtonColor: '#16a34a'
    });
    this.comprasSrv.getCompra(id).subscribe(det => this.compraDetalle.set(det));
    this.cargarCompras();
  });
}

  agregarDetalleServidor(): void {
  const id = this.compraIdActual();
  if (!id) return;
  const li = this.nuevaLinea;
  if (!li.materiaPrimaId || li.cantidad <= 0 || li.precioUnitario < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Línea incompleta',
      text: 'Completa la nueva línea.',
      confirmButtonColor: '#16a34a'
    });
    return;
  }
  if (li.ivaPorcentaje === undefined || li.ivaPorcentaje === null) li.ivaPorcentaje = 0.16;
  this.comprasSrv.agregarDetalle(id, li).subscribe(() => {
    this.nuevaLinea = { materiaPrimaId: null as any, cantidad: 1, precioUnitario: 0, ivaPorcentaje: 0.16 };
    this.comprasSrv.getCompra(id).subscribe(det => this.compraDetalle.set(det));
    this.cargarCompras();
  });
}

  eliminarDetalleServidor(detalleId: number): void {
    const id = this.compraIdActual();
    if (!id) return;
    this.comprasSrv.eliminarDetalle(id, detalleId).subscribe(() => {
      this.comprasSrv.getCompra(id).subscribe(det => this.compraDetalle.set(det));
      this.cargarCompras();
    });
  }

 recibirCompra(id: number): void {
  Swal.fire({
    icon: 'question',
    title: '¿Marcar como RECIBIDA?',
    text: '¿Marcar como RECIBIDA y actualizar inventario?',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, recibir',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.comprasSrv.recibir(id).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Compra recibida.',
          confirmButtonColor: '#16a34a'
        });
        if (this.compraIdActual() === id) this.comprasSrv.getCompra(id).subscribe(det => this.compraDetalle.set(det));
        this.cargarCompras();
      });
    }
  });
}

  cancelarCompra(id: number): void {
  Swal.fire({
    icon: 'warning',
    title: '¿Cancelar esta compra?',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#16a34a',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  }).then(result => {
    if (result.isConfirmed) {
      this.comprasSrv.cambiarEstado(id, EstadoCompra.Cancelada).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Compra cancelada.',
          confirmButtonColor: '#16a34a'
        });
        if (this.compraIdActual() === id) this.comprasSrv.getCompra(id).subscribe(det => this.compraDetalle.set(det));
        this.cargarCompras();
      });
    }
  });
}

  eliminarCompra(id: number): void {
  Swal.fire({
    icon: 'warning',
    title: '¿Eliminar definitivamente?',
    text: 'Esta acción no se puede deshacer.',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#16a34a',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.comprasSrv.eliminarCompra(id).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Compra eliminada.',
          confirmButtonColor: '#16a34a'
        });
        if (this.compraIdActual() === id) this.cerrarEditor();
        this.cargarCompras();
      });
    }
  });
}

  estadoLabel(e: EstadoCompra): string {
    switch (e) {
      case EstadoCompra.Borrador: return 'Borrador';
      case EstadoCompra.Ordenada: return 'Ordenada';
      case EstadoCompra.ParcialmenteRecibida: return 'Parcialmente recibida';
      case EstadoCompra.Recibida: return 'Recibida';
      case EstadoCompra.Cancelada: return 'Cancelada';
      default: return '—';
    }
  }

  badgeClass(e: EstadoCompra): string {
    if (e === EstadoCompra.Recibida) return 'bg-green-100 text-green-700';
    if (e === EstadoCompra.Cancelada) return 'bg-red-100 text-red-700';
    if (e === EstadoCompra.Ordenada) return 'bg-blue-100 text-blue-700';
    if (e === EstadoCompra.ParcialmenteRecibida) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  }
}
