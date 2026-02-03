# NuHeal API Documentation

## Descripción General

NuHeal es un sistema SaaS para enfermeras independientes en Perú. Permite gestionar consultorios de enfermería con funcionalidades adaptadas a la normativa peruana (Ley 27669).

### Stack Tecnológico
- **Backend:** Django 6.0 + Django REST Framework
- **Autenticación:** JWT (SimpleJWT)
- **Base de datos:** PostgreSQL (prod) / SQLite (dev)

### URL Base
```
Desarrollo: http://localhost:8000/api/
Producción: https://api.nuheal.com/api/
```

---

## Autenticación

El sistema usa JWT (JSON Web Tokens). Todos los endpoints (excepto registro, login y planes) requieren el header:

```
Authorization: Bearer <access_token>
```

### Flujo de autenticación:
1. Registro → Obtiene tokens
2. Login → Obtiene tokens
3. Usar access_token en cada request
4. Cuando expire, usar refresh_token para obtener nuevo access_token

---

## 1. AUTH - Autenticación y Usuarios

### 1.1 Registro de Enfermera
```http
POST /api/auth/register/
```

**Request:**
```json
{
  "email": "maria.garcia@email.com",
  "password": "MiPassword123!",
  "password_confirm": "MiPassword123!",
  "first_name": "María",
  "last_name": "García López",
  "telefono": "987654321",
  "numero_colegiatura": "CEP12345",
  "especialidad": "pediatrica",
  "nombre_consultorio": "Consultorio Pediátrico San Miguel"
}
```

**Especialidades disponibles:**
- `general` - Enfermería General
- `pediatrica` - Enfermería Pediátrica
- `comunitaria` - Enfermería Comunitaria
- `geriatrica` - Enfermería Geriátrica
- `uci` - Cuidados Intensivos
- `otra` - Otra

**Response (201):**
```json
{
  "message": "Registro exitoso",
  "user": {
    "id": 1,
    "email": "maria.garcia@email.com",
    "nombre": "María García López"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

> **Nota:** Al registrarse, automáticamente se asigna el plan **Freemium**.

---

### 1.2 Login
```http
POST /api/auth/login/
```

**Request:**
```json
{
  "email": "maria.garcia@email.com",
  "password": "MiPassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "maria.garcia@email.com",
    "nombre": "María García López"
  },
  "enfermera": {
    "id": 1,
    "usuario": {
      "id": 1,
      "email": "maria.garcia@email.com",
      "first_name": "María",
      "last_name": "García López",
      "telefono": "987654321"
    },
    "numero_colegiatura": "CEP12345",
    "especialidad": "pediatrica",
    "nombre_consultorio": "Consultorio Pediátrico San Miguel",
    "plan_actual": {
      "code": "freemium",
      "name": "Freemium"
    },
    "total_pacientes": 0
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

### 1.3 Refresh Token
```http
POST /api/auth/refresh/
```

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### 1.4 Obtener Perfil
```http
GET /api/auth/me/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "usuario": {
    "id": 1,
    "email": "maria.garcia@email.com",
    "first_name": "María",
    "last_name": "García López",
    "telefono": "987654321",
    "foto": null
  },
  "numero_colegiatura": "CEP12345",
  "especialidad": "pediatrica",
  "nombre_consultorio": "Consultorio Pediátrico San Miguel",
  "direccion_consultorio": "Av. La Marina 123, San Miguel",
  "telefono_consultorio": "014567890",
  "ruc": "10123456789",
  "logo": null,
  "plan_actual": {
    "code": "freemium",
    "name": "Freemium"
  },
  "total_pacientes": 5,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 1.5 Actualizar Perfil
```http
PATCH /api/auth/me/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "first_name": "María Elena",
  "telefono": "999888777",
  "nombre_consultorio": "Centro de Enfermería Pediátrica",
  "direccion_consultorio": "Av. Javier Prado 456, San Isidro",
  "ruc": "10123456789"
}
```

---

### 1.6 Cambiar Contraseña
```http
POST /api/auth/change-password/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "old_password": "MiPassword123!",
  "new_password": "NuevoPassword456!",
  "new_password_confirm": "NuevoPassword456!"
}
```

---

### 1.7 Logout
```http
POST /api/auth/logout/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## 2. SUBSCRIPTIONS - Planes y Suscripciones

### 2.1 Listar Planes Disponibles
```http
GET /api/subscriptions/plans/
```
> No requiere autenticación

