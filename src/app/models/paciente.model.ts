import { TipoDocumento, Sexo, Parentesco } from './common.model';

export interface PacienteEdad {
  years: number;
  months: number;
  days: number;
  total_months: number;
}

export interface Responsable {
  id?: number;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  parentesco: Parentesco;
  parentesco_display?: string;
  telefono: string;
  telefono_alternativo?: string;
  email?: string;
  direccion?: string;
  es_principal: boolean;
  puede_autorizar_procedimientos: boolean;
}

export interface Paciente {
  id: number;
  tipo_documento: TipoDocumento;
  tipo_documento_display?: string;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad?: PacienteEdad;
  edad_texto: string;
  es_menor?: boolean;
  sexo: Sexo;
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

export interface PacienteCreate {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  sexo: Sexo;
  lugar_nacimiento?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
}

export interface PacienteStats {
  total: number;
  by_sex: {
    masculino: number;
    femenino: number;
  };
  by_age: Record<string, number>;
}
