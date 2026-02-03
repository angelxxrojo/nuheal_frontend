# Ejemplos de Integración con Angular

## Configuración Inicial

### 1. Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.nuheal.com/api'
};
```

### 2. Modelos (Interfaces)
```typescript
// src/app/models/auth.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  numero_colegiatura: string;
  especialidad: string;
  nombre_consultorio?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    nombre: string;
  };
  enfermera?: Enfermera;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  foto?: string;
}

export interface Enfermera {
  id: number;
  usuario: User;
  numero_colegiatura: string;
  especialidad: string;
  nombre_consultorio?: string;
  direccion_consultorio?: string;
  telefono_consultorio?: string;
  ruc?: string;
  logo?: string;
  plan_actual?: {
    code: string;
    name: string;
  };
  total_pacientes: number;
  created_at: string;
}
```

```typescript
// src/app/models/paciente.model.ts
export interface Paciente {
  id: number;
  tipo_documento: string;
  tipo_documento_display?: string;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad?: {
    years: number;
    months: number;
    days: number;
    total_months: number;
  };
  edad_texto: string;
  es_menor?: boolean;
  sexo: 'M' | 'F';
  sexo_display?: string;
  lugar_nacimiento?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  foto?: string;
  observaciones?: string;
  responsables?: Responsable[];
  responsable_principal?: Responsable;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Responsable {
  id?: number;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  parentesco: string;
  parentesco_display?: string;
  telefono: string;
  telefono_alternativo?: string;
  email?: string;
  direccion?: string;
  es_principal: boolean;
  puede_autorizar_procedimientos: boolean;
}

export interface PacienteCreate {
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  lugar_nacimiento?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
}
```

```typescript
// src/app/models/cita.model.ts
export interface TipoServicio {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio: string;
  color: string;
  requiere_consentimiento: boolean;
  instrucciones_previas?: string;
  orden: number;
  is_active: boolean;
}

export interface Cita {
  id: number;
  paciente: number | Paciente;
  paciente_nombre?: string;
  tipo_servicio: number | TipoServicio;
  servicio_nombre?: string;
  servicio_color?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: CitaEstado;
  estado_display?: string;
  notas?: string;
  motivo_cancelacion?: string;
  recordatorio_enviado: boolean;
  puede_cancelarse?: boolean;
  created_at?: string;
}

export type CitaEstado = 'programada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';

export interface CitaCreate {
  paciente: number;
  tipo_servicio: number;
  fecha: string;
  hora_inicio: string;
  notas?: string;
}

export interface SlotDisponible {
  hora: string;
  disponible: boolean;
}

export interface DisponibilidadResponse {
  fecha: string;
  laborable: boolean;
  slots: SlotDisponible[];
}
```

```typescript
// src/app/models/cred.model.ts
export interface ControlCRED {
  id: number;
  paciente: number | Paciente;
  paciente_nombre?: string;
  cita?: number;
  fecha: string;
  edad_meses: number;
  edad_dias?: number;
  peso_kg: string;
  talla_cm: string;
  perimetro_cefalico_cm?: string;
  perimetro_toracico_cm?: string;
  imc?: string;
  zscore_peso_edad?: string;
  zscore_talla_edad?: string;
  zscore_peso_talla?: string;
  zscore_imc_edad?: string;
  diagnostico_peso_edad?: string;
  diagnostico_peso_edad_display?: string;
  diagnostico_talla_edad?: string;
  diagnostico_talla_edad_display?: string;
  diagnostico_peso_talla?: string;
  diagnostico_peso_talla_display?: string;
  tiene_alerta: boolean;
  tipo_alerta: 'verde' | 'amarillo' | 'rojo';
  alertas_activas?: Alerta[];
  desarrollo_motor?: string;
  desarrollo_lenguaje?: string;
  desarrollo_social?: string;
  desarrollo_cognitivo?: string;
  observaciones?: string;
  recomendaciones?: string;
  proxima_cita?: string;
}

export interface Alerta {
  tipo: 'verde' | 'amarillo' | 'rojo';
  indicador: string;
  diagnostico: string;
}

export interface ControlCREDCreate {
  paciente: number;
  cita?: number;
  fecha: string;
  peso_kg: number;
  talla_cm: number;
  perimetro_cefalico_cm?: number;
  perimetro_toracico_cm?: number;
  desarrollo_motor?: string;
  desarrollo_lenguaje?: string;
  desarrollo_social?: string;
  desarrollo_cognitivo?: string;
  observaciones?: string;
  recomendaciones?: string;
  proxima_cita?: string;
}

export interface GraficoCRED {
  paciente_id: number;
  paciente_nombre: string;
  paciente_sexo: 'M' | 'F';
  controles: {
    fecha: string;
    edad_meses: number;
    peso_kg: string;
    talla_cm: string;
    zscore_peso_edad?: string;
    zscore_talla_edad?: string;
  }[];
  curvas_referencia: {
    peso_edad: CurvaReferencia[];
    talla_edad: CurvaReferencia[];
  };
}

export interface CurvaReferencia {
  edad_meses: number;
  p3: number;
  p50: number;
  p97: number;
}
```

---

## 3. Servicios

### Auth Service
```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Enfermera } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<Enfermera | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): Observable<any> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}/logout/`, { refresh }).pipe(
      tap(() => this.clearSession())
    );
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post<{ access: string }>(`${this.apiUrl}/refresh/`, { refresh }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
      })
    );
  }

  getProfile(): Observable<Enfermera> {
    return this.http.get<Enfermera>(`${this.apiUrl}/me/`).pipe(
      tap(enfermera => {
        this.currentUserSubject.next(enfermera);
        localStorage.setItem('currentUser', JSON.stringify(enfermera));
      })
    );
  }

  updateProfile(data: Partial<any>): Observable<Enfermera> {
    return this.http.patch<Enfermera>(`${this.apiUrl}/me/`, data).pipe(
      tap(enfermera => {
        this.currentUserSubject.next(enfermera);
        localStorage.setItem('currentUser', JSON.stringify(enfermera));
      })
    );
  }

  changePassword(data: { old_password: string; new_password: string; new_password_confirm: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password/`, data);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('access_token', response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);
    if (response.enfermera) {
      this.currentUserSubject.next(response.enfermera);
      localStorage.setItem('currentUser', JSON.stringify(response.enfermera));
    }
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  get accessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  get currentUserValue(): Enfermera | null {
    return this.currentUserSubject.value;
  }
}
```

### HTTP Interceptor
```typescript
// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.accessToken;

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/login')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.access);
          return next.handle(this.addToken(request, response.access));
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(request, token!)))
    );
  }
}
```

### Pacientes Service
```typescript
// src/app/services/pacientes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paciente, PacienteCreate, Responsable } from '../models/paciente.model';
import { PaginatedResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    search?: string;
    sexo?: string;
    page?: number;
    page_size?: number;
  }): Observable<PaginatedResponse<Paciente>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Paciente>>(this.apiUrl + '/', { params: httpParams });
  }

  getById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}/`);
  }

  create(data: PacienteCreate): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl + '/', data);
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

  deleteResponsable(pacienteId: number, responsableId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pacienteId}/responsables/${responsableId}/`);
  }

  getStats(): Observable<{
    total: number;
    by_sex: { masculino: number; femenino: number };
    by_age: Record<string, number>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/`);
  }
}
```

### Agenda Service
```typescript
// src/app/services/agenda.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoServicio, Cita, CitaCreate, DisponibilidadResponse } from '../models/cita.model';
import { PaginatedResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = `${environment.apiUrl}/agenda`;

  constructor(private http: HttpClient) {}

  // Configuración
  getConfiguracion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion/`);
  }

  updateConfiguracion(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/configuracion/`, data);
  }

  // Tipos de Servicio
  getServicios(): Observable<TipoServicio[]> {
    return this.http.get<TipoServicio[]>(`${this.apiUrl}/servicios/`);
  }

  createServicio(data: Partial<TipoServicio>): Observable<TipoServicio> {
    return this.http.post<TipoServicio>(`${this.apiUrl}/servicios/`, data);
  }

  updateServicio(id: number, data: Partial<TipoServicio>): Observable<TipoServicio> {
    return this.http.patch<TipoServicio>(`${this.apiUrl}/servicios/${id}/`, data);
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/servicios/${id}/`);
  }

  // Citas
  getCitas(params?: {
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    paciente?: number;
  }): Observable<PaginatedResponse<Cita>> {
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

  confirmarCita(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas/${id}/confirmar/`, {});
  }

  cancelarCita(id: number, motivo?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas/${id}/cancelar/`, { motivo });
  }

  atenderCita(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas/${id}/atender/`, {});
  }

  marcarNoAsistio(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas/${id}/no-asistio/`, {});
  }

  // Disponibilidad
  getDisponibilidad(fecha: string, tipoServicio?: number): Observable<DisponibilidadResponse> {
    let params = new HttpParams().set('fecha', fecha);
    if (tipoServicio) {
      params = params.set('tipo_servicio', tipoServicio.toString());
    }
    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/disponibilidad/`, { params });
  }

  // Vistas rápidas
  getCitasHoy(): Observable<{
    fecha: string;
    total: number;
    pendientes: number;
    atendidas: number;
    citas: Cita[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/citas-hoy/`);
  }

  getProximasCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/proximas/`);
  }
}
```

