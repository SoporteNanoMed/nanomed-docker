# 📋 Endpoints de Recepcionista - Implementación Frontend

## Estado de Implementación

> **Nota:** El estado de cada endpoint se actualiza automáticamente según la tabla maestra de endpoints (`LISTADO_ENDPOINTS.md`).

---

## Endpoints de Recepcionista

### 1. **Gestión de Citas**

#### `GET /api/receptionists/appointments`
**Descripción**: Listar todas las citas del sistema
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const getAppointments = async (filters?: {
  paciente_id?: number;
  medico_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  especialidad?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/receptionists/appointments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

#### `POST /api/receptionists/appointments`
**Descripción**: Crear cita para paciente
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const createAppointment = async (appointmentData: {
  paciente_id: number;
  medico_id: number;
  fecha_hora: string;
  duracion: number;
  lugar?: string;
  direccion?: string;
  notas?: string;
}) => {
  const response = await fetch('/api/receptionists/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });
  return response.json();
};
```

#### `PUT /api/receptionists/appointments/{id}`
**Descripción**: Actualizar cualquier cita
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const updateAppointment = async (appointmentId: number, updates: {
  fecha_hora?: string;
  duracion?: number;
  lugar?: string;
  direccion?: string;
  notas?: string;
  estado?: string;
}) => {
  const response = await fetch(`/api/receptionists/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};
```

#### `DELETE /api/receptionists/appointments/{id}`
**Descripción**: Cancelar cualquier cita
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const cancelAppointment = async (appointmentId: number) => {
  const response = await fetch(`/api/receptionists/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 2. **Gestión de Médicos**

#### `GET /api/receptionists/doctors`
**Descripción**: Listar todos los médicos
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación actual
const getDoctors = async (filters?: {
  especialidad?: string;
  activo?: boolean;
  search?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/receptionists/doctors?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/receptionists/doctors/{id}/schedule`
**Descripción**: Consultar horarios de un médico
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const getDoctorSchedule = async (doctorId: number) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 3. **Gestión de Pacientes**

#### `GET /api/receptionists/patients`
**Descripción**: Listar todos los pacientes
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Ejemplo de implementación
const getPatients = async (filters?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/receptionists/patients?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "phone": "+56912345678",
      "rut": "12345678-9",
      "birthDate": "1990-01-01",
      "lastAppointment": "2024-12-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150
  }
}
```

#### `GET /api/receptionists/patients/{id}`
**Descripción**: Información detallada de paciente específico
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

```typescript
// Ejemplo de implementación
const getPatientDetails = async (patientId: number) => {
  const response = await fetch(`/api/receptionists/patients/${patientId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+56912345678",
    "rut": "12345678-9",
    "birthDate": "1990-01-01",
    "address": "Av. Providencia 123",
    "emergencyContact": {
      "name": "María Pérez",
      "phone": "+56987654321",
      "relationship": "Esposa"
    },
    "medicalHistory": [
      {
        "date": "2024-12-15",
        "doctor": "Dr. María García",
        "diagnosis": "Hipertensión controlada",
        "treatment": "Enalapril 10mg"
      }
    ],
    "appointments": [
      {
        "id": 1,
        "date": "2024-12-20T10:00:00Z",
        "doctor": "Dr. María García",
        "status": "confirmed"
      }
    ]
  }
}
```

### 4. **Gestión de Horarios Médicos (Sistema Antiguo)**

#### `GET /api/receptionists/doctors/{id}/availability`
**Descripción**: Obtener disponibilidad de médico (OBSOLETO)
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

> **⚠️ NOTA**: Este endpoint está marcado como obsoleto. Se recomienda usar el nuevo sistema de bloques de disponibilidad.

#### `POST /api/receptionists/doctors/{id}/schedule`
**Descripción**: Establecer horarios de un médico
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Ejemplo de implementación
const createSchedule = async (doctorId: number, scheduleData: {
  dias: string[];
  hora_inicio: string;
  hora_fin: string;
}) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(scheduleData)
  });
  return response.json();
};
```

#### `PUT /api/receptionists/doctors/{id}/schedule/{scheduleId}`
**Descripción**: Actualizar horario específico
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

```typescript
// Ejemplo de implementación
const updateSchedule = async (doctorId: number, scheduleId: number, updates: {
  dias?: string[];
  hora_inicio?: string;
  hora_fin?: string;
}) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule/${scheduleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};
```

#### `DELETE /api/receptionists/doctors/{id}/schedule/{scheduleId}`
**Descripción**: Eliminar horario específico
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

```typescript
// Ejemplo de implementación
const deleteSchedule = async (doctorId: number, scheduleId: number) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule/${scheduleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/receptionists/doctors/{id}/schedule/exceptions`
**Descripción**: Agregar excepción de horario
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Ejemplo de implementación
const createScheduleException = async (doctorId: number, exceptionData: {
  fecha: string;
  motivo: string;
}) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule/exceptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(exceptionData)
  });
  return response.json();
};
```

#### `GET /api/receptionists/doctors/{id}/schedule/exceptions`
**Descripción**: Listar excepciones de horario del médico
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

```typescript
// Ejemplo de implementación
const getScheduleExceptions = async (doctorId: number) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule/exceptions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `DELETE /api/receptionists/doctors/{id}/schedule/exceptions/{id}`
**Descripción**: Eliminar excepción de horario
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