**Response (200):**
```json
[
  {
    "id": 1,
    "code": "freemium",
    "name": "Freemium",
    "description": "Plan gratuito con funcionalidades básicas",
    "price_monthly": "0.00",
    "price_yearly": "0.00",
    "is_recommended": false,
    "features": [
      {
        "code": "max_patients",
        "name": "Máximo de pacientes",
        "is_enabled": true,
        "limit": 10,
        "unlimited": false
      },
      {
        "code": "custom_services",
        "name": "Servicios personalizados",
        "is_enabled": true,
        "limit": 3,
        "unlimited": false
      },
      {
        "code": "whatsapp_reminders",
        "name": "Recordatorios WhatsApp",
        "is_enabled": false
      },
      {
        "code": "pdf_consent",
        "name": "Consentimientos PDF",
        "is_enabled": false
      },
      {
        "code": "cred_graphs",
        "name": "Gráficos CRED",
        "is_enabled": true
      },
      {
        "code": "vaccination_calendar",
        "name": "Calendario de vacunas",
        "is_enabled": true
      }
    ]
  },
  {
    "id": 2,
    "code": "initial",
    "name": "Initial",
    "description": "Plan ideal para enfermeras que inician su consultorio",
    "price_monthly": "29.90",
    "price_yearly": "299.00",
    "is_recommended": true,
    "features": [
      {
        "code": "max_patients",
        "name": "Máximo de pacientes",
        "is_enabled": true,
        "limit": 50,
        "unlimited": false
      },
      {
        "code": "whatsapp_reminders",
        "name": "Recordatorios WhatsApp",
        "is_enabled": true
      }
    ]
  },
  {
    "id": 3,
    "code": "pro",
    "name": "Pro",
    "description": "Plan completo para consultorios establecidos",
    "price_monthly": "59.90",
    "price_yearly": "599.00",
    "is_recommended": false,
    "features": [
      {
        "code": "max_patients",
        "name": "Máximo de pacientes",
        "is_enabled": true,
        "limit": null,
        "unlimited": true
      },
      {
        "code": "reports_his",
        "name": "Reportes HIS",
        "is_enabled": true
      }
    ]
  }
]
```

---

### 2.2 Mi Suscripción Actual
```http
GET /api/subscriptions/my-subscription/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "plan": {
    "id": 1,
    "code": "freemium",
    "name": "Freemium",
    "price_monthly": "0.00"
  },
  "status": "active",
  "start_date": "2024-01-15",
  "end_date": null,
  "is_valid": true,
  "usage_stats": {
    "max_patients": {
      "name": "Máximo de pacientes",
      "current": 5,
      "limit": 10,
      "unlimited": false,
      "percentage": 50.0
    },
    "custom_services": {
      "name": "Servicios personalizados",
      "current": 2,
      "limit": 3,
      "unlimited": false,
      "percentage": 66.67
    }
  }
}
```

---

### 2.3 Verificar Feature Disponible
```http
GET /api/subscriptions/check-feature/whatsapp_reminders/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "feature_code": "whatsapp_reminders",
  "has_feature": false,
  "limit": null,
  "unlimited": false,
  "within_limit": true
}
```

---

### 2.4 Estadísticas de Uso
```http
GET /api/subscriptions/usage/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "max_patients": {
    "name": "Máximo de pacientes",
    "current": 5,
    "limit": 10,
    "unlimited": false,
    "percentage": 50.0
  },
  "custom_services": {
    "name": "Servicios personalizados",
    "current": 2,
    "limit": 3,
    "unlimited": false,
    "percentage": 66.67
  }
}
```

---

### 2.5 Cambiar Plan (Upgrade)
```http
POST /api/subscriptions/upgrade/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "plan_code": "initial",
  "payment_period": "monthly"
}
```

**Response (200):**
```json
{
  "message": "Plan actualizado a Initial",
  "subscription": {
    "id": 1,
    "plan": {
      "code": "initial",
      "name": "Initial"
    },
    "status": "active"
  }
}
```

---

## 3. PACIENTES

### 3.1 Listar Pacientes
```http
GET /api/pacientes/
Authorization: Bearer <token>
```

**Query params:**
- `search` - Buscar por nombre o DNI
- `sexo` - Filtrar por sexo (M/F)
- `page` - Página (default: 1)
- `page_size` - Tamaño de página (default: 20, max: 100)

**Ejemplo:**
```http
GET /api/pacientes/?search=garcia&sexo=M&page=1
```

**Response (200):**
```json
{
  "count": 25,
  "total_pages": 2,
  "current_page": 1,
  "next": "http://localhost:8000/api/pacientes/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "numero_documento": "12345678",
      "nombre_completo": "García López, Juan Carlos",
      "fecha_nacimiento": "2022-06-15",
      "edad_texto": "1 año, 7 meses",
      "sexo": "M",
      "sexo_display": "Masculino",
      "telefono": "987654321",
      "is_active": true
    }
  ]
}
```

---

### 3.2 Crear Paciente
```http
POST /api/pacientes/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "tipo_documento": "dni",
  "numero_documento": "12345678",
  "nombres": "Juan Carlos",
  "apellido_paterno": "García",
  "apellido_materno": "López",
  "fecha_nacimiento": "2022-06-15",
  "sexo": "M",
  "lugar_nacimiento": "Lima",
  "direccion": "Av. Arequipa 123, Lince",
  "distrito": "Lince",
  "provincia": "Lima",
  "departamento": "Lima",
  "telefono": "987654321",
  "email": "padres@email.com",
  "observaciones": "Paciente referido por pediatra"
}
```

**Tipos de documento:**
- `dni` - DNI
- `ce` - Carnet de Extranjería
- `pasaporte` - Pasaporte
- `otro` - Otro

