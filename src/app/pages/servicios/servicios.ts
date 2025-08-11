import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, Validators, ReactiveFormsModule, FormsModule,
  FormArray, FormGroup, FormControl
} from '@angular/forms';

import { ServiciosService } from '../../services/servicios.service';
import { MateriaPrimaService } from '../../services/materia-prima'; // 👈 asegúrate del nombre del archivo
import { Servicio } from '../../interfaces/servicio-interface';
import { MateriaPrima } from '../../interfaces/materia-prima';

// Tipo fuerte para cada fila de material
type MaterialForm = {
  materiaPrimaId: FormControl<number | null>;
  cantidadRequerida: FormControl<number>;
  unidad: FormControl<string | null>;
};

type ServicioMaterialPayload = {
  materiaPrimaId: number;
  cantidadRequerida: number;
  unidad?: string; // 👈 sin null
};

type BomItem = {
  materiaPrimaId: number;
  cantidad: number;
  unidad?: string | null;
  materiaPrimaNombre?: string;
};

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})



export class Servicios implements OnInit {
  private serviciosService = inject(ServiciosService);
  private materiasService = inject(MateriaPrimaService);
  private fb = inject(FormBuilder);

  // Estado UI
  mostrarFormulario = signal(false);
  modoEdicion = signal(false);
  busqueda = '';

  // Catálogos
  servicios = signal<Servicio[]>([]);
  materias = signal<MateriaPrima[]>([]);

  // Form principal + BOM (tipado)
  form = this.fb.group({
    id: [null as number | null],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    archivoDocumento: ['', Validators.required],
    materiales: this.fb.array<FormGroup<MaterialForm>>([]) // 👈 tipado
  });

  // Acceso corto al FormArray (tipado)
  get materialesFA(): FormArray<FormGroup<MaterialForm>> {
    return this.form.get('materiales') as FormArray<FormGroup<MaterialForm>>;
  }

  // Factory tipado para cada fila
  private crearMaterialFG(init?: { materiaPrimaId: number | null; cantidadRequerida: number; unidad?: string | null }) {
    return this.fb.group<MaterialForm>({
      materiaPrimaId: this.fb.control(init?.materiaPrimaId ?? null, { nonNullable: false, validators: [Validators.required] }),
      cantidadRequerida: this.fb.control(init?.cantidadRequerida ?? 1, { nonNullable: true, validators: [Validators.required, Validators.min(0.0001)] }),
      unidad: this.fb.control(init?.unidad ?? null, { nonNullable: false })
    });
  }

  // ===== Ciclo de vida =====
  ngOnInit(): void {
    this.cargarServicios();
    this.materiasService.getAll().subscribe(ms => this.materias.set(ms || []));
  }

  // ===== Listado =====
  cargarServicios(): void {
    this.serviciosService.getServicios().subscribe(data => this.servicios.set(data || []));
  }

  serviciosFiltrados(): Servicio[] {
    const t = (this.busqueda || '').toLowerCase().trim();
    if (!t) return this.servicios();
    return this.servicios().filter(s =>
      (s.nombre || '').toLowerCase().includes(t) ||
      (s.descripcion || '').toLowerCase().includes(t)
    );
  }

  // ===== CRUD Servicio (encabezado) =====
  enviar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { id, nombre, descripcion, archivoDocumento } = this.form.getRawValue();
    const payload: Servicio = {
      id: id ?? undefined,
      nombre: nombre || '',
      descripcion: descripcion || '',
      archivoDocumento: (archivoDocumento as any) ?? ''
    } as Servicio;

