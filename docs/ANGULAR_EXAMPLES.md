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
  sexo?: 'M' | 'F';
  rne?: string;
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
  sexo?: 'M' | 'F';
  rne?: string;
  imagen_firma_sello?: string;
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
  clasificacion_etaria?: 'nino' | 'adolescente' | 'adulto' | 'adulto_mayor';
  clasificacion_etaria_display?: string;
  sexo: 'M' | 'F';
  sexo_display?: string;
  lugar_nacimiento?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  ubigeo_cod?: string;
  grupo_sanguineo?: string;
  grupo_sanguineo_display?: string;
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
  ubigeo_cod?: string;
  grupo_sanguineo?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
}
```

```typescript
// src/app/models/cita.model.ts
export type TipoAtencion = 'consultorio' | 'domicilio' | 'teleconsulta';
export type CitaEstado = 'programada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';
export type TipoBloqueo = 'TRABAJO_PRINCIPAL' | 'TRABAJO_SECUNDARIO' | 'PERSONAL' | 'VACACIONES';

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
  tipo_atencion: TipoAtencion;
  tipo_atencion_display?: string;
  plan_tratamiento?: number;
  estado: CitaEstado;
  estado_display?: string;
  notas?: string;
  motivo_cancelacion?: string;
  recordatorio_enviado: boolean;
  puede_cancelarse?: boolean;
  created_at?: string;
}

