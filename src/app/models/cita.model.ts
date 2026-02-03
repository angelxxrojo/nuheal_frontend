import { Paciente } from './paciente.model';

export type CitaEstado = 'programada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';

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

export interface TipoServicioCreate {
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio: string;
  color?: string;
  requiere_consentimiento?: boolean;
  instrucciones_previas?: string;
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

export interface ConfiguracionAgenda {
  id: number;
  hora_inicio: string;
  hora_fin: string;
  dias_laborables: number[];
  intervalo_minutos: number;
  tiempo_entre_citas: number;
  permite_citas_mismo_dia: boolean;
  dias_anticipacion_maxima: number;
}

export interface CitasHoyResponse {
  fecha: string;
  total: number;
  pendientes: number;
  atendidas: number;
  citas: Cita[];
}
