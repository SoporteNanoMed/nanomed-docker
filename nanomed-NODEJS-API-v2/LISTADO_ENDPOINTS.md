# Documentación de Pruebas de Endpoints - Nanomed API v2

## Información General
- **Base URL Desarrollo**: `http://localhost:4000`
- **Base URL Producción**: `https://nanomed-nodejs-api-v2.azurewebsites.net`
- **Autenticación**: Token JWT en header `Authorization: Bearer <token>`
- **Roles del Sistema**: Usuario, Médico, Recepcionista, Admin, API
- **Entorno de Pruebas Postman**: NanoMED CSRF

---

## 📋 TABLA COMPLETA DE ENDPOINTS

| ID | Método | Endpoint | Usuario | Categoría | Descripción | Implementado en Frontend |
|----|--------|----------|---------|-----------|-------------|-------------------------|
| 01 | POST | `/api/auth/register` | Público | Autenticación | Registrar nuevo usuario | ✅ |
| 02 | POST | `/api/auth/login` | Público | Autenticación | Iniciar sesión | ✅ |
| 03 | POST | `/api/auth/logout` | Autenticado | Autenticación | Cerrar sesión | ✅ |
| 04 | GET | `/api/auth/verify-email/{token}` | Público | Autenticación | Verificar email | ✅ |
| 05 | POST | `/api/auth/forgot-password` | Público | Autenticación | Solicitar restablecimiento | ✅ |
| 06 | POST | `/api/auth/reset-password` | Público | Autenticación | Restablecer contraseña | ✅ |
| 07 | GET | `/api/users/me` | Autenticado | Gestión de Usuarios | Obtener perfil propio | ✅ |
| 08 | PUT | `/api/users/me` | Autenticado | Gestión de Usuarios | Actualizar perfil propio | ✅ |
| 09 | POST | `/api/users/me/profile-picture` | Autenticado | Gestión de Usuarios | Subir foto de perfil | ✅ |
| 10 | DELETE | `/api/users/me/profile-picture` | Autenticado | Gestión de Usuarios | Eliminar foto de perfil | ❌ |
| 11 | GET | `/api/doctors` | Autenticado | Médicos | Listar médicos disponibles | ✅ |
| 12 | GET | `/api/doctors/{id}` | Autenticado | Médicos | Obtener médico específico | ✅ |
| 13 | GET | `/api/doctors/me/appointments` | Médico, Admin | Médicos | Listar citas del médico | ❌ |
| 14 | GET | `/api/doctors/me/appointments/{id}` | Médico, Admin | Médicos | Detalle de cita específica | ❌ |
| 15 | PUT | `/api/doctors/me/appointments/{id}/status` | Médico, Admin | Médicos | Actualizar estado de cita | ❌ |
| 16 | GET | `/api/appointments` | Autenticado | Gestión de Citas | Listar citas propias | ✅ |
| 17 | POST | `/api/appointments` | Usuario, Recep, Admin | Gestión de Citas | Crear nueva cita | ✅ |
| 18 | PUT | `/api/appointments/{id}` | Usuario, Recep, Admin | Gestión de Citas | Actualizar cita | ✅ |
| 19 | DELETE | `/api/appointments/{id}` | Usuario, Recep, Admin | Gestión de Citas | Cancelar cita | ✅ |
| 20 | GET | `/api/receptionists/appointments` | Recep, Admin | Recepcionistas | Listar todas las citas | ✅ |
| 21 | POST | `/api/receptionists/appointments` | Recep, Admin | Recepcionistas | Crear cita para paciente | ✅ |
| 22 | PUT | `/api/receptionists/appointments/{id}` | Recep, Admin | Recepcionistas | Actualizar cualquier cita | ✅ |
| 23 | DELETE | `/api/receptionists/appointments/{id}` | Recep, Admin | Recepcionistas | Cancelar cualquier cita | ✅ |
| 24 | GET | `/api/receptionists/patients` | Recep, Admin | Recepcionistas | Listar todos los pacientes | ✅ |
| 25 | GET | `/api/receptionists/patients/{id}` | Recep, Admin | Recepcionistas | Info detallada de paciente | ❌ |
| 26 | GET | `/api/receptionists/doctors` | Recep, Admin | Recepcionistas | Listar todos los médicos | ❌ |
| 27 | GET | `/api/receptionists/doctors/{id}/availability` | Recep, Admin | Recepcionistas | Disponibilidad de médico | ❌ | - OBSOLETO
| 28 | GET | `/api/receptionists/stats/daily` | Recep, Admin | Recepcionistas | Estadísticas diarias | ❌ |
| 29 | POST | `/api/receptionists/doctors/{id}/schedule` | Recep, Admin | Recepcionistas | Establecer horarios médico | ✅  |
| 30 | GET | `/api/receptionists/doctors/{id}/schedule` | Recep, Admin | Recepcionistas | Consultar horarios médico | ✅ |
| 31 | PUT | `/api/receptionists/doctors/{id}/schedule/{scheduleId}` | Recep, Admin | Recepcionistas | Actualizar horario específico | ❌ |
| 32 | DELETE | `/api/receptionists/doctors/{id}/schedule/{scheduleId}` | Recep, Admin | Recepcionistas | Eliminar horario específico | ❌ |
| 33 | POST | `/api/receptionists/doctors/{id}/schedule/exceptions` | Recep, Admin | Recepcionistas | Agregar excepción horario | ✅ |
| 34 | GET | `/api/receptionists/doctors/{id}/schedule/exceptions` | Recep, Admin | Recepcionistas | Listar excepciones médico | ❌ |
| 35 | DELETE | `/api/receptionists/doctors/{id}/schedule/exceptions/{id}` | Recep, Admin | Recepcionistas | Eliminar excepción | ❌ |
| 36 | GET | `/api/receptionists/doctors/{id}/availability-updated` | Recep, Admin | Recepcionistas | Disponibilidad actualizada | ✅ |
| 37 | GET | `/api/exams` | Autenticado | Exámenes | Listar exámenes (Blob Storage) | ✅ |
| 38 | POST | `/api/exams` | Médico, Recep, Admin | Exámenes | 🚫 **ELIMINADO** - Crear examen BD | 🚫 |
| 39 | GET | `/api/exams/{id}` | Autenticado | Exámenes | 🚫 **ELIMINADO** - Obtener examen BD | 🚫 |
| 40 | PUT | `/api/exams/{id}` | Médico, Recep, Admin | Exámenes | 🚫 **ELIMINADO** - Actualizar examen BD | 🚫 |
| 41 | DELETE | `/api/exams/{id}` | Médico, Recep, Admin | Exámenes | 🚫 **ELIMINADO** - Eliminar examen BD | 🚫 |
| 42 | GET | `/api/exams/{id}/file` | Autenticado | Exámenes | 🚫 **ELIMINADO** - Descargar archivo BD | 🚫 |
| 43 | GET | `/api/admin/users` | Admin | Administración | Listar todos los usuarios | ❌ |
| 44 | POST | `/api/admin/users/medico` | Admin | Administración | Crear nuevo usuario médico | ❌ |
| 45 | POST | `/api/admin/users/recepcionista` | Admin | Administración | Crear nuevo recepcionista | ❌ |
| 46 | POST | `/api/admin/users/admin` | Admin | Administración | Crear nuevo administrador | ❌ |
| 47 | POST | `/api/admin/users/api` | Admin | Administración | Crear nuevo usuario API | ❌ |
| 48 | GET | `/api/admin/stats` | Admin | Administración | Estadísticas del sistema | ❌ |
| 49 | GET | `/api/admin/logs` | Admin | Administración | Obtener logs del sistema | ❌ |
| 50 | GET | `/api/admin/doctors` | Admin | Administración | Listar todos los médicos | ❌ |
| 51 | GET | `/api/admin/recepcionistas` | Admin | Administración | Listar recepcionistas | ❌ |
| 52 | PUT | `/api/admin/users/{id}` | Admin | Administración | Actualizar datos usuarios | ❌ |
| 53 | GET | `/api/admin/admin` | Admin | Administración | Listar administradores | ❌ |
| 54 | GET | `/api/specialties` | Público | Especialidades | Listar especialidades | ❌ |
| 55 | GET | `/api/specialties/stats` | Público | Especialidades | Estadísticas especialidades | ❌ |
| 56 | GET | `/api/specialties/{nombre}` | Público | Especialidades | Info especialidad específica | ❌ |
| 57 | GET | `/api/search/doctors` | Autenticado | Búsquedas | Buscar médicos | ✅ |
| 58 | GET | `/api/search/exams` | Autenticado | Búsquedas | Buscar exámenes (Blob Storage) | ✅ |
| 59 | GET | `/api/notifications` | Autenticado | Notificaciones | Listar notificaciones | ✅ |
| 60 | PUT | `/api/notifications/{id}/read` | Autenticado | Notificaciones | Marcar como leída | ❌ |
| 61 | PUT | `/api/notifications/read-all` | Autenticado | Notificaciones | Marcar todas como leídas | ✅ |
| 62 | DELETE | `/api/notifications/{id}` | Autenticado | Notificaciones | Eliminar notificación | ✅ |
| 63 | GET | `/api/notifications/preferences` | Autenticado | Notificaciones | Obtener preferencias | ❌ |
| 64 | PUT | `/api/notifications/preferences` | Autenticado | Notificaciones | Actualizar preferencias | ❌ |
| 65 | GET | `/api/conversations` | Autenticado | Conversaciones | 🚫 **ELIMINADO** | 🚫 |
| 66 | GET | `/api/conversations/{id}` | Autenticado | Conversaciones | 🚫 **ELIMINADO** | 🚫 |
| 67 | POST | `/api/conversations` | Autenticado | Conversaciones | 🚫 **ELIMINADO** | 🚫 |
| 68 | POST | `/api/conversations/{id}/messages` | Autenticado | Conversaciones | 🚫 **ELIMINADO** | 🚫 |
| 69 | PUT | `/api/conversations/{id}/messages/{messageId}/read` | Autenticado | Conversaciones | 🚫 **ELIMINADO** | 🚫 |
| 70 | POST | `/api/conversations/{id}/messages/{messageId}/attachment` | Autenticado | Conversaciones | 🚫 **ELIMINADO** | 🚫 |
| 71 | GET | `/api/conversations/{id}/messages/{messageId}/attachment` | Autenticado | Conversaciones | 🚫 **ELIMINADO** | 🚫 |
| 72 | GET | `/api/users/me/emergency-contacts` | Autenticado | Contactos de Emergencia | Listar contactos emergencia | ❌ |
| 73 | POST | `/api/users/me/emergency-contacts` | Autenticado | Contactos de Emergencia | Agregar contacto emergencia | ❌ |
| 74 | PUT | `/api/users/me/emergency-contacts/{id}` | Autenticado | Contactos de Emergencia | Actualizar contacto | ❌ |
| 75 | DELETE | `/api/users/me/emergency-contacts/{id}` | Autenticado | Contactos de Emergencia | Eliminar contacto | ❌ |
| 76 | GET | `/api/users/me/medical-info` | Autenticado | Información Médica | Obtener info médica | ❌ |
| 77 | PUT | `/api/users/me/medical-info` | Autenticado | Información Médica | Actualizar info médica | ❌ |
| 78 | PUT | `/api/users/me/password` | Autenticado | Gestión de Usuarios | Cambiar contraseña | ❌ |
| 79 | POST | `/api/auth/check-password-strength` | Público | Autenticación | Verificar fortaleza contraseña | ❌ |
| 80 | POST | `/api/appointments/{id}/confirm` | Autenticado | Gestión de Citas | Confirmar asistencia cita | ❌ |
| 81 | POST | `/api/appointments/{id}/reschedule` | Autenticado | Gestión de Citas | Reprogramar cita | ❌ |
| 82 | GET | `/api/appointments/available-slots` | Autenticado | Gestión de Citas | Obtener horarios disponibles | ❌ |
| 83 | GET | `/api/doctors/specialties/{specialtyId}` | Autenticado | Médicos | Médicos por especialidad | ❌ |
| 84 | GET | `/api/admin/users/{id}` | Admin | Administración | Ver detalle usuario específico | ❌ |
| 85 | DELETE | `/api/admin/users/{id}` | Admin | Administración | Desactivar usuario | ❌ |
| 86 | POST | `/api/admin/doctors` | Admin | Administración | Crear nuevo médico | ❌ |
| 87 | DELETE | `/api/admin/doctors/{id}` | Admin | Administración | Desactivar médico | ❌ |
| 88 | GET | `/api/admin/doctors/migration/status` | Admin | Administración | Estado de migración | ❌ |
| 89 | POST | `/api/admin/doctors/migration/execute` | Admin | Administración | Ejecutar migración | ❌ |
| 90 | GET | `/api/admin/appointments` | Admin | Administración | Ver todas las citas | ❌ |
| 91 | POST | `/api/receptionists/doctors/{id}/availability-blocks` | Recep, Admin | Bloques de Disponibilidad | Crear bloques específicos | ✅ |
| 92 | GET | `/api/receptionists/doctors/{id}/availability-blocks` | Recep, Admin | Bloques de Disponibilidad | Obtener bloques disponibilidad | ✅ |
| 93 | POST | `/api/receptionists/doctors/{id}/availability-blocks/generate` | Recep, Admin | Bloques de Disponibilidad | Generar bloques automáticamente | ✅ |
| 94 | DELETE | `/api/receptionists/doctors/{id}/availability-blocks` | Recep, Admin | Bloques de Disponibilidad | Eliminar bloques disponibilidad | ✅ |
| 95 | PUT | `/api/receptionists/availability-blocks/{id}/disable` | Recep, Admin | Bloques de Disponibilidad | Marcar bloque no disponible | ✅ |
| 96 | PUT | `/api/receptionists/availability-blocks/{id}/enable` | Recep, Admin | Bloques de Disponibilidad | Marcar bloque disponible | ✅ |

