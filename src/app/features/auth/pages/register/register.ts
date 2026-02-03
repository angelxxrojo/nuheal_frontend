import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Especialidad } from '../../../../models/common.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-lg w-full space-y-8">
        <div>
          <h1 class="text-center text-3xl font-extrabold text-gray-900">
            NuHeal
          </h1>
          <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
            Crea tu cuenta
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?
            <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              Inicia sesión
            </a>
          </p>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700">
                  Nombres
                </label>
                <input
                  id="first_name"
                  type="text"
                  formControlName="first_name"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                @if (form.get('first_name')?.touched && form.get('first_name')?.errors?.['required']) {
                  <p class="mt-1 text-sm text-red-600">Los nombres son requeridos</p>
                }
              </div>

              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <input
                  id="last_name"
                  type="text"
                  formControlName="last_name"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                @if (form.get('last_name')?.touched && form.get('last_name')?.errors?.['required']) {
                  <p class="mt-1 text-sm text-red-600">Los apellidos son requeridos</p>
                }
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
                <p class="mt-1 text-sm text-red-600">El correo es requerido</p>
              }
              @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                <p class="mt-1 text-sm text-red-600">Ingresa un correo válido</p>
              }
            </div>

            <div>
              <label for="telefono" class="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                formControlName="telefono"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="987654321"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="numero_colegiatura" class="block text-sm font-medium text-gray-700">
                  Número de Colegiatura (CEP)
                </label>
                <input
                  id="numero_colegiatura"
                  type="text"
                  formControlName="numero_colegiatura"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="CEP12345"
                />
                @if (form.get('numero_colegiatura')?.touched && form.get('numero_colegiatura')?.errors?.['required']) {
                  <p class="mt-1 text-sm text-red-600">El número de colegiatura es requerido</p>
                }
              </div>

              <div>
                <label for="especialidad" class="block text-sm font-medium text-gray-700">
                  Especialidad
                </label>
                <select
                  id="especialidad"
                  formControlName="especialidad"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  @for (esp of especialidades; track esp.value) {
                    <option [value]="esp.value">{{ esp.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label for="nombre_consultorio" class="block text-sm font-medium text-gray-700">
                Nombre del Consultorio (opcional)
              </label>
              <input
                id="nombre_consultorio"
                type="text"
                formControlName="nombre_consultorio"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
                  <p class="mt-1 text-sm text-red-600">La contraseña es requerida</p>
                }
                @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
                  <p class="mt-1 text-sm text-red-600">Mínimo 8 caracteres</p>
                }
              </div>

              <div>
                <label for="password_confirm" class="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="password_confirm"
                  type="password"
                  formControlName="password_confirm"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                @if (form.get('password_confirm')?.touched && form.get('password_confirm')?.errors?.['required']) {
                  <p class="mt-1 text-sm text-red-600">Confirma tu contraseña</p>
                }
              </div>
            </div>

            @if (form.errors?.['passwordMismatch'] && form.get('password_confirm')?.touched) {
              <p class="text-sm text-red-600">Las contraseñas no coinciden</p>
            }
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              } @else {
                Crear cuenta
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  especialidades: { value: Especialidad; label: string }[] = [
    { value: 'general', label: 'Enfermería General' },
    { value: 'pediatrica', label: 'Enfermería Pediátrica' },
    { value: 'comunitaria', label: 'Enfermería Comunitaria' },
    { value: 'geriatrica', label: 'Enfermería Geriátrica' },
    { value: 'uci', label: 'Cuidados Intensivos' },
    { value: 'otra', label: 'Otra' }
  ];

  form: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    numero_colegiatura: ['', Validators.required],
    especialidad: ['general', Validators.required],
    nombre_consultorio: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirm: ['', Validators.required]
  }, {
    validators: this.passwordMatchValidator
  });

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('password_confirm')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/nurse/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Error al registrar');
      }
    });
  }
}
