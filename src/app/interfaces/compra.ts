export enum EstadoCompra {
  Borrador = 0,
  Ordenada = 1,
  ParcialmenteRecibida = 2,
  Recibida = 3,
  Cancelada = 4
}

export interface CompraLiteDto {
  id: number;
  fecha: string;
  estado: EstadoCompra;
  proveedorId: number;
  proveedorNombre: string;
  subtotal: number;
  iva: number;
  total: number;
}

export interface CompraDetalleDto {
  id: number;
  materiaPrimaId: number;
  materiaPrimaNombre: string;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje: number;
  subtotal: number;
  iva: number;
  totalLinea: number;
}

export interface CompraDetailDto extends CompraLiteDto {
  numeroDocumento?: string;
  notas?: string;
  detalles: CompraDetalleDto[];
}

export interface CompraDetalleCreateDto {
  materiaPrimaId: number;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje?: number; // default 0.16 si no se envía
}

export interface CompraCreateDto {
  proveedorId: number;
  fecha?: string; // ISO
  numeroDocumento?: string;
  notas?: string;
  detalles: CompraDetalleCreateDto[];
}

export interface CompraUpdateDto {
  fecha?: string;
  numeroDocumento?: string;
  notas?: string;
}

