# Nanomed API v2 🏥

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-red.svg)](https://www.microsoft.com/sql-server)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![Version](https://img.shields.io/badge/Version-2.5.1-brightgreen.svg)](https://github.com/SoporteNanoMed/nanomed-NODEJS-API-v2)

## 📋 Descripción

API REST desarrollada en Node.js para el sistema **Nanomed**, diseñada para gestionar operaciones médicas y administrativas de manera integral. La API proporciona un sistema completo de gestión hospitalaria con múltiples roles de usuario y funcionalidades avanzadas.

## ✨ Características Principales

### 🔐 Sistema de Autenticación Avanzado
- **JWT (JSON Web Tokens)** para autenticación segura
- **Autenticación de dos factores (2FA)** con códigos QR
- **Rate limiting** para protección contra ataques
- **Encriptación bcrypt** para contraseñas
- **Gestión de sesiones** con refresh tokens

### 👥 Sistema de Roles Multinivel
- **👤 Usuario/Paciente** - Gestión de perfil personal y citas
- **👨‍⚕️ Médico** - Gestión de pacientes y exámenes médicos
- **👩‍💼 Recepcionista** - Gestión integral de citas y pacientes ⭐ **NUEVO**
- **🔧 Administrador** - Control total del sistema

### 🏥 Funcionalidades Médicas
- **📅 Gestión de Citas Médicas** con validación de conflictos
- **🔬 Exámenes Médicos** con subida de archivos
- **👨‍⚕️ Directorio de Médicos** por especialidades
- **📊 Reportes y Estadísticas** en tiempo real
- **⏰ Gestión de Horarios Médicos** dinámicos ⭐ **NUEVO**
- **🔔 Notificaciones** automáticas

### 🛡️ Seguridad y Auditoría
- **Validación de datos** en todos los endpoints
- **Logging completo** con Winston
- **Auditoría de acciones** para trazabilidad
- **Protección CORS** configurada
- **Sanitización de inputs** para prevenir inyecciones

### ☁️ Almacenamiento en la Nube (Azure Blob Storage) ⭐ **NUEVO**
- **Almacenamiento escalable** en Azure Blob Storage
- **URLs temporales** con SAS para descarga segura
- **Migración automática** de archivos locales a la nube
- **Gestión de contenedores** organizados por tipo de archivo
- **Backup automático** y alta disponibilidad
- **CDN global** para acceso rápido desde cualquier ubicación

## 💻 Tecnologías Utilizadas

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| **Runtime** | Node.js | 18.x+ | Entorno de ejecución |
| **Framework** | Express.js | 5.x | Framework web |
| **Base de Datos** | SQL Server | 2019+ | Almacenamiento de datos |
| **Autenticación** | JWT | 9.0.2 | Tokens de autenticación |
| **Encriptación** | bcrypt | 5.1.1 | Hash de contraseñas |
| **2FA** | Speakeasy | 2.0.0 | Autenticación de dos factores |
| **QR Codes** | qrcode | 1.5.4 | Generación de códigos QR |
| **Email** | Mailgun.js | 12.0.2 | Servicio de email principal |
| **Email Legacy** | Nodemailer | 7.0.2 | Servicio de email alternativo |
| **Logging** | Winston | 3.17.0 | Sistema de logs |
| **Validación** | express-validator | 7.2.1 | Validación de datos |
| **Archivos** | Multer | 1.4.5-lts.2 | Subida de archivos local |
| **Azure Storage** | @azure/storage-blob | 12.17.0 | Almacenamiento en la nube |
| **Rate Limiting** | express-rate-limit | 7.5.0 | Protección contra spam |
| **CSRF Protection** | csurf | 1.11.0 | Protección CSRF |

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
- **Node.js** 18.x o superior
- **SQL Server** 2019 o superior
- **npm** o **yarn** como gestor de paquetes

### 2. Clonar el Repositorio
```bash
git clone https://github.com/SoporteNanoMed/nanomed-NODEJS-API-v2.git
cd nanomed-NODEJS-API-v2
```

### 3. Instalar Dependencias
```bash
npm install
# o
yarn install

# Instalar dependencia de Azure Blob Storage
npm install @azure/storage-blob
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# ==========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ==========================================
PORT=4000
HOST=localhost
NODE_ENV=development

# ==========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==========================================
DB_SERVER=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nanomed_db
DB_PORT=1433

# ==========================================
# CONFIGURACIÓN JWT
# ==========================================
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# ==========================================
# CONFIGURACIÓN DEL CLIENTE
# ==========================================
CLIENT_URL=http://localhost:3000

# ==========================================
# CONFIGURACIÓN DE EMAIL (MAILGUN)
# ==========================================
MAILGUN_API_KEY=tu_clave_api_de_mailgun
MAILGUN_DOMAIN=sandboxce6553272c424822a6c03b1895cfce03.mailgun.org
MAILGUN_FROM="Nanomed <noreply@nanomed.cl>"

# CONFIGURACIÓN DE EMAIL LEGACY (OPCIONAL)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_FROM="Nanomed <no-reply@nanomed.cl>"

# ==========================================
# CONFIGURACIÓN DE AZURE BLOB STORAGE
# ==========================================
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=nanomedstorage;AccountKey=your-key;EndpointSuffix=core.windows.net
AZURE_STORAGE_ACCOUNT_NAME=nanomedstorage
AZURE_STORAGE_ACCOUNT_KEY=your-account-key
AZURE_STORAGE_SAS_TOKEN=your-sas-token

# Contenedores de Azure Blob Storage
AZURE_STORAGE_CONTAINER_PROFILE_PICTURES=profile-pictures
AZURE_STORAGE_CONTAINER_EXAMS=exams
AZURE_STORAGE_CONTAINER_DOCUMENTS=documents
AZURE_STORAGE_CONTAINER_TEMP=temp
```

### 5. Configurar Base de Datos

Ejecuta el script de estructura de base de datos:
```bash
# Usando SQL Server Management Studio o Azure Data Studio
# Ejecutar: EstucturaBDD.sql
```

Para crear usuarios de prueba (incluyendo recepcionistas):
```bash
# Ejecutar el script SQL en tu base de datos
# Archivo: scripts/agregar_rol_recepcionista.sql
```

### 6. Iniciar la Aplicación

**Modo Desarrollo:**
```bash
npm run dev
# El servidor se reiniciará automáticamente con los cambios
```

**Modo Producción:**
```bash
npm start
```

## 📦 Estructura del Proyecto

```
nanomed-NODEJS-API-v2/
├── 📁 src/                          # Código fuente principal
│   ├── 📁 auth/                     # Sistema de autenticación
│   │   ├── controlador.js           # Lógica de autenticación
│   │   ├── middlewares.js           # Middlewares de autorización
│   │   ├── rutas.js                 # Rutas de autenticación
│   │   ├── servicios.js             # Servicios de autenticación
│   │   └── validaciones.js          # Validaciones de autenticación
│   ├── 📁 users/                    # Gestión de usuarios
│   │   ├── controlador.js           # Lógica de usuarios
│   │   ├── rutas.js                 # Rutas de usuarios
│   │   ├── validaciones.js          # Validaciones de usuarios
│   │   ├── 📁 emergency-contacts/   # Contactos de emergencia
│   │   │   ├── controlador.js       # Lógica de contactos
│   │   │   └── rutas.js             # Rutas de contactos
│   │   └── 📁 medical-info/         # Información médica
│   │       ├── controlador.js       # Lógica de info médica
│   │       └── rutas.js             # Rutas de info médica
│   ├── 📁 doctors/                  # Gestión de médicos
│   │   ├── controlador.js           # Lógica de médicos
│   │   └── rutas.js                 # Rutas de médicos
│   ├── 📁 appointments/             # Gestión de citas médicas
│   │   ├── controlador.js           # Lógica de citas
│   │   ├── rutas.js                 # Rutas principales de citas
│   │   ├── rutas-pago.js            # Rutas de pagos Transbank ⭐
│   │   └── validaciones.js          # Validaciones de citas
│   ├── 📁 exams/                    # Gestión de exámenes médicos
│   │   ├── controlador.js           # Lógica de exámenes
│   │   └── rutas.js                 # Rutas de exámenes
│   ├── 📁 receptionists/            # Módulo de recepcionistas ⭐
│   │   ├── controlador.js           # Lógica de recepcionistas
│   │   ├── rutas.js                 # Rutas de recepcionistas
│   │   └── README.md                # Documentación del módulo
│   ├── 📁 admin/                    # Panel administrativo
│   │   ├── controlador.js           # Lógica administrativa
│   │   ├── rutas.js                 # Rutas administrativas
│   │   ├── validaciones.js          # Validaciones admin
│   │   └── migracion-medicos.js     # Script de migración
│   ├── 📁 notifications/            # Sistema de notificaciones
│   │   ├── controlador.js           # Lógica de notificaciones
│   │   └── rutas.js                 # Rutas de notificaciones
│   ├── 📁 search/                   # Búsqueda avanzada
│   │   ├── controlador.js           # Lógica de búsqueda
│   │   └── rutas.js                 # Rutas de búsqueda
│   ├── 📁 specialties/              # Gestión de especialidades
│   │   ├── controlador.js           # Lógica de especialidades
│   │   └── rutas.js                 # Rutas de especialidades
│   ├── 📁 modulos/                  # Módulos adicionales
│   │   ├── controlador.js           # Controlador de módulos
│   │   └── rutas.js                 # Rutas de módulos
│   ├── 📁 contact/                  # Sistema de contacto
│   │   ├── controlador.js           # Lógica de contacto
│   │   ├── rutas.js                 # Rutas de contacto
│   │   └── validaciones.js          # Validaciones de contacto
│   ├── 📁 db/                       # Configuración de base de datos
│   │   └── sqlserver.js             # Conexión SQL Server
│   ├── 📁 middleware/               # Middlewares personalizados
│   │   ├── azureUpload.js           # Middleware Azure Blob Storage ⭐
│   │   ├── csrf.js                  # Protección CSRF
│   │   ├── errors.js                # Manejo de errores
│   │   ├── examUpload.js            # Subida de exámenes
│   │   ├── logger.js                # Sistema de logging
│   │   ├── sanitization.js          # Sanitización de datos
│   │   └── upload.js                # Subida de archivos local
│   ├── 📁 red/                      # Utilidades de red
│   │   ├── errors.js                # Manejo de errores HTTP
│   │   └── respuestas.js            # Formato de respuestas
│   └── 📁 utils/                    # Utilidades y servicios
│       ├── azureBlobService.js      # Servicio Azure Blob Storage ⭐
│       ├── dateUtils.js             # Utilidades de fechas
│       ├── mailService.js           # Servicio de email
│       ├── security.js              # Utilidades de seguridad
│       └── transbankService.js      # Servicio Transbank WebPay ⭐
├── 📁 scripts/                      # Scripts y utilidades
│   ├── agregar_rol_recepcionista.sql # Script SQL recepcionistas
│   └── test-exam-filenames.js       # Script de testing
├── 📁 uploads/                      # Archivos subidos (local)
│   └── 📁 profile-pictures/         # Fotos de perfil
├── 📄 app.js                        # Configuración de Express
├── 📄 config.js                     # Configuración general
├── 📄 index.js                      # Punto de entrada principal
├── 📄 openapi.yaml                  # Documentación OpenAPI
├── 📄 openapi.json                  # Documentación OpenAPI (JSON)
├── 📄 EstucturaBDD.sql              # Estructura de base de datos
├── 📄 transacciones_pago.sql        # Tabla de transacciones Transbank ⭐
├── 📄 package.json                  # Dependencias del proyecto
├── 📄 yarn.lock                     # Lock file de dependencias
├── 📄 postman_collection.json       # Colección Postman para testing
└── 📄 README.md                     # Documentación principal
```

### 🔧 **Archivos de Configuración Importantes**

#### **Configuración Principal**
- `📄 app.js` - Configuración de Express y middlewares
- `📄 config.js` - Variables de configuración global
- `📄 index.js` - Punto de entrada de la aplicación

#### **Base de Datos**
- `📄 EstucturaBDD.sql` - Estructura completa de la base de datos
- `📄 transacciones_pago.sql` - Tabla para transacciones de Transbank
- `📄 reset_citas_simple.sql` - Script de reset de citas
- `📄 reset_todas_las_citas.sql` - Script de reset completo

#### **Documentación API**
- `📄 openapi.yaml` - Especificación OpenAPI (YAML)
- `📄 openapi.json` - Especificación OpenAPI (JSON)
- `📄 postman_collection.json` - Colección para testing

#### **Scripts de Testing**
- `📄 test-transbank-complete-flow.js` - Prueba completa de Transbank
- `📄 test-transbank-corrected.js` - Prueba corregida de Transbank
- `📄 test-transbank-simple.js` - Prueba simple de Transbank
- `📄 test-transbank.js` - Prueba básica de Transbank
- `📄 test-url-generation.js` - Prueba de generación de URLs

### 🏗️ **Organización de Módulos**

#### **🔐 Autenticación (`src/auth/`)**
- Sistema completo de autenticación JWT
- Middlewares de autorización por roles
- Validaciones de seguridad
- Servicios de autenticación

#### **👥 Usuarios (`src/users/`)**
- Gestión completa de perfiles de usuario
- Contactos de emergencia
- Información médica personal
- Subida de fotos de perfil a Azure

#### **👨‍⚕️ Médicos (`src/doctors/`)**
- Gestión de perfiles médicos
- Especialidades y horarios
- Disponibilidad y bloques de tiempo

#### **🏥 Citas (`src/appointments/`)**
- Gestión completa de citas médicas
- **Integración con Transbank WebPay** ⭐
- Validaciones de conflictos de horarios
- Estados de citas (programada, confirmada, cancelada)

#### **🔬 Exámenes (`src/exams/`)**
- Subida y gestión de exámenes médicos
- Almacenamiento en Azure Blob Storage
- URLs temporales para descarga segura

#### **👩‍💼 Recepcionistas (`src/receptionists/`)**
- **Módulo completo de recepcionistas** ⭐
- Gestión de citas para pacientes
- Gestión de horarios médicos
- Estadísticas y reportes

#### **🔧 Administración (`src/admin/`)**
- Panel de administración completo
- Gestión de usuarios y roles
- Estadísticas del sistema
- Logs y auditoría

#### **🔔 Notificaciones (`src/notifications/`)**
- Sistema de notificaciones en tiempo real
- Recordatorios automáticos
- Gestión de preferencias

#### **🔍 Búsqueda (`src/search/`)**
- Búsqueda avanzada de pacientes y médicos
- Filtros múltiples combinables
- Resultados paginados

#### **🏥 Especialidades (`src/specialties/`)**
- Gestión de especialidades médicas
- Precios por especialidad
- Configuración de servicios

#### **📞 Contacto (`src/contact/`)**
- Sistema de contacto y soporte
- Formularios de contacto
- Notificaciones de contacto

### 🛠️ **Servicios y Utilidades**

#### **☁️ Azure Blob Storage (`src/utils/azureBlobService.js`)**
- Almacenamiento escalable en la nube
- URLs temporales con SAS
- Migración automática de archivos
- Gestión de contenedores organizados

#### **💳 Transbank WebPay (`src/utils/transbankService.js`)**
- **Integración completa y verificada con Transbank WebPay Plus** ⭐
- Pago automático y confirmación de citas tras pago exitoso
- Manejo de errores, reintentos y validaciones de seguridad
- Modo mock para desarrollo y pruebas
- Logging detallado y trazabilidad de transacciones
- Estados de transacción rastreados en base de datos

##### Arquitectura y Archivos Clave
- Backend: `src/utils/transbankService.js`, `src/appointments/rutas-pago.js`, `src/db/sqlserver.js`
- Base de datos: `transacciones_pago.sql`, `EstucturaBDD.sql`
- Frontend: `website/lib/api/services/payment.service.ts`, `website/app/dashboard/citas/payment/confirm/page.tsx`

##### Variables de Entorno Esenciales
```
# Transbank
TBK_COMMERCE_CODE=597055555532
TBK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
TBK_ENVIRONMENT=integration
USE_MOCK_TRANSBANK=false
```

##### Flujo de Pago
1. Creación de cita en estado 'programada'
2. Generación de transacción y redirección automática a WebPay
3. Confirmación automática de cita tras pago exitoso
4. Manejo de reintentos y verificación de estado

##### Endpoints Principales
```
POST   /api/appointments/:id/payment/create   # Crear transacción de pago
POST   /api/appointments/payment/confirm      # Confirmar transacción
GET    /api/appointments/:id/payment/status   # Verificar estado de pago
POST   /api/appointments/payment/retry        # Reintentar pago
```

##### Estructura de la Tabla de Transacciones
- `TransaccionesPago`: id, cita_id, token_transbank, monto, estado, url_pago, respuesta_transbank, timestamps
- Estados: pendiente, aprobada, rechazada, cancelada
- Vistas y SP: `vw_TransaccionesPagoCompletas`, `sp_ObtenerEstadisticasPagos`, `sp_LimpiarTransaccionesPendientes`

##### Scripts de Testing
- `test-transbank-complete-flow.js`, `test-transbank-corrected.js`, `test-transbank-simple.js`

##### Troubleshooting
- Validar configuración del SDK y variables de entorno
- Revisar logs de transacciones y confirmaciones
- Usar modo mock para pruebas locales
- Consultar documentación oficial y scripts de testing

##### Enlaces Oficiales
- [Documentación Transbank](https://www.transbankdevelopers.cl/documentacion/webpay-plus)
- [SDK JavaScript](https://www.npmjs.com/package/transbank-sdk)
- [Credenciales de Prueba](https://www.transbankdevelopers.cl/documentacion/como_empezar#ambiente-de-integracion)

#### **📧 Email (`src/utils/mailService.js`)**
- Servicio principal: Mailgun
- Servicio alternativo: Nodemailer
- Plantillas de email personalizadas
- Notificaciones automáticas

#### **🔒 Seguridad (`src/utils/security.js`)**
- Utilidades de encriptación
- Validación de tokens
- Sanitización de datos
- Funciones de seguridad

#### **📅 Fechas (`src/utils/dateUtils.js`)**
- Utilidades para manejo de fechas
- Formateo de fechas
- Cálculos de horarios
- Validaciones temporales

### 🔧 **Middlewares Personalizados**

#### **📤 Azure Upload (`src/middleware/azureUpload.js`)**
- Subida de archivos a Azure Blob Storage
- Validación de tipos de archivo
- Generación de URLs temporales
- Manejo de errores de subida

#### **🛡️ CSRF Protection (`src/middleware/csrf.js`)**
- Protección contra ataques CSRF
- Validación de tokens CSRF
- Configuración de seguridad

#### **📝 Logging (`src/middleware/logger.js`)**
- Sistema de logging con Winston
- Logs estructurados
- Niveles de log configurables
- Rotación de archivos de log

#### **🧹 Sanitización (`src/middleware/sanitization.js`)**
- Sanitización de datos de entrada
- Prevención de inyecciones
- Validación de tipos de datos
- Limpieza de strings

#### **📁 File Upload (`src/middleware/upload.js`)**
- Subida de archivos local
- Validación de archivos
- Límites de tamaño
- Tipos de archivo permitidos

### 📊 **Base de Datos**

#### **🗄️ Estructura Principal**
- **Usuarios**: Perfiles, roles, autenticación
- **CitasMedicas**: Citas con estados y validaciones
- **ExamenesMedicos**: Exámenes con archivos en Azure
- **TransaccionesPago**: **Transacciones de Transbank** ⭐
- **HorariosMedicos**: Configuración de horarios
- **Especialidades**: Especialidades y precios

#### **📈 Vistas y Procedimientos**
- **vw_TransaccionesPagoCompletas**: Vista completa de transacciones
- **sp_ObtenerEstadisticasPagos**: Estadísticas de pagos
- **sp_LimpiarTransaccionesPendientes**: Limpieza automática

### 🧪 **Testing y Desarrollo**

#### **📋 Scripts de Testing**
- **Transbank**: Pruebas completas de integración de pagos
- **URLs**: Pruebas de generación de URLs
- **Exámenes**: Pruebas de subida de archivos
- **Base de datos**: Scripts de reset y limpieza

#### **📊 Estado de Testing**
- **88 endpoints** documentados en OpenAPI
- **28 endpoints** probados (32%)
- **60 endpoints** pendientes de prueba
- **Scripts automatizados** para testing

### 🚀 **Despliegue y Configuración**

#### **🌐 Variables de Entorno**
- **Base de datos**: SQL Server configuration
- **Autenticación**: JWT secrets y expiración
- **Azure**: Blob Storage connection strings
- **Transbank**: Credenciales de pago
- **Email**: Mailgun y Nodemailer
- **Cliente**: URLs de frontend

#### **🐳 Docker**
- **Dockerfile** para containerización
- **docker-compose** para desarrollo local
- **Variables de entorno** para producción

#### **☁️ Azure**
- **App Service** para despliegue
- **Blob Storage** para archivos
- **SQL Database** para datos
- **CDN** para distribución de contenido

## ☁️ Azure Blob Storage

### 📁 Estructura de Contenedores
```
nanomedstorage/
├── profile-pictures/                # Fotos de perfil de usuarios
│   └── user-{userId}/
│       └── profile-{timestamp}-{random}.{ext}
├── exams/                          # Exámenes médicos
│   └── user-{userId}/
│       └── exam-{timestamp}-{random}.{ext}
├── documents/                      # Documentos generales
│   └── user-{userId}/
│       └── document-{timestamp}-{random}.{ext}
└── temp/                          # Archivos temporales
    └── temp-{timestamp}-{random}.{ext}
```

### 🔧 Servicios Implementados
- **`azureBlobService.js`** - Servicio principal para gestión de archivos
- **`azureUpload.js`** - Middleware para subida de archivos a Azure
- **Migración automática** de archivos locales a la nube
- **URLs temporales** con SAS para descarga segura

### 📤 Endpoints de Archivos
```
POST   /api/users/me/profile-picture    # Subir foto de perfil a Azure
DELETE /api/users/me/profile-picture    # Eliminar foto de perfil
GET    /api/users/me                    # Perfil con URL temporal de foto
```

### 🔄 Migración de Datos
```bash
# Migrar fotos de perfil existentes
node scripts/migrate-to-azure.js profile-pictures

# Migrar todos los archivos
node scripts/migrate-to-azure.js all

# Limpiar archivos locales (cuidado!)
node scripts/migrate-to-azure.js cleanup
```

## 🔑 Roles y Permisos

### 👤 Usuario/Paciente (`user`)
- ✅ Gestionar perfil personal
- ✅ Ver y solicitar citas propias
- ✅ Ver sus exámenes médicos
- ✅ Gestión de contactos de emergencia
- ✅ Recibir notificaciones

### 👨‍⚕️ Médico (`medico`)
- ✅ Gestionar perfil profesional
- ✅ Ver citas asignadas
- ✅ Gestionar exámenes de pacientes
- ✅ Gestión de horarios flexibles
- ✅ Reportes de actividad

### 👩‍💼 Recepcionista (`recepcionista`) ⭐ **NUEVO**
- ✅ **Gestión completa de citas** (crear, actualizar, cancelar)
- ✅ **Gestión de pacientes** (listar, buscar, ver detalles)
- ✅ **Gestión de médicos** (disponibilidad, especialidades)
- ✅ **Gestión de horarios médicos** (configurar, excepciones) ⭐ **NUEVO**
- ✅ **Gestión de exámenes** (crear, actualizar, eliminar)
- ✅ **Reportes y estadísticas** diarias
- ✅ **Búsqueda avanzada** con filtros múltiples

### 🔧 Administrador (`admin`)
- ✅ **Acceso completo** a todas las funcionalidades
- ✅ **Gestión de usuarios** y roles
- ✅ **Configuración del sistema**
- ✅ **Auditoría y logs** completos
- ✅ **Estadísticas avanzadas**

## 🚀 Swagger UI - Documentación Interactiva

### 📖 Acceso a la Documentación

**Swagger UI** está configurado y disponible para probar la API directamente desde el navegador:

- **🌐 URL Local**: `http://localhost:8080/api-docs`
- **📋 Especificación JSON**: `http://localhost:8080/api-docs.json`
- **📖 Guía Completa**: [SWAGGER_UI_GUIDE.md](./SWAGGER_UI_GUIDE.md)

### ✨ Características de Swagger UI

- 🔐 **Autenticación JWT integrada** - Botón "Authorize" para tokens
- 🧪 **Pruebas en vivo** - Botón "Try it out" para cada endpoint
- 📝 **Documentación visual** - 88 endpoints organizados por categorías
- 🔍 **Búsqueda y filtrado** - Encuentra endpoints rápidamente
- 📊 **Ejemplos automáticos** - Requests y responses de ejemplo

### 🎯 Cómo Usar

1. **Iniciar el servidor**: `npm run dev`
2. **Abrir navegador**: `http://localhost:8080/api-docs`
3. **Obtener token**: Usar `/api/auth/login` para obtener JWT
4. **Autorizar**: Hacer clic en "Authorize" e ingresar `Bearer tu_token`
5. **Probar endpoints**: Usar "Try it out" en cualquier endpoint

---

## 🌐 Endpoints Principales

> **Nota:** El estado de cada endpoint se actualiza automáticamente según la tabla maestra de endpoints (`LISTADO_ENDPOINTS.md`).

### 🔐 Autenticación
```
POST   /api/auth/register          # Registro de usuarios
POST   /api/auth/login             # Inicio de sesión
POST   /api/auth/logout            # Cerrar sesión
POST   /api/auth/forgot-password   # Recuperar contraseña
POST   /api/auth/reset-password    # Restablecer contraseña
GET    /api/auth/verify-email/:token # Verificar email
```

### 👥 Gestión de Usuarios
```
GET    /api/users/me               # Perfil del usuario
PUT    /api/users/me               # Actualizar perfil
POST   /api/users/me/profile-picture    # Subir foto de perfil a Azure
DELETE /api/users/me/profile-picture    # Eliminar foto de perfil
```

### 🏥 Citas Médicas
```
GET    /api/appointments           # Listar citas
POST   /api/appointments           # Crear cita
PUT    /api/appointments/:id       # Actualizar cita
DELETE /api/appointments/:id       # Cancelar cita
```

### 👩‍💼 Recepcionistas
```
GET    /api/receptionists/appointments        # Todas las citas
POST   /api/receptionists/appointments        # Crear cita para paciente
PUT    /api/receptionists/appointments/:id    # Actualizar cualquier cita
DELETE /api/receptionists/appointments/:id    # Cancelar cualquier cita
GET    /api/receptionists/patients            # Todos los pacientes
GET    /api/receptionists/patients/:id        # Detalle de paciente
GET    /api/receptionists/doctors             # Todos los médicos
POST   /api/receptionists/doctors/:id/schedule       # Configurar horarios
GET    /api/receptionists/doctors/:id/schedule       # Consultar horarios
PUT    /api/receptionists/doctors/:id/schedule/:sid  # Actualizar horario
DELETE /api/receptionists/doctors/:id/schedule/:sid  # Eliminar horario
POST   /api/receptionists/doctors/:id/schedule/exceptions    # Agregar excepción
GET    /api/receptionists/doctors/:id/schedule/exceptions    # Listar excepciones
DELETE /api/receptionists/doctors/:id/schedule/exceptions/:id # Eliminar excepción
GET    /api/receptionists/doctors/:id/availability-updated   # Disponibilidad actualizada
POST   /api/receptionists/doctors/:id/availability-blocks          # Crear bloques específicos
GET    /api/receptionists/doctors/:id/availability-blocks          # Obtener bloques disponibilidad
POST   /api/receptionists/doctors/:id/availability-blocks/generate # Generar bloques automáticamente
DELETE /api/receptionists/doctors/:id/availability-blocks          # Eliminar bloques disponibilidad
PUT    /api/receptionists/availability-blocks/:id/disable          # Marcar bloque no disponible
PUT    /api/receptionists/availability-blocks/:id/enable           # Marcar bloque disponible
GET    /api/receptionists/stats/daily         # Estadísticas diarias
```

### 🔬 Exámenes Médicos
```
GET    /api/exams                  # Listar exámenes (Blob Storage)
GET    /api/exams/blob/{id}        # Obtener examen específico del blob
GET    /api/exams/blob/{id}/download # Descargar archivo del blob
GET    /api/admin/exams/blob       # Listar todos los exámenes (admin)
GET    /api/admin/exams/blob/stats # Estadísticas de exámenes (admin)
GET    /api/doctor/exams/blob      # Listar exámenes (médicos)
GET    /api/doctor/exams/blob/user/{userId} # Exámenes de usuario específico
DELETE /api/doctor/exams/blob/{id} # Eliminar examen del blob
POST   /api/doctor/exams/blob/{id}/move # Mover examen a carpeta
POST   /api/doctor/exams/blob/bulk-action # Acciones masivas en exámenes
GET    /api/search/exams           # Buscar exámenes en blob storage
```

### 👨‍⚕️ Médicos
```
GET    /api/doctors                # Listar médicos
GET    /api/doctors/:id            # Ver médico
GET    /api/doctors/specialties/{specialtyId} # Médicos por especialidad
```

### 🔧 Administración
```
GET    /api/admin/users            # Gestión de usuarios
POST   /api/admin/users/medico     # Crear usuario médico
POST   /api/admin/users/recepcionista # Crear usuario recepcionista
POST   /api/admin/users/admin      # Crear usuario administrador
POST   /api/admin/users/api        # Crear usuario API
GET    /api/admin/stats            # Estadísticas del sistema
GET    /api/admin/logs             # Logs del sistema
GET    /api/admin/doctors          # Listar todos los médicos
GET    /api/admin/recepcionistas   # Listar recepcionistas
PUT    /api/admin/users/{id}       # Actualizar datos usuarios
GET    /api/admin/admin            # Listar administradores
GET    /api/admin/doctors/migration/status # Estado de migración
POST   /api/admin/doctors/migration/execute # Ejecutar migración
```

## 🧪 Credenciales de Prueba

### 👩‍💼 Recepcionistas
```
Email: Anthony.Santibañes@yopmail.com | Contraseña: RecepSegura123!
```

### 👨‍⚕️ Médicos
```
Email: kendal.sepulveda@yopmail.com | Contraseña: MedicoSeguro123!
```

### 👤 Usuarios
```
Email: cristian.tapia@yopmail.com | Contraseña: NuevaPassword123!
```

### 🔧 Administrador
```
Email: soporte@nanomed.cl | Contraseña: Admin1234$
```

## 📊 Funcionalidades Destacadas

### 🎯 Gestión Inteligente de Citas
- **Validación automática** de conflictos de horarios
- **Disponibilidad en tiempo real** de médicos
- **Filtros avanzados** por fecha, especialidad, estado
- **Paginación optimizada** para grandes volúmenes

### ⏰ Gestión Dinámica de Horarios ⭐ **NUEVO**
- **Configuración flexible** de horarios por médico y día
- **Gestión de excepciones** (vacaciones, reuniones)
- **Cálculo dinámico** de disponibilidad en tiempo real
- **Validaciones automáticas** de consistencia de horarios
- **Bloques de disponibilidad** configurables
- **Generación automática** de slots de tiempo

### 📈 Reportes y Analytics
- **Estadísticas diarias** de citas y actividad
- **Reportes por médico** y especialidad
- **Métricas de rendimiento** del sistema
- **Exportación de datos** en múltiples formatos

### 🔔 Sistema de Notificaciones
- **Notificaciones en tiempo real** para citas
- **Recordatorios automáticos** por email
- **Alertas de sistema** para administradores
- **Gestión de preferencias** de notificaciones

### 🔍 Búsqueda Avanzada
- **Búsqueda semántica** de pacientes y médicos
- **Filtros múltiples** combinables
- **Resultados paginados** y ordenables
- **Búsqueda por texto libre** en múltiples campos

## 🛡️ Seguridad

### 🔐 Autenticación y Autorización
- **JWT tokens** con expiración configurable
- **Refresh tokens** para sesiones prolongadas
- **2FA opcional** con códigos QR
- **Rate limiting** por IP y usuario

### 🛡️ Protección de Datos
- **Encriptación bcrypt** para contraseñas
- **Sanitización** de inputs
- **Validación estricta** de datos
- **CORS configurado** para dominios específicos

### 📝 Auditoría y Logging
- **Logs detallados** de todas las acciones
- **Trazabilidad completa** de cambios
- **Monitoreo de errores** en tiempo real
- **Backup automático** de logs

## 🚀 Despliegue

### 🐳 Docker (Recomendado)
```bash
# Construir imagen
docker build -t nanomed-api .

# Ejecutar contenedor
docker run -p 4000:4000 --env-file .env nanomed-api
```

### ☁️ Azure App Service
```bash
# Configurar Azure CLI
az login
az webapp create --resource-group nanomed-rg --plan nanomed-plan --name nanomed-api

# Desplegar
az webapp deployment source config-zip --resource-group nanomed-rg --name nanomed-api --src nanomed-api.zip
```

### 🌐 Variables de Entorno para Producción
```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DB_SERVER=tu-servidor-produccion.database.windows.net
# ... otras variables de producción
```

## 📚 Documentación Adicional

- **📖 [Documentación OpenAPI](./openapi.yaml)** - Especificación completa de la API
- **🚀 [Guía Swagger UI](./SWAGGER_UI_GUIDE.md)** - Interfaz web interactiva para probar la API
- **🧪 [Pruebas de Endpoints](./PRUEBAS_ENDPOINTS.md)** - Estado de pruebas (28/88 probados - 32%)
- **👩‍💼 [Módulo Recepcionistas](./src/receptionists/README.md)** - Documentación específica
- **🔧 [Guía de Administración](./CHECKLIST_ADMIN_COMPLETADO.md)** - Funcionalidades admin
- **🎨 [Guía Frontend](./FRONTEND_GUIDE.md)** - Integración con frontend
- **📋 [Endpoints Completos](./API_ENDPOINTS.md)** - Lista completa de endpoints

## 🤝 Contribución

### 📋 Proceso de Desarrollo
1. **Fork** del repositorio
2. **Crear rama** para nueva funcionalidad
3. **Desarrollar** con tests incluidos
4. **Documentar** cambios realizados
5. **Pull Request** con descripción detallada

### 🧪 Testing
```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests de integración
npm run test:integration
```

### 📝 Estándares de Código
- **ESLint** para linting
- **Prettier** para formateo
- **JSDoc** para documentación
- **Conventional Commits** para mensajes

## 📞 Soporte

### 🆘 Canales de Soporte
- **📧 Email**: soporte@nanomed.cl
- **💬 Slack**: #nanomed-api
- **🐛 Issues**: GitHub Issues
- **📖 Wiki**: Documentación interna

### 🔧 Troubleshooting

#### Problemas Comunes
1. **Error de conexión a BD**: Verificar credenciales en `.env`
2. **Token expirado**: Usar endpoint de refresh
3. **Permisos insuficientes**: Verificar rol del usuario
4. **Rate limit**: Esperar tiempo de cooldown

#### 🔧 Problemas de Azure Blob Storage
1. **Error de conexión a Azure**:
   - Verificar `AZURE_STORAGE_CONNECTION_STRING` en `.env`
   - Comprobar credenciales de Azure
   - Revisar configuración de red

2. **Error de permisos en Azure**:
   - Verificar `AZURE_STORAGE_SAS_TOKEN`
   - Comprobar permisos de contenedor
   - Revisar políticas de acceso

3. **Archivos no encontrados**:
   - Verificar rutas en base de datos
   - Comprobar existencia en Azure Blob Storage
   - Revisar logs de migración

4. **URLs temporales expiradas**:
   - Las URLs SAS expiran automáticamente
   - Regenerar URL con endpoint correspondiente
   - Verificar configuración de tiempo de expiración

## 📄 Licencia

Este proyecto es **privado y confidencial**. Todos los derechos reservados por **Nanomed**.

## 👨‍💻 Equipo de Desarrollo

- **🏗️ Arquitecto Principal**: [cvega2288]
- **💻 Desarrollador Backend**: [SoporteNanoMed]
- **🎨 Desarrollador Frontend**: [SoporteNanoMed]
- **🔧 DevOps**: [cvega2288]

## 🔄 Actualizaciones Recientes

### ⭐ **Versión 2.5.1 (Diciembre 2024)**

#### ✅ **Funcionalidades Agregadas**
- **🆕 Gestión Avanzada de Horarios Médicos** (14 nuevos endpoints)
  - Configuración flexible de horarios por médico y día de semana
  - Gestión de excepciones (vacaciones, reuniones, etc.)
  - Cálculo dinámico de disponibilidad en tiempo real
  - Validaciones automáticas de consistencia
  - Sistema de bloques de disponibilidad configurables
  - Generación automática de slots de tiempo

- **☁️ Azure Blob Storage Integration** (Migración completa)
  - Almacenamiento escalable en la nube para archivos
  - URLs temporales con SAS para descarga segura
  - Migración automática de archivos locales a Azure
  - Gestión de contenedores organizados por tipo de archivo
  - Backup automático y alta disponibilidad
  - CDN global para acceso rápido

#### 🚫 **Funcionalidades Eliminadas**
- **Sistema de Mensajería** entre pacientes y médicos (7 endpoints)
  - `/api/conversations` - Gestión de conversaciones
  - `/api/conversations/{id}/messages` - Gestión de mensajes
  - Endpoints documentados en OpenAPI pero no implementados en código
  - Eliminados para simplificar el alcance del proyecto

#### 📊 **Estado Actual del Proyecto**
- **Total de Endpoints**: **88 activos** (95 documentados - 7 eliminados)
- **Endpoints Probados**: **28/88 (32%)**
- **Implementados en Frontend**: **14/88 (16%)**
- **Pendientes por Probar**: **60/88 (68%)**

#### 🔍 **Auditoría Completada**
- ✅ Reconciliación entre documentación OpenAPI y código real
- ✅ Identificación de endpoints no documentados pero implementados
- ✅ Actualización de estadísticas precisas
- ✅ Documentación sincronizada con implementación
- ✅ Actualización de dependencias del proyecto

#### 📦 **Actualizaciones de Dependencias**
- **Express**: Actualizado a v5.1.0
- **Mailgun.js**: Integrado v12.0.2 como servicio principal de email
- **Winston**: Actualizado a v3.17.0
- **express-rate-limit**: Actualizado a v7.5.0
- **uuid**: Actualizado a v11.1.0
- **@azure/storage-blob**: Integrado v12.17.0 para almacenamiento en la nube

#### 🧪 **Endpoints Probados Recientemente**
- ✅ **Autenticación**: Registro, login, logout, verificación email
- ✅ **Usuarios**: Gestión completa de perfiles y fotos
- ✅ **Médicos**: Listado y consulta individual
- ✅ **Admin**: Gestión de usuarios por rol
- ✅ **Horarios**: Configuración y bloques de disponibilidad

#### 🎯 **Próximos Objetivos**
- **Probar endpoints de citas médicas** (9 endpoints pendientes)
- **Implementar sistema de exámenes** (6 endpoints pendientes)
- **Completar módulo de notificaciones** (6 endpoints pendientes)
- **Desarrollar búsqueda avanzada** (2 endpoints pendientes)
- **Integrar contactos de emergencia** (4 endpoints pendientes)
- **Completar gestión de horarios médicos** (8 endpoints pendientes)

---

**Última actualización**: Julio 2025  
**Versión**: 2.5.2 - Estado actualizado según LISTADO_ENDPOINTS.md

<div align="center">

**🏥 Desarrollado con ❤️ para Nanomed**

[![Nanomed](https://img.shields.io/badge/Nanomed-Healthcare%20Technology-blue.svg)](https://nanomed.cl)
[![Version](https://img.shields.io/badge/Version-2.5.1-brightgreen.svg)](https://github.com/SoporteNanoMed/nanomed-NODEJS-API-v2)
[![Endpoints](https://img.shields.io/badge/Endpoints-88%20Activos-orange.svg)](./PRUEBAS_ENDPOINTS.md)
[![Coverage](https://img.shields.io/badge/Tests-32%25%20Probados-yellow.svg)](./PRUEBAS_ENDPOINTS.md)

</div>