import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor } from '../../interfaces/proveedor';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-proveedores',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
  standalone: true,
})
export class Proveedores implements OnInit {

  fb = inject(FormBuilder);
  proveedoresService = inject(ProveedoresService);

  form = this.fb.group({
    nombre: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    direccion: [''],
    telefono: [''],
    nombreYCargo: [''],
  });

  busqueda = signal('');
  modoEdicion = signal(false);
  proveedorEditandoId = signal<number | null>(null);
  proveedores = signal<Proveedor[]>([]);
  mostrarFormulario = signal(false);

  proveedoresFiltrados = computed(() => {
    const texto = this.busqueda().toLowerCase();
    return this.proveedores().filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.correo.toLowerCase().includes(texto) ||
      p.direccion.toLowerCase().includes(texto) ||
      (p.nombreYCargo?.toLowerCase().includes(texto) ?? false)
    );
  });

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.proveedoresService.getProveedores().subscribe((data) => {
      this.proveedores.set(data);
    });
  }

  enviar() {
    console.log('✅ ENVIAR() fue llamado');
    if (this.form.invalid) {
    this.form.markAllAsTouched(); 
    return;
  }

    console.log('✅ Datos del formulario:', this.form.getRawValue()); 
    const raw = this.form.getRawValue();

    const data = {
      nombre: raw.nombre ?? '',
      correo: raw.correo ?? '',
      direccion: raw.direccion ?? '',
      telefono: raw.telefono ?? '',
      nombreYCargo: raw.nombreYCargo ?? '',
    };

    if (this.modoEdicion() && this.proveedorEditandoId() !== null) {
      this.proveedoresService.editarProveedor(this.proveedorEditandoId()!, {
        id: this.proveedorEditandoId()!,
        ...data
      }).subscribe(() => {
        this.cancelar();
        this.cargarProveedores();
      });
    } else {
      this.proveedoresService.crearProveedor(data).subscribe(() => {
        this.form.reset();
        this.cargarProveedores();
        this.mostrarFormulario.set(false);
      });
    }
  }

  editar(proveedor: Proveedor) {
    this.modoEdicion.set(true);
    this.proveedorEditandoId.set(proveedor.id!);
    this.form.patchValue(proveedor);
    this.mostrarFormulario.set(true);
  }

  cancelar() {
    this.form.reset();
    this.modoEdicion.set(false);
    this.proveedorEditandoId.set(null);
    this.mostrarFormulario.set(false);
  }

}
