# 🚀 Guía de Swagger UI - Nanomed API v2

## 📋 Descripción

Swagger UI ha sido configurado exitosamente en el proyecto Nanomed API v2 para proporcionar una interfaz web interactiva que permite:

- 📖 **Documentación visual** de todos los endpoints
- 🧪 **Pruebas en vivo** de la API directamente desde el navegador
- 🔐 **Autenticación integrada** con JWT tokens
- 📝 **Ejemplos de requests** y responses
- 🔍 **Búsqueda y filtrado** de endpoints

## 🌐 Acceso a Swagger UI

### URLs Disponibles

| Endpoint | Descripción | Formato |
|----------|-------------|---------|
| `http://localhost:8080/api-docs` | **Interfaz Swagger UI** | HTML Interactivo |
| `http://localhost:8080/api-docs.json` | **Especificación OpenAPI** | JSON |
| `http://localhost:8080/` | **Estado de la API** | JSON |

### Entornos

- **Desarrollo Local**: `http://localhost:8080/api-docs`
- **Producción**: `https://tu-dominio.azurewebsites.net/api-docs`

## 🔧 Configuración Implementada

### Dependencias Instaladas

```json
{
  "swagger-ui-express": "^5.0.0",
  "yamljs": "^0.3.0"
}
```

### Archivos Modificados

- ✅ `app.js` - Configuración de Swagger UI
- ✅ `package.json` - Dependencias agregadas
- ✅ `openapi.yaml` - Especificación existente utilizada

## 🎯 Características de Swagger UI

### ✨ Funcionalidades Principales

1. **Documentación Visual**
   - 88 endpoints documentados
   - Esquemas de datos completos
   - Ejemplos de requests/responses
   - Códigos de estado HTTP

2. **Interfaz Interactiva**
   - Botón "Try it out" para cada endpoint
   - Editor de parámetros en tiempo real
   - Visualización de responses
   - Historial de requests

3. **Autenticación JWT**
   - Botón "Authorize" en la parte superior
   - Campo para ingresar Bearer Token
   - Tokens persistentes durante la sesión

4. **Organización por Tags**
   - Autenticación
   - Usuarios
   - Médicos
   - Citas
   - Recepcionistas
   - Exámenes
   - Administración
   - Notificaciones
   - Búsqueda

## 🚀 Cómo Usar Swagger UI

### 1. Acceder a la Interfaz

```bash
# Iniciar el servidor
npm run dev

# Abrir en navegador
open http://localhost:8080/api-docs
```

### 2. Autenticación

1. **Obtener Token JWT**:
   - Ir a `/api/auth/login`
   - Hacer POST con credenciales
   - Copiar el token del response

2. **Autorizar en Swagger**:
   - Hacer clic en "Authorize" (🔒)
   - Ingresar: `Bearer tu_token_aqui`
   - Hacer clic en "Authorize"

### 3. Probar Endpoints

1. **Seleccionar endpoint** de la lista
2. **Hacer clic en "Try it out"**
3. **Completar parámetros** requeridos
4. **Ejecutar** con "Execute"
5. **Revisar response** y códigos de estado

## 📊 Endpoints Disponibles

### 🔐 Autenticación (6 endpoints)
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify-email/{token}` - Verificar email
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

### 👥 Usuarios (8 endpoints)
- `GET /api/users/me` - Perfil del usuario
- `PUT /api/users/me` - Actualizar perfil
- `PUT /api/users/me/password` - Cambiar contraseña
- `POST /api/users/me/profile-picture` - Subir foto
- `DELETE /api/users/me/profile-picture` - Eliminar foto
- `GET /api/users/me/emergency-contacts` - Contactos emergencia
- `POST /api/users/me/emergency-contacts` - Agregar contacto
- `GET /api/users/me/medical-info` - Información médica

### 👨‍⚕️ Médicos (4 endpoints)
- `GET /api/doctors` - Listar médicos
- `GET /api/doctors/{id}` - Ver médico específico
- `GET /api/doctors/specialties/{specialtyId}` - Por especialidad
- `GET /api/doctors/me/appointments` - Mis citas como médico

### 🏥 Citas (6 endpoints)
- `GET /api/appointments` - Listar citas propias
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/{id}` - Actualizar cita
- `DELETE /api/appointments/{id}` - Cancelar cita
- `POST /api/appointments/{id}/confirm` - Confirmar asistencia
- `POST /api/appointments/{id}/reschedule` - Reprogramar

### 👩‍💼 Recepcionistas (15+ endpoints)
- `GET /api/receptionists/appointments` - Todas las citas
- `POST /api/receptionists/appointments` - Crear cita para paciente
- `GET /api/receptionists/patients` - Todos los pacientes
- `GET /api/receptionists/doctors` - Todos los médicos
- `GET /api/receptionists/stats/daily` - Estadísticas diarias

### 🔬 Exámenes (5 endpoints)
- `GET /api/exams` - Listar exámenes
- `POST /api/exams` - Crear examen
- `GET /api/exams/{id}` - Ver examen específico
- `PUT /api/exams/{id}` - Actualizar examen
- `DELETE /api/exams/{id}` - Eliminar examen

### 🔧 Administración (10+ endpoints)
- `GET /api/admin/users` - Gestión de usuarios
- `POST /api/admin/users/medico` - Crear médico
- `POST /api/admin/users/recepcionista` - Crear recepcionista
- `GET /api/admin/stats` - Estadísticas del sistema
- `GET /api/admin/logs` - Logs del sistema

## 🛠️ Configuración Avanzada

### Personalización de Swagger UI

```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Nanomed API v2 - Documentación',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));
```

### Variables de Entorno

```env
# Swagger UI se configura automáticamente
# No requiere variables adicionales
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error 404 en /api-docs**
   - Verificar que el servidor esté corriendo
   - Confirmar que las dependencias estén instaladas

2. **Error de CORS**
   - Swagger UI está configurado para funcionar en localhost
   - Para producción, ajustar configuración CORS

3. **Token JWT no funciona**
   - Verificar formato: `Bearer token_aqui`
   - Confirmar que el token no haya expirado
   - Usar endpoint de login para obtener token válido

4. **Archivo openapi.yaml no se carga**
   - Verificar que el archivo existe en la raíz
   - Swagger UI tiene fallback automático

### Logs de Debug

```bash
# Ver logs del servidor
npm run dev

# Verificar sintaxis del archivo
node -c app.js
```

## 📚 Recursos Adicionales

### Documentación Oficial
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [OpenAPI Specification](https://swagger.io/specification/)
- [YAML.js](https://github.com/jeremyfa/yaml.js)

### Archivos Relacionados
- `openapi.yaml` - Especificación completa de la API
- `openapi.json` - Versión JSON de la especificación
- `postman_collection.json` - Colección de Postman

## 🎉 Beneficios Implementados

### Para Desarrolladores
- ✅ **Documentación siempre actualizada**
- ✅ **Pruebas rápidas sin Postman**
- ✅ **Ejemplos de código automáticos**
- ✅ **Validación de requests en tiempo real**

### Para QA/Testing
- ✅ **Interfaz visual intuitiva**
- ✅ **Historial de requests**
- ✅ **Códigos de error detallados**
- ✅ **Autenticación simplificada**

### Para Integración
- ✅ **Especificación OpenAPI estándar**
- ✅ **Compatible con herramientas externas**
- ✅ **Generación automática de clientes**
- ✅ **Documentación exportable**

---

**🎯 Swagger UI está listo para usar en `http://localhost:8080/api-docs`**