```typescript
// Ejemplo de implementación
const deleteScheduleException = async (doctorId: number, exceptionId: number) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule/exceptions/${exceptionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 5. **Estadísticas**

#### `GET /api/receptionists/stats/daily`
**Descripción**: Estadísticas diarias del sistema
**Rol**: Recepcionista, Admin
**Estado**: ❌ No implementado en frontend

```typescript
// Ejemplo de implementación
const getDailyStats = async (date?: string) => {
  const params = date ? `?date=${date}` : '';
  const response = await fetch(`/api/receptionists/stats/daily${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "date": "2024-12-20",
    "totalAppointments": 25,
    "confirmedAppointments": 20,
    "cancelledAppointments": 3,
    "pendingAppointments": 2,
    "totalPatients": 18,
    "newPatients": 3,
    "totalDoctors": 5,
    "activeDoctors": 4,
    "revenue": 1500000
  }
}
```

### 6. **Gestión de Bloques de Disponibilidad**

#### `POST /api/receptionists/doctors/{id}/availability-blocks`
**Descripción**: Crear bloques específicos de disponibilidad
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const createAvailabilityBlocks = async (doctorId: number, blockData: {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/availability-blocks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(blockData)
  });
  return response.json();
};
```

#### `GET /api/receptionists/doctors/{id}/availability-blocks`
**Descripción**: Obtener bloques de disponibilidad
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const getAvailabilityBlocks = async (doctorId: number) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/availability-blocks`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/receptionists/doctors/{id}/availability-blocks/generate`
**Descripción**: Generar bloques automáticamente
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const generateAvailabilityBlocks = async (doctorId: number, generateData: {
  fecha: string;
}) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/availability-blocks/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(generateData)
  });
  return response.json();
};
```

#### `DELETE /api/receptionists/doctors/{id}/availability-blocks`
**Descripción**: Eliminar bloques de disponibilidad
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const deleteAvailabilityBlocks = async (doctorId: number, filters?: {
  fecha?: string;
  startDate?: string;
  endDate?: string;
  all?: boolean;
}) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/availability-blocks`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(filters)
  });
  return response.json();
};
```

#### `PUT /api/receptionists/availability-blocks/{id}/disable`
**Descripción**: Marcar bloque como no disponible
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const disableAvailabilityBlock = async (blockId: number) => {
  const response = await fetch(`/api/receptionists/availability-blocks/${blockId}/disable`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/receptionists/availability-blocks/{id}/enable`
**Descripción**: Marcar bloque como disponible
**Rol**: Recepcionista, Admin
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación actual
const enableAvailabilityBlock = async (blockId: number) => {
  const response = await fetch(`/api/receptionists/availability-blocks/${blockId}/enable`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## 🛠️ Consideraciones Técnicas

### **Autenticación**
Todos los endpoints requieren token JWT en el header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### **Manejo de Errores**
```typescript
// Ejemplo de manejo de errores
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Redirigir a login
    router.push('/login');
  } else if (error.status === 403) {
    // Mostrar error de permisos
    toast.error('No tienes permisos para realizar esta acción');
  } else {
    // Error general
    toast.error('Error en el servidor');
  }
};
```

### **Paginación**
Los endpoints que devuelven listas incluyen información de paginación:
```typescript
interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### **Filtros Comunes**
```typescript
interface CommonFilters {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
  status?: string;
}
```

---

## 📱 Componentes Frontend Sugeridos

### **Gestión de Citas** ✅
- `AppointmentList.tsx` - Lista de citas con filtros ✅
- `AppointmentForm.tsx` - Formulario para crear/editar citas ✅
- `AppointmentDetails.tsx` - Detalle de cita específica ✅

### **Gestión de Médicos** ✅
- `DoctorList.tsx` - Lista de médicos con filtros ✅
- `DoctorSchedule.tsx` - Gestión de horarios médicos ✅

### **🆕 Gestión de Bloques de Disponibilidad** ✅
- `AvailabilityBlocks.tsx` - Gestión de bloques de disponibilidad ✅
- `AvailabilityCalendar.tsx` - Calendario de disponibilidad ✅
- `BlockGenerator.tsx` - Generador automático de bloques ✅

### **Gestión de Pacientes** ✅
- `PatientList.tsx` - Lista de pacientes con búsqueda
- `PatientDetails.tsx` - Perfil completo del paciente
- `PatientForm.tsx` - Formulario de paciente

### **Gestión de Horarios (Sistema Antiguo)** ✅
- `ScheduleExceptions.tsx` - Manejo de excepciones
- `ScheduleManager.tsx` - Gestión de horarios fijos

### **Estadísticas** ❌
- `DailyStats.tsx` - Dashboard de estadísticas diarias
- `StatsChart.tsx` - Gráficos de estadísticas

---

## 🎯 Prioridades de Implementación

### **Alta Prioridad** (Funcionalidad Core)
1. `GET /api/receptionists/patients` - Lista de pacientes
2. `GET /api/receptionists/patients/{id}` - Detalle de paciente
3. `GET /api/receptionists/stats/daily` - Estadísticas diarias

### **Media Prioridad** (Funcionalidad secundaria)
4. `POST /api/receptionists/doctors/{id}/schedule` - Establecer horarios
5. `PUT /api/receptionists/doctors/{id}/schedule/{scheduleId}` - Editar horarios
6. `DELETE /api/receptionists/doctors/{id}/schedule/{scheduleId}` - Eliminar horarios

### **Baja Prioridad** (Funcionalidad adicional)
7. `GET /api/receptionists/doctors/{id}/schedule/exceptions` - Excepciones
8. `POST /api/receptionists/doctors/{id}/schedule/exceptions` - Agregar excepciones
9. `DELETE /api/receptionists/doctors/{id}/schedule/exceptions/{id}` - Eliminar excepciones

---

## 📋 Checklist de Implementación

### ✅ **Implementados** (6/15)
- [x] **Gestión de Citas** (4/4 endpoints)
  - [x] Listar citas
  - [x] Crear cita
  - [x] Editar cita
  - [x] Cancelar cita

- [x] **Gestión de Médicos** (2/2 endpoints)
  - [x] Listar médicos
  - [x] Consultar horarios

- [x] **🆕 Gestión de Bloques de Disponibilidad** (6/6 endpoints)
  - [x] Crear bloques específicos
  - [x] Obtener bloques
  - [x] Generar bloques automáticamente
  - [x] Eliminar bloques
  - [x] Marcar bloque no disponible
  - [x] Marcar bloque disponible

### ❌ **Pendientes** (9/15)
- [ ] **Gestión de Pacientes** (2 endpoints)
  - [ ] Listar pacientes
  - [ ] Detalle de paciente

- [ ] **Gestión de Horarios (Sistema Antiguo)** (6 endpoints)
  - [ ] Obtener disponibilidad (obsoleto)
  - [ ] Establecer horarios
  - [ ] Actualizar horario específico
  - [ ] Eliminar horario específico
  - [ ] Agregar excepciones
  - [ ] Listar excepciones
  - [ ] Eliminar excepciones

- [ ] **Estadísticas** (1 endpoint)
  - [ ] Estadísticas diarias

---

**Última actualización**: Julio 2025  
**Versión**: 2.0 - Estado actualizado según LISTADO_ENDPOINTS.md 