import { MetodoPago, CategoriaGasto } from './common.model';

export interface Ingreso {
  id: number;
  cita?: number;
  paciente?: number;
  paciente_nombre?: string;
  fecha: string;
  concepto: string;
  descripcion?: string;
  monto: string;
  metodo_pago: MetodoPago;
  metodo_pago_display?: string;
  numero_recibo?: string;
  created_at?: string;
}

export interface IngresoCreate {
  cita?: number;
  paciente?: number;
  fecha: string;
  concepto: string;
  descripcion?: string;
  monto: string;
  metodo_pago: MetodoPago;
  numero_recibo?: string;
}

export interface Gasto {
  id: number;
  fecha: string;
  categoria: CategoriaGasto;
  categoria_display?: string;
  concepto: string;
  monto: string;
  proveedor?: string;
  numero_documento?: string;
  created_at?: string;
}

export interface GastoCreate {
  fecha: string;
  categoria: CategoriaGasto;
  concepto: string;
  monto: string;
  proveedor?: string;
  numero_documento?: string;
}

export interface ResumenMensual {
  mes: number;
  anio: number;
  total_ingresos: number;
  total_gastos: number;
  balance: number;
  cantidad_ingresos: number;
  cantidad_gastos: number;
  ingresos_por_metodo: Record<MetodoPago, {
    nombre: string;
    total: number;
  }>;
  gastos_por_categoria: Record<CategoriaGasto, {
    nombre: string;
    total: number;
  }>;
}

export interface ResumenAnual {
  anio: number;
  total_ingresos: number;
  total_gastos: number;
  balance: number;
  por_mes: {
    mes: number;
    ingresos: number;
    gastos: number;
    balance: number;
  }[];
}
