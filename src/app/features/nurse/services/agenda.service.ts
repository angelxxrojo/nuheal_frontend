import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/common.model';
import {
  TipoServicio,
  TipoServicioCreate,
  Cita,
  CitaCreate,
  DisponibilidadResponse,
  ConfiguracionAgenda,
  CitasHoyResponse,
  BloqueoAgenda,
  BloqueoAgendaCreate,
  PatronRecurrencia,
  PatronRecurrenciaCreate,
  ListaEspera,
  ListaEsperaCreate,
  PlanTratamiento,
  PlanTratamientoCreate
} from '../../../models/cita.model';

export interface CitasQueryParams {
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  paciente?: number;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/agenda`;

  // --- Configuración ---

  getConfiguracion(): Observable<ConfiguracionAgenda> {
    return this.http.get<ConfiguracionAgenda>(`${this.apiUrl}/configuracion/`);
  }

  updateConfiguracion(data: Partial<ConfiguracionAgenda>): Observable<ConfiguracionAgenda> {
    return this.http.patch<ConfiguracionAgenda>(`${this.apiUrl}/configuracion/`, data);
  }

  // --- Tipos de Servicio ---

  getServicios(): Observable<TipoServicio[]> {
    return this.http.get<TipoServicio[]>(`${this.apiUrl}/servicios/`);
  }

  getServicio(id: number): Observable<TipoServicio> {
    return this.http.get<TipoServicio>(`${this.apiUrl}/servicios/${id}/`);
  }

  createServicio(data: TipoServicioCreate): Observable<TipoServicio> {
    return this.http.post<TipoServicio>(`${this.apiUrl}/servicios/`, data);
  }

  updateServicio(id: number, data: Partial<TipoServicioCreate>): Observable<TipoServicio> {
    return this.http.patch<TipoServicio>(`${this.apiUrl}/servicios/${id}/`, data);
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/servicios/${id}/`);
  }

  // --- Citas ---

  getCitas(params?: CitasQueryParams): Observable<PaginatedResponse<Cita>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Cita>>(`${this.apiUrl}/citas/`, { params: httpParams });
  }

  getCita(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/citas/${id}/`);
  }

  createCita(data: CitaCreate): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/citas/`, data);
  }

  updateCita(id: number, data: Partial<Cita>): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/citas/${id}/`, data);
  }

  deleteCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/citas/${id}/`);
  }

  // Acciones sobre citas
  confirmarCita(id: number): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/citas/${id}/confirmar/`, {});
  }

  cancelarCita(id: number, motivo?: string): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/citas/${id}/cancelar/`, { motivo });
  }

  atenderCita(id: number): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/citas/${id}/atender/`, {});
  }

  marcarNoAsistio(id: number): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/citas/${id}/no-asistio/`, {});
  }

  // --- Disponibilidad ---

  getDisponibilidad(fecha: string, tipoServicio?: number): Observable<DisponibilidadResponse> {
    let params = new HttpParams().set('fecha', fecha);
    if (tipoServicio) {
      params = params.set('tipo_servicio', tipoServicio.toString());
    }
    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/disponibilidad/`, { params });
  }

  // --- Vistas rápidas ---

  getCitasHoy(): Observable<CitasHoyResponse> {
    return this.http.get<CitasHoyResponse>(`${this.apiUrl}/citas-hoy/`);
  }

  getProximasCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/proximas/`);
  }

  // --- Bloqueos de Agenda ---

  getBloqueos(): Observable<BloqueoAgenda[]> {
    return this.http.get<BloqueoAgenda[]>(`${this.apiUrl}/bloqueos/`);
  }

  createBloqueo(data: BloqueoAgendaCreate): Observable<BloqueoAgenda> {
    return this.http.post<BloqueoAgenda>(`${this.apiUrl}/bloqueos/`, data);
  }

  updateBloqueo(id: number, data: Partial<BloqueoAgendaCreate>): Observable<BloqueoAgenda> {
    return this.http.patch<BloqueoAgenda>(`${this.apiUrl}/bloqueos/${id}/`, data);
  }

  deleteBloqueo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bloqueos/${id}/`);
  }

  // --- Patrones de Recurrencia ---

  getPatrones(): Observable<PatronRecurrencia[]> {
    return this.http.get<PatronRecurrencia[]>(`${this.apiUrl}/patrones-recurrencia/`);
  }

  createPatron(data: PatronRecurrenciaCreate): Observable<PatronRecurrencia> {
    return this.http.post<PatronRecurrencia>(`${this.apiUrl}/patrones-recurrencia/`, data);
  }

  // --- Lista de Espera ---

  getListaEspera(estado?: string): Observable<ListaEspera[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<ListaEspera[]>(`${this.apiUrl}/lista-espera/`, { params });
  }

  createListaEspera(data: ListaEsperaCreate): Observable<ListaEspera> {
    return this.http.post<ListaEspera>(`${this.apiUrl}/lista-espera/`, data);
  }

  updateListaEspera(id: number, data: Partial<ListaEspera>): Observable<ListaEspera> {
    return this.http.patch<ListaEspera>(`${this.apiUrl}/lista-espera/${id}/`, data);
  }

  // --- Planes de Tratamiento ---

  getPlanesTratamiento(params?: { estado?: string; paciente?: number }): Observable<PlanTratamiento[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PlanTratamiento[]>(`${this.apiUrl}/planes-tratamiento/`, { params: httpParams });
  }

  createPlanTratamiento(data: PlanTratamientoCreate | FormData): Observable<PlanTratamiento> {
    return this.http.post<PlanTratamiento>(`${this.apiUrl}/planes-tratamiento/`, data);
  }

  completarSesion(planId: number): Observable<PlanTratamiento> {
    return this.http.post<PlanTratamiento>(`${this.apiUrl}/planes-tratamiento/${planId}/completar_sesion/`, {});
  }
}
