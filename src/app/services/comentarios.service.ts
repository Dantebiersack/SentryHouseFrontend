import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Comentario {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ComentariosService {
  private apiUrl = 'https://localhost:5000/api/comentarios'; 

  constructor(private http: HttpClient) {}

  getComentarios() {
    return this.http.get<Comentario[]>(this.apiUrl);
  }

  enviarComentario(comentario: Comentario) {
    return this.http.post<Comentario>(this.apiUrl, comentario);
  }
}
