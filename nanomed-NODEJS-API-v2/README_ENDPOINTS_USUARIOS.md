# 📋 Endpoints de Usuario - Implementación Frontend

## Estado de Implementación

> **Nota:** El estado de cada endpoint se actualiza automáticamente según la tabla maestra de endpoints (`LISTADO_ENDPOINTS.md`).

---

## Endpoints de Usuario

### 1. **Autenticación y Perfil**

#### `POST /api/auth/login`
**Descripción**: Login de usuario
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const loginUsuario = async (credentials: {
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
**Descripción**: Obtener perfil del usuario
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getUsuarioProfile = async () => {
  const response = await fetch('/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/users/me`
**Descripción**: Actualizar perfil del usuario
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const updateUsuarioProfile = async (profileData: {
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
**Rol**: Usuario
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
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const changePassword = async (passwordData: {
  passwordActual: string;
  nuevoPassword: string;
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

### 2. **Información Médica**

#### `GET /api/users/me/medical-info`
**Descripción**: Obtener información médica del usuario
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getMedicalInfo = async () => {
  const response = await fetch('/api/users/medical-info', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/users/me/medical-info`
**Descripción**: Actualizar información médica del usuario
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const updateMedicalInfo = async (medicalData: {
  grupo_sanguineo?: string;
  alergias?: string;
  medicamentos?: string;
  condiciones_medicas?: string;
}) => {
  const response = await fetch('/api/users/medical-info', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(medicalData)
  });
  return response.json();
};
```

### 3. **Contactos de Emergencia**

#### `GET /api/users/me/emergency-contacts`
**Descripción**: Listar contactos de emergencia
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getEmergencyContacts = async () => {
  const response = await fetch('/api/users/emergency-contacts', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/users/me/emergency-contacts`
**Descripción**: Agregar contacto de emergencia
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const addEmergencyContact = async (contactData: {
  nombre: string;
  relacion?: string;
  telefono?: string;
}) => {
  const response = await fetch('/api/users/emergency-contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  return response.json();
};
```

#### `PUT /api/users/me/emergency-contacts/{id}`
**Descripción**: Actualizar contacto de emergencia
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const updateEmergencyContact = async (contactId: number, contactData: {
  nombre?: string;
  relacion?: string;
  telefono?: string;
}) => {
  const response = await fetch(`/api/users/emergency-contacts/${contactId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  return response.json();
};
```

#### `DELETE /api/users/me/emergency-contacts/{id}`
**Descripción**: Eliminar contacto de emergencia
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const deleteEmergencyContact = async (contactId: number) => {
  const response = await fetch(`/api/users/emergency-contacts/${contactId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 4. **Gestión de Citas Médicas**

#### `GET /api/appointments`
**Descripción**: Listar mis citas con filtros
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getMyAppointments = async (filters?: {
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
**Descripción**: Obtener detalle de mi cita específica
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const getMyAppointmentDetail = async (appointmentId: number) => {
  const response = await fetch(`/api/appointments/${appointmentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/appointments`
**Descripción**: Solicitar nueva cita
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const createAppointment = async (appointmentData: {
  medico_id?: number;
  fecha_hora: string;
  duracion?: number;
  lugar?: string;
  direccion?: string;
  notas?: string;
}) => {
  const response = await fetch('/api/appointments', {
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

#### `PUT /api/appointments/{id}`
**Descripción**: Actualizar información de cita
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const updateAppointment = async (appointmentId: number, appointmentData: {
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
    body: JSON.stringify(appointmentData)
  });
  return response.json();
};
```

#### `DELETE /api/appointments/{id}`
**Descripción**: Cancelar cita
**Rol**: Usuario
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

#### `POST /api/appointments/{id}/confirm`
**Descripción**: Confirmar asistencia a cita
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const confirmAppointment = async (appointmentId: number) => {
  const response = await fetch(`/api/appointments/${appointmentId}/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/appointments/{id}/reschedule`
**Descripción**: Reprogramar cita
**Rol**: Usuario
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const rescheduleAppointment = async (appointmentId: number, rescheduleData: {
  nueva_fecha_hora: string;
}) => {
  const response = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rescheduleData)
  });
  return response.json();
};
```

### 5. **Disponibilidad y Horarios**

#### `GET /api/appointments/available-slots`
**Descripción**: Obtener horarios disponibles
**Rol**: Usuario
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

### 6. **Notificaciones**

#### `GET /api/notifications`
**Descripción**: Listar notificaciones del usuario
**Rol**: Usuario
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
**Rol**: Usuario
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
**Rol**: Usuario
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
**Rol**: Usuario
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
**Rol**: Usuario
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
**Rol**: Usuario
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

### 7. **Gestión de Médicos**

#### `GET /api/doctors`
**Descripción**: Listar todos los médicos
**Rol**: Usuario
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

#### `GET /api/doctors/{id}`
**Descripción**: Obtener perfil de médico específico
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const getDoctorProfile = async (doctorId: number) => {
  const response = await fetch(`/api/doctors/${doctorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/doctors/specialties/{specialtyId}`
**Descripción**: Listar médicos por especialidad
**Rol**: Usuario
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

### 8. **Especialidades**

#### `GET /api/specialties`
**Descripción**: Listar especialidades médicas
**Rol**: Usuario
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

#### `GET /api/specialties/{nombre}`
**Descripción**: Obtener información detallada de una especialidad
**Rol**: Usuario
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

### 9. **Búsqueda Avanzada**

#### `GET /api/search/doctors`
**Descripción**: Buscar médicos con filtros avanzados
**Rol**: Usuario
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
**Descripción**: Buscar exámenes del usuario
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const searchExams = async (filters?: {
  tipo_examen?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
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

### 10. **Contacto**

#### `POST /api/contact`
**Descripción**: Enviar mensaje de contacto
**Rol**: Usuario
**Estado**: ✅ Implementado en frontend

```typescript
// Implementación requerida
const sendContactMessage = async (contactData: {
  nombreApellido: string;
  empresa?: string;
  servicio: string;
  telefono: string;
  email: string;
  mensaje: string;
}) => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  return response.json();
};
```

---

## Consideraciones Técnicas

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

## Componentes Frontend Sugeridos

### **Autenticación y Perfil** ✅
- `UsuarioLogin.tsx` - Formulario de login
- `UsuarioProfile.tsx` - Perfil del usuario
- `ProfilePictureUpload.tsx` - Subida de foto de perfil
- `ChangePassword.tsx` - Cambio de contraseña

### **Información Médica** ❌
- `MedicalInfo.tsx` - Información médica del usuario
- `MedicalInfoForm.tsx` - Formulario para actualizar información médica

### **Contactos de Emergencia** ❌
- `EmergencyContacts.tsx` - Lista de contactos de emergencia
- `EmergencyContactForm.tsx` - Formulario para agregar/editar contactos
- `EmergencyContactCard.tsx` - Tarjeta de contacto individual

### **Gestión de Citas** ✅
- `UsuarioAppointments.tsx` - Lista de citas del usuario
- `AppointmentDetail.tsx` - Detalle de cita específica
- `AppointmentForm.tsx` - Formulario para solicitar cita
- `AppointmentConfirmation.tsx` - Confirmación de asistencia
- `AppointmentReschedule.tsx` - Reprogramación de citas

### **Notificaciones** ✅
- `NotificationsList.tsx` - Lista de notificaciones
- `NotificationPreferences.tsx` - Preferencias de notificación
- `NotificationBadge.tsx` - Badge de notificaciones no leídas

### **Disponibilidad** ❌
- `AvailableSlots.tsx` - Horarios disponibles
- `SlotSelection.tsx` - Selección de horario

### **Gestión de Médicos** ✅
- `DoctorsList.tsx` - Lista de médicos
- `DoctorProfile.tsx` - Perfil de médico
- `DoctorsBySpecialty.tsx` - Médicos por especialidad

### **Especialidades** ❌
- `SpecialtiesList.tsx` - Lista de especialidades
- `SpecialtyDetail.tsx` - Detalle de especialidad

### **Búsqueda Avanzada** ✅
- `SearchDoctors.tsx` - Búsqueda de médicos
- `SearchExams.tsx` - Búsqueda de exámenes
- `SearchFilters.tsx` - Filtros de búsqueda

### **Contacto** ✅
- `ContactForm.tsx` - Formulario de contacto
- `ContactSuccess.tsx` - Confirmación de envío

---

## Prioridades de Implementación

### **Alta Prioridad** (Funcionalidad Core) ✅
1. `POST /api/auth/login` - Login de usuario ✅
2. `GET /api/users/me` - Obtener perfil ✅
3. `GET /api/appointments` - Listar mis citas ✅
4. `POST /api/appointments` - Solicitar nueva cita ✅
5. `GET /api/doctors` - Listar médicos ✅
6. `GET /api/appointments/available-slots` - Horarios disponibles

### **Media Prioridad** (Funcionalidad secundaria)
7. `GET /api/notifications` - Notificaciones
8. `PUT /api/notifications/{id}/read` - Marcar como leída
9. `GET /api/users/medical-info` - Información médica
10. `PUT /api/users/medical-info` - Actualizar información médica
11. `GET /api/users/emergency-contacts` - Contactos de emergencia
12. `PUT /api/users/me` - Actualizar perfil ✅

### **Baja Prioridad** (Funcionalidad adicional)
13. `GET /api/specialties` - Especialidades
14. `GET /api/doctors/specialties/{specialtyId}` - Médicos por especialidad
15. `GET /api/search/doctors` - Búsqueda de médicos
16. `GET /api/search/exams` - Búsqueda de exámenes
17. `PUT /api/users/me/password` - Cambiar contraseña
18. `POST /api/users/me/profile-picture` - Subir foto ✅
19. `GET /api/notifications/preferences` - Preferencias de notificación
20. `POST /api/contact` - Formulario de contacto ✅

---

## Checklist de Implementación

### ✅ **Implementados** (8/25)
- [x] **Autenticación y Perfil** (4/5 endpoints)
  - [x] Login de usuario
  - [x] Obtener perfil
  - [x] Actualizar perfil
  - [x] Subir foto de perfil
  - [ ] Cambiar contraseña

- [ ] **Información Médica** (2/2 endpoints)
  - [ ] Obtener información médica
  - [ ] Actualizar información médica

- [ ] **Contactos de Emergencia** (4/4 endpoints)
  - [ ] Listar contactos de emergencia
  - [ ] Agregar contacto de emergencia
  - [ ] Actualizar contacto de emergencia
  - [ ] Eliminar contacto de emergencia

- [x] **Gestión de Citas Médicas** (4/7 endpoints)
  - [x] Listar mis citas
  - [ ] Obtener detalle de cita
  - [x] Solicitar nueva cita
  - [x] Actualizar información de cita
  - [x] Cancelar cita
  - [ ] Confirmar asistencia
  - [ ] Reprogramar cita

- [ ] **Disponibilidad y Horarios** (1/1 endpoint)
  - [ ] Obtener horarios disponibles

- [ ] **Notificaciones** (6/6 endpoints)
  - [ ] Listar notificaciones
  - [ ] Marcar como leída
  - [ ] Marcar todas como leídas
  - [ ] Eliminar notificación
  - [ ] Obtener preferencias
  - [ ] Actualizar preferencias

- [x] **Gestión de Médicos** (2/3 endpoints)
  - [x] Listar todos los médicos
  - [x] Obtener perfil de médico
  - [ ] Listar médicos por especialidad

- [ ] **Especialidades** (2/2 endpoints)
  - [ ] Listar especialidades
  - [ ] Obtener detalle de especialidad

- [ ] **Búsqueda Avanzada** (2/2 endpoints)
  - [ ] Buscar médicos
  - [ ] Buscar exámenes

- [x] **Contacto** (1/1 endpoint)
  - [x] Enviar mensaje de contacto

### ❌ **Pendientes** (17/25)
- [ ] **Autenticación y Perfil** (1/5 endpoints)
  - [ ] Cambiar contraseña

- [ ] **Información Médica** (2/2 endpoints)
  - [ ] Obtener información médica
  - [ ] Actualizar información médica

- [ ] **Contactos de Emergencia** (4/4 endpoints)
  - [ ] Listar contactos de emergencia
  - [ ] Agregar contacto de emergencia
  - [ ] Actualizar contacto de emergencia
  - [ ] Eliminar contacto de emergencia

- [ ] **Gestión de Citas Médicas** (3/7 endpoints)
  - [ ] Obtener detalle de cita
  - [ ] Confirmar asistencia
  - [ ] Reprogramar cita

- [ ] **Disponibilidad y Horarios** (1/1 endpoint)
  - [ ] Obtener horarios disponibles

- [ ] **Notificaciones** (6/6 endpoints)
  - [ ] Listar notificaciones
  - [ ] Marcar como leída
  - [ ] Marcar todas como leídas
  - [ ] Eliminar notificación
  - [ ] Obtener preferencias
  - [ ] Actualizar preferencias

- [ ] **Especialidades** (2/2 endpoints)
  - [ ] Listar especialidades
  - [ ] Obtener detalle de especialidad

- [ ] **Búsqueda Avanzada** (2/2 endpoints)
  - [ ] Buscar médicos
  - [ ] Buscar exámenes

---

**Última actualización**: Julio 2025  
**Versión**: 3.0 - Estado actualizado según LISTADO_ENDPOINTS.md 