export interface PlantillaConsentimiento {
  id: number;
  nombre: string;
  codigo: string;
  contenido?: string;
  contenido_template?: string; // Alias por compatibilidad
  descripcion?: string;
  activo?: boolean;
  is_active?: boolean;
}

export interface Consentimiento {
  id: number;
  paciente: number;
  paciente_nombre?: string;
  cita?: number;
  cita_info?: {
    id: number;
    fecha: string;
    servicio_nombre: string;
  };
  plantilla?: number;
  plantilla_nombre?: string;
  tipo_procedimiento: string;
  contenido: string;
  responsable_nombre: string;
  responsable_dni: string;
  responsable_parentesco: string;
  fecha_firma: string;
  created_at: string;
}

export interface ConsentimientoCreate {
  paciente: number;
  cita?: number;
  plantilla_id?: number;
  tipo_procedimiento: string;
  contenido: string;
  responsable_nombre: string;
  responsable_dni: string;
  responsable_parentesco: string;
}