### CRED Service
```typescript
// src/app/services/cred.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ControlCRED, ControlCREDCreate, GraficoCRED } from '../models/cred.model';
import { PaginatedResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class CREDService {
  private apiUrl = `${environment.apiUrl}/cred`;

  constructor(private http: HttpClient) {}

  getControles(params?: {
    paciente?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    con_alerta?: boolean;
  }): Observable<PaginatedResponse<ControlCRED>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<ControlCRED>>(this.apiUrl + '/', { params: httpParams });
  }

  getControl(id: number): Observable<ControlCRED> {
    return this.http.get<ControlCRED>(`${this.apiUrl}/${id}/`);
  }

  createControl(data: ControlCREDCreate): Observable<ControlCRED> {
    return this.http.post<ControlCRED>(this.apiUrl + '/', data);
  }

  updateControl(id: number, data: Partial<ControlCREDCreate>): Observable<ControlCRED> {
    return this.http.patch<ControlCRED>(`${this.apiUrl}/${id}/`, data);
  }

  getGrafico(pacienteId: number): Observable<GraficoCRED> {
    return this.http.get<GraficoCRED>(`${this.apiUrl}/paciente/${pacienteId}/grafico/`);
  }

  getAlertas(): Observable<ControlCRED[]> {
    return this.http.get<ControlCRED[]>(`${this.apiUrl}/alertas/`);
  }

  calcularZScores(data: {
    peso_kg: number;
    talla_cm: number;
    edad_meses: number;
    sexo: 'M' | 'F';
  }): Observable<{
    input: any;
    zscores: any;
    diagnosticos: any;
  }> {
    return this.http.post<any>(`${this.apiUrl}/calculadora/`, data);
  }
}
```

