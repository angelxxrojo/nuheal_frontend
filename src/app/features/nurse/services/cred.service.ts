import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/common.model';
import {
  ControlCRED,
  ControlCREDCreate,
  GraficoCRED,
  CalculadoraOMSRequest,
  CalculadoraOMSResponse
} from '../../../models/cred.model';

export interface CREDQueryParams {
  paciente?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  con_alerta?: boolean;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CREDService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cred`;

  getControles(params?: CREDQueryParams): Observable<PaginatedResponse<ControlCRED>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<ControlCRED>>(`${this.apiUrl}/`, { params: httpParams });
  }

  getControl(id: number): Observable<ControlCRED> {
    return this.http.get<ControlCRED>(`${this.apiUrl}/${id}/`);
  }

  createControl(data: ControlCREDCreate): Observable<ControlCRED> {
    return this.http.post<ControlCRED>(`${this.apiUrl}/`, data);
  }

  updateControl(id: number, data: Partial<ControlCREDCreate>): Observable<ControlCRED> {
    return this.http.patch<ControlCRED>(`${this.apiUrl}/${id}/`, data);
  }

  deleteControl(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  getGrafico(pacienteId: number): Observable<GraficoCRED> {
    return this.http.get<GraficoCRED>(`${this.apiUrl}/paciente/${pacienteId}/grafico/`);
  }

  getAlertas(): Observable<ControlCRED[]> {
    return this.http.get<ControlCRED[]>(`${this.apiUrl}/alertas/`);
  }

  calcularZScores(data: CalculadoraOMSRequest): Observable<CalculadoraOMSResponse> {
    return this.http.post<CalculadoraOMSResponse>(`${this.apiUrl}/calculadora/`, data);
  }
}