**Response (201):**
```json
{
  "id": 1,
  "tipo_documento": "dni",
  "tipo_documento_display": "DNI",
  "numero_documento": "12345678",
  "nombres": "Juan Carlos",
  "apellido_paterno": "García",
  "apellido_materno": "López",
  "nombre_completo": "García López, Juan Carlos",
  "fecha_nacimiento": "2022-06-15",
  "edad": {
    "years": 1,
    "months": 7,
    "days": 15,
    "total_months": 19
  },
  "edad_texto": "1 año, 7 meses",
  "es_menor": true,
  "sexo": "M",
  "sexo_display": "Masculino",
  "responsables": [],
  "responsable_principal": null,
  "is_active": true,
  "created_at": "2024-01-20T14:30:00Z"
}
```

---

### 3.3 Obtener Detalle de Paciente
```http
GET /api/pacientes/1/
Authorization: Bearer <token>
```

---

### 3.4 Actualizar Paciente
```http
PATCH /api/pacientes/1/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "telefono": "999888777",
  "direccion": "Nueva dirección 456"
}
```

---

### 3.5 Eliminar Paciente (Soft Delete)
```http
DELETE /api/pacientes/1/
Authorization: Bearer <token>
```

> Marca `is_active = false`, no elimina físicamente.

---

### 3.6 Agregar Responsable a Paciente
```http
POST /api/pacientes/1/responsables/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "tipo_documento": "dni",
  "numero_documento": "87654321",
  "nombres": "Ana María",
  "apellidos": "López Rodríguez",
  "parentesco": "madre",
  "telefono": "987654321",
  "telefono_alternativo": "999888777",
  "email": "ana.lopez@email.com",
  "direccion": "Av. Arequipa 123",
  "es_principal": true,
  "puede_autorizar_procedimientos": true
}
```

**Parentescos disponibles:**
- `madre` - Madre
- `padre` - Padre
- `abuelo` - Abuelo(a)
- `tio` - Tío(a)
- `hermano` - Hermano(a)
- `tutor` - Tutor legal
- `otro` - Otro

---

### 3.7 Listar Responsables de Paciente
```http
GET /api/pacientes/1/responsables/
Authorization: Bearer <token>
```

---

### 3.8 Estadísticas de Pacientes
```http
GET /api/pacientes/stats/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "total": 25,
  "by_sex": {
    "masculino": 12,
    "femenino": 13
  },
  "by_age": {
    "0-11_meses": 5,
    "1-2_anios": 8,
    "2-5_anios": 7,
    "5-18_anios": 3,
    "adultos": 2
  }
}
```

---

## 4. AGENDA

### 4.1 Configuración de Agenda

#### Obtener configuración
```http
GET /api/agenda/configuracion/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "hora_inicio": "08:00:00",
  "hora_fin": "18:00:00",
  "dias_laborables": [1, 2, 3, 4, 5],
  "intervalo_minutos": 15,
  "tiempo_entre_citas": 0,
  "permite_citas_mismo_dia": true,
  "dias_anticipacion_maxima": 30
}
```

> **Días:** 1=Lunes, 2=Martes, ... 7=Domingo

#### Actualizar configuración
```http
PATCH /api/agenda/configuracion/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "hora_inicio": "09:00:00",
  "hora_fin": "19:00:00",
  "dias_laborables": [1, 2, 3, 4, 5, 6],
  "intervalo_minutos": 30
}
```

---

### 4.2 Tipos de Servicio

#### Listar servicios
```http
GET /api/agenda/servicios/
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Control CRED",
    "descripcion": "Control de Crecimiento y Desarrollo",
    "duracion_minutos": 45,
    "precio": "50.00",
    "color": "#10B981",
    "requiere_consentimiento": false,
    "instrucciones_previas": "Traer carnet de vacunación y DNI del niño",
    "orden": 1,
    "is_active": true
  },
  {
    "id": 2,
    "nombre": "Vacunación",
    "descripcion": "Aplicación de vacunas del esquema nacional",
    "duracion_minutos": 15,
    "precio": "30.00",
    "color": "#3B82F6",
    "requiere_consentimiento": true,
    "instrucciones_previas": "Traer carnet de vacunación",
    "orden": 2,
    "is_active": true
  },
  {
    "id": 3,
    "nombre": "Curación",
    "descripcion": "Curación de heridas",
    "duracion_minutos": 30,
    "precio": "40.00",
    "color": "#EF4444",
    "requiere_consentimiento": true,
    "orden": 3,
    "is_active": true
  }
]
```

#### Crear servicio
```http
POST /api/agenda/servicios/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "Estimulación Temprana",
  "descripcion": "Sesión de estimulación temprana para niños de 0-3 años",
  "duracion_minutos": 60,
  "precio": "80.00",
  "color": "#8B5CF6",
  "requiere_consentimiento": false,
  "instrucciones_previas": "Traer ropa cómoda para el niño"
}
```

---

### 4.3 Citas

#### Listar citas
```http
GET /api/agenda/citas/
Authorization: Bearer <token>
```

**Query params:**
- `fecha` - Fecha específica (YYYY-MM-DD)
- `fecha_inicio` - Desde fecha
- `fecha_fin` - Hasta fecha
- `estado` - programada, confirmada, atendida, cancelada, no_asistio
- `paciente` - ID del paciente

**Ejemplo:**
```http
GET /api/agenda/citas/?fecha=2024-01-25
GET /api/agenda/citas/?fecha_inicio=2024-01-01&fecha_fin=2024-01-31&estado=atendida
```