### Vacunas Service
```typescript
// src/app/services/vacunas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Vacuna {
  id: number;
  codigo: string;
  nombre: string;
  nombre_comercial?: string;
  descripcion?: string;
  enfermedad_previene: string;
  via_administracion: string;
  via_administracion_display?: string;
  dosis_ml: string;
  sitio_aplicacion?: string;
}

export interface EsquemaDosis {
  id: number;
  vacuna?: Vacuna;
  vacuna_nombre?: string;
  vacuna_codigo?: string;
  numero_dosis: number;
  nombre_dosis: string;
  edad_meses_minima: number;
  edad_meses_ideal: number;
  edad_meses_maxima?: number;
  es_refuerzo: boolean;
}

export interface DosisAplicada {
  id: number;
  vacuna: Vacuna;
  esquema_dosis: EsquemaDosis;
  fecha_aplicacion: string;
  lote: string;
  fecha_vencimiento_lote?: string;
  sitio_aplicacion?: string;
  edad_aplicacion_meses: number;
  observaciones?: string;
  reacciones_adversas?: string;
  aplicada_a_tiempo: boolean;
}

export interface CarnetVacunacion {
  paciente: {
    id: number;
    nombre: string;
    fecha_nacimiento: string;
    edad_meses: number;
    edad_texto: string;
  };
  dosis_aplicadas: DosisAplicada[];
  dosis_pendientes: EsquemaDosis[];
  dosis_vencidas: EsquemaDosis[];
  proximas_dosis: EsquemaDosis[];
  resumen: {
    total_aplicadas: number;
    total_pendientes: number;
    total_vencidas: number;
    tiene_vacunas_pendientes_urgentes: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VacunasService {
  private apiUrl = `${environment.apiUrl}/vacunas`;

  constructor(private http: HttpClient) {}

  getCatalogo(): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${this.apiUrl}/catalogo/`);
  }

  getEsquemaNacional(): Observable<{ vacuna: Vacuna; dosis: EsquemaDosis[] }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/esquema-nacional/`);
  }

  getCarnet(pacienteId: number): Observable<CarnetVacunacion> {
    return this.http.get<CarnetVacunacion>(`${this.apiUrl}/carnet/${pacienteId}/`);
  }

  registrarDosis(data: {
    paciente: number;
    vacuna: number;
    esquema_dosis: number;
    fecha_aplicacion: string;
    lote: string;
    fecha_vencimiento_lote?: string;
    sitio_aplicacion?: string;
    observaciones?: string;
    reacciones_adversas?: string;
  }): Observable<DosisAplicada> {
    return this.http.post<DosisAplicada>(`${this.apiUrl}/dosis-aplicadas/`, data);
  }

  getPacientesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pacientes-pendientes/`);
  }
}
```

### Reportes Service
```typescript
// src/app/services/reportes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/dashboard/`);
  }

  getProduccion(fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get(`${this.apiUrl}/produccion/`, { params });
  }

  getHIS(mes: number, anio: number): Observable<any> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/his/`, { params });
  }

  getVacunacion(mes: number, anio: number): Observable<any> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/vacunacion/`, { params });
  }

  getCRED(mes: number, anio: number): Observable<any> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/cred/`, { params });
  }
}
```

