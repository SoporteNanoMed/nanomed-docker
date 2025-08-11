# Seguridad de Contraseñas - nanoMED API

## 🔐 Resumen de Implementación

La API de nanoMED implementa las mejores prácticas de seguridad para el manejo de contraseñas:

- ✅ **Nunca se almacenan contraseñas en texto plano**
- ✅ **Hash con bcrypt y salt rounds configurables**
- ✅ **Verificación segura con timing attack protection**
- ✅ **Rehashing automático para mayor seguridad**
- ✅ **Validación de fortaleza de contraseñas**
- ✅ **Eliminación de datos sensibles en respuestas**

## 🛡️ Configuración de Seguridad

### **Salt Rounds**
```javascript
// config.js
security: {
  bcryptSaltRounds: 12, // Configurable vía BCRYPT_SALT_ROUNDS
  passwordMinLength: 8,
  passwordMaxLength: 128
}
```

### **Variables de Entorno**
```env
# Configuración de seguridad de contraseñas
BCRYPT_SALT_ROUNDS=12          # Rounds de salt para bcrypt (por defecto: 12)
PASSWORD_MIN_LENGTH=8          # Longitud mínima (por defecto: 8)
PASSWORD_MAX_LENGTH=128        # Longitud máxima (por defecto: 128)
```

## 🔧 Funciones de Seguridad

### **1. Hash de Contraseñas (`src/utils/security.js`)**

#### `hashPassword(password)`
```javascript
// Hashea una contraseña con salt rounds configurables
const hashedPassword = await hashPassword("MiContraseña123!");
// Resultado: $2b$12$...
```

#### `verifyPassword(password, hash)`
```javascript
// Verifica una contraseña contra su hash
const isValid = await verifyPassword("MiContraseña123!", hashedPassword);
// Resultado: true/false
```

### **2. Validación de Fortaleza**

#### `validatePasswordStrength(password)`
```javascript
const result = validatePasswordStrength("MiContraseña123!");
// Resultado:
{
  isValid: true,
  strength: "Fuerte",
  score: 5,
  errors: [],
  suggestions: []
}
```

#### Criterios de Validación:
- **Longitud**: 8-128 caracteres
- **Mayúsculas**: Al menos una letra mayúscula
- **Minúsculas**: Al menos una letra minúscula  
- **Números**: Al menos un dígito
- **Caracteres especiales**: Al menos uno (@$!%*?&)
- **Patrones débiles**: Detecta y penaliza patrones comunes
- **Secuencias**: Detecta secuencias de letras/números
- **Repeticiones**: Penaliza caracteres repetidos

#### Niveles de Fortaleza:
- **Muy fuerte** (6+ puntos): Cumple todos los criterios + extras
- **Fuerte** (4-5 puntos): Cumple criterios básicos + algunos extras
- **Moderada** (2-3 puntos): Cumple criterios mínimos
- **Débil** (0-1 puntos): No cumple criterios básicos

### **3. Rehashing Automático**

```javascript
// Durante el login, verifica si el hash necesita actualización
if (passwordMatch && needsRehash(user.password_hash)) {
  const newHash = await hashPassword(password);
  await updateUserPassword(user.id, newHash);
}
```

### **4. Sanitización de Datos**

```javascript
// Elimina automáticamente datos sensibles
const cleanUser = sanitizeUserData(user);
// Campos eliminados: password_hash, tokens, secrets, etc.
```

## 📊 Implementación en Endpoints

### **Registro de Usuario**
```javascript
// POST /api/auth/register
const hashedPassword = await hashPassword(userData.password);
const newUser = {
  // ... otros campos
  password_hash: hashedPassword
};
```

### **Login**
```javascript
// POST /api/auth/login
const passwordMatch = await verifyPassword(password, user.password_hash);

// Rehashing automático si es necesario
if (passwordMatch && needsRehash(user.password_hash)) {
  const newHash = await hashPassword(password);
  await updatePassword(user.id, newHash);
}
```

### **Cambio de Contraseña**
```javascript
// PUT /api/users/me/password
const currentValid = await verifyPassword(currentPassword, user.password_hash);
if (currentValid) {
  const newHash = await hashPassword(newPassword);
  await updatePassword(user.id, newHash);
}
```

### **Verificación de Fortaleza**
```javascript
// POST /api/auth/check-password-strength
const result = validatePasswordStrength(password);
return {
  isValid: result.isValid,
  strength: result.strength,
  suggestions: result.suggestions
};
```

