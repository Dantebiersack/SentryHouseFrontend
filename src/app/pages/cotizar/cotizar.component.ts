import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder, Validators, ReactiveFormsModule, FormsModule,
    FormGroup
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cotizacion } from '../../interfaces/cotizacion';
import { ServiciosService} from '../../services/servicios.service';
import { Servicio } from '../../interfaces/servicio-interface';
import { User } from '../../interfaces/user-detail';
import { CorreoService } from '../../services/correo.service';
import { CorreoConfirmacion } from '../../interfaces/correoConfirmacion';

@Component({
    selector: 'app-cotizar',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule
    ],
    // La ruta es correcta, pero revisa si el archivo existe físicamente y si los permisos son correctos.
    templateUrl: './cotizar.component.html',
    styleUrl: './cotizar.component.css'
})

export class CotizarComponent implements OnInit {

    private serviciosService = inject(ServiciosService);
    private fb = inject(FormBuilder);
    private correoService = inject(CorreoService);

    servicios = signal<Servicio[]>([]);
    servicioSeleccionadoId = signal<number | null>(null);
    servicioSeleccionado = signal<Servicio | null>(null);
    vistaActual = signal<'servicios' | 'formulario'>('servicios');

    // Define el formulario con validadores, el campo de contraseña ha sido eliminado
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
            next: (data) => {
                this.servicios.set(data || []);
            },
            error: (e) => console.error('Error al cargar los servicios:', e)
        });
    }

    seleccionarServicio(id: number): void {
        this.servicioSeleccionadoId.set(id);
        console.log(`Servicio con ID ${id} seleccionado. Por favor, completa el formulario para cotizar.`);
    }

    seleccionarServicioYMostrarFormulario(id: number): void {
        // Se añade una verificación para asegurar que el ID no sea nulo antes de continuar
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
        if (this.cotizacionForm.valid && this.servicioSeleccionadoId() !== null) {
            const formValue = this.cotizacionForm.value;
            const passwordTemporal = this.generarPasswordTemporal();

            const nuevaCotizacion: Cotizacion = {
                nombre: formValue.nombre!,
                apellidoPaterno: formValue.apellidoPaterno!,
                apellidoMaterno: formValue.apellidoMaterno!,
                email: formValue.email!,
                telefono: formValue.telefono!,
                direccion: formValue.direccion!,
                fechaSolicitud: new Date().toISOString(),
                estaFinalizada: false,
                serviciosIds: [this.servicioSeleccionadoId()!],
            };

            console.log('Datos de la cotización a enviar:', nuevaCotizacion);

            this.serviciosService.crearCotizacion(nuevaCotizacion).subscribe({
                next: (response) => {
                    console.log('Cotización enviada con éxito:', response);
                    // Ahora, la contraseña temporal se genera aquí y se pasa a guardarUsuario
                    this.guardarUsuario(passwordTemporal);
                    this.cotizacionForm.reset();
                    this.servicioSeleccionadoId.set(null);
                    this.vistaActual.set('servicios');
                },
                error: (error) => {
                    console.error('Error al enviar la cotización:', error);
                }
            });

        } else {
            console.log('Por favor, completa todos los campos del formulario y selecciona un servicio.');
        }
    }

    // Función para generar una contraseña temporal que cumple con los requisitos del servidor
    private generarPasswordTemporal(): string {
        const digitos = '0123456789';
        const noAlfanumericos = '!@#$%^&*()_+-=[]{}|;:<>,.?/~';
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const todosLosCaracteres = digitos + noAlfanumericos + letras;
        const longitud = 8; // La longitud mínima del password

        let passwordArray = [];

        // Garantizar al menos un dígito
        passwordArray.push(digitos.charAt(Math.floor(Math.random() * digitos.length)));

        // Garantizar al menos un carácter no alfanumérico
        passwordArray.push(noAlfanumericos.charAt(Math.floor(Math.random() * noAlfanumericos.length)));

        // Rellenar el resto de la contraseña con caracteres aleatorios
        while (passwordArray.length < longitud) {
            passwordArray.push(todosLosCaracteres.charAt(Math.floor(Math.random() * todosLosCaracteres.length)));
        }

        // Mezclar el array para que los caracteres requeridos no estén siempre al principio
        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }

        return passwordArray.join('');
    }


    // El método ahora recibe la contraseña temporal como argumento
    guardarUsuario(passwordTemporal: string): void {
        const formValue = this.cotizacionForm.value;
        const nombreCompleto = formValue.nombre! + ' ' + formValue.apellidoPaterno! + ' ' + formValue.apellidoMaterno!;

        const nuevoUsuario: User = {
            fullName: nombreCompleto,
            password: passwordTemporal,
            email: formValue.email!,
            roles: ['User']
        };

        console.log('Usuario a crear:', nuevoUsuario);

        this.serviciosService.crearUsuario(nuevoUsuario).subscribe({
            next: (response) => {
                console.log('Usuario creado con éxito:', response);
                // Ahora, la lógica para enviar el correo se ejecuta aquí
                this.enviarCredencialesPorCorreo(formValue.email!, nuevoUsuario.password);
            },
            error: (error) => {
                console.error('Error al crear el usuario:', error);
            }
        });
    }

    private enviarCredencialesPorCorreo(destinatario: string, passwordTemporal: string): void {
        const asunto = '¡Bienvenido! Tus credenciales de acceso.';
        const cuerpo = `Hola,\n\nGracias por tu cotización. Hemos creado una cuenta para ti. Aquí están tus credenciales temporales:\n\nCorreo: ${destinatario}\nContraseña: ${passwordTemporal}\n\nPor favor, inicia sesión y cambia tu contraseña lo antes posible.\n\nSaludos,\nEl equipo de la empresa`;

        const datosCorreo: CorreoConfirmacion = {
            destinatario: destinatario,
            asunto: asunto,
            cuerpo: cuerpo,
        };

        this.correoService.enviarCorreoConfirmacion(datosCorreo).subscribe({
            next: (response) => {
                console.log('Correo de confirmación enviado con éxito:', response);
            },
            error: (error) => {
                console.error('Error al enviar el correo de confirmación:', error);
            }
        });
    }
}
