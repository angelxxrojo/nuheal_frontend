import { Especialidad, Sexo } from './common.model';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  foto?: string;
  is_admin: boolean;
}

export interface Enfermera {
  id: number;
  usuario: User;
  numero_colegiatura: string;
  especialidad: Especialidad;
  nombre_consultorio?: string;
  direccion_consultorio?: string;
  telefono_consultorio?: string;
  ruc?: string;
  logo?: string;
  sexo?: Sexo;
  rne?: string;
  imagen_firma_sello?: string;
  plan_actual?: {
    code: string;
    name: string;
  };
  total_pacientes: number;
  created_at: string;
}

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
  especialidad: Especialidad;
  nombre_consultorio?: string;
}

export interface AuthResponse {
  message?: string;
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

export interface RefreshTokenResponse {
  access: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  telefono?: string;
  nombre_consultorio?: string;
  direccion_consultorio?: string;
  telefono_consultorio?: string;
  ruc?: string;
  sexo?: Sexo;
  rne?: string;
}
