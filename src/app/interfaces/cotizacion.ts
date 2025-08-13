export interface Cotizacion {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaSolicitud: string;
  estaFinalizada: boolean;
  usuarioId: string;
  serviciosIds: number[];
}