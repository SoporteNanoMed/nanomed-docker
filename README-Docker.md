# Nanomed - Docker Compose Setup

Este proyecto incluye una configuración de Docker Compose para levantar tanto la API Node.js como el frontend Next.js de Nanomed.

## Estructura del Proyecto

```
Nanomed/
├── nanomed-NODEJS-API-v2/     # API Node.js
├── nanomed-v4-react-node-nextjs/  # Frontend Next.js
├── docker-compose.yml         # Configuración principal de Docker Compose
├── env.example               # Variables de entorno de ejemplo
└── README-Docker.md          # Este archivo
```

## Requisitos Previos

- Docker
- Docker Compose

## Configuración Inicial

1. **Copiar las variables de entorno:**
   ```bash
   cp env.example .env
   ```

2. **Editar el archivo `.env`** con tus configuraciones específicas:
   - Configuración de base de datos
   - Credenciales de email
   - Claves JWT
   - URLs de la aplicación

## Comandos de Docker Compose

### Levantar todos los servicios
```bash
docker-compose up -d
```

### Levantar solo la API
```bash
docker-compose up -d api
```

### Levantar solo el frontend
```bash
docker-compose up -d frontend
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo la API
docker-compose logs -f api

# Solo el frontend
docker-compose logs -f frontend
```

### Detener todos los servicios
```bash
docker-compose down
```

### Reconstruir las imágenes
```bash
docker-compose build --no-cache
```

### Limpiar todo (incluyendo volúmenes)
```bash
docker-compose down -v
docker system prune -f
```

## Puertos

- **API Node.js**: http://localhost:8080
- **Frontend Next.js**: http://localhost:3000
- **Base de datos SQL Server** (opcional): localhost:1433

## Configuración de Base de Datos

El docker-compose incluye una configuración comentada para SQL Server. Si necesitas una base de datos local:

1. Descomenta la sección `db` en `docker-compose.yml`
2. Descomenta las variables de entorno de base de datos en el servicio `api`
3. Descomenta la dependencia `db` en el servicio `api`
4. Descomenta el volumen `sqlserver_data`

## Variables de Entorno Importantes

### API
- `DB_SERVER`: Servidor de base de datos
- `DB_USER`: Usuario de base de datos
- `DB_PASSWORD`: Contraseña de base de datos
- `DB_NAME`: Nombre de la base de datos
- `JWT_SECRET`: Clave secreta para JWT
- `EMAIL_USER`: Usuario de email
- `EMAIL_PASSWORD`: Contraseña de email

### Frontend
- `NEXT_PUBLIC_API_URL`: URL de la API
- `NEXT_PUBLIC_CLIENT_URL`: URL del frontend

## Desarrollo

Los volúmenes están configurados para hot-reload:
- Los cambios en el código se reflejan automáticamente
- `node_modules` está excluido del volumen para evitar conflictos

## Troubleshooting

### Problemas comunes:

1. **Puertos ocupados**: Verifica que los puertos 3000 y 8080 estén libres
2. **Permisos de archivos**: En Linux/Mac, puede ser necesario ajustar permisos
3. **Memoria insuficiente**: Aumenta la memoria asignada a Docker
4. **Problemas de red**: Verifica que la red `nanomed-network` se haya creado correctamente

### Comandos útiles:

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs de errores
docker-compose logs --tail=100

# Entrar al contenedor de la API
docker-compose exec api sh

# Entrar al contenedor del frontend
docker-compose exec frontend sh

# Ver uso de recursos
docker stats
```

## Producción

Para producción, considera:

1. Usar imágenes específicas de producción
2. Configurar variables de entorno seguras
3. Habilitar rate limiting
4. Configurar SSL/TLS
5. Usar un reverse proxy (nginx)
6. Configurar backups de base de datos
7. Monitoreo y logging

## Contribución

Para contribuir al proyecto:

1. Haz fork del repositorio
2. Crea una rama para tu feature
3. Prueba con Docker Compose
4. Envía un pull request
