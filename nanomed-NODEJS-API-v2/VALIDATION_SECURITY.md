# Validación y Sanitización de Datos - nanoMED API

## 🛡️ Resumen de Seguridad

La API de nanoMED implementa múltiples capas de validación y sanitización para proteger contra:

- ✅ **SQL Injection** - Consultas parametrizadas
- ✅ **XSS (Cross-Site Scripting)** - Sanitización HTML
- ✅ **NoSQL Injection** - Validación de caracteres especiales
- ✅ **Inyección de comandos** - Filtrado de caracteres de control
- ✅ **Validación de tipos de datos** - Express-validator
- ✅ **Sanitización automática** - Middleware global

## 📋 Validaciones Implementadas

### **Autenticación (`src/auth/validaciones.js`)**

#### Registro de Usuario
```javascript
- Nombre/Apellido: 2-100 caracteres, solo letras y espacios
- Email: Formato válido, normalizado, máximo 255 caracteres
- Contraseña: Mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial
- RUT: Validación con dígito verificador chileno
- Teléfono: Formato chileno válido
- Fecha nacimiento: Entre 13-120 años, no futura
```

#### Login
```javascript
- Email: Formato válido
- Contraseña: Campo requerido
```

### **Usuarios (`src/users/validaciones.js`)**

#### Actualizar Perfil
```javascript
- Todos los campos opcionales con validaciones específicas
- Sanitización HTML automática
- Validación de longitudes máximas
- Escape de caracteres especiales
```

#### Cambiar Contraseña
```javascript
- Contraseña actual requerida
- Nueva contraseña: 8-128 caracteres con complejidad
- Confirmación de contraseña coincidente
```

#### Información Médica
```javascript
- Grupo sanguíneo: Lista predefinida (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Alergias/Medicamentos/Condiciones: Máximo 1000 caracteres
- Sanitización HTML en campos de texto
```

### **Citas Médicas (`src/appointments/validaciones.js`)**

#### Crear/Actualizar Cita
```javascript
- Fecha: Formato ISO8601, debe ser futura, máximo 1 año adelante
- Duración: 15-480 minutos
- Estado: programada, confirmada, completada, cancelada
- Campos de texto: Sanitizados y con límites de longitud
```

### **Administración (`src/admin/validaciones.js`)**

#### Gestión de Usuarios y Médicos
```javascript
- Validaciones específicas para roles
- Campos opcionales con validación condicional
- Sanitización de todos los inputs
- Validación de IDs numéricos
```

## 🔧 Middleware de Sanitización

### **Sanitización Global (`src/middleware/sanitization.js`)**

#### Funciones Principales:
- `sanitizeInput()`: Middleware global aplicado a todas las rutas
- `sanitizeObject()`: Sanitización recursiva de objetos
- `sanitizeString()`: Escape HTML y limpieza de caracteres de control
- `preventNoSQLInjection()`: Prevención de inyecciones NoSQL

#### Aplicación:
```javascript
// En app.js
app.use(sanitizeInput);
app.use(preventNoSQLInjection);
```

### **Validadores Personalizados**

#### RUT Chileno
```javascript
function validarRUT(rut) {
  // Validación completa con dígito verificador
  // Acepta formatos: 12345678-9, 12.345.678-9
}
```

#### Teléfono Chileno
```javascript
function validarTelefonoChileno(telefono) {
  // Patrones válidos:
  // +56912345678 (móvil con código país)
  // +56223456789 (fijo con código país)
  // 912345678 (móvil)
  // 223456789 (fijo)
}
```

## 🛡️ Protección contra SQL Injection

### **Consultas Parametrizadas**
```javascript
// ✅ CORRECTO - Consulta parametrizada
const query = "SELECT * FROM Usuarios WHERE email = @email";
request.input('email', sql.NVarChar, email);

// ❌ INCORRECTO - Concatenación directa
const query = `SELECT * FROM Usuarios WHERE email = '${email}'`;
```

### **Tipado de Parámetros**
```javascript
// Tipado automático según el tipo de dato
switch (typeof value) {
  case 'number':
    paramType = Number.isInteger(value) ? sql.Int : sql.Float;
    break;
  case 'boolean':
    paramType = sql.Bit;
    break;
  case 'object':
    paramType = value instanceof Date ? sql.DateTime : sql.NVarChar;
    break;
  default:
    paramType = sql.NVarChar;
}
```