export interface CitaCreate {
  paciente: number;
  tipo_servicio: number;
  fecha: string;
  hora_inicio: string;
  tipo_atencion?: TipoAtencion;
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

export interface BloqueoAgenda {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio?: string;
  hora_fin?: string;
  motivo?: string;
  tipo: TipoBloqueo;
  tipo_display?: string;
  titulo?: string;
  es_recurrente: boolean;
  color: string;
  is_active: boolean;
}

export interface BloqueoAgendaCreate {
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio?: string;
  hora_fin?: string;
  motivo?: string;
  tipo?: TipoBloqueo;
  titulo?: string;
  es_recurrente?: boolean;
  color?: string;
}

export interface PatronRecurrencia {
  id: number;
  bloqueo: number;
  tipo_recurrencia: 'diario' | 'semanal' | 'patron';
  tipo_recurrencia_display?: string;
  intervalo_dias?: number;
  dias_semana?: number[];
  patron_ciclo?: string[];
  fecha_inicio_recurrencia: string;
  fecha_fin_recurrencia?: string;
}

export interface ListaEspera {
  id: number;
  paciente: number;
  paciente_nombre?: string;
  tipo_servicio: number;
  servicio_nombre?: string;
  fecha_deseada: string;
  tipo_atencion: TipoAtencion;
  tipo_atencion_display?: string;
  notas?: string;
  estado: 'esperando' | 'notificado' | 'agendado' | 'cancelado';
  estado_display?: string;
  created_at?: string;
}

export interface PlanTratamiento {
  id: number;
  paciente: number;
  paciente_nombre?: string;
  tipo_servicio: number;
  servicio_nombre?: string;
  nombre: string;
  descripcion?: string;
  total_sesiones: number;
  sesiones_completadas: number;
  frecuencia: 'diaria' | 'semanal' | 'quincenal' | 'mensual' | 'personalizada';
  frecuencia_display?: string;
  dias_semana?: number[];
  fecha_inicio: string;
  fecha_fin_estimada?: string;
  estado: 'activo' | 'completado' | 'suspendido' | 'cancelado';
  estado_display?: string;
  orden_medica?: string;
  requiere_orden_medica: boolean;
  notas?: string;
  progreso: number;
  sesiones_restantes: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlanTratamientoCreate {
  paciente: number;
  tipo_servicio: number;
  nombre: string;
  descripcion?: string;
  total_sesiones: number;
  frecuencia: string;
  dias_semana?: number[];
  fecha_inicio: string;
  fecha_fin_estimada?: string;
  orden_medica?: File;
  requiere_orden_medica?: boolean;
  notas?: string;
}
```

```typescript
// src/app/models/cred.model.ts
export type SuplementoHierroEstado = 'no_iniciado' | 'iniciado' | 'continuando' | 'terminado';
export type SuplementoHierroTipo = 'gotas' | 'jarabe' | 'otro';

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
  dosaje_hemoglobina?: string;
  suplemento_hierro_estado?: SuplementoHierroEstado;
  suplemento_hierro_tipo?: SuplementoHierroTipo;
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
  dosaje_hemoglobina?: number;
  suplemento_hierro_estado?: SuplementoHierroEstado;
  suplemento_hierro_tipo?: SuplementoHierroTipo;
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

```typescript
// src/app/models/vacuna.model.ts
export type OrigenInsumo = 'stock_propio' | 'traido_paciente';
export type EstadoCerteza = 'verificado' | 'declarado' | 'desconocido';

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
  contraindicaciones?: string;
  efectos_secundarios?: string;
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
  vacuna?: Vacuna;
  esquema_dosis?: EsquemaDosis;
  vacuna_nombre_manual?: string;
  vacuna_laboratorio?: string;
  nombre_vacuna_display: string;
  fecha_aplicacion: string;
  lote?: string;
  fecha_vencimiento_lote?: string;
  lote_vacuna?: number;
  sitio_aplicacion?: string;
  edad_aplicacion_meses: number;
  origen_insumo: OrigenInsumo;
  origen_insumo_display?: string;
  foto_receta_medica?: string;
  foto_envase?: string;
  estado_certeza: EstadoCerteza;
  estado_certeza_display?: string;
  observaciones?: string;
  reacciones_adversas?: string;
  aplicada_a_tiempo?: boolean | null;
  created_at?: string;
}

export interface DosisAplicadaCreate {
  paciente: number;
  vacuna?: number;
  esquema_dosis?: number;
  vacuna_nombre_manual?: string;
  vacuna_laboratorio?: string;
  fecha_aplicacion: string;
  lote?: string;
  fecha_vencimiento_lote?: string;
  lote_vacuna?: number;
  sitio_aplicacion?: string;
  origen_insumo?: OrigenInsumo;
  foto_receta_medica?: File;
  foto_envase?: File;
  estado_certeza?: EstadoCerteza;
  observaciones?: string;
  reacciones_adversas?: string;
}

export interface LoteVacuna {
  id: number;
  vacuna: number;
  vacuna_nombre?: string;
  numero_lote: string;
  fecha_vencimiento: string;
  stock_inicial: number;
  stock_actual: number;
  proveedor?: string;
  fecha_adquisicion?: string;
  observaciones?: string;
  esta_vencido: boolean;
  esta_por_vencer: boolean;
  stock_bajo: boolean;
  created_at?: string;
}

export interface LoteVacunaCreate {
  vacuna: number;
  numero_lote: string;
  fecha_vencimiento: string;
  stock_inicial: number;
  stock_actual?: number;
  proveedor?: string;
  fecha_adquisicion?: string;
  observaciones?: string;
}

export interface NoVacunacion {
  id: number;
  paciente: number;
  paciente_nombre?: string;
  esquema_dosis: number;
  dosis_nombre?: string;
  vacuna_nombre?: string;
  fecha: string;
  motivo: 'enfermo' | 'rechazo_padres' | 'desabastecimiento' | 'contraindicacion' | 'otro';
  motivo_display?: string;
  detalle?: string;
  created_at?: string;
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
    paciente_id: number;
    total_aplicadas: number;
    total_pendientes: number;
    total_vencidas: number;
    tiene_vacunas_pendientes_urgentes: boolean;
  };
}

export interface AlertaLote {
  lote: LoteVacuna;
  alertas: ('vencido' | 'por_vencer' | 'stock_bajo')[];
}
```

```typescript
// src/app/models/facturacion.model.ts
export type EstadoPago = 'pagado' | 'pendiente' | 'adelanto';

export interface Ingreso {
  id: number;
  cita?: number;
  paciente?: number;
  paciente_nombre?: string;
  fecha: string;
  concepto: string;
  descripcion?: string;
  monto: string;
  metodo_pago: string;
  metodo_pago_display?: string;
  estado_pago: EstadoPago;
  estado_pago_display?: string;
  monto_pendiente: string;
  numero_recibo?: string;
  comprobante?: string;
  created_at?: string;
}

export interface IngresoCreate {
  cita?: number;
  paciente?: number;
  fecha: string;
  concepto: string;
  descripcion?: string;
  monto: string;
  metodo_pago: string;
  estado_pago?: EstadoPago;
  monto_pendiente?: string;
  numero_recibo?: string;
  comprobante?: File;
}

export interface Gasto {
  id: number;
  fecha: string;
  categoria: string;
  categoria_display?: string;
  concepto: string;
  descripcion?: string;
  monto: string;
  proveedor?: string;
  numero_documento?: string;
  comprobante?: string;
  created_at?: string;
}
```

```typescript
// src/app/models/historia-clinica.model.ts
export interface DiagnosticoNANDA {
  id: number;
  codigo: string;
  dominio: string;
  clase: string;
  etiqueta: string;
  definicion?: string;
}

export interface DiagnosticoCIE10 {
  id: number;
  codigo: string;
  descripcion: string;
  capitulo: string;
  grupo: string;
}

export interface NotaSOAPIE {
  id: number;
  fecha: string;
  enfermera_nombre?: string;
  cita?: number;
  cita_info?: {
    id: number;
    fecha: string;
    servicio: string;
  };
  subjetivo: string;
  objetivo: string;
  analisis: string;
  planificacion: string;
  intervencion: string;
  evaluacion: string;
  temperatura?: string;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  presion_sistolica?: number;
  presion_diastolica?: number;
  presion_arterial?: string;
  saturacion_oxigeno?: number;
  glucosa_capilar?: string;
  diagnosticos_nanda?: DiagnosticoNANDA[];
  diagnosticos_cie10?: DiagnosticoCIE10[];
  created_at?: string;
  updated_at?: string;
}

export interface NotaSOAPIECreate {
  cita?: number;
  fecha: string;
  subjetivo: string;
  objetivo: string;
  analisis: string;
  planificacion: string;
  intervencion: string;
  evaluacion: string;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  presion_sistolica?: number;
  presion_diastolica?: number;
  saturacion_oxigeno?: number;
  glucosa_capilar?: number;
  diagnosticos_nanda_ids?: number[];
  diagnosticos_cie10_ids?: number[];
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

  /** Upload firma/sello - use FormData for file upload */
  updateProfileWithFile(data: FormData): Observable<Enfermera> {
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
import {
  TipoServicio, Cita, CitaCreate, DisponibilidadResponse,
  BloqueoAgenda, BloqueoAgendaCreate, PatronRecurrencia,
  ListaEspera, PlanTratamiento, PlanTratamientoCreate
} from '../models/cita.model';
import { PaginatedResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = `${environment.apiUrl}/agenda`;

  constructor(private http: HttpClient) {}

  // --- Configuracion ---
  getConfiguracion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion/`);
  }

  updateConfiguracion(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/configuracion/`, data);
  }

  // --- Tipos de Servicio ---
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

  // --- Citas ---
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

  // --- Disponibilidad ---
  getDisponibilidad(fecha: string, tipoServicio?: number): Observable<DisponibilidadResponse> {
    let params = new HttpParams().set('fecha', fecha);
    if (tipoServicio) {
      params = params.set('tipo_servicio', tipoServicio.toString());
    }
    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/disponibilidad/`, { params });
  }

  // --- Vistas rapidas ---
  getCitasHoy(): Observable<{ fecha: string; total: number; pendientes: number; atendidas: number; citas: Cita[] }> {
    return this.http.get<any>(`${this.apiUrl}/citas-hoy/`);
  }

  getProximasCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/proximas/`);
  }

  // --- Bloqueos ---
  getBloqueos(): Observable<BloqueoAgenda[]> {
    return this.http.get<BloqueoAgenda[]>(`${this.apiUrl}/bloqueos/`);
  }

  createBloqueo(data: BloqueoAgendaCreate): Observable<BloqueoAgenda> {
    return this.http.post<BloqueoAgenda>(`${this.apiUrl}/bloqueos/`, data);
  }

  updateBloqueo(id: number, data: Partial<BloqueoAgendaCreate>): Observable<BloqueoAgenda> {
    return this.http.patch<BloqueoAgenda>(`${this.apiUrl}/bloqueos/${id}/`, data);
  }

  deleteBloqueo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bloqueos/${id}/`);
  }

  // --- Patrones de Recurrencia ---
  getPatrones(): Observable<PatronRecurrencia[]> {
    return this.http.get<PatronRecurrencia[]>(`${this.apiUrl}/patrones-recurrencia/`);
  }

  createPatron(data: Partial<PatronRecurrencia>): Observable<PatronRecurrencia> {
    return this.http.post<PatronRecurrencia>(`${this.apiUrl}/patrones-recurrencia/`, data);
  }

  // --- Lista de Espera ---
  getListaEspera(estado?: string): Observable<ListaEspera[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<ListaEspera[]>(`${this.apiUrl}/lista-espera/`, { params });
  }

  createListaEspera(data: { paciente: number; tipo_servicio: number; fecha_deseada: string; tipo_atencion?: string; notas?: string }): Observable<ListaEspera> {
    return this.http.post<ListaEspera>(`${this.apiUrl}/lista-espera/`, data);
  }

  updateListaEspera(id: number, data: Partial<ListaEspera>): Observable<ListaEspera> {
    return this.http.patch<ListaEspera>(`${this.apiUrl}/lista-espera/${id}/`, data);
  }

  // --- Planes de Tratamiento ---
  getPlanesTratamiento(params?: { estado?: string; paciente?: number }): Observable<PlanTratamiento[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PlanTratamiento[]>(`${this.apiUrl}/planes-tratamiento/`, { params: httpParams });
  }

  createPlanTratamiento(data: PlanTratamientoCreate | FormData): Observable<PlanTratamiento> {
    return this.http.post<PlanTratamiento>(`${this.apiUrl}/planes-tratamiento/`, data);
  }

  completarSesion(planId: number): Observable<PlanTratamiento> {
    return this.http.post<PlanTratamiento>(`${this.apiUrl}/planes-tratamiento/${planId}/completar_sesion/`, {});
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
  }): Observable<{ input: any; zscores: any; diagnosticos: any }> {
    return this.http.post<any>(`${this.apiUrl}/calculadora/`, data);
  }
}
```

### Vacunas Service
```typescript
// src/app/services/vacunas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Vacuna, EsquemaDosis, DosisAplicada, DosisAplicadaCreate,
  CarnetVacunacion, LoteVacuna, LoteVacunaCreate,
  NoVacunacion, AlertaLote
} from '../models/vacuna.model';

