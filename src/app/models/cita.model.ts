import { Paciente } from './paciente.model';

export type TipoAtencion = 'consultorio' | 'domicilio' | 'teleconsulta';
export type CitaEstado = 'programada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';
export type TipoBloqueo = 'trabajo_principal' | 'trabajo_secundario' | 'personal' | 'vacaciones';

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

// --- Bloqueos de Agenda ---

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

// --- Patrones de Recurrencia ---

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

export interface PatronRecurrenciaCreate {
  bloqueo: number;
  tipo_recurrencia: 'diario' | 'semanal' | 'patron';
  intervalo_dias?: number;
  dias_semana?: number[];
  patron_ciclo?: string[];
  fecha_inicio_recurrencia: string;
  fecha_fin_recurrencia?: string;
}

// --- Lista de Espera ---

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

export interface ListaEsperaCreate {
  paciente: number;
  tipo_servicio: number;
  fecha_deseada: string;
  tipo_atencion?: TipoAtencion;
  notas?: string;
}

// --- Planes de Tratamiento ---

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
