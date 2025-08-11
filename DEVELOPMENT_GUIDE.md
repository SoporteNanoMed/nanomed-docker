# 🛠️ Guía de Desarrollo - Nanomed

## 📋 Resumen

Esta guía explica cómo manejar el desarrollo en el **monorepo** de Nanomed, que contiene tanto el backend como el frontend en un solo repositorio con Docker Compose.

## 🏗️ Estructura del Proyecto

```
nanomed-docker/
├── 📁 nanomed-NODEJS-API-v2/          # Backend API
├── 📁 nanomed-v4-react-node-nextjs/   # Frontend Next.js
├── 📄 docker-compose.yml              # Orquestación Docker
├── 📄 dev.sh                          # Script de desarrollo
├── 📄 package.json                    # Configuración monorepo
└── 📄 README.md                       # Documentación principal
```

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/nanomed-docker.git
cd nanomed-docker
```

### 2. Configurar Variables de Entorno
```bash
cp env-local-sqlserver.example .env
# Editar .env con tus configuraciones
```

### 3. Iniciar Desarrollo
```bash
./dev.sh start
```

### 4. Acceder a las Aplicaciones
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Base de datos**: localhost:1433

## 🔄 Flujo de Desarrollo

### **Opción 1: Desarrollo con Docker (Recomendado)**

```bash
# 1. Iniciar todos los servicios
./dev.sh start

# 2. Ver logs en tiempo real
./dev.sh logs api        # Logs del backend
./dev.sh logs frontend   # Logs del frontend
./dev.sh logs db         # Logs de la base de datos

# 3. Hacer cambios en el código
# Los cambios se reflejan automáticamente (hot-reload)

# 4. Reconstruir si es necesario
./dev.sh rebuild api     # Reconstruir solo el backend
./dev.sh rebuild frontend # Reconstruir solo el frontend

# 5. Detener servicios
./dev.sh stop
```

### **Opción 2: Desarrollo Local (Sin Docker)**

```bash
# Backend
cd nanomed-NODEJS-API-v2
npm install
npm run dev

# Frontend (en otra terminal)
cd nanomed-v4-react-node-nextjs
npm install
npm run dev
```

## 📝 Manejo de Cambios

### **1. Crear una Rama de Feature**
```bash
git checkout -b feature/nueva-funcionalidad
```

### **2. Hacer Cambios**
- Editar archivos en `nanomed-NODEJS-API-v2/` (backend)
- Editar archivos en `nanomed-v4-react-node-nextjs/` (frontend)
- Los cambios se reflejan automáticamente con hot-reload

### **3. Commit y Push**
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### **4. Crear Pull Request**
- Ir a GitHub
- Crear Pull Request desde tu rama a `main`
- El CI/CD se ejecutará automáticamente

## 🗄️ Base de Datos

### **Sincronización con Desarrollo**
```bash
# Sincronizar usuarios de Azure con local
./dev.sh sync-db

# Acceder a la base de datos
./dev.sh db
```

### **Configuraciones Disponibles**
```bash
# Local SQL Server (recomendado para desarrollo)
./setup-local-sqlserver.sh

# Azure SQL (producción)
./setup-azure-sql.sh

# PostgreSQL (alternativa)
./setup-postgresql.sh
```

## 🧪 Testing

### **Ejecutar Tests**
```bash
# Todos los tests
npm test

# Solo backend
npm run test:api

# Solo frontend
npm run test:frontend
```

### **Tests en CI/CD**
- Los tests se ejecutan automáticamente en GitHub Actions
- Se ejecutan en cada Pull Request
- Se ejecutan en cada push a `main`

## 🚀 Despliegue

### **Desarrollo**
```bash
./dev.sh start
```

### **Producción**
```bash
# Configurar variables de producción
cp env-azure-sql.example .env
# Editar .env con credenciales de producción

# Desplegar
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoreo y Logs

### **Ver Logs**
```bash
# Todos los servicios
./dev.sh logs

# Servicio específico
./dev.sh logs api
./dev.sh logs frontend
./dev.sh logs db
```

