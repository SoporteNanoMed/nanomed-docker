# 📋 Endpoints de API - Implementación Frontend

## Estado de Implementación

> **Nota:** El estado de cada endpoint se actualiza automáticamente según la tabla maestra de endpoints (`LISTADO_ENDPOINTS.md`).

---

## Endpoints de API

### 1. **Autenticación y Perfil**

#### `POST /api/auth/login`
**Descripción**: Login de API
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const loginApi = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

#### `GET /api/users/me`
**Descripción**: Obtener perfil del API
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getApiProfile = async () => {
  const response = await fetch('/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/users/me`
**Descripción**: Actualizar perfil del API
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const updateApiProfile = async (profileData: {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  ciudad?: string;
  region?: string;
}) => {
  const response = await fetch('/api/users/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};
```

### 2. **Gestión de Citas Avanzada**

#### `GET /api/receptionists/appointments`
**Descripción**: Listar todas las citas con filtros avanzados
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getAllAppointments = async (filters?: {
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
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/receptionists/appointments`
**Descripción**: Crear cita para cualquier paciente
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const createAppointmentForPatient = async (appointmentData: {
  paciente_id: number;
  medico_id?: number;
  fecha_hora: string;
  duracion?: number;
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
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const updateAnyAppointment = async (appointmentId: number, updateData: {
  paciente_id?: number;
  medico_id?: number;
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
    body: JSON.stringify(updateData)
  });
  return response.json();
};
```

#### `DELETE /api/receptionists/appointments/{id}`
**Descripción**: Cancelar cualquier cita
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const cancelAnyAppointment = async (appointmentId: number) => {
  const response = await fetch(`/api/receptionists/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/appointments`
**Descripción**: Listar citas del usuario con filtros
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getUserAppointments = async (filters?: {
  medico_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  especialidad?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/appointments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/appointments/{id}`
**Descripción**: Obtener detalle de cita específica
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getAppointmentDetail = async (appointmentId: number) => {
  const response = await fetch(`/api/appointments/${appointmentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/appointments/{id}`
**Descripción**: Actualizar información de cita
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const updateAppointment = async (appointmentId: number, updateData: {
  fecha_hora?: string;
  duracion?: number;
  lugar?: string;
  direccion?: string;
  notas?: string;
  estado?: string;
}) => {
  const response = await fetch(`/api/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  return response.json();
};
```

#### `DELETE /api/appointments/{id}`
**Descripción**: Cancelar cita
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const cancelAppointment = async (appointmentId: number) => {
  const response = await fetch(`/api/appointments/${appointmentId}`, {
    method: 'DELETE',
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
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getAllPatients = async (filters?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/receptionists/patients?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/receptionists/patients/{id}`
**Descripción**: Obtener información de un paciente específico
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getPatientDetail = async (patientId: number) => {
  const response = await fetch(`/api/receptionists/patients/${patientId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 4. **Gestión de Médicos**

#### `GET /api/doctors`
**Descripción**: Listar médicos con filtros
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getDoctors = async (filters?: {
  especialidad?: string;
  nombre?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/doctors?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/doctors/specialties/{specialtyId}`
**Descripción**: Listar médicos por especialidad
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getDoctorsBySpecialty = async (specialtyId: string) => {
  const response = await fetch(`/api/doctors/specialties/${specialtyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/doctors/{id}`
**Descripción**: Obtener perfil de médico específico
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getDoctorDetail = async (doctorId: number) => {
  const response = await fetch(`/api/doctors/${doctorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 5. **Gestión de Exámenes Médicos**

#### `GET /api/exams`
**Descripción**: Listar exámenes con filtros avanzados
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getExams = async (filters?: {
  tipo_examen?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  paciente_id?: number;
  medico_id?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/exams?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/exams/{id}`
**Descripción**: Obtener detalle de examen específico
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getExamDetail = async (examId: number) => {
  const response = await fetch(`/api/exams/${examId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/exams/{id}/file`
**Descripción**: Descargar archivo de examen
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const downloadExamFile = async (examId: number) => {
  const response = await fetch(`/api/exams/${examId}/file`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.blob();
};
```

#### `POST /api/exams`
**Descripción**: Crear nuevo examen
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const createExam = async (examData: {
  paciente_id: number;
  tipo_examen: string;
  fecha: string;
  medico_id?: number;
  notas?: string;
  archivo?: File;
}) => {
  const formData = new FormData();
  formData.append('paciente_id', examData.paciente_id.toString());
  formData.append('tipo_examen', examData.tipo_examen);
  formData.append('fecha', examData.fecha);
  if (examData.medico_id) formData.append('medico_id', examData.medico_id.toString());
  if (examData.notas) formData.append('notas', examData.notas);
  if (examData.archivo) formData.append('archivo', examData.archivo);
  
  const response = await fetch('/api/exams', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return response.json();
};
```

#### `PUT /api/exams/{id}`
**Descripción**: Actualizar información de examen
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const updateExam = async (examId: number, updateData: {
  tipo_examen?: string;
  fecha?: string;
  medico_id?: number;
  notas?: string;
  estado?: string;
}) => {
  const response = await fetch(`/api/exams/${examId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  return response.json();
};
```

#### `DELETE /api/exams/{id}`
**Descripción**: Eliminar examen
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const deleteExam = async (examId: number) => {
  const response = await fetch(`/api/exams/${examId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 6. **Búsquedas Avanzadas**

#### `GET /api/search/doctors`
**Descripción**: Buscar médicos con filtros avanzados
**Rol**: API
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const searchDoctors = async (filters?: {
  especialidad?: string;
  nombre?: string;
  apellido?: string;
  activo?: boolean;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/search/doctors?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/search/exams`
**Descripción**: Buscar exámenes con filtros avanzados
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const searchExams = async (filters?: {
  tipo_examen?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  medico_id?: number;
  paciente_id?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/search/exams?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 7. **Gestión de Especialidades**

#### `GET /api/specialties`
**Descripción**: Listar especialidades médicas
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getSpecialties = async () => {
  const response = await fetch('/api/specialties', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/specialties/stats`
**Descripción**: Obtener estadísticas de especialidades
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getSpecialtiesStats = async () => {
  const response = await fetch('/api/specialties/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/specialties/{nombre}`
**Descripción**: Obtener información detallada de una especialidad
**Rol**: API
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getSpecialtyDetail = async (specialtyName: string) => {
  const response = await fetch(`/api/specialties/${encodeURIComponent(specialtyName)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## Configuración de Autenticación

### Headers Requeridos
```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Manejo de Errores
```typescript
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Token expirado o inválido
    // Redirigir a login
  } else if (error.status === 403) {
    // Acceso denegado
    // Mostrar mensaje de error
  } else if (error.status === 404) {
    // Recurso no encontrado
    // Mostrar mensaje apropiado
  } else {
    // Error del servidor
    // Mostrar mensaje genérico
  }
};
```

---

## Checklist de Implementación

### ✅ Autenticación y Perfil
- [x] Login de API
- [x] Obtener perfil
- [x] Actualizar perfil

### ✅ Gestión de Citas Avanzada
- [x] Listar todas las citas
- [x] Crear cita para cualquier paciente
- [x] Actualizar cualquier cita
- [x] Cancelar cualquier cita
- [x] Listar citas del usuario
- [x] Obtener detalle de cita
- [x] Actualizar cita del usuario
- [x] Cancelar cita del usuario

### ✅ Gestión de Pacientes
- [x] Listar todos los pacientes
- [ ] Obtener información de paciente específico

### ✅ Gestión de Médicos
- [x] Listar médicos con filtros
- [ ] Listar médicos por especialidad
- [x] Obtener perfil de médico específico

### ✅ Gestión de Exámenes Médicos
- [x] Listar exámenes con filtros
- [x] Obtener detalle de examen
- [x] Descargar archivo de examen
- [x] Crear nuevo examen
- [ ] Actualizar examen
- [ ] Eliminar examen

### ✅ Búsquedas Avanzadas
- [x] Buscar médicos
- [ ] Buscar exámenes

### ✅ Gestión de Especialidades
- [ ] Listar especialidades
- [ ] Obtener estadísticas de especialidades
- [ ] Obtener información de especialidad específica

---

**Última actualización**: Julio 2025  
**Versión**: 2.0 - Estado actualizado según LISTADO_ENDPOINTS.md 