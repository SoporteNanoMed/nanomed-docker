# 📋 Endpoints de Administrador - Implementación Frontend

## Estado de Implementación

> **Nota:** El estado de cada endpoint se actualiza automáticamente según la tabla maestra de endpoints (`LISTADO_ENDPOINTS.md`).

---

## Endpoints de Administración

### 1. **Gestión de Usuarios**

#### `GET /api/admin/users`
**Descripción**: Listar todos los usuarios con filtros
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const listarUsuarios = async (filters?: {
  role?: string;
  activo?: boolean;
  email_verified?: boolean;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/admin/users?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `GET /api/admin/users/{id}`
**Descripción**: Obtener detalle completo de usuario
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const obtenerUsuarioCompleto = async (userId: number) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `PUT /api/admin/users/{id}`
**Descripción**: Actualizar usuario
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const actualizarUsuario = async (userId: number, userData: {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  telefono?: string;
  rut?: string;
  role?: 'user' | 'medico' | 'admin' | 'api';
  email_verified?: boolean;
  genero?: string;
}) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

#### `DELETE /api/admin/users/{id}`
**Descripción**: Desactivar usuario
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const desactivarUsuario = async (userId: number) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 2. **Gestión de Médicos**

#### `GET /api/admin/doctors`
**Descripción**: Listar todos los médicos con filtros
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const listarMedicos = async (filters?: {
  especialidad?: string;
  activo?: boolean;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/admin/doctors?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/admin/doctors`
**Descripción**: Crear nuevo médico
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const crearMedico = async (medicoData: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  especialidad: string;
  telefono?: string;
  rut?: string;
  fecha_nacimiento?: string;
  genero?: string;
}) => {
  const response = await fetch('/api/admin/doctors', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(medicoData)
  });
  return response.json();
};
```

#### `PUT /api/admin/doctors/{id}`
**Descripción**: Actualizar médico
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const actualizarMedico = async (medicoId: number, medicoData: {
  nombre?: string;
  apellido?: string;
  email?: string;
  especialidad?: string;
  telefono?: string;
  activo?: boolean;
}) => {
  const response = await fetch(`/api/admin/doctors/${medicoId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(medicoData)
  });
  return response.json();
};
```

#### `DELETE /api/admin/doctors/{id}`
**Descripción**: Desactivar médico
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const desactivarMedico = async (medicoId: number) => {
  const response = await fetch(`/api/admin/doctors/${medicoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 3. **Gestión de Recepcionistas**

#### `GET /api/admin/recepcionistas`
**Descripción**: Listar todos los recepcionistas
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const listarRecepcionistas = async (filters?: {
  email_verified?: boolean;
  activo?: boolean;
  search?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/admin/recepcionistas?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 4. **Gestión de Administradores**

#### `GET /api/admin/admin`
**Descripción**: Listar todos los administradores
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const listarAdministradores = async (filters?: {
  activo?: boolean;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/admin/admin?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 5. **Creación de Usuarios con Roles Especiales**

#### `POST /api/admin/users/medico`
**Descripción**: Crear nuevo usuario médico
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const crearUsuarioMedico = async (userData: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rut?: string;
  fecha_nacimiento?: string;
  genero?: string;
}) => {
  const response = await fetch('/api/admin/users/medico', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

#### `POST /api/admin/users/recepcionista`
**Descripción**: Crear nuevo usuario recepcionista
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const crearUsuarioRecepcionista = async (userData: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rut?: string;
  fecha_nacimiento?: string;
  genero?: string;
}) => {
  const response = await fetch('/api/admin/users/recepcionista', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

#### `POST /api/admin/users/admin`
**Descripción**: Crear nuevo usuario administrador
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const crearUsuarioAdmin = async (userData: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rut?: string;
  fecha_nacimiento?: string;
  genero?: string;
}) => {
  const response = await fetch('/api/admin/users/admin', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

#### `POST /api/admin/users/api`
**Descripción**: Crear nuevo usuario API
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const crearUsuarioApi = async (userData: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rut?: string;
  fecha_nacimiento?: string;
  genero?: string;
}) => {
  const response = await fetch('/api/admin/users/api', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

### 6. **Gestión de Citas**

#### `GET /api/admin/appointments`
**Descripción**: Ver todas las citas con filtros
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const verTodasLasCitas = async (filters?: {
  estado?: string;
  medico_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/admin/appointments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 7. **Estadísticas del Sistema**

#### `GET /api/admin/stats`
**Descripción**: Obtener estadísticas completas del sistema
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const obtenerEstadisticas = async () => {
  const response = await fetch('/api/admin/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 8. **Gestión de Logs del Sistema**

#### `GET /api/admin/logs`
**Descripción**: Obtener logs del sistema
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const obtenerLogs = async (filters?: {
  nivel?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  limite?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/admin/logs?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 9. **Migración de Médicos**

#### `GET /api/admin/doctors/migration/status`
**Descripción**: Obtener estado de migración de médicos
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const obtenerEstadoMigracion = async () => {
  const response = await fetch('/api/admin/doctors/migration/status', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### `POST /api/admin/doctors/migration/execute`
**Descripción**: Ejecutar migración de médicos
**Rol**: Administrador
**Estado**: ❌ No implementado en frontend

```typescript
// Implementación requerida
const ejecutarMigracion = async (migrationData?: {
  batch_size?: number;
  dry_run?: boolean;
}) => {
  const response = await fetch('/api/admin/doctors/migration/execute', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(migrationData || {})
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

### **Validaciones de Datos**
Los endpoints incluyen validaciones automáticas para:
- Formato de email
- Contraseñas seguras (mínimo 8 caracteres, mayúsculas, minúsculas, números, caracteres especiales)
- Formato de RUT chileno
- Formato de teléfono chileno
- Fechas válidas
- Roles permitidos

---

## 📱 Componentes Frontend Sugeridos

### **Gestión de Usuarios** ❌
- `AdminUsersList.tsx` - Lista de todos los usuarios
- `UserDetail.tsx` - Detalle completo de usuario
- `UserEditForm.tsx` - Formulario para editar usuario
- `UserDeactivateModal.tsx` - Modal para desactivar usuario

### **Gestión de Médicos** ❌
- `AdminDoctorsList.tsx` - Lista de todos los médicos
- `DoctorCreateForm.tsx` - Formulario para crear médico
- `DoctorEditForm.tsx` - Formulario para editar médico
- `DoctorDeactivateModal.tsx` - Modal para desactivar médico

### **Gestión de Recepcionistas** ❌
- `AdminReceptionistsList.tsx` - Lista de recepcionistas
- `ReceptionistDetail.tsx` - Detalle de recepcionista

### **Gestión de Administradores** ❌
- `AdminAdministratorsList.tsx` - Lista de administradores
- `AdministratorDetail.tsx` - Detalle de administrador

### **🆕 Creación de Usuarios** ❌
- `CreateUserForm.tsx` - Formulario genérico para crear usuarios
- `CreateMedicoForm.tsx` - Formulario específico para médicos
- `CreateReceptionistForm.tsx` - Formulario específico para recepcionistas
- `CreateAdminForm.tsx` - Formulario específico para administradores
- `CreateApiUserForm.tsx` - Formulario específico para usuarios API

### **🆕 Gestión de Citas** ❌
- `AdminAppointmentsList.tsx` - Lista de todas las citas
- `AppointmentFilters.tsx` - Filtros para citas
- `AppointmentDetail.tsx` - Detalle de cita específica

### **🆕 Estadísticas del Sistema** ❌
- `SystemStats.tsx` - Dashboard de estadísticas
- `StatsCards.tsx` - Tarjetas de estadísticas
- `StatsCharts.tsx` - Gráficos de estadísticas
- `TopSpecialtiesChart.tsx` - Gráfico de especialidades más solicitadas

### **🆕 Gestión de Logs** ❌
- `SystemLogs.tsx` - Lista de logs del sistema
- `LogFilters.tsx` - Filtros para logs
- `LogDetail.tsx` - Detalle de log específico

### **🆕 Migración de Médicos** ❌
- `MigrationStatus.tsx` - Estado de migración
- `MigrationExecute.tsx` - Ejecutar migración
- `MigrationProgress.tsx` - Progreso de migración

### **🆕 Gestión Avanzada de Médicos** ❌
- `DoctorLegacyCreate.tsx` - Crear médico legacy
- `DoctorDeactivateModal.tsx` - Modal para desactivar médico

---

## 🎯 Prioridades de Implementación

### **Alta Prioridad** (Funcionalidad Core)
1. `GET /api/admin/users` - Listar usuarios
2. `GET /api/admin/stats` - Estadísticas del sistema
3. `POST /api/admin/users/medico` - Crear médicos
4. `GET /api/admin/doctors` - Listar médicos
5. `PUT /api/admin/users/{id}` - Actualizar usuarios

### **Media Prioridad** (Funcionalidad secundaria)
6. `GET /api/admin/users/{id}` - Detalle de usuario
7. `DELETE /api/admin/users/{id}` - Desactivar usuarios
8. `POST /api/admin/users/recepcionista` - Crear recepcionistas
9. `GET /api/admin/recepcionistas` - Listar recepcionistas
10. `POST /api/admin/users/admin` - Crear administradores

### **Baja Prioridad** (Funcionalidad adicional)
11. `GET /api/admin/admin` - Listar administradores
12. `POST /api/admin/users/api` - Crear usuarios API
13. `GET /api/admin/logs` - Obtener logs del sistema
14. `GET /api/admin/doctors/migration/status` - Estado de migración
15. `POST /api/admin/doctors/migration/execute` - Ejecutar migración
16. `POST /api/admin/doctors` - Crear médicos legacy
17. `DELETE /api/admin/doctors/{id}` - Desactivar médicos
18. `GET /api/admin/appointments` - Ver todas las citas

---

## 📋 Checklist de Implementación

### ❌ **Pendientes** (18/18)
- [ ] **Gestión de Usuarios** (4/4 endpoints)
  - [ ] Listar todos los usuarios
  - [ ] Obtener detalle de usuario
  - [ ] Actualizar usuario
  - [ ] Desactivar usuario

- [ ] **Gestión de Médicos** (3/3 endpoints)
  - [ ] Listar todos los médicos
  - [ ] Crear nuevo médico
  - [ ] Actualizar médico

- [ ] **Gestión de Recepcionistas** (1/1 endpoint)
  - [ ] Listar recepcionistas

- [ ] **Gestión de Administradores** (1/1 endpoint)
  - [ ] Listar administradores

- [ ] **🆕 Creación de Usuarios Especiales** (4/4 endpoints)
  - [ ] Crear usuario médico
  - [ ] Crear usuario recepcionista
  - [ ] Crear usuario administrador
  - [ ] Crear usuario API

- [ ] **🆕 Gestión de Citas** (1/1 endpoint)
  - [ ] Ver todas las citas

- [ ] **🆕 Estadísticas del Sistema** (1/1 endpoint)
  - [ ] Obtener estadísticas completas

- [ ] **🆕 Gestión de Logs** (1/1 endpoint)
  - [ ] Obtener logs del sistema

- [ ] **🆕 Migración de Médicos** (2/2 endpoints)
  - [ ] Obtener estado de migración
  - [ ] Ejecutar migración

- [ ] **🆕 Gestión Avanzada de Médicos** (2/2 endpoints)
  - [ ] Crear médico legacy
  - [ ] Desactivar médico

---

**Última actualización**: Julio 2025  
**Versión**: 3.0 - Estado actualizado según LISTADO_ENDPOINTS.md 