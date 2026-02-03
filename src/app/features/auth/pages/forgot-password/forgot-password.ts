import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h1 class="text-center text-3xl font-extrabold text-gray-900">
            NuHeal
          </h1>
          <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
            Recuperar contraseña
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        @if (success()) {
          <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <p>Se han enviado las instrucciones a tu correo electrónico.</p>
            <p class="mt-2">
              <a routerLink="/auth/login" class="font-medium text-green-700 hover:text-green-600">
                Volver al inicio de sesión
              </a>
            </p>
          </div>
        } @else {
          @if (error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="correo@ejemplo.com"
              />
              @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
                <p class="mt-1 text-sm text-red-600">El correo es requerido</p>
              }
              @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                <p class="mt-1 text-sm text-red-600">Ingresa un correo válido</p>
              }
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loading() || form.invalid"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading()) {
                  <span class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                } @else {
                  Enviar instrucciones
                }
              </button>
            </div>

            <div class="text-center">
              <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
                Volver al inicio de sesión
              </a>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    // TODO: Implement password reset API call
    // For now, just simulate success
    setTimeout(() => {
      this.loading.set(false);
      this.success.set(true);
    }, 1500);
  }
}
