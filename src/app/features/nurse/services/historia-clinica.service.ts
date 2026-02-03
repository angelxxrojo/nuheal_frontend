import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  HistoriaClinica,
  HistoriaClinicaCreate,
  NotaSOAPIE,
  NotaSOAPIECreate
} from '../../../models/historia-clinica.model';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pacientes`;

  getHistoria(pacienteId: number): Observable<HistoriaClinica> {
    return this.http.get<HistoriaClinica>(`${this.apiUrl}/${pacienteId}/historia/`);
  }

  createHistoria(pacienteId: number, data: HistoriaClinicaCreate): Observable<HistoriaClinica> {
    return this.http.post<HistoriaClinica>(`${this.apiUrl}/${pacienteId}/historia/`, data);
  }

  updateHistoria(pacienteId: number, data: Partial<HistoriaClinicaCreate>): Observable<HistoriaClinica> {
    return this.http.patch<HistoriaClinica>(`${this.apiUrl}/${pacienteId}/historia/`, data);
  }

  getNotas(pacienteId: number): Observable<NotaSOAPIE[]> {
    return this.http.get<NotaSOAPIE[]>(`${this.apiUrl}/${pacienteId}/historia/notas/`);
  }

  getNota(pacienteId: number, notaId: number): Observable<NotaSOAPIE> {
    return this.http.get<NotaSOAPIE>(`${this.apiUrl}/${pacienteId}/historia/notas/${notaId}/`);
  }

  createNota(pacienteId: number, data: NotaSOAPIECreate): Observable<NotaSOAPIE> {
    return this.http.post<NotaSOAPIE>(`${this.apiUrl}/${pacienteId}/historia/notas/`, data);
  }

  updateNota(pacienteId: number, notaId: number, data: Partial<NotaSOAPIECreate>): Observable<NotaSOAPIE> {
    return this.http.patch<NotaSOAPIE>(`${this.apiUrl}/${pacienteId}/historia/notas/${notaId}/`, data);
  }

  deleteNota(pacienteId: number, notaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pacienteId}/historia/notas/${notaId}/`);
  }
}
