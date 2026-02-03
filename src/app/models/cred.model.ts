import { Paciente } from './paciente.model';
import { Sexo } from './common.model';

export type TipoAlerta = 'verde' | 'amarillo' | 'rojo';

export type DiagnosticoNutricional = 'normal' | 'desnutricion_aguda' | 'desnutricion_cronica' |
  'sobrepeso' | 'obesidad' | 'riesgo_desnutricion' | 'riesgo_sobrepeso' | 'talla_baja' | 'talla_alta';

export interface Alerta {
  tipo: TipoAlerta;
  indicador: string;
  diagnostico: string;
}

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
  diagnostico_peso_edad?: DiagnosticoNutricional;
  diagnostico_peso_edad_display?: string;
  diagnostico_talla_edad?: DiagnosticoNutricional;
  diagnostico_talla_edad_display?: string;
  diagnostico_peso_talla?: DiagnosticoNutricional;
  diagnostico_peso_talla_display?: string;
  tiene_alerta: boolean;
  tipo_alerta: TipoAlerta;
  alertas_activas?: Alerta[];
  desarrollo_motor?: string;
  desarrollo_lenguaje?: string;
  desarrollo_social?: string;
  desarrollo_cognitivo?: string;
  observaciones?: string;
  recomendaciones?: string;
  proxima_cita?: string;
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

export interface CurvaReferencia {
  edad_meses: number;
  p3: number;
  p50: number;
  p97: number;
}

export interface GraficoCRED {
  paciente_id: number;
  paciente_nombre: string;
  paciente_sexo: Sexo;
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

export interface CalculadoraOMSRequest {
  peso_kg: number;
  talla_cm: number;
  edad_meses: number;
  sexo: Sexo;
}

export interface CalculadoraOMSResponse {
  input: {
    peso_kg: number;
    talla_cm: number;
    edad_meses: number;
    sexo: Sexo;
    imc: number;
  };
  zscores: {
    zscore_peso_edad: number;
    zscore_talla_edad: number;
    zscore_imc_edad: number;
    zscore_peso_talla: number | null;
    zscore_pc_edad: number | null;
  };
  diagnosticos: {
    diagnostico_peso_edad: DiagnosticoNutricional;
    diagnostico_peso_edad_display: string;
    diagnostico_talla_edad: DiagnosticoNutricional;
    diagnostico_talla_edad_display: string;
    tiene_alerta: boolean;
    tipo_alerta: TipoAlerta;
  };
}
