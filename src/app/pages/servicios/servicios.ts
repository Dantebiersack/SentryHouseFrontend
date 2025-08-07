import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../interfaces/servicio-interface';
import { ServiciosService } from '../../services/servicios.service';

@Component({
  selector: 'app-servicios',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class Servicios implements OnInit {
  private serviciosService = inject(ServiciosService);
  private fb = inject(FormBuilder);

  servicios = signal<Servicio[]>([]);
  mostrarFormulario = signal(false);
  modoEdicion = signal(false);
  busqueda = '';
  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    archivoDocumento: ['', Validators.required]
  });

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.serviciosService.getServicios().subscribe((resp) => {
      this.servicios.set(resp);
    });
  }

  serviciosFiltrados(): Servicio[] {
    const texto = this.busqueda.toLowerCase();
    return this.servicios().filter((s) =>
      s.nombre.toLowerCase().includes(texto)
    );
  }

  enviar(): void {
    if (this.form.invalid) return;

    const servicio = this.form.value;

    if (this.modoEdicion()) {
      this.serviciosService.updateServicio(servicio.id, servicio).subscribe(() => {
        this.cargarServicios();
        this.cancelar();
      });
    } else {
      const { id, ...nuevoServicio } = servicio;
      this.serviciosService.addServicio(nuevoServicio).subscribe(() => {
        this.cargarServicios();
        this.cancelar();
      });
    }
  }

  editar(servicio: Servicio): void {
    this.form.setValue({
      id: servicio.id,
      nombre: servicio.nombre ?? '',
      descripcion: servicio.descripcion ?? '',
      archivoDocumento: servicio.archivoDocumento ?? ''
    });

    this.mostrarFormulario.set(true);
    this.modoEdicion.set(true);
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    this.serviciosService.deleteServicio(id).subscribe(() => {
      this.cargarServicios();
    });
  }

  cancelar(): void {
    this.form.reset();
    this.mostrarFormulario.set(false);
    this.modoEdicion.set(false);
  }
}