## 🔒 Protección XSS

### **Sanitización HTML**
```javascript
// Escape automático de caracteres HTML
let sanitized = validator.escape(input);

// Ejemplo:
// Input: <script>alert('xss')</script>
// Output: &lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;
```

### **Limpieza de Caracteres de Control**
```javascript
// Remover caracteres de control peligrosos
sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
```

## 📊 Validación de Archivos

### **Límites de Tamaño**
```javascript
// Perfiles: 5MB
// Exámenes: 10MB  
// Mensajes: 25MB
```

### **Tipos de Archivo Permitidos**
```javascript
// Imágenes: jpg, jpeg, png, gif
// Documentos: pdf, doc, docx
// Validación por MIME type y extensión
```

## 🚨 Manejo de Errores

### **Respuestas Estandarizadas**
```javascript
// Error de validación
{
  "error": true,
  "message": "El email es inválido",
  "code": 400
}
```

### **Logging de Intentos Maliciosos**
```javascript
// Se registran automáticamente:
// - Intentos de inyección SQL
// - Caracteres especiales en campos
// - Violaciones de rate limiting
// - Errores de validación repetidos
```

## 🔧 Configuración y Personalización

### **Variables de Entorno**
```env
# Límites de validación personalizables
MAX_NAME_LENGTH=100
MAX_EMAIL_LENGTH=255
MAX_TEXT_FIELD_LENGTH=1000
PASSWORD_MIN_LENGTH=8
PASSWORD_MAX_LENGTH=128
```

### **Personalización de Validadores**
```javascript
// Agregar nuevos validadores en sanitization.js
function validarNuevoCampo(valor) {
  // Lógica de validación personalizada
  return esValido;
}
```

## 📈 Monitoreo y Métricas

### **Logs de Validación**
- Errores de validación se registran en `error.log`
- Intentos de inyección se marcan como críticos
- Estadísticas de validación en `combined.log`

### **Alertas Recomendadas**
- Múltiples errores de validación desde la misma IP
- Intentos de inyección SQL/NoSQL
- Patrones de ataque XSS
- Violaciones repetidas de rate limiting

## 🧪 Testing de Validaciones

### **Casos de Prueba Recomendados**
```javascript
// SQL Injection
"'; DROP TABLE Usuarios; --"

// XSS
"<script>alert('xss')</script>"

// NoSQL Injection
{ "$ne": null }

// Caracteres especiales
"test\x00\x1F\x7F"
```

### **Herramientas de Testing**
- OWASP ZAP para pruebas automatizadas
- Postman con casos de prueba maliciosos
- Burp Suite para testing manual

## 🔄 Mantenimiento

### **Actualizaciones Regulares**
- Revisar y actualizar patrones de validación
- Actualizar librerías de seguridad
- Monitorear nuevos vectores de ataque
- Revisar logs de seguridad mensualmente

### **Auditorías de Código**
- Revisar nuevas validaciones antes de deploy
- Verificar que todos los endpoints tengan validación
- Asegurar que la sanitización se aplique consistentemente 

---

## 🟢 Estado Actual de Validaciones y Seguridad (Julio 2025)

- ✅ **Validaciones y sanitización global**: Todos los endpoints principales usan validaciones estrictas y middleware de sanitización global (`sanitizeInput`, `preventNoSQLInjection`).
- ✅ **Cobertura completa de autenticación, usuarios, citas, exámenes y administración**.
- ✅ **Validadores personalizados** para RUT y teléfono chileno en todos los módulos.
- ✅ **Protección activa contra SQL Injection, XSS y NoSQL Injection**.
- ✅ **Límites de tamaño y tipo de archivos** en endpoints de subida.
- ✅ **Logging y monitoreo de intentos maliciosos**.
- 🟡 **Cobertura de testing de validaciones**: 32% de endpoints probados con casos de validación y sanitización, en aumento.

### Próximos pasos recomendados
- Ampliar cobertura de testing automatizado para validaciones y sanitización en endpoints secundarios y administrativos.
- Revisar y actualizar patrones de validación ante nuevos vectores de ataque.
- Mantener auditorías de código y actualización de librerías de seguridad.

--- 