@Injectable({
  providedIn: 'root'
})
export class VacunasService {
  private apiUrl = `${environment.apiUrl}/vacunas`;

  constructor(private http: HttpClient) {}

  // --- Catalogo ---
  getCatalogo(): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${this.apiUrl}/catalogo/`);
  }

  getEsquemaNacional(): Observable<{ vacuna: Vacuna; dosis: EsquemaDosis[] }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/esquema-nacional/`);
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

  /**
   * Registrar dosis aplicada.
   * Usa FormData si incluye archivos (foto_receta_medica, foto_envase).
   */
  registrarDosis(data: DosisAplicadaCreate | FormData): Observable<DosisAplicada> {
    return this.http.post<DosisAplicada>(`${this.apiUrl}/dosis-aplicadas/`, data);
  }

  getPacientesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pacientes-pendientes/`);
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

  // --- No Vacunacion ---
  getNoVacunacion(pacienteId?: number): Observable<NoVacunacion[]> {
    let params = new HttpParams();
    if (pacienteId) params = params.set('paciente', pacienteId.toString());
    return this.http.get<NoVacunacion[]>(`${this.apiUrl}/no-vacunacion/`, { params });
  }

  createNoVacunacion(data: { paciente: number; esquema_dosis: number; fecha: string; motivo: string; detalle?: string }): Observable<NoVacunacion> {
    return this.http.post<NoVacunacion>(`${this.apiUrl}/no-vacunacion/`, data);
  }
}
```

