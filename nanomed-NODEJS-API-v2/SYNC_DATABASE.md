# 🔄 Sincronización de Base de Datos

## 📋 Descripción

Este proceso permite sincronizar la base de datos local de Docker con la base de datos de desarrollo (`bddnanomed_DEV`) para tener exactamente los mismos usuarios.

## 🛠️ Archivos creados

- `export-users.sql` - Script para exportar usuarios de desarrollo
- `sync-users-local.sql` - Script para limpiar tabla local
- `sync-database.js` - Script automatizado de sincronización
- `.env-dev` - Configuración de credenciales

## 📝 Pasos para sincronizar

### 1. Configurar credenciales de desarrollo

Editar el archivo `.env-dev` con las credenciales correctas:

```bash
# Configuración de la base de datos de desarrollo
DEV_DB_SERVER=tu-servidor-real.database.windows.net
DEV_DB_USER=tu-usuario-real
DEV_DB_PASSWORD=tu-password-real
DEV_DB_NAME=bddnanomed_DEV
```

### 2. Opción A: Sincronización automatizada (Recomendada)

```bash
# Cargar variables de entorno
source .env-dev

# Ejecutar sincronización
cd nanomed-NODEJS-API-v2
node sync-database.js
```

### 3. Opción B: Sincronización manual

#### Paso 1: Exportar usuarios de desarrollo
1. Conectar a la base de datos `bddnanomed_DEV`
2. Ejecutar el script `export-users.sql`
3. Copiar los resultados (INSERT statements)

#### Paso 2: Limpiar tabla local
```bash
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -C -d nanomed -i sync-users-local.sql
```

#### Paso 3: Insertar usuarios en local
1. Crear archivo con los INSERT statements
2. Ejecutar en la base de datos local

## 🔧 Verificación

Después de la sincronización, verificar que los usuarios se copiaron correctamente:

```bash
# Verificar cantidad de usuarios
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -C -d nanomed -Q "SELECT COUNT(*) as total_usuarios FROM Usuarios;"

# Verificar algunos usuarios
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -C -d nanomed -Q "SELECT TOP 5 id, nombre, apellido, email, role FROM Usuarios;"
```

## ⚠️ Consideraciones importantes

1. **Backup**: Hacer backup de la base de datos local antes de sincronizar
2. **Credenciales**: Asegurar que las credenciales de desarrollo sean correctas
3. **Conexión**: Verificar que se pueda conectar a la base de datos de desarrollo
4. **Contraseñas**: Los usuarios mantendrán sus contraseñas originales
5. **IDs**: Los IDs se resetearán (empezarán desde 1)

## 🚨 Respaldo de datos locales

Antes de sincronizar, hacer backup de usuarios locales importantes:

```bash
# Exportar usuarios locales actuales
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -C -d nanomed -Q "SELECT * FROM Usuarios;" \
  -o backup-usuarios-local.txt
```

## 🔄 Sincronización inversa (Opcional)

Para sincronizar cambios locales hacia desarrollo, crear un script similar pero en dirección inversa.

## 📞 Soporte

Si hay problemas durante la sincronización:

1. Verificar conectividad a la base de datos de desarrollo
2. Revisar logs de error
3. Verificar que Docker esté ejecutándose
4. Confirmar que las credenciales sean correctas
