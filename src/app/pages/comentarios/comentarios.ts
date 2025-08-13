import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.css']
})
export class Comentarios {
  comentario = {
    nombre: '',
    email: '',
    mensaje: ''
  };

  comentarios: any[] = [];

  enviarComentario() {
    if (this.comentario.nombre && this.comentario.email && this.comentario.mensaje) {
      this.comentarios.push({
        ...this.comentario,
        fecha: this.obtenerHoraActual()
      });
      this.comentario = { nombre: '', email: '', mensaje: '' };
    }
  }

  obtenerHoraActual(): string {
    const fecha = new Date();
    return `Publicado a las ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')}, ${fecha.toLocaleDateString('es-ES')}`;
  }
}
