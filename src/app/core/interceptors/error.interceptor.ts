import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error desconocido';

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
            break;
          case 400:
            errorMessage = parseValidationErrors(error.error);
            break;
          case 401:
            errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
            break;
          case 402:
            errorMessage = error.error?.detail || 'Se requiere una suscripción activa.';
            break;
          case 403:
            errorMessage = error.error?.detail || 'No tiene permisos para esta acción.';
            break;
          case 404:
            errorMessage = error.error?.detail || 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intente más tarde.';
            break;
          default:
            errorMessage = error.error?.detail || error.message || 'Error del servidor';
        }
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url
      });

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error.error
      }));
    })
  );
};

function parseValidationErrors(error: ApiErrorResponse): string {
  if (typeof error === 'string') return error;

  if (error.detail) return error.detail;

  const messages: string[] = [];

  for (const key in error) {
    if (Object.prototype.hasOwnProperty.call(error, key)) {
      const value = error[key];
      if (Array.isArray(value)) {
        messages.push(...value.map(v => String(v)));
      } else if (typeof value === 'string') {
        messages.push(value);
      }
    }
  }

  return messages.join('. ') || 'Error de validación';
}
