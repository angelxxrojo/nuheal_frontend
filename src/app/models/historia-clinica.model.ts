export type TipoParto = 'vaginal' | 'cesarea';
export type GrupoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'ND';

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

export interface HistoriaClinica {
  id: number;
  paciente: {
    id: number;
    nombre_completo: string;
  };
  numero: string;
  fecha_apertura: string;
  peso_nacimiento_gr?: number;
  talla_nacimiento_cm?: string;
  perimetro_cefalico_nacimiento_cm?: string;
  semanas_gestacion?: number;
  tipo_parto?: TipoParto;
  tipo_parto_display?: string;
  apgar_1min?: number;
  apgar_5min?: number;
  antecedentes_personales?: string;
  antecedentes_familiares?: string;
  antecedentes_perinatales?: string;
  alergias?: string;
  grupo_sanguineo?: GrupoSanguineo;
  grupo_sanguineo_display?: string;
  tipo_alimentacion?: string;
  observaciones?: string;
  total_notas: number;
}

export interface HistoriaClinicaCreate {
  peso_nacimiento_gr?: number;
  talla_nacimiento_cm?: number;
  perimetro_cefalico_nacimiento_cm?: number;
  semanas_gestacion?: number;
  tipo_parto?: TipoParto;
  apgar_1min?: number;
  apgar_5min?: number;
  antecedentes_personales?: string;
  antecedentes_familiares?: string;
  antecedentes_perinatales?: string;
  alergias?: string;
  grupo_sanguineo?: GrupoSanguineo;
  tipo_alimentacion?: string;
  observaciones?: string;
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
