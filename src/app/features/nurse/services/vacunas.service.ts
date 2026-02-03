import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Vacuna,
  EsquemaNacional,
  CarnetVacunacion,
  DosisAplicada,
  DosisAplicadaCreate,
  PacienteVacunasPendientes
} from '../../../models/vacuna.model';

@Injectable({
  providedIn: 'root'
})
export class VacunasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vacunas`;

  getCatalogo(): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${this.apiUrl}/catalogo/`);
  }

  getEsquemaNacional(): Observable<EsquemaNacional[]> {
    return this.http.get<EsquemaNacional[]>(`${this.apiUrl}/esquema-nacional/`);
  }

  getCarnet(pacienteId: number): Observable<CarnetVacunacion> {
    return this.http.get<CarnetVacunacion>(`${this.apiUrl}/carnet/${pacienteId}/`);
  }

  registrarDosis(data: DosisAplicadaCreate): Observable<DosisAplicada> {
    return this.http.post<DosisAplicada>(`${this.apiUrl}/dosis-aplicadas/`, data);
  }

  updateDosis(id: number, data: Partial<DosisAplicadaCreate>): Observable<DosisAplicada> {
    return this.http.patch<DosisAplicada>(`${this.apiUrl}/dosis-aplicadas/${id}/`, data);
  }

  deleteDosis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dosis-aplicadas/${id}/`);
  }

  getPacientesPendientes(): Observable<PacienteVacunasPendientes[]> {
    return this.http.get<PacienteVacunasPendientes[]>(`${this.apiUrl}/pacientes-pendientes/`);
  }
}
