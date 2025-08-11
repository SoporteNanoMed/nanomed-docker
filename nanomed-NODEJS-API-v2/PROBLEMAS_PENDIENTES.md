# Problemas Pendientes - API NanoMED

## Documentación: Problema CSRF y Solución Implementada

### Resumen del Problema

Durante el desarrollo y testing de la API de NanoMED, se encontró un problema persistente con la protección CSRF (Cross-Site Request Forgery) que impedía el correcto funcionamiento de los endpoints, especialmente el endpoint de login.

### Descripción del Error

#### Error Principal
```json
{
    "error": true,
    "status": 500,
    "body": "misconfigured csrf"
}
```

#### Error Secundario
```json
{
    "error": true,
    "status": 403,
    "body": "Token CSRF inválido o faltante"
}
```

### Análisis del Problema

#### 1. Configuración Inicial
La API tenía implementada protección CSRF usando la librería `csurf` con las siguientes características:
- Protección condicional aplicada solo a métodos POST, PUT, DELETE, PATCH
- Rutas protegidas: `/api/auth/`, `/api/users/`, `/api/doctors/`, `/api/appointments/`, `/api/admin/`
- Configuración de cookies con `httpOnly`, `sameSite` y configuración específica para producción

#### 2. Problemas Identificados

##### A. Error "misconfigured csrf"
- **Causa**: La librería `csurf` no podía establecer correctamente las cookies necesarias
- **Origen**: Configuración incompatible entre el middleware CSRF y el entorno de desarrollo
- **Impacto**: Imposibilidad de generar tokens CSRF válidos

##### B. Problema Circular
- **Situación**: Para obtener un token CSRF válido, se necesitaba hacer una petición GET a `/api/csrf-token`
- **Conflicto**: Este endpoint también estaba siendo protegido por el middleware CSRF
- **Resultado**: Imposibilidad de obtener el token inicial necesario

##### C. Complejidad en Testing
- **Postman**: Requería configuración compleja de cookies y manejo de tokens
- **Desarrollo**: Cada petición necesitaba un flujo de 2 pasos (obtener token → usar token)
- **Debugging**: Dificultad para identificar si los errores eran de autenticación o de CSRF

### Intentos de Solución

#### 1. Configuración de Cookies
```javascript
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 3600000,
  key: '_csrf'
}
```

#### 2. Exclusión del Endpoint de Token
```javascript
if (req.path === '/api/csrf-token' && req.method === 'GET') {
  return next();
}
```

#### 3. Manejo de Errores Mejorado
```javascript
csrfProtection(req, res, (err) => {
  if (err) {
    console.log('Error en CSRF middleware:', err.message);
    return next(error('Token CSRF inválido o faltante', 403));
  }
  next();
});
```

#### 4. Variable de Entorno DISABLE_CSRF
```bash
DISABLE_CSRF=true node index.js
```

### Solución Final Implementada

#### Decisión: Deshabilitar CSRF en Desarrollo

Después de múltiples intentos de configuración, se decidió implementar una solución que **deshabilita automáticamente CSRF en entornos de desarrollo**.

#### Implementación
```javascript
const csrfDisabled = process.env.DISABLE_CSRF === 'true' || process.env.NODE_ENV !== 'production';

if (csrfDisabled) {
  console.log('CSRF deshabilitado - permitiendo petición:', req.method, req.path);
  return next();
}
```

#### Criterios de Deshabilitación
1. **Variable explícita**: `DISABLE_CSRF=true`
2. **Entorno de desarrollo**: `NODE_ENV !== 'production'`

### Justificación de la Decisión

#### 1. Enfoque en Desarrollo
- **Prioridad**: Permitir desarrollo y testing fluido de la API
- **Productividad**: Eliminar barreras innecesarias durante el desarrollo
- **Testing**: Simplificar las pruebas en Postman y herramientas similares

#### 2. Seguridad Mantenida en Producción
- **Producción**: CSRF permanece activo cuando `NODE_ENV=production`
- **Flexibilidad**: Posibilidad de habilitar CSRF en desarrollo si es necesario
- **Control**: Variable de entorno permite control granular

#### 3. Beneficios Inmediatos
- **Simplicidad**: Peticiones directas sin tokens adicionales
- **Velocidad**: Testing más rápido y eficiente
- **Debugging**: Menos variables en la ecuación de errores

### Configuración para Postman

#### Desarrollo (CSRF Deshabilitado)
```
POST {{baseUrl}}/api/auth/login
Headers: Content-Type: application/json
Body: {"email": "soporte@nanomed.cl", "password": "Admin1234$"}
```

#### Producción (CSRF Habilitado)
```
1. GET {{baseUrl}}/api/csrf-token
2. POST {{baseUrl}}/api/auth/login
   Headers: 
   - Content-Type: application/json
   - X-CSRF-Token: {{csrfToken}}
   Body: {"email": "soporte@nanomed.cl", "password": "Admin1234$"}
```

### Recomendaciones Futuras

#### 1. Para Desarrollo
- Mantener CSRF deshabilitado para agilizar el desarrollo
- Usar la configuración actual que detecta automáticamente el entorno

#### 2. Para Producción
- Asegurar que `NODE_ENV=production` esté configurado
- Realizar pruebas específicas de CSRF antes del despliegue
- Documentar el flujo de obtención de tokens para el frontend

#### 3. Para Testing
- Crear scripts automatizados que manejen el flujo CSRF en producción
- Mantener colecciones separadas de Postman para desarrollo y producción

### Estado Actual
- ✅ **RESUELTO**: CSRF deshabilitado en desarrollo
- ✅ **FUNCIONAL**: Login y endpoints funcionando correctamente
- ⚠️ **PENDIENTE**: Testing en entorno de producción con CSRF habilitado

---

## Otros Problemas Pendientes

### 1. Conexión a Base de Datos
- **Estado**: ✅ Configurada y funcional
- **Notas**: La conexión a SQL Server está activa y utilizada en todos los módulos principales (usuarios, citas, pagos, exámenes, etc.).
- **Acción futura**: Monitorear logs y credenciales en despliegues.

### 2. Configuración de Entorno
- **Estado**: ✅ Completada
- **Notas**: Existe archivo `.env` documentado y todas las variables críticas están integradas en la configuración y el README. El sistema utiliza dotenv y variables de entorno para todos los servicios.
- **Acción futura**: Mantener actualizado el archivo `.env` en cada entorno.

### 3. Testing de Endpoints
- **Estado**: 🟡 En progreso (32% cobertura)
- **Completado**: Login, usuarios, citas, pagos, exámenes y módulos principales probados.
- **Pendiente**: Pruebas completas de endpoints secundarios y administrativos. Actualmente 28/88 endpoints probados (32%).
- **Acción futura**: Continuar con pruebas automatizadas y manuales, priorizando endpoints críticos y de administración.

---

*Documento creado: Junio 2025*  
*Última actualización: Julio 2025* 