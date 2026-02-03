export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

export type TipoDocumento = 'dni' | 'ce' | 'pasaporte' | 'otro';

export type Sexo = 'M' | 'F';

export type GrupoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'ND';

export type Parentesco = 'madre' | 'padre' | 'abuelo' | 'tio' | 'hermano' | 'tutor' | 'otro';

export type MetodoPago = 'efectivo' | 'transferencia' | 'yape' | 'plin' | 'tarjeta' | 'otro';

export type CategoriaGasto = 'insumos' | 'alquiler' | 'servicios' | 'equipos' | 'marketing' | 'otro';

export type Especialidad = 'general' | 'pediatrica' | 'comunitaria' | 'geriatrica' | 'uci' | 'otra';
