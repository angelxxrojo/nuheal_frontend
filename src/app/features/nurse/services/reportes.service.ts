import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Dashboard {
  total_pacientes: number;
  citas_hoy: {
    total: number;
    pendientes: number;
    atendidas: number;
  };
  atenciones_mes: number;
  alertas_nutricionales: number;
  pacientes_vacunas_pendientes: number;
}

export interface ReporteProduccion {
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  total_atenciones: number;
  por_servicio: {
    tipo_servicio__nombre: string;
    total: number;
  }[];
  por_sexo: Record<string, number>;
  por_edad: Record<string, number>;
}

export interface ReporteHIS {
  establecimiento: string;
  profesional: string;
  cep: string;
  periodo: string;
  resumen: {
    total_atenciones: number;
    controles_cred: number;
    vacunas_aplicadas: number;
  };
  registros: {
    fecha: string;
    historia_clinica: string;
    dni: string;
    apellidos_nombres: string;
    sexo: string;
    edad: string;
    diagnostico: string;
    tipo: string;
  }[];
}

export interface ReporteVacunacion {
  periodo: string;
  total_dosis_aplicadas: number;
  por_vacuna: {
    vacuna: string;
    total: number;
  }[];
  por_grupo_edad: Record<string, number>;
}

export interface ReporteCRED {
  periodo: string;
  total_controles: number;
  por_estado_nutricional: Record<string, number>;
  alertas: {
    paciente: string;
    diagnostico: string;
    fecha: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/dashboard/`);
  }

  getProduccion(fechaInicio?: string, fechaFin?: string): Observable<ReporteProduccion> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<ReporteProduccion>(`${this.apiUrl}/produccion/`, { params });
  }

  getHIS(mes: number, anio: number): Observable<ReporteHIS> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.http.get<ReporteHIS>(`${this.apiUrl}/his/`, { params });
  }

  getVacunacion(mes: number, anio: number): Observable<ReporteVacunacion> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.http.get<ReporteVacunacion>(`${this.apiUrl}/vacunacion/`, { params });
  }

  getCRED(mes: number, anio: number): Observable<ReporteCRED> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.http.get<ReporteCRED>(`${this.apiUrl}/cred/`, { params });
  }
}
