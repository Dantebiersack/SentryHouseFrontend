import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, NonNullableFormBuilder } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MateriaPrimaService } from '../../services/materia-prima';
import { MateriaPrima as MateriaPrimaInterface } from '../../interfaces/materia-prima';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor } from '../../interfaces/proveedor';

@Component({
  selector: 'app-materia-prima',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './materia-prima.html',
  styleUrl: './materia-prima.css',
})
export class MateriaPrima implements OnInit {
  fb: NonNullableFormBuilder = inject(FormBuilder).nonNullable;
  service = inject(MateriaPrimaService);

  form = this.fb.group({
    nombreProducto: ['', Validators.required],
    cantidad: 0,
    costoTotal: 0,
    proveedorId: 0
  });


  proveedoresService = inject(ProveedoresService);
  proveedores = signal<Proveedor[]>([]);

  materiasPrimas = signal<MateriaPrimaInterface[]>([]);
  busqueda = signal('');
  modoEdicion = signal(false);
  editandoId = signal<number | null>(null);
  mostrarFormulario = signal(false);

  materiasFiltradas = computed(() => {
    const texto = this.busqueda().toLowerCase();
    return this.materiasPrimas().filter(mp =>
      mp.nombreProducto?.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargarDatos();
    this.proveedoresService.getProveedores().subscribe((data) =>
      this.proveedores.set(data)
    );
  }

  cargarDatos() {
    this.service.getAll().subscribe(data => this.materiasPrimas.set(data));
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const mp: MateriaPrimaInterface = {
      id: this.editandoId() ?? 0,
      nombreProducto: raw.nombreProducto,
      cantidad: raw.cantidad,
      costoTotal: raw.costoTotal,
      proveedorId: raw.proveedorId
    };

    if (this.modoEdicion() && this.editandoId() !== null) {
      this.service.update(this.editandoId()!, mp).subscribe(() => {
        this.cancelar();
        this.cargarDatos();
      });
    } else {
      this.service.create(mp).subscribe(() => {
        this.form.reset();
        this.cargarDatos();
        this.mostrarFormulario.set(false);
      });
    }
  }

  editar(mp: MateriaPrimaInterface) {
    this.modoEdicion.set(true);
    this.editandoId.set(mp.id!);
    this.form.patchValue(mp);
    this.mostrarFormulario.set(true);
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar materia prima?')) {
      this.service.delete(id).subscribe(() => this.cargarDatos());
    }
  }

  cancelar() {
    this.form.reset();
    this.modoEdicion.set(false);
    this.editandoId.set(null);
    this.mostrarFormulario.set(false);
  }
}
