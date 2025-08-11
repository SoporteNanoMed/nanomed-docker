# 🏥 Nanomed - Plataforma Médica Completa

## 📋 Descripción

Nanomed es una plataforma médica integral que combina un backend Node.js con un frontend Next.js, diseñada para proporcionar servicios de salud de vanguardia con tecnología e inteligencia artificial.

## 🏗️ Arquitectura

```
nanomed-docker/
├── nanomed-NODEJS-API-v2/     # Backend API (Node.js + Express)
├── nanomed-v4-react-node-nextjs/  # Frontend (Next.js + React)
└── docker-compose.yml         # Orquestación de servicios
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/nanomed-docker.git
cd nanomed-docker
```

2. **Configurar variables de entorno:**
```bash
cp env-local-sqlserver.example .env
# Editar .env con tus configuraciones
```

3. **Iniciar todos los servicios:**
```bash
./start.sh
```

4. **Acceder a las aplicaciones:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Base de datos: localhost:1433

## 🛠️ Desarrollo

### Estructura de Proyectos

#### Backend (`nanomed-NODEJS-API-v2/`)
- **Tecnología**: Node.js, Express, SQL Server
- **Puerto**: 8080
- **Base de datos**: SQL Server (Docker)
- **Documentación**: Ver `nanomed-NODEJS-API-v2/README.md`

#### Frontend (`nanomed-v4-react-node-nextjs/`)
- **Tecnología**: Next.js, React, TypeScript
- **Puerto**: 3000
- **API**: Se conecta al backend en puerto 8080
- **Documentación**: Ver `nanomed-v4-react-node-nextjs/README.md`

### Comandos Útiles

```bash
# Iniciar todos los servicios
./start.sh

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db

# Detener todos los servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Acceder a la base de datos
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -d nanomed
```

## 🔧 Configuración

### Variables de Entorno

El archivo `.env` contiene todas las configuraciones necesarias:

```bash
# API Configuration
NODE_ENV=development
PORT=8080
HOST=0.0.0.0

# Database Configuration
DB_SERVER=db
DB_USER=${DB_USER:-sa}
DB_PASSWORD=${DB_PASSWORD:-YourStrong@Passw0rd}
DB_NAME=nanomed
DB_PORT=1433

# Frontend Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

### Configuraciones Disponibles

- **Local SQL Server**: `./setup-local-sqlserver.sh`
- **Azure SQL**: `./setup-azure-sql.sh`
- **PostgreSQL**: `./setup-postgresql.sh`

## 📊 Base de Datos

### Sincronización con Desarrollo

Para sincronizar la base de datos local con la de desarrollo:

```bash
cd nanomed-NODEJS-API-v2
export $(cat .env-dev | grep -v '^#' | xargs)
node sync-database.js
```

### Estructura de Tablas

- `Usuarios` - Usuarios del sistema
- `CitasMedicas` - Citas médicas
- `ExamenesMedicos` - Exámenes médicos
- `Notificaciones` - Notificaciones del sistema
- Y más...

## 🔄 Flujo de Desarrollo

### 1. Desarrollo Local
```bash
# Hacer cambios en el código
# Los cambios se reflejan automáticamente (hot-reload)

# Ver logs en tiempo real
docker-compose logs -f api
docker-compose logs -f frontend
```

### 2. Testing
```bash
# Probar API
curl http://localhost:8080/api/health

# Probar Frontend
open http://localhost:3000
```

### 3. Commit y Push
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

## 🚀 Despliegue

### Desarrollo
```bash
./start.sh
```

### Producción
```bash
# Configurar variables de producción
cp env-azure-sql.example .env
# Editar .env con credenciales de producción

# Desplegar
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentación Adicional

- [Guía de Docker](README-Docker.md)
- [Sincronización de Base de Datos](nanomed-NODEJS-API-v2/SYNC_DATABASE.md)
- [Migración a TypeORM](nanomed-NODEJS-API-v2/MIGRATION_TO_TYPEORM.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **Email**: soporte@nanomed.cl
- **Documentación**: Ver archivos README en cada subdirectorio
- **Issues**: Crear un issue en GitHub para reportar bugs o solicitar features
# Test Docker Hub credentials
