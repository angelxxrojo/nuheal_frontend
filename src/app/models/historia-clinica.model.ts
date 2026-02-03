export type TipoParto = 'vaginal' | 'cesarea';
export type GrupoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'ND';

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
  historia_clinica: number;
  cita?: number;
  cita_info?: {
    id: number;
    fecha: string;
    servicio_nombre: string;
  };
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
  saturacion_oxigeno?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  created_at: string;
  enfermera_nombre?: string;
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
  saturacion_oxigeno?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
}
