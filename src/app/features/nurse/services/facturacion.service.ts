import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/common.model';
import {
  Ingreso,
  IngresoCreate,
  Gasto,
  GastoCreate,
  ResumenMensual,
  ResumenAnual
} from '../../../models/facturacion.model';

export interface FacturacionQueryParams {
  mes?: number;
  anio?: number;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/facturacion`;

  // Ingresos
  getIngresos(params?: FacturacionQueryParams): Observable<PaginatedResponse<Ingreso>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Ingreso>>(`${this.apiUrl}/ingresos/`, { params: httpParams });
  }

  getIngreso(id: number): Observable<Ingreso> {
    return this.http.get<Ingreso>(`${this.apiUrl}/ingresos/${id}/`);
  }

  createIngreso(data: IngresoCreate): Observable<Ingreso> {
    return this.http.post<Ingreso>(`${this.apiUrl}/ingresos/`, data);
  }

  updateIngreso(id: number, data: Partial<IngresoCreate>): Observable<Ingreso> {
    return this.http.patch<Ingreso>(`${this.apiUrl}/ingresos/${id}/`, data);
  }

  deleteIngreso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ingresos/${id}/`);
  }

  // Gastos
  getGastos(params?: FacturacionQueryParams): Observable<PaginatedResponse<Gasto>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Gasto>>(`${this.apiUrl}/gastos/`, { params: httpParams });
  }

  getGasto(id: number): Observable<Gasto> {
    return this.http.get<Gasto>(`${this.apiUrl}/gastos/${id}/`);
  }

  createGasto(data: GastoCreate): Observable<Gasto> {
    return this.http.post<Gasto>(`${this.apiUrl}/gastos/`, data);
  }

  updateGasto(id: number, data: Partial<GastoCreate>): Observable<Gasto> {
    return this.http.patch<Gasto>(`${this.apiUrl}/gastos/${id}/`, data);
  }

  deleteGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/gastos/${id}/`);
  }

  // Resúmenes
  getResumenMensual(mes: number, anio: number): Observable<ResumenMensual> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.http.get<ResumenMensual>(`${this.apiUrl}/resumen/`, { params });
  }

  getResumenAnual(anio: number): Observable<ResumenAnual> {
    const params = new HttpParams().set('anio', anio.toString());
    return this.http.get<ResumenAnual>(`${this.apiUrl}/resumen-anual/`, { params });
  }
}