---

## 4. Modelo común para paginación
```typescript
// src/app/models/common.model.ts
export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

---

## 5. Guards

### Auth Guard
```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

### Feature Guard (verificar si tiene feature disponible)
```typescript
// src/app/guards/feature.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeatureGuard implements CanActivate {
  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredFeature = route.data['feature'] as string;

    return this.subscriptionService.checkFeature(requiredFeature).pipe(
      map(response => {
        if (response.has_feature) {
          return true;
        }

        // Redirigir a página de upgrade
        this.router.navigate(['/upgrade'], {
          queryParams: { feature: requiredFeature }
        });
        return false;
      })
    );
  }
}
```

---

## 6. Uso en Componentes

### Ejemplo: Dashboard Component
```typescript
// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ReportesService, Dashboard } from '../../services/reportes.service';
import { AgendaService } from '../../services/agenda.service';
import { Cita } from '../../models/cita.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  citasHoy: Cita[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private reportesService: ReportesService,
    private agendaService: AgendaService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Cargar dashboard y citas en paralelo
    this.reportesService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
      },
      error: (err) => {
        this.error = 'Error cargando dashboard';
        console.error(err);
      }
    });

    this.agendaService.getCitasHoy().subscribe({
      next: (data) => {
        this.citasHoy = data.citas;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }
}
```

### Ejemplo: Agendar Cita Component
```typescript
// src/app/pages/citas/agendar-cita/agendar-cita.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgendaService } from '../../../services/agenda.service';
import { PacientesService } from '../../../services/pacientes.service';
import { TipoServicio, SlotDisponible } from '../../../models/cita.model';
import { Paciente } from '../../../models/paciente.model';

@Component({
  selector: 'app-agendar-cita',
  templateUrl: './agendar-cita.component.html'
})
export class AgendarCitaComponent implements OnInit {
  form: FormGroup;
  pacientes: Paciente[] = [];
  servicios: TipoServicio[] = [];
  slots: SlotDisponible[] = [];
  loading = false;
  searchPaciente = '';

  constructor(
    private fb: FormBuilder,
    private agendaService: AgendaService,
    private pacientesService: PacientesService,
    private router: Router
  ) {
    this.form = this.fb.group({
      paciente: [null, Validators.required],
      tipo_servicio: [null, Validators.required],
      fecha: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.agendaService.getServicios().subscribe({
      next: (servicios) => {
        this.servicios = servicios.filter(s => s.is_active);
      }
    });
  }

  searchPacientes(): void {
    if (this.searchPaciente.length >= 2) {
      this.pacientesService.getAll({ search: this.searchPaciente }).subscribe({
        next: (response) => {
          this.pacientes = response.results;
        }
      });
    }
  }

  onFechaChange(): void {
    const fecha = this.form.get('fecha')?.value;
    const servicioId = this.form.get('tipo_servicio')?.value;

    if (fecha) {
      this.agendaService.getDisponibilidad(fecha, servicioId).subscribe({
        next: (response) => {
          if (response.laborable) {
            this.slots = response.slots;
          } else {
            this.slots = [];
            alert('Este día no es laborable');
          }
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;

      this.agendaService.createCita(this.form.value).subscribe({
        next: (cita) => {
          this.router.navigate(['/citas', cita.id]);
        },
        error: (err) => {
          this.loading = false;
          alert(err.error?.detail || 'Error al crear la cita');
        }
      });
    }
  }
}
```

---

## 7. App Module Configuration

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    // ... otros componentes
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 8. Manejo de Errores Global

```typescript
// src/app/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar'; // o tu sistema de notificaciones

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = error.error.message;
        } else {
          // Error del servidor
          switch (error.status) {
            case 400:
              errorMessage = this.parseValidationErrors(error.error);
              break;
            case 401:
              errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
              break;
            case 403:
              errorMessage = error.error?.detail || 'No tiene permisos para esta acción';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
              break;
          }
        }

        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        return throwError(() => error);
      })
    );
  }

  private parseValidationErrors(error: any): string {
    if (typeof error === 'string') return error;

    const messages: string[] = [];
    for (const key in error) {
      if (Array.isArray(error[key])) {
        messages.push(...error[key]);
      } else if (typeof error[key] === 'string') {
        messages.push(error[key]);
      }
    }
    return messages.join('. ') || 'Error de validación';
  }
}
```

---

## Notas Importantes

1. **Todos los endpoints (excepto login, register y planes) requieren autenticación**
2. **Las fechas se envían en formato `YYYY-MM-DD`**
3. **Las horas se envían en formato `HH:MM:SS` o `HH:MM`**
4. **Los decimales se envían como strings para evitar problemas de precisión**
5. **El backend siempre retorna los datos del usuario autenticado (multi-tenant por FK)**