**Response (200):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "paciente": 1,
      "paciente_nombre": "García López, Juan Carlos",
      "tipo_servicio": 1,
      "servicio_nombre": "Control CRED",
      "servicio_color": "#10B981",
      "fecha": "2024-01-25",
      "hora_inicio": "09:00:00",
      "hora_fin": "09:45:00",
      "estado": "programada",
      "estado_display": "Programada",
      "recordatorio_enviado": false
    },
    {
      "id": 2,
      "paciente": 2,
      "paciente_nombre": "Rodríguez Sánchez, María",
      "tipo_servicio": 2,
      "servicio_nombre": "Vacunación",
      "servicio_color": "#3B82F6",
      "fecha": "2024-01-25",
      "hora_inicio": "10:00:00",
      "hora_fin": "10:15:00",
      "estado": "confirmada",
      "estado_display": "Confirmada",
      "recordatorio_enviado": true
    }
  ]
}
```

---

#### Crear cita
```http
POST /api/agenda/citas/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "paciente": 1,
  "tipo_servicio": 1,
  "fecha": "2024-01-25",
  "hora_inicio": "09:00:00",
  "notas": "Control de los 18 meses"
}
```

> La `hora_fin` se calcula automáticamente según la duración del servicio.

**Response (201):**
```json
{
  "id": 1,
  "paciente": {
    "id": 1,
    "nombre_completo": "García López, Juan Carlos",
    "edad_texto": "1 año, 7 meses"
  },
  "tipo_servicio": {
    "id": 1,
    "nombre": "Control CRED",
    "duracion_minutos": 45,
    "precio": "50.00"
  },
  "fecha": "2024-01-25",
  "hora_inicio": "09:00:00",
  "hora_fin": "09:45:00",
  "estado": "programada",
  "notas": "Control de los 18 meses"
}
```

---

#### Acciones sobre citas

**Confirmar cita:**
```http
POST /api/agenda/citas/1/confirmar/
Authorization: Bearer <token>
```

**Cancelar cita:**
```http
POST /api/agenda/citas/1/cancelar/
Authorization: Bearer <token>
```
```json
{
  "motivo": "Paciente reprogramó"
}
```

**Marcar como atendida:**
```http
POST /api/agenda/citas/1/atender/
Authorization: Bearer <token>
```

**Marcar como no asistió:**
```http
POST /api/agenda/citas/1/no-asistio/
Authorization: Bearer <token>
```

---

### 4.4 Disponibilidad

```http
GET /api/agenda/disponibilidad/?fecha=2024-01-25&tipo_servicio=1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "fecha": "2024-01-25",
  "laborable": true,
  "slots": [
    {"hora": "08:00", "disponible": true},
    {"hora": "08:15", "disponible": true},
    {"hora": "08:30", "disponible": true},
    {"hora": "08:45", "disponible": true},
    {"hora": "09:00", "disponible": false},
    {"hora": "09:15", "disponible": false},
    {"hora": "09:30", "disponible": false},
    {"hora": "09:45", "disponible": true},
    {"hora": "10:00", "disponible": false}
  ]
}
```

---

### 4.5 Citas de Hoy
```http
GET /api/agenda/citas-hoy/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "fecha": "2024-01-25",
  "total": 8,
  "pendientes": 5,
  "atendidas": 3,
  "citas": [
    {
      "id": 1,
      "paciente_nombre": "García López, Juan Carlos",
      "servicio_nombre": "Control CRED",
      "hora_inicio": "09:00:00",
      "estado": "atendida"
    }
  ]
}
```

---

### 4.6 Próximas Citas (7 días)
```http
GET /api/agenda/proximas/
Authorization: Bearer <token>
```

---

## 5. HISTORIA CLÍNICA

### 5.1 Crear Historia Clínica para Paciente
```http
POST /api/pacientes/1/historia/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "peso_nacimiento_gr": 3200,
  "talla_nacimiento_cm": 50.5,
  "perimetro_cefalico_nacimiento_cm": 34.0,
  "semanas_gestacion": 39,
  "tipo_parto": "vaginal",
  "apgar_1min": 8,
  "apgar_5min": 9,
  "antecedentes_personales": "Ninguno relevante",
  "antecedentes_familiares": "Padre asmático",
  "antecedentes_perinatales": "Embarazo sin complicaciones",
  "alergias": "Ninguna conocida",
  "grupo_sanguineo": "O+",
  "tipo_alimentacion": "Lactancia materna exclusiva",
  "observaciones": ""
}
```

**Grupos sanguíneos:**
- `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `ND` (No determinado)

---

### 5.2 Obtener Historia Clínica
```http
GET /api/pacientes/1/historia/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "paciente": {
    "id": 1,
    "nombre_completo": "García López, Juan Carlos"
  },
  "numero": "HC2024-00001",
  "fecha_apertura": "2024-01-20",
  "peso_nacimiento_gr": 3200,
  "talla_nacimiento_cm": "50.50",
  "semanas_gestacion": 39,
  "tipo_parto": "vaginal",
  "apgar_1min": 8,
  "apgar_5min": 9,
  "antecedentes_personales": "Ninguno relevante",
  "antecedentes_familiares": "Padre asmático",
  "alergias": "Ninguna conocida",
  "grupo_sanguineo": "O+",
  "grupo_sanguineo_display": "O+",
  "total_notas": 3
}
```

