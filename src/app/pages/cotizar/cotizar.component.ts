import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder, Validators, ReactiveFormsModule, FormsModule
} from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Cotizacion } from '../../interfaces/cotizacion';
import { ServiciosService } from '../../services/servicios.service';
import { Servicio } from '../../interfaces/servicio-interface';
import { User } from '../../interfaces/user-detail';
import { CorreoService } from '../../services/correo.service';
import { CorreoConfirmacion } from '../../interfaces/correoConfirmacion';
import { AuthResponse } from '../../interfaces/auth-response';

@Component({
    selector: 'app-cotizar',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule
    ],
    templateUrl: './cotizar.component.html',
    styleUrls: ['./cotizar.component.css']
})
export class CotizarComponent implements OnInit {

    private serviciosService = inject(ServiciosService);
    private fb = inject(FormBuilder);
    private correoService = inject(CorreoService);

    servicios = signal<Servicio[]>([]);
    servicioSeleccionadoId = signal<number | null>(null);
    servicioSeleccionado = signal<Servicio | null>(null);
    vistaActual = signal<'servicios' | 'formulario'>('servicios');

    cotizacionForm = this.fb.group({
        nombre: ['', Validators.required],
        apellidoPaterno: ['', Validators.required],
        apellidoMaterno: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        direccion: ['', Validators.required],
    });

    ngOnInit(): void {
        this.cargarServicios();
    }

    cargarServicios(): void {
        this.serviciosService.getServicios().subscribe({
            next: (data) => this.servicios.set(data || []),
            error: (e) => this.manejarError(e)
        });
    }

    seleccionarServicioYMostrarFormulario(id: number): void {
        if (id !== null) {
            this.servicioSeleccionadoId.set(id);
            const servicio = this.servicios().find(s => s.id === id);
            this.servicioSeleccionado.set(servicio || null);
            this.vistaActual.set('formulario');
        } else {
            console.error('Error: No se puede seleccionar un servicio con un ID nulo.');
        }
    }

    enviarCotizacion(): void {
        if (!this.cotizacionForm.valid || this.servicioSeleccionadoId() === null) {
            console.log('Por favor, completa todos los campos del formulario y selecciona un servicio.');
            return;
        }

        const formValue = this.cotizacionForm.value;
        const passwordTemporal = this.generarPasswordTemporal();
        const nombreCompleto = `${formValue.nombre} ${formValue.apellidoPaterno} ${formValue.apellidoMaterno}`;

        const nuevoUsuario: User = {
            fullName: nombreCompleto,
            password: passwordTemporal,
            email: formValue.email!,
            roles: ['User']
        };

        // Crear usuario primero
        this.serviciosService.crearUsuario(nuevoUsuario).subscribe({
            next: (respuesta: AuthResponse) => {
                console.log('Usuario creado con éxito:', respuesta);

                // Crear cotización con el userId retornado
                const nuevaCotizacion: Cotizacion = {
                    nombre: formValue.nombre!,
                    apellidoPaterno: formValue.apellidoPaterno!,
                    apellidoMaterno: formValue.apellidoMaterno!,
                    email: formValue.email!,
                    telefono: formValue.telefono!,
                    direccion: formValue.direccion!,
                    fechaSolicitud: new Date().toISOString(),
                    estaFinalizada: false,
                    usuarioId: respuesta.userId,
                    serviciosIds: [this.servicioSeleccionadoId()!],
                };

                this.serviciosService.crearCotizacion(nuevaCotizacion).subscribe({
                    next: (res) => {
                        console.log('Cotización enviada con éxito:', res);
                        this.enviarCredencialesPorCorreo(formValue.email!, passwordTemporal);
                        this.cotizacionForm.reset();
                        this.servicioSeleccionadoId.set(null);
                        this.vistaActual.set('servicios');
                    },
                    error: (err) => this.manejarError(err)
                });
            },
            error: (err) => this.manejarError(err)
        });
    }

    private generarPasswordTemporal(): string {
        const digitos = '0123456789';
        const noAlfanumericos = '!@#$%^&*()_+-=[]{}|;:<>,.?/~';
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const todos = digitos + noAlfanumericos + letras;
        const longitud = 8;
        let passwordArray = [
            digitos.charAt(Math.floor(Math.random() * digitos.length)),
            noAlfanumericos.charAt(Math.floor(Math.random() * noAlfanumericos.length))
        ];
        while (passwordArray.length < longitud) {
            passwordArray.push(todos.charAt(Math.floor(Math.random() * todos.length)));
        }
        // Mezclar
        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }
        return passwordArray.join('');
    }

    private enviarCredencialesPorCorreo(destinatario: string, passwordTemporal: string): void {
        const asunto = '¡Bienvenido! Tus credenciales de acceso.';
        const cuerpo = `Hola,

Gracias por tu cotización. Hemos creado una cuenta para ti. Aquí están tus credenciales temporales:

Correo: ${destinatario}
Contraseña: ${passwordTemporal}

Por favor, inicia sesión y cambia tu contraseña lo antes posible.

Saludos,
El equipo de la empresa`;

        const datosCorreo: CorreoConfirmacion = { destinatario, asunto, cuerpo };
        this.correoService.enviarCorreoConfirmacion(datosCorreo).subscribe({
            next: (res) => console.log('Correo enviado con éxito:', res),
            error: (err) => this.manejarError(err)
        });
    }

    // Manejo centralizado de errores
    private manejarError(error: HttpErrorResponse): void {
        if (error.error) {
            console.error('Error del backend:', error.error);
            if (error.error.message) console.error('Mensaje:', error.error.message);
            if (Array.isArray(error.error.errors)) console.error('Errores de validación:', error.error.errors);
        } else {
            console.error('Error desconocido:', error.message);
        }
    }
}
