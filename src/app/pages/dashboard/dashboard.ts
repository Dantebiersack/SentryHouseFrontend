import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardSummaryResponse } from '../../services/dashboard.service';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit {
  private svc = inject(DashboardService);

  // ✅ Alternativa 2: objeto inicial por defecto
  data: DashboardSummaryResponse = {
    rango: { from: '', to: '' },
    kpis: {
      subtotal: 0,
      iva: 0,
      total: 0,
      cantidadVentas: 0,
      ventasHoy: 0,
      ventasSemana: 0,
      ventasMes: 0
    },
    series: { porDia: [] },
    topServicios: [],
    porEstado: []
  };

  loading = false;
  error?: string;

  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD

  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  private lineChart?: Chart;
  private doughnutChart?: Chart;

  ngOnInit(): void {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 29);
    this.from = past.toISOString().slice(0, 10);
    this.to = today.toISOString().slice(0, 10);
  }

  ngAfterViewInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = undefined;

    this.svc.getSummary(this.from, this.to).subscribe({
      next: (res) => {
        this.data = res;
        this.renderLine();
        this.renderDoughnut();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error || 'Error cargando dashboard';
        this.loading = false;
      },
    });
  }

  // ----- Helpers -----

  private estadoLabel(estado: number | string): string {
    if (typeof estado === 'string') return estado;
    switch (estado) {
      case 0: return 'Borrador';
      case 1: return 'Entregada';
      case 2: return 'Cancelada';
      default: return `Estado ${estado}`;
    }
  }

  // Rellena días faltantes entre from/to con 0
  private buildDailySeries(): { labels: string[]; values: number[] } {
    const map = new Map(this.data.series.porDia.map(d => [d.fecha, d.total]));
    const start = new Date(this.from!);
    const end = new Date(this.to!);

    const labels: string[] = [];
    const values: number[] = [];

    const d = new Date(start);
    while (d <= end) {
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      values.push(map.get(key) ?? 0);
      d.setDate(d.getDate() + 1);
    }
    return { labels, values };
  }

  // ----- Charts -----

  private renderLine(): void {
    const { labels, values } = this.buildDailySeries();

    if (this.lineChart) {
      this.lineChart.data.labels = labels as any;
      this.lineChart.data.datasets[0].data = values as any;
      this.lineChart.update();
      return;
    }

    const ctx = this.lineCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const cfg: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total (MXN)',
          data: values,
          fill: true,
          tension: 0.25,
          borderWidth: 2,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          pointRadius: 3,
          pointHoverRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = Number(ctx.parsed.y ?? 0);
                return ` ${v.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`;
              }
            }
          }
        }
      },
    };

    this.lineChart = new Chart(ctx, cfg);
  }

  private renderDoughnut(): void {
    const labels = this.data.porEstado.map(e => this.estadoLabel(e.estado));
    const values = this.data.porEstado.map(e => e.cantidad);

    if (this.doughnutChart) {
      this.doughnutChart.data.labels = labels as any;
      this.doughnutChart.data.datasets[0].data = values as any;
      this.doughnutChart.update();
      return;
    }

    const ctx = this.doughnutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Ventas por estado',
          data: values,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: [
            'rgba(37, 99, 235, 0.75)',   // Borrador
            'rgba(16, 185, 129, 0.75)',  // Entregada
            'rgba(239, 68, 68, 0.75)',   // Cancelada
            'rgba(234, 179, 8, 0.75)',   // Otros
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${Number(ctx.parsed ?? 0)} venta(s)`
            }
          }
        }
      },
    };

    this.doughnutChart = new Chart(ctx, cfg);
  }
}