---

### 5.3 Crear Nota SOAPIE
```http
POST /api/pacientes/1/historia/notas/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "cita": 1,
  "fecha": "2024-01-25T10:30:00Z",
  "subjetivo": "Madre refiere que el niño come bien, duerme normal. No presenta fiebre ni otros síntomas.",
  "objetivo": "Paciente activo, reactivo. Piel y mucosas hidratadas. No presenta signos de alarma.",
  "analisis": "Niño sano en control de crecimiento y desarrollo adecuado para su edad.",
  "planificacion": "Continuar con lactancia materna. Iniciar alimentación complementaria según indicaciones.",
  "intervencion": "Se realiza control de peso y talla. Se brinda consejería nutricional a la madre.",
  "evaluacion": "Madre comprende indicaciones. Se programa próximo control.",
  "temperatura": 36.5,
  "frecuencia_cardiaca": 100,
  "frecuencia_respiratoria": 28,
  "saturacion_oxigeno": 98
}
```

---

### 5.4 Listar Notas SOAPIE
```http
GET /api/pacientes/1/historia/notas/
Authorization: Bearer <token>
```

---

## 6. CRED - Control de Crecimiento y Desarrollo

### 6.1 Crear Control CRED
```http
POST /api/cred/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "paciente": 1,
  "cita": 1,
  "fecha": "2024-01-25",
  "peso_kg": 10.500,
  "talla_cm": 78.5,
  "perimetro_cefalico_cm": 46.0,
  "desarrollo_motor": "Camina solo, sube escaleras con ayuda",
  "desarrollo_lenguaje": "Dice 10 palabras aproximadamente",
  "desarrollo_social": "Interactúa con otros niños, imita actividades",
  "desarrollo_cognitivo": "Reconoce objetos, sigue instrucciones simples",
  "observaciones": "Buen estado general"
}
```

**Response (201):**
```json
{
  "id": 1,
  "paciente": {
    "id": 1,
    "nombre_completo": "García López, Juan Carlos",
    "edad_texto": "1 año, 7 meses"
  },
  "fecha": "2024-01-25",
  "edad_meses": 19,
  "edad_dias": 589,
  "peso_kg": "10.500",
  "talla_cm": "78.5",
  "perimetro_cefalico_cm": "46.0",
  "imc": "17.03",
  "zscore_peso_edad": "0.25",
  "zscore_talla_edad": "-0.15",
  "zscore_imc_edad": "0.45",
  "diagnostico_peso_edad": "normal",
  "diagnostico_peso_edad_display": "Normal",
  "diagnostico_talla_edad": "normal",
  "diagnostico_talla_edad_display": "Normal",
  "tiene_alerta": false,
  "tipo_alerta": "verde",
  "alertas_activas": [],
  "recomendaciones": "Continuar con controles CRED según calendario.\nContinuar con alimentación complementaria adecuada."
}
```

> **Los Z-scores y diagnósticos se calculan automáticamente** usando las tablas de la OMS.

---

### 6.2 Listar Controles CRED
```http
GET /api/cred/?paciente=1
Authorization: Bearer <token>
```

---

### 6.3 Gráfico de Crecimiento
```http
GET /api/cred/paciente/1/grafico/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "paciente_id": 1,
  "paciente_nombre": "García López, Juan Carlos",
  "paciente_sexo": "M",
  "controles": [
    {
      "fecha": "2023-06-15",
      "edad_meses": 0,
      "peso_kg": "3.200",
      "talla_cm": "50.5",
      "zscore_peso_edad": "0.10",
      "zscore_talla_edad": "0.05"
    },
    {
      "fecha": "2023-08-15",
      "edad_meses": 2,
      "peso_kg": "5.100",
      "talla_cm": "57.0",
      "zscore_peso_edad": "-0.20",
      "zscore_talla_edad": "-0.10"
    },
    {
      "fecha": "2024-01-25",
      "edad_meses": 19,
      "peso_kg": "10.500",
      "talla_cm": "78.5",
      "zscore_peso_edad": "0.25",
      "zscore_talla_edad": "-0.15"
    }
  ],
  "curvas_referencia": {
    "peso_edad": [
      {"edad_meses": 0, "p3": 2.5, "p50": 3.35, "p97": 4.3},
      {"edad_meses": 6, "p3": 6.0, "p50": 7.93, "p97": 10.0},
      {"edad_meses": 12, "p3": 7.5, "p50": 9.65, "p97": 12.0}
    ],
    "talla_edad": [
      {"edad_meses": 0, "p3": 46.1, "p50": 49.9, "p97": 53.7},
      {"edad_meses": 6, "p3": 63.3, "p50": 67.6, "p97": 72.0},
      {"edad_meses": 12, "p3": 71.0, "p50": 75.7, "p97": 80.5}
    ]
  }
}
```

---

### 6.4 Alertas Nutricionales
```http
GET /api/cred/alertas/
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 5,
    "paciente": 3,
    "paciente_nombre": "Pérez Silva, Ana",
    "fecha": "2024-01-20",
    "edad_meses": 8,
    "peso_kg": "6.200",
    "talla_cm": "65.0",
    "tiene_alerta": true,
    "tipo_alerta": "amarillo"
  }
]
```

---

