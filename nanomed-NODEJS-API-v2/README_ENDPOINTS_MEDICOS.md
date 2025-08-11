# 📋 Endpoints de Médico - Implementación Frontend

## Estado de Implementación

> **Nota:** El estado de cada endpoint se actualiza automáticamente según la tabla maestra de endpoints (`LISTADO_ENDPOINTS.md`).

---

## Endpoints de Médico

### 1. **Autenticación y Perfil**

#### `POST /api/auth/login`
**Descripción**: Login de médico
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const loginMedico = async (credentials: {
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
**Descripción**: Obtener perfil del médico
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getMedicoProfile = async () => {
  const response = await fetch('/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/users/me`
**Descripción**: Actualizar perfil del médico
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const updateMedicoProfile = async (profileData: {
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

#### `POST /api/users/me/profile-picture`
**Descripción**: Subir foto de perfil
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/users/me/profile-picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return response.json();
};
```

#### `PUT /api/users/me/password`
**Descripción**: Cambiar contraseña
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const changePassword = async (passwordData: {
  current_password: string;
  new_password: string;
}) => {
  const response = await fetch('/api/users/me/password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(passwordData)
  });
  return response.json();
};
```

### 2. **Gestión de Citas Médicas**

#### `GET /api/doctors/me/appointments`
**Descripción**: Listar mis citas con filtros
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getMyAppointments = async (filters?: {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  paciente_nombre?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/doctors/me/appointments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/doctors/me/appointments/{id}`
**Descripción**: Obtener detalle de mi cita específica
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getMyAppointmentDetail = async (appointmentId: number) => {
  const response = await fetch(`/api/doctors/me/appointments/${appointmentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/doctors/me/appointments/{id}/status`
**Descripción**: Actualizar estado de mi cita
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const updateAppointmentStatus = async (appointmentId: number, statusData: {
  estado: 'programada' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
}) => {
  const response = await fetch(`/api/doctors/me/appointments/${appointmentId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(statusData)
  });
  return response.json();
};
```

### 3. **Gestión de Exámenes Médicos**

#### `GET /api/exams`
**Descripción**: Listar exámenes del médico
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getMyExams = async (filters?: {
  tipo_examen?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  paciente_id?: number;
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
**Rol**: Médico
**Estado**: 🚫 Eliminado del proyecto

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

#### `POST /api/exams`
**Descripción**: Crear nuevo examen
**Rol**: Médico
**Estado**: 🚫 Eliminado del proyecto

```typescript
// Implementación requerida
const createExam = async (examData: {
  paciente_id: number;
  tipo_examen: string;
  fecha: string;
  descripcion?: string;
  resultados?: string;
  estado?: string;
  file?: File;
}) => {
  const formData = new FormData();
  Object.entries(examData).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'file') {
        formData.append('file', value as File);
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
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
**Descripción**: Actualizar examen
**Rol**: Médico
**Estado**: 🚫 Eliminado del proyecto

```typescript
// Implementación requerida
const updateExam = async (examId: number, examData: {
  tipo_examen?: string;
  fecha?: string;
  descripcion?: string;
  resultados?: string;
  estado?: string;
}) => {
  const response = await fetch(`/api/exams/${examId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(examData)
  });
  return response.json();
};
```

#### `DELETE /api/exams/{id}`
**Descripción**: Eliminar examen
**Rol**: Médico
**Estado**: 🚫 Eliminado del proyecto

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

#### `GET /api/exams/{id}/file`
**Descripción**: Descargar archivo de examen
**Rol**: Médico
**Estado**: 🚫 Eliminado del proyecto

```typescript
// Implementación requerida
const downloadExamFile = async (examId: number) => {
  const response = await fetch(`/api/exams/${examId}/file`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examen-${examId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  return response;
};
```

### 4. **Disponibilidad y Horarios**

#### `GET /api/appointments/available-slots`
**Descripción**: Obtener horarios disponibles
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getAvailableSlots = async (filters?: {
  medico_id?: number;
  fecha?: string;
  especialidad?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/appointments/available-slots?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/receptionists/doctors/{id}/schedule`
**Descripción**: Obtener mi horario configurado
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getMySchedule = async (doctorId: number) => {
  const response = await fetch(`/api/receptionists/doctors/${doctorId}/schedule`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 5. **Notificaciones**

#### `GET /api/notifications`
**Descripción**: Listar notificaciones del médico
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getNotifications = async (filters?: {
  limite?: number;
  offset?: number;
  leida?: boolean;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/notifications?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/notifications/{id}/read`
**Descripción**: Marcar notificación como leída
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const markNotificationAsRead = async (notificationId: number) => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/notifications/read-all`
**Descripción**: Marcar todas las notificaciones como leídas
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const markAllNotificationsAsRead = async () => {
  const response = await fetch('/api/notifications/read-all', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `DELETE /api/notifications/{id}`
**Descripción**: Eliminar notificación
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const deleteNotification = async (notificationId: number) => {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/notifications/preferences`
**Descripción**: Obtener preferencias de notificación
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getNotificationPreferences = async () => {
  const response = await fetch('/api/notifications/preferences', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/notifications/preferences`
**Descripción**: Actualizar preferencias de notificación
**Rol**: Médico
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const updateNotificationPreferences = async (preferences: {
  email_citas?: boolean;
  email_resultados?: boolean;
  email_promociones?: boolean;
  sms_citas?: boolean;
  sms_resultados?: boolean;
}) => {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preferences)
  });
  return response.json();
};
```

### 6. **Gestión de Pacientes**

#### `GET /api/receptionists/patients`
**Descripción**: Listar pacientes del médico
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getPatients = async (filters?: {
  nombre?: string;
  email?: string;
  rut?: string;
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
**Descripción**: Obtener detalle de paciente
**Rol**: Médico
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

### 7. **Especialidades**

#### `GET /api/doctors/specialties/{specialtyId}`
**Descripción**: Listar médicos por especialidad
**Rol**: Médico
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

#### `GET /api/doctors`
**Descripción**: Listar todos los médicos
**Rol**: Médico
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getAllDoctors = async (filters?: {
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

### **Subida de Archivos**
Para endpoints que requieren archivos:
```typescript
const uploadFile = async (file: File, endpoint: string) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return response.json();
};
```

---

## 📱 Componentes Frontend Sugeridos

### **Autenticación y Perfil** ❌
- `MedicoLogin.tsx` - Formulario de login
- `MedicoProfile.tsx` - Perfil del médico
- `ProfilePictureUpload.tsx` - Subida de foto de perfil
- `ChangePassword.tsx` - Cambio de contraseña

### **Gestión de Citas** ❌
- `MedicoAppointments.tsx` - Lista de citas del médico
- `AppointmentDetail.tsx` - Detalle de cita específica
- `AppointmentStatusUpdate.tsx` - Actualización de estado

### **🆕 Gestión de Exámenes** ❌
- `MedicoExams.tsx` - Lista de exámenes
- `ExamDetail.tsx` - Detalle de examen
- `ExamForm.tsx` - Formulario para crear/editar exámenes
- `ExamFileUpload.tsx` - Subida de archivos de examen
- `ExamFileDownload.tsx` - Descarga de archivos

### **🆕 Notificaciones** ❌
- `NotificationsList.tsx` - Lista de notificaciones
- `NotificationPreferences.tsx` - Preferencias de notificación
- `NotificationBadge.tsx` - Badge de notificaciones no leídas

### **Disponibilidad** ❌
- `AvailableSlots.tsx` - Horarios disponibles
- `MedicoSchedule.tsx` - Horario del médico

### **Gestión de Pacientes** ❌
- `PatientList.tsx` - Lista de pacientes
- `PatientDetail.tsx` - Detalle de paciente

### **Especialidades** ❌
- `DoctorsBySpecialty.tsx` - Médicos por especialidad
- `AllDoctors.tsx` - Lista de todos los médicos

---

## 🎯 Prioridades de Implementación

### **Alta Prioridad** (Funcionalidad Core)
1. `POST /api/auth/login` - Login de médico
2. `GET /api/users/me` - Obtener perfil
3. `GET /api/doctors/me/appointments` - Listar mis citas
4. `PUT /api/doctors/me/appointments/{id}/status` - Actualizar estado de citas
5. `GET /api/exams` - Listar mis exámenes
6. `POST /api/exams` - Crear exámenes

### **Media Prioridad** (Funcionalidad secundaria)
7. `GET /api/notifications` - Notificaciones
8. `PUT /api/notifications/{id}/read` - Marcar como leída
9. `GET /api/receptionists/patients` - Listar pacientes
10. `GET /api/receptionists/patients/{id}` - Detalle de paciente
11. `PUT /api/users/me` - Actualizar perfil
12. `POST /api/users/me/profile-picture` - Subir foto

### **Baja Prioridad** (Funcionalidad adicional)
13. `GET /api/appointments/available-slots` - Horarios disponibles
14. `GET /api/receptionists/doctors/{id}/schedule` - Mi horario
15. `GET /api/doctors/specialties/{specialtyId}` - Médicos por especialidad
16. `GET /api/doctors` - Todos los médicos
17. `PUT /api/users/me/password` - Cambiar contraseña
18. `GET /api/notifications/preferences` - Preferencias de notificación

---

## 📋 Checklist de Implementación

### ❌ **Pendientes** (18/18)
- [ ] **Autenticación y Perfil** (5/5 endpoints)
  - [ ] Login de médico
  - [ ] Obtener perfil
  - [ ] Actualizar perfil
  - [ ] Subir foto de perfil
  - [ ] Cambiar contraseña

- [ ] **Gestión de Citas Médicas** (3/3 endpoints)
  - [ ] Listar mis citas
  - [ ] Obtener detalle de cita
  - [ ] Actualizar estado de cita

- [ ] **🆕 Gestión de Exámenes Médicos** (6/6 endpoints)
  - [ ] Listar mis exámenes
  - [ ] Obtener detalle de examen
  - [ ] Crear nuevo examen
  - [ ] Actualizar examen
  - [ ] Eliminar examen
  - [ ] Descargar archivo de examen

- [ ] **Disponibilidad y Horarios** (2/2 endpoints)
  - [ ] Obtener horarios disponibles
  - [ ] Obtener mi horario configurado

- [ ] **🆕 Notificaciones** (6/6 endpoints)
  - [ ] Listar notificaciones
  - [ ] Marcar como leída
  - [ ] Marcar todas como leídas
  - [ ] Eliminar notificación
  - [ ] Obtener preferencias
  - [ ] Actualizar preferencias

- [ ] **Gestión de Pacientes** (2/2 endpoints)
  - [ ] Listar pacientes
  - [ ] Detalle de paciente

- [ ] **Especialidades** (2/2 endpoints)
  - [ ] Médicos por especialidad
  - [ ] Todos los médicos

---

**Última actualización**: Julio 2025  
**Versión**: 2.0 - Estado actualizado según LISTADO_ENDPOINTS.md 