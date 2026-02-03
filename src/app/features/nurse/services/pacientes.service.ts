import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/common.model';
import { Paciente, PacienteCreate, Responsable, PacienteStats } from '../../../models/paciente.model';

export interface PacientesQueryParams {
  search?: string;
  sexo?: string;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pacientes`;

  getAll(params?: PacientesQueryParams): Observable<PaginatedResponse<Paciente>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Paciente>>(`${this.apiUrl}/`, { params: httpParams });
  }

  getById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}/`);
  }

  create(data: PacienteCreate): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.apiUrl}/`, data);
  }

  update(id: number, data: Partial<PacienteCreate>): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.apiUrl}/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  getResponsables(pacienteId: number): Observable<Responsable[]> {
    return this.http.get<Responsable[]>(`${this.apiUrl}/${pacienteId}/responsables/`);
  }

  addResponsable(pacienteId: number, data: Omit<Responsable, 'id'>): Observable<Responsable> {
    return this.http.post<Responsable>(`${this.apiUrl}/${pacienteId}/responsables/`, data);
  }

  updateResponsable(pacienteId: number, responsableId: number, data: Partial<Responsable>): Observable<Responsable> {
    return this.http.patch<Responsable>(`${this.apiUrl}/${pacienteId}/responsables/${responsableId}/`, data);
  }

  deleteResponsable(pacienteId: number, responsableId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pacienteId}/responsables/${responsableId}/`);
  }

  getStats(): Observable<PacienteStats> {
    return this.http.get<PacienteStats>(`${this.apiUrl}/stats/`);
  }
}