### Historia Clinica Service
```typescript
// src/app/services/historia-clinica.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiagnosticoNANDA, DiagnosticoCIE10, NotaSOAPIE, NotaSOAPIECreate } from '../models/historia-clinica.model';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // --- Historia Clinica ---
  getHistoria(pacienteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pacientes/${pacienteId}/historia/`);
  }

  createHistoria(pacienteId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pacientes/${pacienteId}/historia/`, data);
  }

  updateHistoria(pacienteId: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/pacientes/${pacienteId}/historia/`, data);
  }

  // --- Notas SOAPIE ---
  getNotas(pacienteId: number): Observable<NotaSOAPIE[]> {
    return this.http.get<NotaSOAPIE[]>(`${this.apiUrl}/pacientes/${pacienteId}/historia/notas/`);
  }

  getNota(pacienteId: number, notaId: number): Observable<NotaSOAPIE> {
    return this.http.get<NotaSOAPIE>(`${this.apiUrl}/pacientes/${pacienteId}/historia/notas/${notaId}/`);
  }

  createNota(pacienteId: number, data: NotaSOAPIECreate): Observable<NotaSOAPIE> {
    return this.http.post<NotaSOAPIE>(`${this.apiUrl}/pacientes/${pacienteId}/historia/notas/`, data);
  }

  // --- Catalogos de diagnosticos ---
  getDiagnosticosNANDA(search?: string): Observable<DiagnosticoNANDA[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<DiagnosticoNANDA[]>(`${this.apiUrl}/historia-clinica/diagnosticos-nanda/`, { params });
  }

  getDiagnosticosCIE10(search?: string): Observable<DiagnosticoCIE10[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<DiagnosticoCIE10[]>(`${this.apiUrl}/historia-clinica/diagnosticos-cie10/`, { params });
  }
}
```

### Facturacion Service
```typescript
// src/app/services/facturacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ingreso, IngresoCreate, Gasto } from '../models/facturacion.model';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private apiUrl = `${environment.apiUrl}/facturacion`;

  constructor(private http: HttpClient) {}

  // --- Ingresos ---
  getIngresos(params?: { mes?: number; anio?: number }): Observable<Ingreso[]> {
    let httpParams = new HttpParams();
    if (params?.mes) httpParams = httpParams.set('mes', params.mes.toString());
    if (params?.anio) httpParams = httpParams.set('anio', params.anio.toString());
    return this.http.get<Ingreso[]>(`${this.apiUrl}/ingresos/`, { params: httpParams });
  }

  createIngreso(data: IngresoCreate | FormData): Observable<Ingreso> {
    return this.http.post<Ingreso>(`${this.apiUrl}/ingresos/`, data);
  }

  // --- Gastos ---
  getGastos(params?: { mes?: number; anio?: number }): Observable<Gasto[]> {
    let httpParams = new HttpParams();
    if (params?.mes) httpParams = httpParams.set('mes', params.mes.toString());
    if (params?.anio) httpParams = httpParams.set('anio', params.anio.toString());
    return this.http.get<Gasto[]>(`${this.apiUrl}/gastos/`, { params: httpParams });
  }

  createGasto(data: Partial<Gasto> | FormData): Observable<Gasto> {
    return this.http.post<Gasto>(`${this.apiUrl}/gastos/`, data);
  }

  // --- Resumenes ---
  getResumenMensual(mes: number, anio: number): Observable<any> {
    const params = new HttpParams().set('mes', mes.toString()).set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/resumen/`, { params });
  }

  getResumenAnual(anio: number): Observable<any> {
    const params = new HttpParams().set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/resumen-anual/`, { params });
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
    const params = new HttpParams().set('mes', mes.toString()).set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/his/`, { params });
  }

  getVacunacion(mes: number, anio: number): Observable<any> {
    const params = new HttpParams().set('mes', mes.toString()).set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/vacunacion/`, { params });
  }

  getCRED(mes: number, anio: number): Observable<any> {
    const params = new HttpParams().set('mes', mes.toString()).set('anio', anio.toString());
    return this.http.get(`${this.apiUrl}/cred/`, { params });
  }
}
```

---

## 4. Modelo comun para paginacion
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

        // Redirigir a pagina de upgrade
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

### Ejemplo: Registrar Dosis con Origen de Insumo
```typescript
// src/app/pages/vacunas/registrar-dosis/registrar-dosis.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VacunasService } from '../../../services/vacunas.service';
import { Vacuna, EsquemaDosis, LoteVacuna, OrigenInsumo } from '../../../models/vacuna.model';

