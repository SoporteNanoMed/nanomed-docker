# Migración a TypeORM

## 📋 Resumen

Esta migración convierte la API de Node.js de usar consultas SQL directas a TypeORM, proporcionando:

- ✅ Mejor tipado y validación
- ✅ Relaciones entre entidades
- ✅ Migraciones automáticas
- ✅ Query Builder más robusto
- ✅ Mejor manejo de errores

## 🚀 Instalación

Las dependencias ya están instaladas:

```bash
npm install typeorm reflect-metadata @types/node
```

## 📁 Estructura de archivos

```
src/
├── entities/           # Entidades TypeORM
│   ├── User.js
│   ├── Doctor.js
│   └── Appointment.js
├── repositories/       # Repositorios personalizados
│   └── UserRepository.js
├── migrations/         # Migraciones de base de datos
│   └── 001-create-tables.js
└── db/
    ├── typeorm-config.js    # Configuración TypeORM
    ├── repository.js        # Repositorio base
    └── init-typeorm.js      # Inicialización
```

## 🔧 Configuración

### 1. Configuración de TypeORM
- `src/db/typeorm-config.js`: Configuración principal
- Soporte para SQL Server con SSL deshabilitado para desarrollo

### 2. Entidades
- `User`: Usuarios del sistema
- `Doctor`: Médicos (extensión de User)
- `Appointment`: Citas médicas

### 3. Repositorios
- `BaseRepository`: Funcionalidad común
- `UserRepository`: Operaciones específicas de usuarios

## 🗄️ Migración de base de datos

### Ejecutar migración:
```bash
npm run migrate
```

### Crear tablas manualmente:
```sql
-- Tabla Users
CREATE TABLE Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(255) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  name NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) DEFAULT 'user',
  isActive BIT DEFAULT 1,
  emailVerified BIT DEFAULT 0,
  verificationToken NVARCHAR(255) NULL,
  resetPasswordToken NVARCHAR(255) NULL,
  resetPasswordExpires DATETIME NULL,
  lastLogin DATETIME NULL,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE()
);

-- Tabla Doctores
CREATE TABLE Doctores (
  id INT IDENTITY(1,1) PRIMARY KEY,
  userId INT NOT NULL,
  specialty NVARCHAR(255) NOT NULL,
  license NVARCHAR(255) NOT NULL,
  experience INT NULL,
  bio TEXT NULL,
  isAvailable BIT DEFAULT 1,
  rating DECIMAL(3,2) DEFAULT 0,
  totalAppointments INT DEFAULT 0,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Tabla CitasMedicas
CREATE TABLE CitasMedicas (
  id INT IDENTITY(1,1) PRIMARY KEY,
  userId INT NOT NULL,
  doctorId INT NOT NULL,
  date DATETIME NOT NULL,
  status NVARCHAR(50) DEFAULT 'pendiente',
  type NVARCHAR(50) DEFAULT 'consulta',
  notes TEXT NULL,
  symptoms TEXT NULL,
  diagnosis TEXT NULL,
  prescription TEXT NULL,
  paymentStatus NVARCHAR(50) DEFAULT 'pendiente',
  amount DECIMAL(10,2) NULL,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (doctorId) REFERENCES Doctores(id)
);
```

## 🔄 Migración de controladores

### Antes (SQL directo):
```javascript
const db = require("../db/sqlserver");

async function login(req, res) {
  const user = await db.unoUsuario("Usuarios", { email: req.body.email });
  // ...
}
```

### Después (TypeORM):
```javascript
const UserRepository = require("../repositories/UserRepository");

async function login(req, res) {
  const user = await userRepository.findByEmail(req.body.email);
  // ...
}
```

## 📝 Ejemplos de uso

### Crear usuario:
```javascript
const user = await userRepository.create({
  email: "test@example.com",
  password: hashedPassword,
  name: "Test User",
  role: "user"
});
```

### Buscar usuario con relaciones:
```javascript
const user = await userRepository.findByEmailWithRelations("test@example.com");
// Incluye appointments y doctorAppointments
```

### Actualizar usuario:
```javascript
await userRepository.update(userId, {
  name: "New Name",
  emailVerified: true
});
```

### Consultas complejas:
```javascript
const doctors = await userRepository.findDoctors();
const patients = await userRepository.findPatients();
```

## 🔧 Próximos pasos

1. **Migrar controladores restantes**:
   - `src/doctors/controlador.js`
   - `src/appointments/controlador.js`
   - `src/admin/controlador.js`

2. **Crear entidades adicionales**:
   - `Specialty`
   - `Notification`
   - `Exam`

3. **Implementar migraciones automáticas**:
   - Usar TypeORM CLI
   - Migraciones incrementales

4. **Optimizar consultas**:
   - Usar Query Builder
   - Implementar cache

## ⚠️ Notas importantes

- **Sincronización**: `synchronize: false` en producción
- **SSL**: Deshabilitado para desarrollo local
- **Relaciones**: Configuradas en entidades
- **Validaciones**: Implementar en entidades

## 🐛 Solución de problemas

### Error de conexión:
```bash
# Verificar configuración en config.js
# Verificar variables de entorno
# Verificar que SQL Server esté ejecutándose
```

### Error de tablas:
```bash
# Ejecutar migración
npm run migrate

# O crear tablas manualmente
```

### Error de entidades:
```bash
# Verificar rutas en typeorm-config.js
# Verificar sintaxis de entidades
# Verificar imports
```
