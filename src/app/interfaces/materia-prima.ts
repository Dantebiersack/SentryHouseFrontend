export interface MateriaPrima {
  id?: number;
  nombreProducto?: string;
  cantidad?: number;
  costoTotal?: number;
  proveedorId?: number;
  proveedor?: {
    id: number;
    nombre: string;
  };
}
