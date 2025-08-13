import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup
} from '@angular/forms';
import { CorreoService } from '../../services/correo.service';
import { Correo } from '../../interfaces/correo';

@Component({
  selector: 'app-contactanos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './contactanos.html',
  styleUrl: './contactanos.css'
})
export class ContactanosComponent implements OnInit {

  private correoService = inject(CorreoService);
  private fb = inject(FormBuilder);

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      asunto: ['', Validators.required],
      cuerpo: ['', Validators.required],
    });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const datosParaCorreo: Correo = this.form.value;

    this.correoService.enviarCorreoCotizacion(datosParaCorreo).subscribe(
      (response) => {
        console.log('Correo enviado con éxito:', response.mensaje);
        alert('Correo de cotización enviado correctamente.');
        this.form.reset();
      },
      (error) => {
        console.error('Error al enviar el correo:', error.error);
        alert('Ocurrió un error al enviar el correo.');
      }
    );
  }
}