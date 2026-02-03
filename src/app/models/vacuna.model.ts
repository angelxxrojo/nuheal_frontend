export type ViaAdministracion = 'IM' | 'SC' | 'ID' | 'VO' | 'IN';

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

export interface DosisAplicadaCreate {
  paciente: number;
  vacuna: number;
  esquema_dosis: number;
  fecha_aplicacion: string;
  lote: string;
  fecha_vencimiento_lote?: string;
  sitio_aplicacion?: string;
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