### **Estado de Servicios**
```bash
./dev.sh status
```

## 🔧 Comandos Útiles

### **Script de Desarrollo (`./dev.sh`)**
```bash
./dev.sh start          # Iniciar todos los servicios
./dev.sh stop           # Detener todos los servicios
./dev.sh restart        # Reiniciar todos los servicios
./dev.sh logs [servicio] # Ver logs
./dev.sh rebuild [servicio] # Reconstruir imágenes
./dev.sh db             # Acceder a la base de datos
./dev.sh sync-db        # Sincronizar base de datos
./dev.sh status         # Estado de servicios
./dev.sh help           # Ayuda
```

### **NPM Scripts**
```bash
npm start               # Iniciar servicios
npm stop                # Detener servicios
npm run dev             # Script de desarrollo
npm test                # Ejecutar tests
npm run build           # Construir proyectos
npm run install:all     # Instalar todas las dependencias
npm run clean           # Limpiar Docker
```

## 🐛 Debugging

### **Backend**
```bash
# Ver logs del backend
./dev.sh logs api

# Acceder al contenedor del backend
docker-compose exec api sh

# Ver variables de entorno
docker-compose exec api env
```

### **Frontend**
```bash
# Ver logs del frontend
./dev.sh logs frontend

# Acceder al contenedor del frontend
docker-compose exec frontend sh
```

### **Base de Datos**
```bash
# Acceder a la base de datos
./dev.sh db

# Ver logs de la base de datos
./dev.sh logs db
```

## 📚 Documentación

### **Archivos de Documentación**
- `README.md` - Documentación principal
- `README-Docker.md` - Guía de Docker
- `DEVELOPMENT_GUIDE.md` - Esta guía
- `VERSION.md` - Versionado del proyecto
- `nanomed-NODEJS-API-v2/MIGRATION_TO_TYPEORM.md` - Migración a TypeORM
- `nanomed-NODEJS-API-v2/SYNC_DATABASE.md` - Sincronización de BD

### **Enlaces Útiles**
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js](https://nextjs.org/docs)
- [Node.js](https://nodejs.org/docs)
- [TypeORM](https://typeorm.io/)

## 🤝 Contribución

### **1. Fork el Proyecto**
- Ir a GitHub y hacer fork del repositorio

### **2. Clonar tu Fork**
```bash
git clone https://github.com/tu-usuario/nanomed-docker.git
cd nanomed-docker
```

### **3. Crear Rama de Feature**
```bash
git checkout -b feature/tu-funcionalidad
```

### **4. Hacer Cambios**
- Seguir las convenciones de código
- Agregar tests si es necesario
- Actualizar documentación

### **5. Commit y Push**
```bash
git add .
git commit -m "feat: descripción de cambios"
git push origin feature/tu-funcionalidad
```

### **6. Crear Pull Request**
- Ir a GitHub
- Crear Pull Request
- Describir los cambios
- Esperar review

## 📞 Soporte

### **Problemas Comunes**

#### **Docker no inicia**
```bash
# Verificar que Docker Desktop esté ejecutándose
open -a Docker  # macOS
```

#### **Puertos ocupados**
```bash
# Ver qué está usando los puertos
lsof -i :3000
lsof -i :8080
lsof -i :1433

# Detener servicios
./dev.sh stop
```

#### **Base de datos no conecta**
```bash
# Verificar estado
./dev.sh status

# Reiniciar servicios
./dev.sh restart

# Ver logs
./dev.sh logs db
```

### **Contacto**
- **Email**: soporte@nanomed.cl
- **Issues**: Crear issue en GitHub
- **Documentación**: Ver archivos README

## 🎯 Próximos Pasos

1. **Configurar CI/CD** con tus credenciales
2. **Agregar tests** unitarios y de integración
3. **Configurar monitoreo** y alertas
4. **Documentar API** con Swagger
5. **Implementar autenticación** mejorada
6. **Agregar métricas** y analytics