### **Leyenda:**
- **✅**: Implementado en frontend
- **❌**: No implementado en frontend
- **🚫**: Eliminado del proyecto
- **Usuarios**: Público, Autenticado, Usuario, Médico, Recep, Admin, API

### **Estadísticas:**
- **Total Endpoints**: 96 (12 eliminados + 84 activos)
- **Cambios recientes**: Migración de exámenes de BD a Blob Storage
- **Implementados en Frontend**: 36/84 (43%)

---
---

## 🗑️ ENDPOINTS ELIMINADOS - MIGRACIÓN A BLOB STORAGE

### ⚠️ IMPORTANTE: Gestión de Exámenes Migrada

**Fecha de eliminación**: Enero 2025  
**Motivo**: Migración completa de gestión de exámenes de base de datos a Azure Blob Storage para mejor rendimiento y escalabilidad.

### 📋 Endpoints Eliminados de Gestión en Base de Datos

Los siguientes endpoints ya **NO ESTÁN DISPONIBLES** y retornarán error 404:

| ID | Método | Endpoint | Descripción | Estado |
|----|--------|----------|-------------|---------|
| 37 | GET | `/api/exams` | Listar exámenes desde BD | ❌ **ELIMINADO** |
| 38 | POST | `/api/exams` | Crear examen en BD | ❌ **ELIMINADO** |
| 39 | GET | `/api/exams/{id}` | Obtener examen específico desde BD | ❌ **ELIMINADO** |
| 40 | PUT | `/api/exams/{id}` | Actualizar examen en BD | ❌ **ELIMINADO** |
| 41 | DELETE | `/api/exams/{id}` | Eliminar examen de BD | ❌ **ELIMINADO** |
| 42 | GET | `/api/exams/{id}/file` | Descargar archivo desde BD | ❌ **ELIMINADO** |
| 58 | GET | `/api/search/exams` | Buscar exámenes en BD | ✅ **MIGRADO** |

