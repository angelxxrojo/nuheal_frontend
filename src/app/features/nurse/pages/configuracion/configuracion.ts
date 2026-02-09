import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';
import { AuthService } from '../../../../core/services/auth.service';
import { Enfermera } from '../../../../models/auth.model';
import { Sexo, Especialidad } from '../../../../models/common.model';

type TabType = 'perfil' | 'consultorio' | 'seguridad' | 'plan';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent],
  template: `
    <div>
      <app-page-breadcrumb pageTitle="Configuración" />

      <!-- Tabs Navigation -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex gap-6">
          @for (tab of tabs; track tab.key) {
            <button
              (click)="activeTab.set(tab.key)"
              class="border-b-2 px-1 pb-3 text-sm font-medium transition-colors"
              [class]="activeTab() === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
            >
              {{ tab.label }}
            </button>
          }
        </nav>
      </div>

      <!-- Tab: Perfil -->
      @if (activeTab() === 'perfil') {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Meta Card -->
          <div class="lg:col-span-1">
            <div class="rounded-2xl border border-gray-200 bg-white p-6">
              <div class="flex flex-col items-center text-center">
                <div class="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                  {{ userInitials }}
                </div>
                <h3 class="text-lg font-semibold text-gray-900">{{ userName }}</h3>
                <p class="text-sm text-gray-500">{{ userRole }}</p>
                @if (user()?.especialidad) {
                  <span class="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {{ especialidadDisplay(user()!.especialidad) }}
                  </span>
                }
                @if (user()?.numero_colegiatura) {
                  <p class="mt-2 text-xs text-gray-400">{{ user()!.numero_colegiatura }}</p>
                }
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="lg:col-span-2">
            <div class="rounded-2xl border border-gray-200 bg-white">
              <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h4 class="text-base font-semibold text-gray-800">Información Personal</h4>
                <button
                  (click)="openPersonalModal()"
                  class="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                  Editar
                </button>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p class="mb-1 text-xs text-gray-500">Nombre</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.usuario?.first_name || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-xs text-gray-500">Apellido</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.usuario?.last_name || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-xs text-gray-500">Email</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.usuario?.email || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-xs text-gray-500">Teléfono</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.usuario?.telefono || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-xs text-gray-500">Sexo</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.sexo === 'M' ? 'Masculino' : user()?.sexo === 'F' ? 'Femenino' : '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-xs text-gray-500">Especialidad</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.especialidad ? especialidadDisplay(user()!.especialidad) : '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-xs text-gray-500">Nro. Colegiatura</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.numero_colegiatura || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-xs text-gray-500">RNE</p>
                    <p class="text-sm font-medium text-gray-900">{{ user()?.rne || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Firma y Sello Card -->
            <div class="mt-6 rounded-2xl border border-gray-200 bg-white">
              <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h4 class="text-base font-semibold text-gray-800">Firma y Sello</h4>
                <label
                  class="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Subir imagen
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    class="hidden"
                    (change)="onFirmaSelChange($event)"
                  />
                </label>
              </div>
              <div class="p-6">
                @if (user()?.imagen_firma_sello) {
                  <img
                    [src]="user()!.imagen_firma_sello"
                    alt="Firma y Sello"
                    class="max-h-32 rounded-lg border border-gray-200"
                  />
                } @else {
                  <p class="text-sm text-gray-400">No se ha subido una imagen de firma y sello.</p>
                }
                @if (uploadingFirma()) {
                  <p class="mt-2 text-xs text-blue-600">Subiendo imagen...</p>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tab: Consultorio -->
      @if (activeTab() === 'consultorio') {
        <div class="rounded-2xl border border-gray-200 bg-white">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h4 class="text-base font-semibold text-gray-800">Datos del Consultorio</h4>
            <button
              (click)="openConsultorioModal()"
              class="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
              Editar
            </button>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p class="mb-1 text-xs text-gray-500">Nombre del Consultorio</p>
                <p class="text-sm font-medium text-gray-900">{{ user()?.nombre_consultorio || '-' }}</p>
              </div>
              <div>
                <p class="mb-1 text-xs text-gray-500">Dirección</p>
                <p class="text-sm font-medium text-gray-900">{{ user()?.direccion_consultorio || '-' }}</p>
              </div>
              <div>
                <p class="mb-1 text-xs text-gray-500">Teléfono del Consultorio</p>
                <p class="text-sm font-medium text-gray-900">{{ user()?.telefono_consultorio || '-' }}</p>
              </div>
              <div>
                <p class="mb-1 text-xs text-gray-500">RUC</p>
                <p class="text-sm font-medium text-gray-900">{{ user()?.ruc || '-' }}</p>
              </div>
            </div>
            @if (user()?.logo) {
              <div class="mt-5">
                <p class="mb-2 text-xs text-gray-500">Logo</p>
                <img
                  [src]="user()!.logo"
                  alt="Logo del Consultorio"
                  class="max-h-20 rounded-lg"
                />
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab: Seguridad -->
      @if (activeTab() === 'seguridad') {
        <div class="rounded-2xl border border-gray-200 bg-white">
          <div class="border-b border-gray-200 px-6 py-4">
            <h4 class="text-base font-semibold text-gray-800">Cambiar Contraseña</h4>
          </div>
          <div class="p-6">
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="max-w-md space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Contraseña actual</label>
                <input
                  type="password"
                  formControlName="old_password"
                  class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Nueva contraseña</label>
                <input
                  type="password"
                  formControlName="new_password"
                  class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  formControlName="new_password_confirm"
                  class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              @if (passwordError()) {
                <p class="text-sm text-red-600">{{ passwordError() }}</p>
              }
              @if (passwordSuccess()) {
                <p class="text-sm text-green-600">{{ passwordSuccess() }}</p>
              }
              <button
                type="submit"
                [disabled]="passwordForm.invalid || savingPassword()"
                class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {{ savingPassword() ? 'Guardando...' : 'Cambiar Contraseña' }}
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Tab: Plan -->
      @if (activeTab() === 'plan') {
        <div class="rounded-2xl border border-gray-200 bg-white">
          <div class="border-b border-gray-200 px-6 py-4">
            <h4 class="text-base font-semibold text-gray-800">Plan Actual</h4>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <p class="mb-1 text-xs text-gray-500">Plan</p>
                <p class="text-sm font-medium text-gray-900">
                  @if (user()?.plan_actual) {
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full bg-green-500"></span>
                      {{ user()!.plan_actual!.name }}
                    </span>
                  } @else {
                    -
                  }
                </p>
              </div>
              <div>
                <p class="mb-1 text-xs text-gray-500">Total Pacientes</p>
                <p class="text-sm font-medium text-gray-900">{{ user()?.total_pacientes ?? 0 }}</p>
              </div>
              <div>
                <p class="mb-1 text-xs text-gray-500">Registrado desde</p>
                <p class="text-sm font-medium text-gray-900">{{ user()?.created_at ? (user()!.created_at | date:'dd/MM/yyyy') : '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal: Editar Información Personal -->
      @if (showPersonalModal()) {
        <div class="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div class="w-full max-w-[600px] rounded-3xl bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 class="text-lg font-semibold text-gray-800">Editar Información Personal</h3>
              <button (click)="showPersonalModal.set(false)" class="text-gray-400 hover:text-gray-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form [formGroup]="personalForm" (ngSubmit)="savePersonal()" class="p-6">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    formControlName="first_name"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    type="text"
                    formControlName="last_name"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    formControlName="telefono"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">Sexo</label>
                  <select
                    formControlName="sexo"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">RNE</label>
                  <input
                    type="text"
                    formControlName="rne"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">Especialidad</label>
                  <select
                    formControlName="especialidad"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="general">Enfermería General</option>
                    <option value="pediatrica">Enfermería Pediátrica</option>
                    <option value="comunitaria">Enfermería Comunitaria</option>
                    <option value="geriatrica">Enfermería Geriátrica</option>
                    <option value="uci">Cuidados Intensivos</option>
                    <option value="otra">Otra</option>
                  </select>
                </div>
              </div>
              @if (personalError()) {
                <p class="mt-3 text-sm text-red-600">{{ personalError() }}</p>
              }
              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  (click)="showPersonalModal.set(false)"
                  class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="personalForm.invalid || savingPersonal()"
                  class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ savingPersonal() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal: Editar Consultorio -->
      @if (showConsultorioModal()) {
        <div class="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div class="w-full max-w-[600px] rounded-3xl bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 class="text-lg font-semibold text-gray-800">Editar Datos del Consultorio</h3>
              <button (click)="showConsultorioModal.set(false)" class="text-gray-400 hover:text-gray-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form [formGroup]="consultorioForm" (ngSubmit)="saveConsultorio()" class="p-6">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-sm font-medium text-gray-700">Nombre del Consultorio</label>
                  <input
                    type="text"
                    formControlName="nombre_consultorio"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    formControlName="direccion_consultorio"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    formControlName="telefono_consultorio"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700">RUC</label>
                  <input
                    type="text"
                    formControlName="ruc"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              @if (consultorioError()) {
                <p class="mt-3 text-sm text-red-600">{{ consultorioError() }}</p>
              }
              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  (click)="showConsultorioModal.set(false)"
                  class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="consultorioForm.invalid || savingConsultorio()"
                  class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ savingConsultorio() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ConfiguracionComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  user = signal<Enfermera | null>(null);
  activeTab = signal<TabType>('perfil');

  // Modal states
  showPersonalModal = signal(false);
  showConsultorioModal = signal(false);

  // Saving states
  savingPersonal = signal(false);
  savingConsultorio = signal(false);
  savingPassword = signal(false);
  uploadingFirma = signal(false);

  // Error/success messages
  personalError = signal('');
  consultorioError = signal('');
  passwordError = signal('');
  passwordSuccess = signal('');

  tabs = [
    { key: 'perfil' as TabType, label: 'Perfil' },
    { key: 'consultorio' as TabType, label: 'Consultorio' },
    { key: 'seguridad' as TabType, label: 'Seguridad' },
    { key: 'plan' as TabType, label: 'Plan' }
  ];

  personalForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    telefono: [''],
    sexo: [''],
    rne: [''],
    especialidad: ['general']
  });

  consultorioForm = this.fb.group({
    nombre_consultorio: [''],
    direccion_consultorio: [''],
    telefono_consultorio: [''],
    ruc: ['']
  });

  passwordForm = this.fb.group({
    old_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    new_password_confirm: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (enfermera) => this.user.set(enfermera),
      error: () => {
        // Use cached value if API fails
        const cached = this.authService.currentUserValue;
        if (cached) this.user.set(cached);
      }
    });
  }

  get userName(): string {
    const u = this.user();
    if (u?.usuario) return `${u.usuario.first_name} ${u.usuario.last_name}`;
    return 'Usuario';
  }

  get userInitials(): string {
    const u = this.user();
    if (u?.usuario) {
      return `${u.usuario.first_name.charAt(0)}${u.usuario.last_name.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  get userRole(): string {
    return this.authService.userRole;
  }

  especialidadDisplay(esp: Especialidad): string {
    const map: Record<Especialidad, string> = {
      general: 'Enfermería General',
      pediatrica: 'Enfermería Pediátrica',
      comunitaria: 'Enfermería Comunitaria',
      geriatrica: 'Enfermería Geriátrica',
      uci: 'Cuidados Intensivos',
      otra: 'Otra'
    };
    return map[esp] || esp;
  }

  // --- Personal Info Modal ---

  openPersonalModal(): void {
    const u = this.user();
    if (u) {
      this.personalForm.patchValue({
        first_name: u.usuario.first_name,
        last_name: u.usuario.last_name,
        telefono: u.usuario.telefono || '',
        sexo: u.sexo || '',
        rne: u.rne || '',
        especialidad: u.especialidad || 'general'
      });
    }
    this.personalError.set('');
    this.showPersonalModal.set(true);
  }

  savePersonal(): void {
    if (this.personalForm.invalid) return;
    this.savingPersonal.set(true);
    this.personalError.set('');

    const val = this.personalForm.value;
    const data: Record<string, string> = {};
    if (val.first_name) data['first_name'] = val.first_name;
    if (val.last_name) data['last_name'] = val.last_name;
    if (val.telefono !== undefined) data['telefono'] = val.telefono || '';
    if (val.sexo) data['sexo'] = val.sexo;
    if (val.rne !== undefined) data['rne'] = val.rne || '';
    if (val.especialidad) data['especialidad'] = val.especialidad;

    this.authService.updateProfile(data as any).subscribe({
      next: (enfermera) => {
        this.user.set(enfermera);
        this.savingPersonal.set(false);
        this.showPersonalModal.set(false);
      },
      error: (err) => {
        this.savingPersonal.set(false);
        this.personalError.set(err?.error?.detail || 'Error al guardar los cambios.');
      }
    });
  }

  // --- Consultorio Modal ---

  openConsultorioModal(): void {
    const u = this.user();
    if (u) {
      this.consultorioForm.patchValue({
        nombre_consultorio: u.nombre_consultorio || '',
        direccion_consultorio: u.direccion_consultorio || '',
        telefono_consultorio: u.telefono_consultorio || '',
        ruc: u.ruc || ''
      });
    }
    this.consultorioError.set('');
    this.showConsultorioModal.set(true);
  }

  saveConsultorio(): void {
    this.savingConsultorio.set(true);
    this.consultorioError.set('');

    const val = this.consultorioForm.value;
    this.authService.updateProfile(val as any).subscribe({
      next: (enfermera) => {
        this.user.set(enfermera);
        this.savingConsultorio.set(false);
        this.showConsultorioModal.set(false);
      },
      error: (err) => {
        this.savingConsultorio.set(false);
        this.consultorioError.set(err?.error?.detail || 'Error al guardar los cambios.');
      }
    });
  }

  // --- Password ---

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const val = this.passwordForm.value;
    if (val.new_password !== val.new_password_confirm) {
      this.passwordError.set('Las contraseñas no coinciden.');
      return;
    }

    this.savingPassword.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');

    this.authService.changePassword({
      old_password: val.old_password!,
      new_password: val.new_password!,
      new_password_confirm: val.new_password_confirm!
    }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSuccess.set('Contraseña cambiada exitosamente.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordError.set(err?.error?.detail || err?.error?.old_password?.[0] || 'Error al cambiar la contraseña.');
      }
    });
  }

  // --- Firma y Sello Upload ---

  onFirmaSelChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingFirma.set(true);
    const formData = new FormData();
    formData.append('imagen_firma_sello', file);

    this.authService.updateProfile(formData).subscribe({
      next: (enfermera) => {
        this.user.set(enfermera);
        this.uploadingFirma.set(false);
      },
      error: () => {
        this.uploadingFirma.set(false);
      }
    });
  }
}
