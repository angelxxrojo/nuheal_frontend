import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Vacuna,
  EsquemaNacional,
  CarnetVacunacion,
  DosisAplicada,
  DosisAplicadaCreate,
  PacienteVacunasPendientes,
  LoteVacuna,
  LoteVacunaCreate,
  NoVacunacion,
  NoVacunacionCreate,
  AlertaLote
} from '../../../models/vacuna.model';

@Injectable({
  providedIn: 'root'
})
export class VacunasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vacunas`;

  // --- Catálogo ---

  getCatalogo(): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${this.apiUrl}/catalogo/`);
  }

  getEsquemaNacional(): Observable<EsquemaNacional[]> {
    return this.http.get<EsquemaNacional[]>(`${this.apiUrl}/esquema-nacional/`);
  }

  // --- Carnet ---

  getCarnet(pacienteId: number): Observable<CarnetVacunacion> {
    return this.http.get<CarnetVacunacion>(`${this.apiUrl}/carnet/${pacienteId}/`);
  }

  // --- Dosis Aplicadas ---

  getDosisAplicadas(pacienteId?: number): Observable<DosisAplicada[]> {
    let params = new HttpParams();
    if (pacienteId) params = params.set('paciente', pacienteId.toString());
    return this.http.get<DosisAplicada[]>(`${this.apiUrl}/dosis-aplicadas/`, { params });
  }

  registrarDosis(data: DosisAplicadaCreate | FormData): Observable<DosisAplicada> {
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

  // --- Lotes (Inventario) ---

  getLotes(vacunaId?: number): Observable<LoteVacuna[]> {
    let params = new HttpParams();
    if (vacunaId) params = params.set('vacuna', vacunaId.toString());
    return this.http.get<LoteVacuna[]>(`${this.apiUrl}/lotes/`, { params });
  }

  createLote(data: LoteVacunaCreate): Observable<LoteVacuna> {
    return this.http.post<LoteVacuna>(`${this.apiUrl}/lotes/`, data);
  }

  updateLote(id: number, data: Partial<LoteVacunaCreate>): Observable<LoteVacuna> {
    return this.http.patch<LoteVacuna>(`${this.apiUrl}/lotes/${id}/`, data);
  }

  getAlertasLotes(): Observable<AlertaLote[]> {
    return this.http.get<AlertaLote[]>(`${this.apiUrl}/lotes/alertas/`);
  }

  // --- No Vacunación ---

  getNoVacunacion(pacienteId?: number): Observable<NoVacunacion[]> {
    let params = new HttpParams();
    if (pacienteId) params = params.set('paciente', pacienteId.toString());
    return this.http.get<NoVacunacion[]>(`${this.apiUrl}/no-vacunacion/`, { params });
  }

  createNoVacunacion(data: NoVacunacionCreate): Observable<NoVacunacion> {
    return this.http.post<NoVacunacion>(`${this.apiUrl}/no-vacunacion/`, data);
  }
}