### 🔄 Endpoints de Reemplazo - Blob Storage

Usa estos nuevos endpoints para gestión de exámenes:

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/api/exams` | Listar exámenes desde blob storage | Todos los roles |
| GET | `/api/exams/blob/{id}` | Obtener examen específico del blob | Todos los roles |
| GET | `/api/exams/blob/{id}/download` | Descargar archivo del blob | Todos los roles |
| GET | `/api/admin/exams/blob` | Listar todos los exámenes (admin) | Admin |
| GET | `/api/admin/exams/blob/stats` | Estadísticas de exámenes | Admin |
| GET | `/api/doctor/exams/blob` | Listar exámenes (médicos) | Admin, Médico |
| GET | `/api/doctor/exams/blob/user/{userId}` | Exámenes de usuario específico | Admin, Médico |
| DELETE | `/api/doctor/exams/blob/{id}` | Eliminar examen del blob | Admin, Médico |
| POST | `/api/doctor/exams/blob/{id}/move` | Mover examen a carpeta | Admin, Médico |
| POST | `/api/doctor/exams/blob/bulk-action` | Acciones masivas en exámenes | Admin, Médico |
| GET | `/api/search/exams` | Buscar exámenes en blob storage | Todos los roles |

### 📝 Notas de Migración

1. **Cambio de IDs**: Los IDs de exámenes ahora usan formato `blob_` en lugar de números secuenciales
2. **Nuevos permisos**: Mayor granularidad en permisos por rol
3. **Mejor rendimiento**: Descarga directa desde Azure Blob Storage
4. **Gestión masiva**: Nuevas funcionalidades para operaciones en lote
5. **Estadísticas**: Estadísticas en tiempo real desde blob storage

### 🚨 Acción Requerida para Desarrolladores

- **Frontend**: Actualizar todas las llamadas a endpoints eliminados
- **Postman**: Actualizar colección con nuevos endpoints
- **Documentación**: Revisar integraciones existentes
- **Testing**: Probar nuevos flujos de blob storage

---

**Última actualización**: 18/07/2025  
**Versión del documento**: 10.0 - Migración completa a Blob Storage para gestión de exámenes