### 6.5 Calculadora OMS (sin guardar)
```http
POST /api/cred/calculadora/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "peso_kg": 10.5,
  "talla_cm": 78.5,
  "edad_meses": 19,
  "sexo": "M"
}
```

**Response (200):**
```json
{
  "input": {
    "peso_kg": 10.5,
    "talla_cm": 78.5,
    "edad_meses": 19,
    "sexo": "M",
    "imc": 17.03
  },
  "zscores": {
    "zscore_peso_edad": 0.25,
    "zscore_talla_edad": -0.15,
    "zscore_imc_edad": 0.45,
    "zscore_peso_talla": null,
    "zscore_pc_edad": null
  },
  "diagnosticos": {
    "diagnostico_peso_edad": "normal",
    "diagnostico_peso_edad_display": "Normal",
    "diagnostico_talla_edad": "normal",
    "diagnostico_talla_edad_display": "Normal",
    "tiene_alerta": false,
    "tipo_alerta": "verde"
  }
}
```

---

## 7. VACUNAS

### 7.1 Catálogo de Vacunas
```http
GET /api/vacunas/catalogo/
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "codigo": "BCG",
    "nombre": "BCG",
    "nombre_comercial": "BCG",
    "descripcion": "Vacuna contra la tuberculosis",
    "enfermedad_previene": "Tuberculosis (formas graves)",
    "via_administracion": "ID",
    "via_administracion_display": "Intradérmica",
    "dosis_ml": "0.10",
    "sitio_aplicacion": "Región deltoidea del brazo derecho"
  },
  {
    "id": 3,
    "codigo": "PENTA",
    "nombre": "Pentavalente",
    "descripcion": "Vacuna combinada pentavalente",
    "enfermedad_previene": "Difteria, Tétanos, Tos ferina, Hepatitis B, Haemophilus influenzae tipo b",
    "via_administracion": "IM",
    "dosis_ml": "0.50"
  }
]
```

---

### 7.2 Esquema Nacional de Vacunación
```http
GET /api/vacunas/esquema-nacional/
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "vacuna": {
      "id": 1,
      "codigo": "BCG",
      "nombre": "BCG"
    },
    "dosis": [
      {
        "id": 1,
        "numero_dosis": 1,
        "nombre_dosis": "Dosis única",
        "edad_meses_minima": 0,
        "edad_meses_ideal": 0,
        "edad_meses_maxima": null,
        "es_refuerzo": false
      }
    ]
  },
  {
    "vacuna": {
      "id": 3,
      "codigo": "PENTA",
      "nombre": "Pentavalente"
    },
    "dosis": [
      {
        "id": 3,
        "numero_dosis": 1,
        "nombre_dosis": "1ra dosis",
        "edad_meses_minima": 2,
        "edad_meses_ideal": 2,
        "edad_meses_maxima": 12
      },
      {
        "id": 4,
        "numero_dosis": 2,
        "nombre_dosis": "2da dosis",
        "edad_meses_minima": 4,
        "edad_meses_ideal": 4,
        "edad_meses_maxima": 12
      },
      {
        "id": 5,
        "numero_dosis": 3,
        "nombre_dosis": "3ra dosis",
        "edad_meses_minima": 6,
        "edad_meses_ideal": 6,
        "edad_meses_maxima": 12
      }
    ]
  }
]
```

---

### 7.3 Carnet de Vacunación de Paciente
```http
GET /api/vacunas/carnet/1/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "paciente": {
    "id": 1,
    "nombre": "García López, Juan Carlos",
    "fecha_nacimiento": "2022-06-15",
    "edad_meses": 19,
    "edad_texto": "1 año, 7 meses"
  },
  "dosis_aplicadas": [
    {
      "id": 1,
      "vacuna": {
        "id": 1,
        "codigo": "BCG",
        "nombre": "BCG"
      },
      "esquema_dosis": {
        "id": 1,
        "nombre_dosis": "Dosis única"
      },
      "fecha_aplicacion": "2022-06-16",
      "lote": "BCG2022A",
      "sitio_aplicacion": "Brazo derecho",
      "edad_aplicacion_meses": 0,
      "aplicada_a_tiempo": true
    }
  ],
  "dosis_pendientes": [
    {
      "id": 14,
      "vacuna_nombre": "SPR (Sarampión, Paperas, Rubéola)",
      "vacuna_codigo": "SPR",
      "numero_dosis": 2,
      "nombre_dosis": "2da dosis (Refuerzo)",
      "edad_meses_minima": 18,
      "edad_meses_ideal": 18
    }
  ],
  "dosis_vencidas": [],
  "proximas_dosis": [
    {
      "id": 14,
      "vacuna_nombre": "SPR",
      "nombre_dosis": "2da dosis (Refuerzo)",
      "edad_meses_ideal": 18
    }
  ],
  "resumen": {
    "paciente_id": 1,
    "total_aplicadas": 12,
    "total_pendientes": 3,
    "total_vencidas": 0,
    "tiene_vacunas_pendientes_urgentes": true
  }
}
```

---

### 7.4 Registrar Dosis Aplicada
```http
POST /api/vacunas/dosis-aplicadas/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "paciente": 1,
  "vacuna": 7,
  "esquema_dosis": 14,
  "fecha_aplicacion": "2024-01-25",
  "lote": "SPR2024A",
  "fecha_vencimiento_lote": "2025-06-30",
  "sitio_aplicacion": "Brazo izquierdo",
  "observaciones": "Sin reacciones inmediatas"
}
```

