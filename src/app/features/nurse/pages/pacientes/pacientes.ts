import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacientesService, PacientesQueryParams } from '../../services/pacientes.service';
import { Paciente, PacienteCreate, PacienteStats } from '../../../../models/paciente.model';
import { TipoDocumento, Sexo, GrupoSanguineo } from '../../../../models/common.model';
import { debounceTime, Subject } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../shared/components/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, PageBreadcrumbComponent],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Pacientes" />

      <!-- Stats Cards -->
      @if (stats()) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Total Pacientes</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats()!.total }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Masculinos</p>
            <p class="text-2xl font-semibold text-blue-600">{{ stats()!.by_sex.masculino }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Femeninos</p>
            <p class="text-2xl font-semibold text-pink-600">{{ stats()!.by_sex.femenino }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-5">
            <p class="text-sm text-gray-500">Menores de 5 años</p>
            <p class="text-2xl font-semibold text-primary-600">{{ stats()!.by_age['0-5'] || 0 }}</p>
          </div>
        </div>
      }

      <!-- Search, Filters and Action Button -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
          </div>
          <div class="flex gap-3">
            <select
              [(ngModel)]="filterSexo"
              (ngModelChange)="loadPacientes()"
              class="h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
              <option value="">Todos los sexos</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            <button
              (click)="openCreateModal()"
              class="inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nuevo Paciente
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {{ error() }}
          <button (click)="loadPacientes()" class="ml-2 underline">Reintentar</button>
        </div>
      }

      <!-- Pacientes Table -->
      @if (!loading() && !error()) {
        @if (pacientes().length === 0) {
          <div class="rounded-2xl border border-gray-200 bg-white p-6">
            <div class="text-center py-8">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-800">No hay pacientes</p>
              <p class="mt-1 text-sm text-gray-500">Comienza agregando tu primer paciente</p>
              <button (click)="openCreateModal()" class="mt-4 inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300">
                Agregar Paciente
              </button>
            </div>
          </div>
        } @else {
          <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead class="border-b border-gray-100 bg-gray-50/50">
                  <tr>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Paciente</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Documento</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Edad</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Sexo</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Teléfono</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                @for (paciente of pacientes(); track paciente.id) {
                  <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-5 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                          {{ getInitials(paciente) }}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-800">{{ paciente.nombre_completo }}</p>
                          <p class="text-xs text-gray-500">{{ paciente.email || 'Sin email' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{{ paciente.tipo_documento_display || paciente.tipo_documento | uppercase }}</span>
                      <span class="ml-1.5 text-sm text-gray-600">{{ paciente.numero_documento }}</span>
                    </td>
                    <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{{ paciente.edad_texto }}</td>
                    <td class="px-5 py-4 whitespace-nowrap">
                      <span [class]="paciente.sexo === 'M' ? 'inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700' : 'inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700'">
                        {{ paciente.sexo_display || (paciente.sexo === 'M' ? 'Masculino' : 'Femenino') }}
                      </span>
                    </td>
                    <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{{ paciente.telefono || '-' }}</td>
                    <td class="px-5 py-4 whitespace-nowrap">
                      <span [class]="paciente.is_active ? 'inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700' : 'inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700'">
                        {{ paciente.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-5 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-1">
                        <a
                          [routerLink]="['/nurse/pacientes', paciente.id]"
                          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver detalle">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <button
                          (click)="openEditModal(paciente)"
                          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          (click)="confirmDelete(paciente)"
                          class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between mt-4">
              <p class="text-sm text-gray-500">
                Mostrando {{ pacientes().length }} de {{ totalCount() }} pacientes
              </p>
              <div class="flex items-center gap-2">
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Anterior
                </button>
                <span class="px-3 py-2 text-sm text-gray-700">
                  Página {{ currentPage() }} de {{ totalPages() }}
                </span>
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Siguiente
                </button>
              </div>
            </div>
          }
        }
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeModal()"></div>
        <div class="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <button (click)="closeModal()" class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6 sm:h-11 sm:w-11">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
            </svg>
          </button>
          <h4 class="mb-6 font-semibold text-gray-800 text-xl">
            {{ editingPaciente() ? 'Editar Paciente' : 'Nuevo Paciente' }}
          </h4>

          @if (loadingEdit()) {
            <div class="flex flex-col items-center justify-center py-12">
              <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-4 text-sm text-gray-500">Cargando datos del paciente...</p>
            </div>
          } @else {
          <form [formGroup]="pacienteForm" (ngSubmit)="savePaciente()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <!-- Tipo Documento -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Documento *</label>
                <select formControlName="tipo_documento" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                  <option value="dni">DNI</option>
                  <option value="ce">Carné de Extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <!-- Número Documento -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Número de Documento *</label>
                <input type="text" formControlName="numero_documento" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                @if (pacienteForm.get('numero_documento')?.touched && pacienteForm.get('numero_documento')?.errors) {
                  <p class="mt-1.5 text-xs text-red-500">El número de documento es requerido</p>
                }
              </div>

              <!-- Nombres -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Nombres *</label>
                <input type="text" formControlName="nombres" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                @if (pacienteForm.get('nombres')?.touched && pacienteForm.get('nombres')?.errors) {
                  <p class="mt-1.5 text-xs text-red-500">Los nombres son requeridos</p>
                }
              </div>

              <!-- Apellido Paterno -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Apellido Paterno *</label>
                <input type="text" formControlName="apellido_paterno" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                @if (pacienteForm.get('apellido_paterno')?.touched && pacienteForm.get('apellido_paterno')?.errors) {
                  <p class="mt-1.5 text-xs text-red-500">El apellido paterno es requerido</p>
                }
              </div>

              <!-- Apellido Materno -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Apellido Materno</label>
                <input type="text" formControlName="apellido_materno" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Fecha Nacimiento -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Fecha de Nacimiento *</label>
                <input type="date" formControlName="fecha_nacimiento" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
                @if (pacienteForm.get('fecha_nacimiento')?.touched && pacienteForm.get('fecha_nacimiento')?.errors) {
                  <p class="mt-1.5 text-xs text-red-500">La fecha de nacimiento es requerida</p>
                }
              </div>

              <!-- Sexo -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Sexo *</label>
                <select formControlName="sexo" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <!-- Lugar de Nacimiento -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
                <input type="text" formControlName="lugar_nacimiento" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Teléfono -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" formControlName="telefono" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Email -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <input type="email" formControlName="email" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Dirección -->
              <div class="md:col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Dirección</label>
                <input type="text" formControlName="direccion" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Distrito -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Distrito</label>
                <input type="text" formControlName="distrito" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Provincia -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Provincia</label>
                <input type="text" formControlName="provincia" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Departamento -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Departamento</label>
                <input type="text" formControlName="departamento" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Ubigeo -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Código Ubigeo</label>
                <input type="text" formControlName="ubigeo_cod" placeholder="Ej: 150101" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20">
              </div>

              <!-- Grupo Sanguíneo -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Grupo Sanguíneo</label>
                <select formControlName="grupo_sanguineo" class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden">
                  <option value="">-- Seleccionar --</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="ND">No determinado</option>
                </select>
              </div>

              <!-- Observaciones -->
              <div class="md:col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea formControlName="observaciones" rows="3" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20"></textarea>
              </div>
            </div>

            @if (formError()) {
              <div class="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{{ formError() }}</div>
            }

            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
              <button type="button" (click)="closeModal()" class="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="pacienteForm.invalid || saving()"
                class="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 transition">
                @if (saving()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                {{ editingPaciente() ? 'Guardar Cambios' : 'Crear Paciente' }}
              </button>
            </div>
          </form>
          }
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" (click)="closeDeleteModal()"></div>
        <div class="relative w-full max-w-[400px] rounded-3xl bg-white p-6 lg:p-10 m-5 sm:m-0">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h4 class="mt-4 font-semibold text-center text-gray-800 text-xl">Eliminar Paciente</h4>
          <p class="mt-2 text-sm text-center text-gray-500">
            ¿Estás seguro de que deseas eliminar a <strong class="text-gray-700">{{ deletingPaciente()?.nombre_completo }}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 mt-8">
            <button (click)="closeDeleteModal()" class="flex-1 inline-flex items-center justify-center rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button
              (click)="deletePaciente()"
              [disabled]="deleting()"
              class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300 transition">
              @if (deleting()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              }
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class PacientesComponent implements OnInit {
  private pacientesService = inject(PacientesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private searchSubject = new Subject<string>();

  // List state
  pacientes = signal<Paciente[]>([]);
  stats = signal<PacienteStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);

  // Filters
  searchTerm = '';
  filterSexo = '';

  // Modal state
  showModal = signal(false);
  editingPaciente = signal<Paciente | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  loadingEdit = signal(false);

  // Delete modal state
  showDeleteModal = signal(false);
  deletingPaciente = signal<Paciente | null>(null);
  deleting = signal(false);

  pacienteForm = this.fb.group({
    tipo_documento: ['dni' as TipoDocumento, Validators.required],
    numero_documento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellido_paterno: ['', Validators.required],
    apellido_materno: [''],
    fecha_nacimiento: ['', Validators.required],
    sexo: ['M' as Sexo, Validators.required],
    lugar_nacimiento: [''],
    direccion: [''],
    distrito: [''],
    provincia: [''],
    departamento: [''],
    ubigeo_cod: [''],
    grupo_sanguineo: ['' as GrupoSanguineo | ''],
    telefono: [''],
    email: [''],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.loadPacientes();
    this.loadStats();

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage.set(1);
      this.loadPacientes();
    });
  }

  loadPacientes(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: PacientesQueryParams = {
      page: this.currentPage(),
      page_size: 10
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    if (this.filterSexo) {
      params.sexo = this.filterSexo;
    }

    this.pacientesService.getAll(params).subscribe({
      next: (response) => {
        this.pacientes.set(response.results);
        this.totalPages.set(response.total_pages);
        this.totalCount.set(response.count);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los pacientes');
        this.loading.set(false);
        console.error('Error loading pacientes:', err);
      }
    });
  }

  loadStats(): void {
    this.pacientesService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPacientes();
    }
  }

  getInitials(paciente: Paciente): string {
    const first = paciente.nombres?.charAt(0) || '';
    const last = paciente.apellido_paterno?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  openCreateModal(): void {
    this.editingPaciente.set(null);
    this.loadingEdit.set(false);
    this.pacienteForm.reset({
      tipo_documento: 'dni',
      sexo: 'M',
      grupo_sanguineo: ''
    });
    this.formError.set(null);
    this.showModal.set(true);
  }

  openEditModal(paciente: Paciente): void {
    // First fetch the complete patient data
    this.loadingEdit.set(true);
    this.showModal.set(true);
    this.formError.set(null);
    this.pacienteForm.reset();

    this.pacientesService.getById(paciente.id).subscribe({
      next: (fullPaciente) => {
        this.editingPaciente.set(fullPaciente);
        this.pacienteForm.setValue({
          tipo_documento: fullPaciente.tipo_documento || 'dni',
          numero_documento: fullPaciente.numero_documento || '',
          nombres: fullPaciente.nombres || '',
          apellido_paterno: fullPaciente.apellido_paterno || '',
          apellido_materno: fullPaciente.apellido_materno || '',
          fecha_nacimiento: fullPaciente.fecha_nacimiento || '',
          sexo: fullPaciente.sexo || 'M',
          lugar_nacimiento: fullPaciente.lugar_nacimiento || '',
          direccion: fullPaciente.direccion || '',
          distrito: fullPaciente.distrito || '',
          provincia: fullPaciente.provincia || '',
          departamento: fullPaciente.departamento || '',
          ubigeo_cod: fullPaciente.ubigeo_cod || '',
          grupo_sanguineo: fullPaciente.grupo_sanguineo || '',
          telefono: fullPaciente.telefono || '',
          email: fullPaciente.email || '',
          observaciones: fullPaciente.observaciones || ''
        });
        this.loadingEdit.set(false);
      },
      error: (err) => {
        this.formError.set('Error al cargar los datos del paciente');
        this.loadingEdit.set(false);
        console.error('Error loading paciente:', err);
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingPaciente.set(null);
    this.loadingEdit.set(false);
  }

  savePaciente(): void {
    if (this.pacienteForm.invalid) return;

    this.saving.set(true);
    this.formError.set(null);

    const data = this.pacienteForm.value as PacienteCreate;

    const request = this.editingPaciente()
      ? this.pacientesService.update(this.editingPaciente()!.id, data)
      : this.pacientesService.create(data);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadPacientes();
        this.loadStats();
        this.saving.set(false);
      },
      error: (err) => {
        this.formError.set(err.error?.detail || 'Error al guardar el paciente');
        this.saving.set(false);
      }
    });
  }

  confirmDelete(paciente: Paciente): void {
    this.deletingPaciente.set(paciente);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingPaciente.set(null);
  }

  deletePaciente(): void {
    const paciente = this.deletingPaciente();
    if (!paciente) return;

    this.deleting.set(true);

    this.pacientesService.delete(paciente.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadPacientes();
        this.loadStats();
        this.deleting.set(false);
      },
      error: (err) => {
        console.error('Error deleting paciente:', err);
        this.deleting.set(false);
      }
    });
  }
}
