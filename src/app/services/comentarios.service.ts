import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Comentario {
  nombre: string;
  correo: string;
  mensaje: string;
  fecha: Date;
}

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private comentarios: Comentario[] = [];

  agregarComentario(comentario: Comentario) {
    this.comentarios.push(comentario);
  }

  obtenerComentarios(): Comentario[] {
    return this.comentarios;
  }
}