    if (this.modoEdicion()) {
      this.serviciosService.updateServicio(id!, payload).subscribe(() => {
        this.cargarServicios();
      });
    } else {
      this.serviciosService.addServicio(payload).subscribe((created: any) => {
        const newId = created?.id ?? created?.Id;
        this.form.patchValue({ id: newId });
        this.modoEdicion.set(true);
        this.cargarServicios();
      });
    }
  }

  editar(servicio: Servicio): void {
    this.form.patchValue({
      id: servicio.id ?? null,
      nombre: servicio.nombre ?? '',
      descripcion: servicio.descripcion ?? '',
      archivoDocumento: (servicio as any).archivoDocumento ?? ''
    });

    this.materialesFA.clear();

    if (servicio.id) {
      this.serviciosService.getServicioDetalle(servicio.id).subscribe((det: any) => {
        const raw = det?.materiales?.$values ?? det?.materiales ?? [];
        const mats = (raw as any[])
          .map(x => this.mapBomItem(x))
          .filter(mi => Number.isFinite(mi.materiaPrimaId) && mi.materiaPrimaId > 0);

        mats.forEach(mi => this.materialesFA.push(this.crearMaterialFG({
          materiaPrimaId: mi.materiaPrimaId,
          cantidadRequerida: mi.cantidad,
          unidad: mi.unidad ?? undefined
        })));
      });
    }

    this.mostrarFormulario.set(true);
    this.modoEdicion.set(true);
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    this.serviciosService.deleteServicio(id).subscribe(() => this.cargarServicios());
  }

  cancelar(): void {
    this.form.reset();
    this.materialesFA.clear();
    this.mostrarFormulario.set(false);
    this.modoEdicion.set(false);
  }

  // ===== BOM (ServicioMaterial) =====
  agregarMaterial(): void {
    this.materialesFA.push(this.crearMaterialFG());
  }

  removerMaterial(i: number): void {
    this.materialesFA.removeAt(i);
  }



  guardarMateriales(): void {
    const id = this.form.value.id;
    if (!id) { alert('Primero guarda el servicio para obtener un ID.'); return; }

    const rows = this.materialesFA.getRawValue();

    const payload: ServicioMaterialPayload[] = rows
      .filter(r => r.materiaPrimaId && r.cantidadRequerida > 0)
      .map(r => ({
        materiaPrimaId: Number(r.materiaPrimaId),
        cantidadRequerida: Number(r.cantidadRequerida),
        ...(r.unidad ? { unidad: r.unidad } : {})
      }));

    this.serviciosService.setMateriales(id, payload).subscribe({
      next: () => { alert('Materiales guardados.'); this.serviciosService.getServicioDetalle(id).subscribe(); },
      error: (e) => { console.error(e); alert('No se pudieron guardar los materiales.'); }
    });

  }

  bom = signal<Record<number, BomItem[]>>({});
  loadingBom = signal<Record<number, boolean>>({});
  openBom = signal<Record<number, boolean>>({});

  // MAPEO ROBUSTO: soporta Item1/2/3/4, PascalCase, camelCase y anidados
  private mapBomItem(m: any): BomItem {
    // id de materia prima
    const mpId =
      m?.materiaPrimaId ?? m?.MateriaPrimaId ??
      m?.materiaPrima?.id ?? m?.MateriaPrima?.Id ??
      m?.id ?? m?.Id ??
      m?.item1 ?? m?.Item1;

    // cantidad
    const cant =
      m?.cantidad ?? m?.Cantidad ??
      m?.cantidadRequerida ?? m?.CantidadRequerida ??
      m?.item3 ?? m?.Item3;

    // unidad (puede venir null o string)
    const uni =
      m?.unidad ?? m?.Unidad ??
      m?.item4 ?? m?.Item4 ?? null;

    // nombre (si el back lo manda)
    const mpNombre =
      m?.materiaPrimaNombre ?? m?.MateriaPrimaNombre ??
      m?.materiaPrima?.nombreProducto ?? m?.MateriaPrima?.NombreProducto ??
      m?.item2 ?? m?.Item2;

    return {
      materiaPrimaId: Number(mpId ?? NaN),
      cantidad: Number(cant ?? 0),
      unidad: (uni ?? null) as string | null,
      materiaPrimaNombre: mpNombre ? String(mpNombre) : undefined
    };
  }

  toggleMateriales(servicio: Servicio) {
    const id = servicio.id!;
    this.openBom.set({ ...this.openBom(), [id]: !this.openBom()[id] });
    if (this.openBom()[id] && !this.bom()[id]) this.cargarBom(id);
  }

  private cargarBom(id: number) {
    this.loadingBom.set({ ...this.loadingBom(), [id]: true });

    this.serviciosService.getServicioDetalle(id).subscribe({
      next: (det: any) => {
        // soporta el caso de $values (cuando el back manda colecciones así)
        const raw = det?.materiales?.$values ?? det?.materiales ?? [];
        const mats = (raw as any[]).map(x => this.mapBomItem(x))
          // filtra basura si algo vino raro
          .filter(mi => Number.isFinite(mi.materiaPrimaId) && mi.materiaPrimaId > 0);

        this.bom.set({ ...this.bom(), [id]: mats });
        this.loadingBom.set({ ...this.loadingBom(), [id]: false });
      },
      error: () => {
        this.bom.set({ ...this.bom(), [id]: [] });
        this.loadingBom.set({ ...this.loadingBom(), [id]: false });
      }
    });
  }

  // nombre por catálogo si el DTO no trae nombre
  nombreMateria(id: number): string {
    const m = this.materias().find(x => x.id === id);
    return m?.nombreProducto ?? `#${id}`;
  }

}
