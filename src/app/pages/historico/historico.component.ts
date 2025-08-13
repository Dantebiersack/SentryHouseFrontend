import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { VentasService } from '../../services/ventas.service';
import { Venta } from '../../interfaces/venta';
import { Cotizacion } from '../../interfaces/cotizacion';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent implements OnInit {
  ventas: Venta[] = [];
  cotizaciones: Cotizacion[] = [];

  constructor(
    private ventasService: VentasService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    const userDetail = this.authService.getUserDetail();

    if (userDetail && userDetail.id) {
      const usuarioId = userDetail.id;

      // Obtener ventas
      this.ventasService.obtenerVentasPorUsuario(usuarioId).subscribe({
        next: (data) => {
          this.ventas = data;
          console.log('Ventas obtenidas:', this.ventas);
        },
        error: (err) => console.error('Error al obtener ventas', err)
      });

      // Obtener cotizaciones
      this.ventasService.getCotizacionesUsuario(usuarioId).subscribe({
        next: (data) => {
          this.cotizaciones = data;
          console.log('Cotizaciones obtenidas:', this.cotizaciones);
        },
        error: (err) => console.error('Error al obtener cotizaciones', err)
      });

    } else {
      console.error('No se pudo obtener el ID del usuario. Asegúrate de que la sesión esté iniciada.');
    }
  }
}
