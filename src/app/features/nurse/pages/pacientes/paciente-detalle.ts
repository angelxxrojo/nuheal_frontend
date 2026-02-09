import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PacientesService } from '../../services/pacientes.service';
import { Paciente, Responsable, PacienteCreate } from '../../../../models/paciente.model';
import { TipoDocumento, Parentesco } from '../../../../models/common.model';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, PageBreadcrumbComponent],
  template: `
    <app-page-breadcrumb
      pageTitle="Detalle del Paciente"
      parentTitle="Pacientes"
      parentLink="/nurse/pacientes"
    />

    <!-- Loading State -->
    @if (loading()) {
      <div class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    }

    <!-- Error State -->
    @if (error()) {
      <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {{ error() }}
        <button (click)="loadPaciente()" class="ml-2 underline hover:no-underline">Reintentar</button>
      </div>
    }

    @if (paciente() && !loading()) {
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Main Info Column -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Profile Header Card -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div class="flex flex-col items-center gap-6 w-full xl:flex-row">
                <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-primary-100 text-2xl font-semibold text-primary-700 dark:border-gray-800 dark:bg-primary-900/30 dark:text-primary-400">
                  {{ getPatientInitials() }}
                </div>
                <div class="order-3 xl:order-2">
                  <h4 class="mb-2 text-center text-lg font-semibold text-gray-800 dark:text-white/90 xl:text-left">
                    {{ paciente()!.nombre_completo }}
                  </h4>
                  <div class="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <span [class]="paciente()!.sexo === 'M'
                      ? 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'">
                      {{ paciente()!.sexo === 'M' ? 'Masculino' : 'Femenino' }}
                    </span>
                    <div class="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ paciente()!.edad_texto }}
                    </p>
                    <div class="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <span [class]="paciente()!.is_active
                      ? 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400'">
                      {{ paciente()!.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
              <button
                (click)="openEditModal()"
                class="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>
            </div>
          </div>

          <!-- Personal Information Card -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Información Personal
            </h4>
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
              <div>
                <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Documento</p>
                <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                  <span class="mr-1 inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {{ paciente()!.tipo_documento | uppercase }}
                  </span>
                  {{ paciente()!.numero_documento }}
                </p>
              </div>
              <div>
                <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
                <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.fecha_nacimiento | date:'dd/MM/yyyy' }}</p>
              </div>
              @if (paciente()!.lugar_nacimiento) {
                <div>
                  <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Lugar de Nacimiento</p>
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.lugar_nacimiento }}</p>
                </div>
              }
              @if (paciente()!.telefono) {
                <div>
                  <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Teléfono</p>
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.telefono }}</p>
                </div>
              }
              @if (paciente()!.email) {
                <div>
                  <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Email</p>
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.email }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Address Card -->
          @if (paciente()!.direccion || paciente()!.distrito || paciente()!.provincia || paciente()!.departamento) {
            <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <h4 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Dirección
              </h4>
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
                @if (paciente()!.direccion) {
                  <div class="lg:col-span-2">
                    <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Dirección</p>
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.direccion }}</p>
                  </div>
                }
                @if (paciente()!.distrito) {
                  <div>
                    <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Distrito</p>
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.distrito }}</p>
                  </div>
                }
                @if (paciente()!.provincia) {
                  <div>
                    <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Provincia</p>
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.provincia }}</p>
                  </div>
                }
                @if (paciente()!.departamento) {
                  <div>
                    <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Departamento</p>
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.departamento }}</p>
                  </div>
                }
                @if (paciente()!.ubigeo_cod) {
                  <div>
                    <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Ubigeo</p>
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.ubigeo_cod }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Grupo Sanguíneo -->
          @if (paciente()!.grupo_sanguineo && paciente()!.grupo_sanguineo !== 'ND') {
            <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Grupo Sanguíneo</p>
                  <p class="text-lg font-semibold text-gray-800 dark:text-white/90">{{ paciente()!.grupo_sanguineo_display || paciente()!.grupo_sanguineo }}</p>
                </div>
              </div>
            </div>
          }

          <!-- Observations Card -->
          @if (paciente()!.observaciones) {
            <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
              <h4 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Observaciones
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ paciente()!.observaciones }}</p>
            </div>
          }

          <!-- Responsables Section -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div class="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
              <h4 class="text-lg font-semibold text-gray-800 dark:text-white/90">
                Responsables
              </h4>
              <button
                (click)="openResponsableModal()"
                class="flex items-center justify-center gap-2 rounded-full border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 lg:inline-flex"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Agregar Responsable
              </button>
            </div>

            @if (loadingResponsables()) {
              <div class="flex justify-center py-8">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              </div>
            } @else if (responsables().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <p class="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">Sin responsables</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Agrega un responsable para este paciente</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (responsable of responsables(); track responsable.id) {
                  <div class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 sm:flex-row sm:items-start sm:justify-between">
                    <div class="flex items-start gap-4">
                      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        {{ getResponsableInitials(responsable) }}
                      </div>
                      <div>
                        <div class="mb-1 flex flex-wrap items-center gap-2">
                          <p class="font-medium text-gray-800 dark:text-white/90">{{ responsable.nombres }} {{ responsable.apellidos }}</p>
                          @if (responsable.es_principal) {
                            <span class="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                              Principal
                            </span>
                          }
                          @if (responsable.puede_autorizar_procedimientos) {
                            <span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Autoriza
                            </span>
                          }
                        </div>
                        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          {{ responsable.parentesco_display || responsable.parentesco | titlecase }}
                          <span class="mx-1">•</span>
                          {{ responsable.tipo_documento | uppercase }} {{ responsable.numero_documento }}
                        </p>
                        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span class="inline-flex items-center gap-1">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            {{ responsable.telefono }}
                          </span>
                          @if (responsable.email) {
                            <span class="inline-flex items-center gap-1">
                              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                              </svg>
                              {{ responsable.email }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2 self-end sm:self-start">
                      <button
                        (click)="editResponsable(responsable)"
                        class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        title="Editar">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        (click)="confirmDeleteResponsable(responsable)"
                        class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        title="Eliminar">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <!-- Sidebar Column -->
        <div class="space-y-6">
          <!-- Quick Actions Card -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Acciones Rápidas
            </h4>
            <div class="space-y-3">
              <a
                [routerLink]="['/nurse/agenda']"
                [queryParams]="{paciente: paciente()!.id}"
                class="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Agendar Cita
              </a>
              <a
                [routerLink]="['/nurse/cred']"
                [queryParams]="{paciente: paciente()!.id}"
                class="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Control CRED
              </a>
              <a
                [routerLink]="['/nurse/vacunas']"
                [queryParams]="{paciente: paciente()!.id}"
                class="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                </svg>
                Vacunas
              </a>
              <a
                [routerLink]="['/nurse/historia-clinica']"
                [queryParams]="{paciente: paciente()!.id}"
                class="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Historia Clínica
              </a>
            </div>
          </div>

          <!-- Minor Alert -->
          @if (paciente()!.es_menor) {
            <div class="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <svg class="h-5 w-5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm text-blue-700 dark:text-blue-400">Este paciente es menor de edad y requiere un responsable autorizado.</span>
            </div>
          }

          <!-- System Info Card -->
          <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Información del Sistema
            </h4>
            <div class="space-y-3">
              @if (paciente()!.created_at) {
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Registrado</span>
                  <span class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              }
              @if (paciente()!.updated_at) {
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Última actualización</span>
                  <span class="text-sm font-medium text-gray-800 dark:text-white/90">{{ paciente()!.updated_at | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Responsable Modal -->
    @if (showResponsableModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-sm" (click)="closeResponsableModal()"></div>
        <div class="relative m-4 w-full max-w-lg rounded-3xl bg-white p-6 dark:bg-gray-900">
          <button
            (click)="closeResponsableModal()"
            class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <h4 class="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            {{ editingResponsable() ? 'Editar Responsable' : 'Nuevo Responsable' }}
          </h4>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Complete la información del responsable del paciente.
          </p>

          <form [formGroup]="responsableForm" (ngSubmit)="saveResponsable()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Documento *</label>
                <select formControlName="tipo_documento" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <option value="dni">DNI</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Documento *</label>
                <input type="text" formControlName="numero_documento" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombres *</label>
                <input type="text" formControlName="nombres" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos *</label>
                <input type="text" formControlName="apellidos" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Parentesco *</label>
                <select formControlName="parentesco" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono *</label>
                <input type="tel" formControlName="telefono" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono Alternativo</label>
                <input type="tel" formControlName="telefono_alternativo" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" formControlName="email" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div class="sm:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                <input type="text" formControlName="direccion" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" formControlName="es_principal" id="es_principal" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                <label for="es_principal" class="text-sm text-gray-700 dark:text-gray-300">Es responsable principal</label>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" formControlName="puede_autorizar_procedimientos" id="puede_autorizar" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                <label for="puede_autorizar" class="text-sm text-gray-700 dark:text-gray-300">Puede autorizar procedimientos</label>
              </div>
            </div>

            @if (responsableError()) {
              <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {{ responsableError() }}
              </div>
            }

            <div class="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                (click)="closeResponsableModal()"
                class="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="responsableForm.invalid || savingResponsable()"
                class="flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                @if (savingResponsable()) {
                  <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
      <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-sm" (click)="closeDeleteResponsableModal()"></div>
        <div class="relative m-4 w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
          <div class="text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg class="h-7 w-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Eliminar Responsable</h3>
            <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar a <strong class="text-gray-700 dark:text-gray-300">{{ deletingResponsable()?.nombres }} {{ deletingResponsable()?.apellidos }}</strong>?
            </p>
            <div class="flex gap-3">
              <button
                (click)="closeDeleteResponsableModal()"
                class="flex-1 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                (click)="deleteResponsable()"
                [disabled]="deletingResponsableLoading()"
                class="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
              >
                @if (deletingResponsableLoading()) {
                  <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
      <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-sm" (click)="closeEditModal()"></div>
        <div class="relative m-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <button
            (click)="closeEditModal()"
            class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <h4 class="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            Editar Paciente
          </h4>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Actualice la información del paciente.
          </p>

          <form [formGroup]="pacienteForm" (ngSubmit)="savePaciente()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Documento *</label>
                <select formControlName="tipo_documento" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <option value="dni">DNI</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Documento *</label>
                <input type="text" formControlName="numero_documento" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombres *</label>
                <input type="text" formControlName="nombres" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido Paterno *</label>
                <input type="text" formControlName="apellido_paterno" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido Materno</label>
                <input type="text" formControlName="apellido_materno" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Nacimiento *</label>
                <input type="date" formControlName="fecha_nacimiento" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Sexo *</label>
                <select formControlName="sexo" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Lugar de Nacimiento</label>
                <input type="text" formControlName="lugar_nacimiento" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                <input type="tel" formControlName="telefono" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" formControlName="email" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div class="sm:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                <input type="text" formControlName="direccion" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Distrito</label>
                <input type="text" formControlName="distrito" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Provincia</label>
                <input type="text" formControlName="provincia" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Departamento</label>
                <input type="text" formControlName="departamento" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              </div>
              <div class="sm:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
                <textarea formControlName="observaciones" rows="3" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"></textarea>
              </div>
            </div>

            @if (pacienteError()) {
              <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {{ pacienteError() }}
              </div>
            }

            <div class="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                (click)="closeEditModal()"
                class="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="pacienteForm.invalid || savingPaciente()"
                class="flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                @if (savingPaciente()) {
                  <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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

  getPatientInitials(): string {
    const p = this.paciente();
    if (!p) return '';
    const first = p.nombres?.charAt(0) || '';
    const last = p.apellido_paterno?.charAt(0) || '';
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