@Component({
  selector: 'app-registrar-dosis',
  templateUrl: './registrar-dosis.component.html'
})
export class RegistrarDosisComponent implements OnInit {
  form: FormGroup;
  vacunas: Vacuna[] = [];
  lotes: LoteVacuna[] = [];
  origenInsumo: OrigenInsumo = 'stock_propio';
  esVacunaManual = false;

  constructor(
    private fb: FormBuilder,
    private vacunasService: VacunasService
  ) {
    this.form = this.fb.group({
      paciente: [null, Validators.required],
      vacuna: [null],
      esquema_dosis: [null],
      vacuna_nombre_manual: [''],
      vacuna_laboratorio: [''],
      fecha_aplicacion: ['', Validators.required],
      origen_insumo: ['stock_propio', Validators.required],
      lote_vacuna: [null],
      lote: [''],
      fecha_vencimiento_lote: [null],
      sitio_aplicacion: [''],
      estado_certeza: ['verificado'],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.vacunasService.getCatalogo().subscribe(v => this.vacunas = v);
  }

  onOrigenChange(origen: OrigenInsumo): void {
    this.origenInsumo = origen;
    if (origen === 'stock_propio') {
      // Cargar lotes disponibles de la vacuna seleccionada
      const vacunaId = this.form.get('vacuna')?.value;
      if (vacunaId) {
        this.vacunasService.getLotes(vacunaId).subscribe(l => {
          this.lotes = l.filter(lote => !lote.esta_vencido && lote.stock_actual > 0);
        });
      }
    }
  }

  toggleVacunaManual(): void {
    this.esVacunaManual = !this.esVacunaManual;
    if (this.esVacunaManual) {
      this.form.patchValue({ vacuna: null, esquema_dosis: null });
    } else {
      this.form.patchValue({ vacuna_nombre_manual: '', vacuna_laboratorio: '' });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = new FormData();
      const values = this.form.value;

      // Solo agregar campos con valor
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value as string);
        }
      });

