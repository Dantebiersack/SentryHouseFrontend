// Enum alineado con el back
export enum EstadoVenta {
  Borrador = 0,
  Confirmada = 1,
  Cancelada = 2,
  Entregada = 3,
}

// Lo que devuelve el listado por usuario (flexible)
export interface Venta {
  id: number;
  fechaVenta: string;
  estado?: EstadoVenta;
  subtotal?: number;
  iva?: number;
  total?: number;
  // opcionales por si tu endpoint incluye nombres de servicios u otros campos
  servicios?: string[];
  [key: string]: any;
}

// DTOs para trabajar con las nuevas rutas del back
export interface VentaLineaCreateDto {
  servicioId: number;
  cantidad: number;
  precioUnitario?: number; // si no mandas, el back toma el PrecioBase del servicio (si existe)
  ivaPorcentaje?: number;  // default 0.16 en el back
}

export interface VentaCreateDto {
  usuarioId: string;
  cotizacionId?: number;
  lineas: VentaLineaCreateDto[];
}

export interface VentaDetalleDto {
  id: number;
  servicioId: number;
  servicioNombre: string;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje: number;
  subtotal: number;
  iva: number;
  totalLinea: number;
}

export interface VentaDetailDto {
  id: number;
  fechaVenta: string;
  estado: EstadoVenta;
  subtotal: number;
  iva: number;
  total: number;
  cotizacionId?: number;
  usuarioId: string;
  detalles: VentaDetalleDto[];
}
