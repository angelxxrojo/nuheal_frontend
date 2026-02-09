export type ViaAdministracion = 'IM' | 'SC' | 'ID' | 'VO' | 'IN';
export type OrigenInsumo = 'stock_propio' | 'traido_paciente';
export type EstadoCerteza = 'verificado' | 'declarado' | 'desconocido';

export interface Vacuna {
  id: number;
  codigo: string;
  nombre: string;
  nombre_comercial?: string;
  descripcion?: string;
  enfermedad_previene: string;
  via_administracion: ViaAdministracion;
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

export interface EsquemaNacional {
  vacuna: Vacuna;
  dosis: EsquemaDosis[];
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

export interface PacienteVacunasPendientes {
  paciente: {
    id: number;
    nombre: string;
    edad_texto: string;
  };
  total_vencidas: number;
  total_proximas: number;
  vencidas: {
    vacuna_nombre: string;
    nombre_dosis: string;
  }[];
  proximas: {
    vacuna_nombre: string;
    nombre_dosis: string;
  }[];
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

export interface NoVacunacionCreate {
  paciente: number;
  esquema_dosis: number;
  fecha: string;
  motivo: string;
  detalle?: string;
}

export interface AlertaLote {
  lote: LoteVacuna;
  alertas: ('vencido' | 'por_vencer' | 'stock_bajo')[];
}