---

### 7.5 Pacientes con Vacunas Pendientes
```http
GET /api/vacunas/pacientes-pendientes/
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "paciente": {
      "id": 3,
      "nombre": "Pérez Silva, Ana",
      "edad_texto": "8 meses"
    },
    "total_vencidas": 2,
    "total_proximas": 3,
    "vencidas": [
      {
        "vacuna_nombre": "Rotavirus",
        "nombre_dosis": "2da dosis"
      }
    ],
    "proximas": [
      {
        "vacuna_nombre": "Pentavalente",
        "nombre_dosis": "3ra dosis"
      }
    ]
  }
]
```

---

## 8. DOCUMENTOS

### 8.1 Plantillas de Consentimiento
```http
GET /api/documentos/plantillas/
Authorization: Bearer <token>
```

---

### 8.2 Crear Consentimiento Informado
```http
POST /api/documentos/consentimientos/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "paciente": 1,
  "cita": 2,
  "plantilla_id": 1,
  "tipo_procedimiento": "Aplicación de vacuna SPR",
  "contenido": "Yo, Ana María López Rodríguez, identificada con DNI 87654321, en mi calidad de madre del menor Juan Carlos García López, autorizo la aplicación de la vacuna SPR...",
  "responsable_nombre": "Ana María López Rodríguez",
  "responsable_dni": "87654321",
  "responsable_parentesco": "Madre"
}
```

---

### 8.3 Descargar PDF
```http
GET /api/documentos/consentimientos/1/pdf/
Authorization: Bearer <token>
```

---

## 9. FACTURACIÓN

### 9.1 Registrar Ingreso
```http
POST /api/facturacion/ingresos/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "cita": 1,
  "paciente": 1,
  "fecha": "2024-01-25",
  "concepto": "Control CRED",
  "descripcion": "Control de crecimiento y desarrollo - 18 meses",
  "monto": "50.00",
  "metodo_pago": "efectivo",
  "numero_recibo": "001-0001"
}
```

**Métodos de pago:**
- `efectivo` - Efectivo
- `transferencia` - Transferencia bancaria
- `yape` - Yape
- `plin` - Plin
- `tarjeta` - Tarjeta
- `otro` - Otro

---

### 9.2 Listar Ingresos
```http
GET /api/facturacion/ingresos/?mes=1&anio=2024
Authorization: Bearer <token>
```

---

### 9.3 Registrar Gasto
```http
POST /api/facturacion/gastos/
Authorization: Bearer <token>
```

**Request:**
```json
{
  "fecha": "2024-01-20",
  "categoria": "insumos",
  "concepto": "Compra de jeringas y algodón",
  "monto": "150.00",
  "proveedor": "Farmacia San José",
  "numero_documento": "F001-12345"
}
```

**Categorías:**
- `insumos` - Insumos médicos
- `alquiler` - Alquiler
- `servicios` - Servicios (luz, agua, internet)
- `equipos` - Equipos
- `marketing` - Marketing/Publicidad
- `otro` - Otro

---

### 9.4 Resumen Mensual
```http
GET /api/facturacion/resumen/?mes=1&anio=2024
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mes": 1,
  "anio": 2024,
  "total_ingresos": 2500.00,
  "total_gastos": 450.00,
  "balance": 2050.00,
  "cantidad_ingresos": 50,
  "cantidad_gastos": 5,
  "ingresos_por_metodo": {
    "efectivo": {"nombre": "Efectivo", "total": 1500.00},
    "yape": {"nombre": "Yape", "total": 800.00},
    "transferencia": {"nombre": "Transferencia bancaria", "total": 200.00}
  },
  "gastos_por_categoria": {
    "insumos": {"nombre": "Insumos médicos", "total": 300.00},
    "servicios": {"nombre": "Servicios", "total": 150.00}
  }
}
```

---

### 9.5 Resumen Anual
```http
GET /api/facturacion/resumen-anual/?anio=2024
Authorization: Bearer <token>
```

---

## 10. REPORTES

### 10.1 Dashboard Principal
```http
GET /api/reportes/dashboard/
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "total_pacientes": 45,
  "citas_hoy": {
    "total": 8,
    "pendientes": 3,
    "atendidas": 5
  },
  "atenciones_mes": 120,
  "alertas_nutricionales": 3,
  "pacientes_vacunas_pendientes": 7
}
```

---

### 10.2 Reporte de Producción
```http
GET /api/reportes/produccion/?fecha_inicio=2024-01-01&fecha_fin=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "periodo": {
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2024-01-31"
  },
  "total_atenciones": 120,
  "por_servicio": [
    {"tipo_servicio__nombre": "Control CRED", "total": 45},
    {"tipo_servicio__nombre": "Vacunación", "total": 35},
    {"tipo_servicio__nombre": "Curación", "total": 25},
    {"tipo_servicio__nombre": "Estimulación Temprana", "total": 15}
  ],
  "por_sexo": {
    "M": 58,
    "F": 62
  },
  "por_edad": {
    "0-11_meses": 25,
    "1-4a": 50,
    "2-5_anios": 30,
    "5-18_anios": 10,
    "adultos": 5
  }
}
```

