import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/common.model';
import {
  PlantillaConsentimiento,
  Consentimiento,
  ConsentimientoCreate
} from '../../../models/documento.model';

export interface ConsentimientoQueryParams {
  paciente?: number;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/documentos`;

  // Plantillas
  getPlantillas(): Observable<PlantillaConsentimiento[]> {
    return this.http.get<any>(`${this.apiUrl}/plantillas/`).pipe(
      map(response => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          return response;
        }
        return response.results || [];
      })
    );
  }

  getPlantilla(id: number): Observable<PlantillaConsentimiento> {
    return this.http.get<PlantillaConsentimiento>(`${this.apiUrl}/plantillas/${id}/`);
  }

  // Consentimientos
  getConsentimientos(params?: ConsentimientoQueryParams): Observable<PaginatedResponse<Consentimiento>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Consentimiento>>(`${this.apiUrl}/consentimientos/`, { params: httpParams });
  }

  getConsentimiento(id: number): Observable<Consentimiento> {
    return this.http.get<Consentimiento>(`${this.apiUrl}/consentimientos/${id}/`);
  }

  createConsentimiento(data: ConsentimientoCreate): Observable<Consentimiento> {
    return this.http.post<Consentimiento>(`${this.apiUrl}/consentimientos/`, data);
  }

  deleteConsentimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/consentimientos/${id}/`);
  }

  // PDF
  getConsentimientoPdfUrl(id: number): string {
    return `${this.apiUrl}/consentimientos/${id}/pdf/`;
  }

  downloadConsentimientoPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/consentimientos/${id}/pdf/`, {
      responseType: 'blob'
    });
  }
}
