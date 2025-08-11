# 🛡️ Protección CSRF - Nanomed API

## 📋 Resumen

Este documento describe la implementación de protección Cross-Site Request Forgery (CSRF) en la API de Nanomed.

## 🚨 ¿Qué es CSRF?

CSRF es un ataque donde un sitio malicioso engaña al navegador del usuario para que realice acciones no deseadas en un sitio web donde el usuario está autenticado.

## 🛠️ Implementación

### 1. Middleware CSRF Condicional

La protección CSRF se aplica **selectivamente** a:
- ✅ Métodos que modifican datos: `POST`, `PUT`, `DELETE`, `PATCH`
- ✅ Rutas críticas: `/api/auth/*`, `/api/users/*`, `/api/admin/*`, etc.
- ❌ Métodos de solo lectura: `GET`, `HEAD`, `OPTIONS`

### 2. Configuración de Cookies

```javascript
cookie: {
  httpOnly: true,           // No accesible desde JavaScript
  secure: true,             // Solo HTTPS en producción
  sameSite: 'strict',       // Protección adicional
  maxAge: 3600000          // 1 hora de expiración
}
```

### 3. Múltiples Formas de Envío del Token

El token CSRF puede enviarse mediante:
- Header: `X-CSRF-Token`
- Header: `X-XSRF-Token`
- Header: `CSRF-Token`
- Body: `_csrf`
- Query: `_csrf`

## 🔧 Uso para Desarrolladores Frontend

### 1. Obtener Token CSRF

```javascript
// Obtener token CSRF
const response = await fetch('/api/csrf-token', {
  credentials: 'include'
});
const { body } = await response.json();
const csrfToken = body.csrfToken;
```

### 2. Enviar Token en Requests

```javascript
// Opción 1: En el header (RECOMENDADO)
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify(loginData)
});

// Opción 2: En el body
fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    ...registerData,
    _csrf: csrfToken
  })
});
```

### 3. Manejo de Errores CSRF

```javascript
try {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(userData)
  });

  if (response.status === 403) {
    // Token CSRF inválido - obtener nuevo token
    await refreshCsrfToken();
    // Reintentar request
  }
} catch (error) {
  console.error('Error CSRF:', error);
}
```

## 🔍 Rutas Protegidas

Las siguientes rutas requieren token CSRF:

### Autenticación
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Usuarios
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `PATCH /api/users/:id`

### Administración
- `POST /api/admin/*`
- `PUT /api/admin/*`
- `DELETE /api/admin/*`

### Citas y Doctores
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `POST /api/doctors`
- `PUT /api/doctors/:id`

## 🚫 Rutas NO Protegidas

- `GET` requests (solo lectura)
- `HEAD`, `OPTIONS` requests
- Rutas de archivos estáticos (`/uploads/*`)
- Endpoint de obtención de token (`/api/csrf-token`)

## ⚠️ Consideraciones Importantes

### 1. Compatibilidad con JWT
- La protección CSRF complementa (no reemplaza) la autenticación JWT
- Ambos mecanismos trabajan juntos para mayor seguridad

### 2. Desarrollo vs Producción
- En desarrollo: cookies pueden usar HTTP
- En producción: cookies DEBEN usar HTTPS (`secure: true`)

### 3. SameSite Policy
- `sameSite: 'strict'` proporciona protección adicional
- Puede requerir ajustes si hay subdominios

## 🧪 Testing

### Verificar Protección CSRF

```bash
# Request sin token CSRF (debe fallar)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Respuesta esperada: 403 Forbidden

# Request con token CSRF (debe funcionar)
# 1. Obtener token
curl -X GET http://localhost:8080/api/csrf-token \
  -c cookies.txt

# 2. Usar token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: [TOKEN_OBTENIDO]" \
  -b cookies.txt \
  -d '{"email":"test@test.com","password":"password"}'
```

## 📊 Monitoreo

Los intentos de CSRF fallidos se registran en los logs con:
- IP del atacante
- Ruta intentada
- Timestamp
- User-Agent

## 🔄 Actualización de Tokens

Los tokens CSRF expiran cada hora. El frontend debe:
1. Manejar errores 403
2. Obtener nuevo token automáticamente
3. Reintentar el request original

## 🎯 Beneficios de Seguridad

✅ **Previene ataques CSRF** en formularios y requests maliciosos
✅ **Protección selectiva** - no impacta performance en requests de lectura  
✅ **Múltiples métodos de envío** - flexibilidad para diferentes frontends
✅ **Integración transparente** - no requiere cambios en lógica de negocio
✅ **Compatible con JWT** - doble capa de seguridad 