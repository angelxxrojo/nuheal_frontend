import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  HistoriaClinica,
  HistoriaClinicaCreate,
  NotaSOAPIE,
  NotaSOAPIECreate,
  DiagnosticoNANDA,
  DiagnosticoCIE10
} from '../../../models/historia-clinica.model';

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pacientes`;
  private catalogoUrl = `${environment.apiUrl}/historia-clinica`;

  // --- Historia Clínica ---

  getHistoria(pacienteId: number): Observable<HistoriaClinica> {
    return this.http.get<PaginatedResponse<HistoriaClinica>>(`${this.apiUrl}/${pacienteId}/historia/`).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          return response.results[0];
        }
        throw { status: 404, message: 'Historia clínica no encontrada' };
      })
    );
  }

  createHistoria(pacienteId: number, data: HistoriaClinicaCreate): Observable<HistoriaClinica> {
    return this.http.post<HistoriaClinica>(`${this.apiUrl}/${pacienteId}/historia/`, data);
  }

  updateHistoria(pacienteId: number, historiaId: number, data: Partial<HistoriaClinicaCreate>): Observable<HistoriaClinica> {
    return this.http.patch<HistoriaClinica>(`${this.apiUrl}/${pacienteId}/historia/${historiaId}/`, data);
  }

  // --- Notas SOAPIE ---

  getNotas(pacienteId: number, historiaId: number): Observable<NotaSOAPIE[]> {
    return this.http.get<NotaSOAPIE[]>(`${this.apiUrl}/${pacienteId}/historia/${historiaId}/notas/`);
  }

  getNota(pacienteId: number, historiaId: number, notaId: number): Observable<NotaSOAPIE> {
    return this.http.get<NotaSOAPIE>(`${this.apiUrl}/${pacienteId}/historia/${historiaId}/notas/${notaId}/`);
  }

  createNota(pacienteId: number, historiaId: number, data: NotaSOAPIECreate): Observable<NotaSOAPIE> {
    return this.http.post<NotaSOAPIE>(`${this.apiUrl}/${pacienteId}/historia/${historiaId}/notas/`, data);
  }

  updateNota(pacienteId: number, historiaId: number, notaId: number, data: Partial<NotaSOAPIECreate>): Observable<NotaSOAPIE> {
    return this.http.patch<NotaSOAPIE>(`${this.apiUrl}/${pacienteId}/historia/${historiaId}/notas/${notaId}/`, data);
  }

  deleteNota(pacienteId: number, historiaId: number, notaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pacienteId}/historia/${historiaId}/notas/${notaId}/`);
  }

  // --- Catálogos de Diagnósticos ---

  getDiagnosticosNANDA(search?: string): Observable<DiagnosticoNANDA[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<DiagnosticoNANDA[]>(`${this.catalogoUrl}/diagnosticos-nanda/`, { params });
  }

  getDiagnosticosCIE10(search?: string): Observable<DiagnosticoCIE10[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<DiagnosticoCIE10[]>(`${this.catalogoUrl}/diagnosticos-cie10/`, { params });
  }
}
