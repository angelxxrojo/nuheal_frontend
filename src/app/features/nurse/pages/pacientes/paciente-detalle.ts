import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PacientesService } from '../../services/pacientes.service';
import { Paciente, Responsable, PacienteCreate } from '../../../../models/paciente.model';
import { TipoDocumento, Parentesco } from '../../../../models/common.model';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/nurse/pacientes" class="btn btn-ghost">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </a>
        <div class="flex-1">
          <h1 class="text-2xl font-semibold text-gray-900">Detalle del Paciente</h1>
          <p class="text-sm text-gray-500">Información completa y responsables</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="spinner spinner-lg"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="alert alert-danger">
          {{ error() }}
          <button (click)="loadPaciente()" class="ml-2 underline">Reintentar</button>
        </div>
      }

      @if (paciente() && !loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Info Card -->
          <div class="lg:col-span-2 space-y-6">
            <div class="card">
              <div class="card-header flex items-center justify-between">
                <h2 class="font-semibold text-gray-900">Información Personal</h2>
                <button (click)="openEditModal()" class="btn btn-secondary btn-sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Editar
                </button>
              </div>
              <div class="card-body">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm text-gray-500">Nombre Completo</p>
                    <p class="font-medium text-gray-900">{{ paciente()!.nombre_completo }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Documento</p>
                    <p class="font-medium text-gray-900">
                      <span class="badge badge-gray mr-1">{{ paciente()!.tipo_documento | uppercase }}</span>
                      {{ paciente()!.numero_documento }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Fecha de Nacimiento</p>
                    <p class="font-medium text-gray-900">{{ paciente()!.fecha_nacimiento | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Edad</p>
                    <p class="font-medium text-gray-900">{{ paciente()!.edad_texto }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Sexo</p>
                    <p class="font-medium">
                      <span [class]="paciente()!.sexo === 'M' ? 'badge badge-info' : 'badge badge-primary'">
                        {{ paciente()!.sexo === 'M' ? 'Masculino' : 'Femenino' }}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Estado</p>
                    <p class="font-medium">
                      <span [class]="paciente()!.is_active ? 'badge badge-success' : 'badge badge-danger'">
                        {{ paciente()!.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </p>
                  </div>
                  @if (paciente()!.lugar_nacimiento) {
                    <div>
                      <p class="text-sm text-gray-500">Lugar de Nacimiento</p>
                      <p class="font-medium text-gray-900">{{ paciente()!.lugar_nacimiento }}</p>
                    </div>
                  }
                  @if (paciente()!.telefono) {
                    <div>
                      <p class="text-sm text-gray-500">Teléfono</p>
                      <p class="font-medium text-gray-900">{{ paciente()!.telefono }}</p>
                    </div>
                  }
                  @if (paciente()!.email) {
                    <div>
                      <p class="text-sm text-gray-500">Email</p>
                      <p class="font-medium text-gray-900">{{ paciente()!.email }}</p>
                    </div>
                  }
                  @if (paciente()!.direccion) {
                    <div class="md:col-span-2">
                      <p class="text-sm text-gray-500">Dirección</p>
                      <p class="font-medium text-gray-900">
                        {{ paciente()!.direccion }}
                        @if (paciente()!.distrito) {, {{ paciente()!.distrito }}}
                        @if (paciente()!.provincia) {, {{ paciente()!.provincia }}}
                        @if (paciente()!.departamento) {, {{ paciente()!.departamento }}}
                      </p>
                    </div>
                  }
                  @if (paciente()!.observaciones) {
                    <div class="md:col-span-2">
                      <p class="text-sm text-gray-500">Observaciones</p>
                      <p class="font-medium text-gray-900">{{ paciente()!.observaciones }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Responsables Section -->
            <div class="card">
              <div class="card-header flex items-center justify-between">
                <h2 class="font-semibold text-gray-900">Responsables</h2>
                <button (click)="openResponsableModal()" class="btn btn-primary btn-sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Agregar
                </button>
              </div>
              <div class="card-body">
                @if (loadingResponsables()) {
                  <div class="flex justify-center py-4">
                    <div class="spinner"></div>
                  </div>
                } @else if (responsables().length === 0) {
                  <div class="empty-state py-8">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p class="empty-state-title">Sin responsables</p>
                    <p class="empty-state-description">Agrega un responsable para este paciente</p>
                  </div>
                } @else {
                  <div class="space-y-4">
                    @for (responsable of responsables(); track responsable.id) {
                      <div class="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-start gap-4">
                          <div class="avatar avatar-md bg-primary-100 text-primary-700">
                            {{ getResponsableInitials(responsable) }}
                          </div>
                          <div>
                            <div class="flex items-center gap-2">
                              <p class="font-medium text-gray-900">{{ responsable.nombres }} {{ responsable.apellidos }}</p>
                              @if (responsable.es_principal) {
                                <span class="badge badge-primary">Principal</span>
                              }
                              @if (responsable.puede_autorizar_procedimientos) {
                                <span class="badge badge-success">Autoriza</span>
                              }
                            </div>
                            <p class="text-sm text-gray-500">
                              {{ responsable.parentesco_display || responsable.parentesco | titlecase }}
                              • {{ responsable.tipo_documento | uppercase }} {{ responsable.numero_documento }}
                            </p>
                            <p class="text-sm text-gray-500">
                              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                              </svg>
                              {{ responsable.telefono }}
                              @if (responsable.email) {
                                <span class="ml-3">
                                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                  </svg>
                                  {{ responsable.email }}
                                </span>
                              }
                            </p>
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <button
                            (click)="editResponsable(responsable)"
                            class="btn btn-ghost btn-sm"
                            title="Editar">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            (click)="confirmDeleteResponsable(responsable)"
                            class="btn btn-ghost btn-sm text-red-600"
                            title="Eliminar">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="space-y-6">
            <div class="card card-body">
              <h3 class="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div class="space-y-2">
                <a [routerLink]="['/nurse/agenda']" [queryParams]="{paciente: paciente()!.id}" class="btn btn-secondary w-full justify-start">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Agendar Cita
                </a>
                <a [routerLink]="['/nurse/cred']" [queryParams]="{paciente: paciente()!.id}" class="btn btn-secondary w-full justify-start">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  Control CRED
                </a>
                <a [routerLink]="['/nurse/vacunas']" [queryParams]="{paciente: paciente()!.id}" class="btn btn-secondary w-full justify-start">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                  Vacunas
                </a>
                <a [routerLink]="['/nurse/historia-clinica']" [queryParams]="{paciente: paciente()!.id}" class="btn btn-secondary w-full justify-start">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Historia Clínica
                </a>
              </div>
            </div>

            <!-- Info Summary -->
            @if (paciente()!.es_menor) {
              <div class="alert alert-info">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Este paciente es menor de edad y requiere un responsable autorizado.</span>
              </div>
            }

            <div class="card card-body">
              <h3 class="font-semibold text-gray-900 mb-4">Información del Sistema</h3>
              <div class="space-y-2 text-sm">
                @if (paciente()!.created_at) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">Registrado</span>
                    <span class="text-gray-900">{{ paciente()!.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                }
                @if (paciente()!.updated_at) {
                  <div class="flex justify-between">
                    <span class="text-gray-500">Última actualización</span>
                    <span class="text-gray-900">{{ paciente()!.updated_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Responsable Modal -->
    @if (showResponsableModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ editingResponsable() ? 'Editar Responsable' : 'Nuevo Responsable' }}
            </h2>
          </div>
          <form [formGroup]="responsableForm" (ngSubmit)="saveResponsable()" class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Tipo de Documento *</label>
                <select formControlName="tipo_documento" class="form-input">
                  <option value="dni">DNI</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label class="form-label">Número de Documento *</label>
                <input type="text" formControlName="numero_documento" class="form-input">
              </div>
              <div>
                <label class="form-label">Nombres *</label>
                <input type="text" formControlName="nombres" class="form-input">
              </div>
              <div>
                <label class="form-label">Apellidos *</label>
                <input type="text" formControlName="apellidos" class="form-input">
              </div>
              <div>
                <label class="form-label">Parentesco *</label>
                <select formControlName="parentesco" class="form-input">
                  <option value="madre">Madre</option>
                  <option value="padre">Padre</option>
                  <option value="abuelo">Abuelo(a)</option>
                  <option value="tio">Tío(a)</option>
                  <option value="hermano">Hermano(a)</option>
                  <option value="tutor">Tutor Legal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label class="form-label">Teléfono *</label>
                <input type="tel" formControlName="telefono" class="form-input">
              </div>
              <div>
                <label class="form-label">Teléfono Alternativo</label>
                <input type="tel" formControlName="telefono_alternativo" class="form-input">
              </div>
              <div>
                <label class="form-label">Email</label>
                <input type="email" formControlName="email" class="form-input">
              </div>
              <div class="md:col-span-2">
                <label class="form-label">Dirección</label>
                <input type="text" formControlName="direccion" class="form-input">
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" formControlName="es_principal" id="es_principal" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                <label for="es_principal" class="text-sm text-gray-700">Es responsable principal</label>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" formControlName="puede_autorizar_procedimientos" id="puede_autorizar" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                <label for="puede_autorizar" class="text-sm text-gray-700">Puede autorizar procedimientos</label>
              </div>
            </div>

            @if (responsableError()) {
              <div class="alert alert-danger">{{ responsableError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeResponsableModal()" class="btn btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="responsableForm.invalid || savingResponsable()"
                class="btn btn-primary">
                @if (savingResponsable()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                {{ editingResponsable() ? 'Guardar Cambios' : 'Agregar Responsable' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Responsable Confirmation -->
    @if (showDeleteResponsableModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md animate-slideIn">
          <div class="p-6">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-center text-gray-900">Eliminar Responsable</h3>
            <p class="mt-2 text-sm text-center text-gray-500">
              ¿Estás seguro de que deseas eliminar a <strong>{{ deletingResponsable()?.nombres }} {{ deletingResponsable()?.apellidos }}</strong>?
            </p>
            <div class="flex gap-3 mt-6">
              <button (click)="closeDeleteResponsableModal()" class="btn btn-secondary flex-1">
                Cancelar
              </button>
              <button
                (click)="deleteResponsable()"
                [disabled]="deletingResponsableLoading()"
                class="btn btn-danger flex-1">
                @if (deletingResponsableLoading()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Edit Paciente Modal -->
    @if (showEditModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideIn">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Editar Paciente</h2>
          </div>
          <form [formGroup]="pacienteForm" (ngSubmit)="savePaciente()" class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Tipo de Documento *</label>
                <select formControlName="tipo_documento" class="form-input">
                  <option value="dni">DNI</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label class="form-label">Número de Documento *</label>
                <input type="text" formControlName="numero_documento" class="form-input">
              </div>
              <div>
                <label class="form-label">Nombres *</label>
                <input type="text" formControlName="nombres" class="form-input">
              </div>
              <div>
                <label class="form-label">Apellido Paterno *</label>
                <input type="text" formControlName="apellido_paterno" class="form-input">
              </div>
              <div>
                <label class="form-label">Apellido Materno</label>
                <input type="text" formControlName="apellido_materno" class="form-input">
              </div>
              <div>
                <label class="form-label">Fecha de Nacimiento *</label>
                <input type="date" formControlName="fecha_nacimiento" class="form-input">
              </div>
              <div>
                <label class="form-label">Sexo *</label>
                <select formControlName="sexo" class="form-input">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label class="form-label">Lugar de Nacimiento</label>
                <input type="text" formControlName="lugar_nacimiento" class="form-input">
              </div>
              <div>
                <label class="form-label">Teléfono</label>
                <input type="tel" formControlName="telefono" class="form-input">
              </div>
              <div>
                <label class="form-label">Email</label>
                <input type="email" formControlName="email" class="form-input">
              </div>
              <div class="md:col-span-2">
                <label class="form-label">Dirección</label>
                <input type="text" formControlName="direccion" class="form-input">
              </div>
              <div>
                <label class="form-label">Distrito</label>
                <input type="text" formControlName="distrito" class="form-input">
              </div>
              <div>
                <label class="form-label">Provincia</label>
                <input type="text" formControlName="provincia" class="form-input">
              </div>
              <div>
                <label class="form-label">Departamento</label>
                <input type="text" formControlName="departamento" class="form-input">
              </div>
              <div class="md:col-span-2">
                <label class="form-label">Observaciones</label>
                <textarea formControlName="observaciones" rows="3" class="form-input"></textarea>
              </div>
            </div>

            @if (pacienteError()) {
              <div class="alert alert-danger">{{ pacienteError() }}</div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" (click)="closeEditModal()" class="btn btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="pacienteForm.invalid || savingPaciente()"
                class="btn btn-primary">
                @if (savingPaciente()) {
                  <div class="spinner spinner-sm mr-2"></div>
                }
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class PacienteDetalleComponent implements OnInit {
  private pacientesService = inject(PacientesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  paciente = signal<Paciente | null>(null);
  responsables = signal<Responsable[]>([]);
  loading = signal(false);
  loadingResponsables = signal(false);
  error = signal<string | null>(null);

  // Responsable modal
  showResponsableModal = signal(false);
  editingResponsable = signal<Responsable | null>(null);
  savingResponsable = signal(false);
  responsableError = signal<string | null>(null);

  // Delete responsable
  showDeleteResponsableModal = signal(false);
  deletingResponsable = signal<Responsable | null>(null);
  deletingResponsableLoading = signal(false);

  // Edit paciente modal
  showEditModal = signal(false);
  savingPaciente = signal(false);
  pacienteError = signal<string | null>(null);

  responsableForm = this.fb.group({
    tipo_documento: ['dni' as TipoDocumento, Validators.required],
    numero_documento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    parentesco: ['madre' as Parentesco, Validators.required],
    telefono: ['', Validators.required],
    telefono_alternativo: [''],
    email: [''],
    direccion: [''],
    es_principal: [false],
    puede_autorizar_procedimientos: [true]
  });

  pacienteForm = this.fb.group({
    tipo_documento: ['dni' as TipoDocumento, Validators.required],
    numero_documento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellido_paterno: ['', Validators.required],
    apellido_materno: [''],
    fecha_nacimiento: ['', Validators.required],
    sexo: ['M' as 'M' | 'F', Validators.required],
    lugar_nacimiento: [''],
    direccion: [''],
    distrito: [''],
    provincia: [''],
    departamento: [''],
    telefono: [''],
    email: [''],
    observaciones: ['']
  });

  private pacienteId: number = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pacienteId = +params['id'];
      this.loadPaciente();
    });
  }

  loadPaciente(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pacientesService.getById(this.pacienteId).subscribe({
      next: (paciente) => {
        this.paciente.set(paciente);
        this.loading.set(false);
        this.loadResponsables();
      },
      error: (err) => {
        this.error.set('Error al cargar el paciente');
        this.loading.set(false);
        if (err.status === 404) {
          this.router.navigate(['/nurse/pacientes']);
        }
      }
    });
  }

  loadResponsables(): void {
    this.loadingResponsables.set(true);

    this.pacientesService.getResponsables(this.pacienteId).subscribe({
      next: (responsables) => {
        this.responsables.set(responsables);
        this.loadingResponsables.set(false);
      },
      error: (err) => {
        console.error('Error loading responsables:', err);
        this.loadingResponsables.set(false);
      }
    });
  }

  getResponsableInitials(responsable: Responsable): string {
    const first = responsable.nombres?.charAt(0) || '';
    const last = responsable.apellidos?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  // Responsable Modal Methods
  openResponsableModal(): void {
    this.editingResponsable.set(null);
    this.responsableForm.reset({
      tipo_documento: 'dni',
      parentesco: 'madre',
      es_principal: false,
      puede_autorizar_procedimientos: true
    });
    this.responsableError.set(null);
    this.showResponsableModal.set(true);
  }

  editResponsable(responsable: Responsable): void {
    this.editingResponsable.set(responsable);
    this.responsableForm.patchValue({
      tipo_documento: responsable.tipo_documento,
      numero_documento: responsable.numero_documento,
      nombres: responsable.nombres,
      apellidos: responsable.apellidos,
      parentesco: responsable.parentesco,
      telefono: responsable.telefono,
      telefono_alternativo: responsable.telefono_alternativo || '',
      email: responsable.email || '',
      direccion: responsable.direccion || '',
      es_principal: responsable.es_principal,
      puede_autorizar_procedimientos: responsable.puede_autorizar_procedimientos
    });
    this.responsableError.set(null);
    this.showResponsableModal.set(true);
  }

  closeResponsableModal(): void {
    this.showResponsableModal.set(false);
    this.editingResponsable.set(null);
  }

  saveResponsable(): void {
    if (this.responsableForm.invalid) return;

    this.savingResponsable.set(true);
    this.responsableError.set(null);

    const data = this.responsableForm.value as Omit<Responsable, 'id'>;

    const request = this.editingResponsable()
      ? this.pacientesService.updateResponsable(this.pacienteId, this.editingResponsable()!.id!, data)
      : this.pacientesService.addResponsable(this.pacienteId, data);

    request.subscribe({
      next: () => {
        this.closeResponsableModal();
        this.loadResponsables();
        this.savingResponsable.set(false);
      },
      error: (err) => {
        this.responsableError.set(err.error?.detail || 'Error al guardar el responsable');
        this.savingResponsable.set(false);
      }
    });
  }

  confirmDeleteResponsable(responsable: Responsable): void {
    this.deletingResponsable.set(responsable);
    this.showDeleteResponsableModal.set(true);
  }

  closeDeleteResponsableModal(): void {
    this.showDeleteResponsableModal.set(false);
    this.deletingResponsable.set(null);
  }

  deleteResponsable(): void {
    const responsable = this.deletingResponsable();
    if (!responsable?.id) return;

    this.deletingResponsableLoading.set(true);

    this.pacientesService.deleteResponsable(this.pacienteId, responsable.id).subscribe({
      next: () => {
        this.closeDeleteResponsableModal();
        this.loadResponsables();
        this.deletingResponsableLoading.set(false);
      },
      error: (err) => {
        console.error('Error deleting responsable:', err);
        this.deletingResponsableLoading.set(false);
      }
    });
  }

  // Edit Paciente Modal Methods
  openEditModal(): void {
    const p = this.paciente();
    if (!p) return;

    this.pacienteForm.patchValue({
      tipo_documento: p.tipo_documento,
      numero_documento: p.numero_documento,
      nombres: p.nombres,
      apellido_paterno: p.apellido_paterno,
      apellido_materno: p.apellido_materno || '',
      fecha_nacimiento: p.fecha_nacimiento,
      sexo: p.sexo,
      lugar_nacimiento: p.lugar_nacimiento || '',
      direccion: p.direccion || '',
      distrito: p.distrito || '',
      provincia: p.provincia || '',
      departamento: p.departamento || '',
      telefono: p.telefono || '',
      email: p.email || '',
      observaciones: p.observaciones || ''
    });
    this.pacienteError.set(null);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  savePaciente(): void {
    if (this.pacienteForm.invalid) return;

    this.savingPaciente.set(true);
    this.pacienteError.set(null);

    const formValue = this.pacienteForm.value;
    const data: Partial<PacienteCreate> = {
      tipo_documento: formValue.tipo_documento || undefined,
      numero_documento: formValue.numero_documento || undefined,
      nombres: formValue.nombres || undefined,
      apellido_paterno: formValue.apellido_paterno || undefined,
      apellido_materno: formValue.apellido_materno || undefined,
      fecha_nacimiento: formValue.fecha_nacimiento || undefined,
      sexo: formValue.sexo || undefined,
      lugar_nacimiento: formValue.lugar_nacimiento || undefined,
      direccion: formValue.direccion || undefined,
      distrito: formValue.distrito || undefined,
      provincia: formValue.provincia || undefined,
      departamento: formValue.departamento || undefined,
      telefono: formValue.telefono || undefined,
      email: formValue.email || undefined,
      observaciones: formValue.observaciones || undefined
    };

    this.pacientesService.update(this.pacienteId, data).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadPaciente();
        this.savingPaciente.set(false);
      },
      error: (err) => {
        this.pacienteError.set(err.error?.detail || 'Error al guardar el paciente');
        this.savingPaciente.set(false);
      }
    });
  }
}