---

### 10.3 Reporte HIS (MINSA)
```http
GET /api/reportes/his/?mes=1&anio=2024
Authorization: Bearer <token>
```

> **Requiere feature:** `reports_his` (Plan Pro)

**Response (200):**
```json
{
  "establecimiento": "Consultorio Pediátrico San Miguel",
  "profesional": "María García López",
  "cep": "CEP12345",
  "periodo": "01/2024",
  "resumen": {
    "total_atenciones": 120,
    "controles_cred": 45,
    "vacunas_aplicadas": 85
  },
  "registros": [
    {
      "fecha": "15/01/2024",
      "historia_clinica": "HC2024-00001",
      "dni": "12345678",
      "apellidos_nombres": "García López, Juan Carlos",
      "sexo": "M",
      "edad": "1 año, 7 meses",
      "diagnostico": "Control CRED",
      "tipo": "C"
    }
  ]
}
```

---

### 10.4 Reporte de Vacunación
```http
GET /api/reportes/vacunacion/?mes=1&anio=2024
Authorization: Bearer <token>
```

---

### 10.5 Reporte CRED
```http
GET /api/reportes/cred/?mes=1&anio=2024
Authorization: Bearer <token>
```

---

## Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos / Feature no disponible |
| 404 | Not Found - Recurso no encontrado |
| 402 | Payment Required - Suscripción requerida |

### Ejemplos de respuestas de error:

**Feature no disponible (403):**
```json
{
  "detail": "La funcionalidad \"whatsapp_reminders\" no está disponible en tu plan actual."
}
```

**Límite excedido (403):**
```json
{
  "detail": "Has alcanzado el límite de max_patients: 10/10. Actualiza tu plan para continuar."
}
```

**Validación fallida (400):**
```json
{
  "numero_documento": ["Ya existe un paciente con este documento."],
  "fecha": ["No se pueden agendar citas en fechas pasadas."]
}
```

---

## Flujos Principales para Angular

### 1. Flujo de Autenticación
```
1. Usuario ingresa email/password
2. POST /api/auth/login/ → Guardar tokens
3. Guardar access_token en localStorage o sessionStorage
4. Agregar interceptor HTTP para incluir Authorization header
5. Si 401, intentar refresh con POST /api/auth/refresh/
6. Si refresh falla, redirigir a login
```

### 2. Flujo de Registro
```
1. Usuario llena formulario de registro
2. POST /api/auth/register/
3. Guardar tokens y redirigir a dashboard
4. Usuario inicia con plan Freemium automáticamente
```

### 3. Flujo de Agendar Cita
```
1. Seleccionar paciente (GET /api/pacientes/)
2. Seleccionar servicio (GET /api/agenda/servicios/)
3. Seleccionar fecha
4. Consultar disponibilidad (GET /api/agenda/disponibilidad/?fecha=X&tipo_servicio=Y)
5. Seleccionar hora disponible
6. Crear cita (POST /api/agenda/citas/)
```

### 4. Flujo de Control CRED
```
1. Buscar paciente
2. Ingresar mediciones (peso, talla)
3. POST /api/cred/ → Z-scores y diagnósticos calculados automáticamente
4. Mostrar alertas si hay
5. Ver gráfico de crecimiento (GET /api/cred/paciente/{id}/grafico/)
```

### 5. Flujo de Vacunación
```
1. Buscar paciente
2. Ver carnet (GET /api/vacunas/carnet/{paciente_id}/)
3. Ver dosis pendientes/vencidas
4. Registrar dosis (POST /api/vacunas/dosis-aplicadas/)
```

---

## Configuración CORS para Angular

El backend permite requests desde:
- `http://localhost:4200` (desarrollo)

Para producción, configurar la variable de entorno `CORS_ALLOWED_ORIGINS`.

---

## Modelo de datos para TypeScript

```typescript
// Ejemplo de interfaces para Angular

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  foto?: string;
}

interface Enfermera {
  id: number;
  usuario: User;
  numero_colegiatura: string;
  especialidad: string;
  nombre_consultorio?: string;
  plan_actual?: {
    code: string;
    name: string;
  };
  total_pacientes: number;
}

interface Paciente {
  id: number;
  numero_documento: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad_texto: string;
  sexo: 'M' | 'F';
  telefono?: string;
}

interface Cita {
  id: number;
  paciente: number | Paciente;
  paciente_nombre: string;
  tipo_servicio: number;
  servicio_nombre: string;
  servicio_color: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'programada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';
}

interface ControlCRED {
  id: number;
  paciente: number | Paciente;
  fecha: string;
  edad_meses: number;
  peso_kg: string;
  talla_cm: string;
  zscore_peso_edad?: string;
  zscore_talla_edad?: string;
  diagnostico_peso_edad?: string;
  diagnostico_talla_edad?: string;
  tiene_alerta: boolean;
  tipo_alerta: 'verde' | 'amarillo' | 'rojo';
}

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  is_recommended: boolean;
  features: PlanFeature[];
}

interface PlanFeature {
  code: string;
  name: string;
  is_enabled: boolean;
  limit?: number | null;
  unlimited?: boolean;
}
```

---

## Contacto

Para dudas sobre la API, contactar al equipo de backend.