      // Agregar fotos si existen
      const receta = (document.getElementById('foto_receta') as HTMLInputElement)?.files?.[0];
      const envase = (document.getElementById('foto_envase') as HTMLInputElement)?.files?.[0];
      if (receta) formData.append('foto_receta_medica', receta);
      if (envase) formData.append('foto_envase', envase);

      this.vacunasService.registrarDosis(formData).subscribe({
        next: (dosis) => {
          console.log('Dosis registrada:', dosis.nombre_vacuna_display);
          // Navegar al carnet del paciente
        },
        error: (err) => {
          console.error('Error:', err.error);
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
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          switch (error.status) {
            case 400:
              errorMessage = this.parseValidationErrors(error.error);
              break;
            case 401:
              errorMessage = 'Sesion expirada. Por favor inicie sesion nuevamente.';
              break;
            case 403:
              errorMessage = error.error?.detail || 'No tiene permisos para esta accion';
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
    return messages.join('. ') || 'Error de validacion';
  }
}
```

---

## Notas Importantes

1. **Todos los endpoints (excepto login, register y planes) requieren autenticacion**
2. **Las fechas se envian en formato `YYYY-MM-DD`**
3. **Las horas se envian en formato `HH:MM:SS` o `HH:MM`**
4. **Los decimales se envian como strings para evitar problemas de precision**
5. **El backend siempre retorna los datos del usuario autenticado (multi-tenant por FK)**
6. **Para endpoints con archivos (fotos, PDFs), usar `FormData` en vez de JSON**
7. **Los campos `vacuna` y `esquema_dosis` en dosis aplicadas son opcionales - se puede registrar una vacuna manual**
8. **El campo `origen_insumo` determina si se descuenta stock (stock_propio) o no (traido_paciente)**