## 🗄️ Estructura de Base de Datos

### **Tabla Usuarios**
```sql
CREATE TABLE Usuarios (
  id INT PRIMARY KEY IDENTITY(1,1),
  -- ... otros campos
  password_hash VARCHAR(255) NOT NULL,  -- Hash bcrypt
  -- ... campos de seguridad adicionales
);
```

### **Formato de Hash bcrypt**
```
$2b$12$saltsaltsaltsaltsaltsOhash43characterslong
│ │ │  │                      │
│ │ │  │                      └─ Hash (31 chars)
│ │ │  └─ Salt (22 chars)
│ │ └─ Cost factor (12 rounds)
│ └─ Minor version (b)
└─ Major version (2)
```

## 🔍 Monitoreo y Auditoría

### **Logs de Seguridad**
```javascript
// Se registran automáticamente:
- Intentos de login fallidos
- Cambios de contraseña
- Rehashing de contraseñas
- Violaciones de políticas de contraseñas
```

### **Métricas Recomendadas**
- Tiempo promedio de hash/verificación
- Frecuencia de rehashing
- Distribución de fortaleza de contraseñas
- Intentos de contraseñas débiles

## 🚨 Mejores Prácticas Implementadas

### **1. Timing Attack Protection**
```javascript
// bcrypt.compare() tiene protección integrada contra timing attacks
const isValid = await verifyPassword(password, hash);
```

### **2. Salt Único por Contraseña**
```javascript
// bcrypt genera un salt único automáticamente para cada hash
const hash1 = await hashPassword("password123");
const hash2 = await hashPassword("password123");
// hash1 !== hash2 (diferentes salts)
```

### **3. Configuración Adaptativa**
```javascript
// Salt rounds se pueden aumentar con el tiempo
// Rehashing automático actualiza hashes antiguos
const needsUpdate = needsRehash(oldHash);
```

### **4. Validación Estricta**
```javascript
// Validación tanto en frontend como backend
// Múltiples criterios de fortaleza
// Detección de patrones comunes débiles
```

## 🔧 Configuración por Ambiente

### **Desarrollo**
```env
BCRYPT_SALT_ROUNDS=10    # Más rápido para desarrollo
PASSWORD_MIN_LENGTH=6    # Menos estricto para testing
```

### **Producción**
```env
BCRYPT_SALT_ROUNDS=12    # Mayor seguridad
PASSWORD_MIN_LENGTH=8    # Estricto para usuarios reales
```

### **Alta Seguridad**
```env
BCRYPT_SALT_ROUNDS=15    # Máxima seguridad (más lento)
PASSWORD_MIN_LENGTH=12   # Contraseñas más largas
```

## 🧪 Testing de Seguridad

### **Casos de Prueba**
```javascript
// Contraseñas débiles que deben fallar
const weakPasswords = [
  "123456",
  "password",
  "qwerty",
  "admin",
  "letmein"
];

// Contraseñas fuertes que deben pasar
const strongPasswords = [
  "MyStr0ng!P@ssw0rd",
  "C0mpl3x&S3cur3!",
  "Un1qu3$P@ssw0rd2024"
];
```

### **Verificación de Hash**
```javascript
// Verificar que nunca se almacenen contraseñas en texto plano
const users = await getAllUsers();
users.forEach(user => {
  assert(user.password_hash.startsWith('$2b$'));
  assert(!user.password); // No debe existir campo 'password'
});
```

## 📈 Rendimiento

### **Benchmarks de bcrypt**
```
Salt Rounds | Tiempo (ms) | Seguridad
10          | ~100ms      | Buena
12          | ~400ms      | Muy buena (recomendado)
15          | ~3200ms     | Excelente (alta seguridad)
```

### **Optimizaciones**
- Rehashing solo cuando es necesario
- Verificación asíncrona para no bloquear
- Configuración adaptativa por ambiente

## 🔄 Mantenimiento

### **Actualizaciones Regulares**
- Revisar salt rounds anualmente
- Actualizar librerías de seguridad
- Monitorear nuevas vulnerabilidades
- Auditar contraseñas de usuarios

### **Migración de Hashes**
```javascript
// El sistema detecta y actualiza hashes antiguos automáticamente
// No requiere intervención manual del usuario
``` 