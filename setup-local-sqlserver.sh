#!/bin/bash

# Script para configurar SQL Server local con Docker

echo "🏠 Configurando SQL Server local con Docker..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker primero."
    exit 1
fi

# Verificar si existe el archivo de estructura de base de datos
if [ ! -f "./nanomed-NODEJS-API-v2/EstucturaBDD.sql" ]; then
    echo "⚠️  Archivo EstucturaBDD.sql no encontrado."
    echo "   La base de datos se creará vacía."
    echo "   Puedes importar la estructura manualmente después."
fi

# Crear backup del docker-compose original
if [ -f docker-compose.yml ]; then
    cp docker-compose.yml docker-compose.yml.backup
    echo "📋 Backup creado: docker-compose.yml.backup"
fi

# Copiar la versión con SQL Server local
cp docker-compose-with-local-sqlserver.yml docker-compose.yml
echo "✅ Configuración de SQL Server local activada"

# Actualizar variables de entorno
if [ -f .env ]; then
    echo "📝 Actualizando variables de entorno para SQL Server local..."
    # Agregar variables de base de datos si no existen
    if ! grep -q "DB_SERVER=db" .env; then
        echo "" >> .env
        echo "# Local SQL Server Database Configuration" >> .env
        echo "DB_SERVER=db" >> .env
        echo "DB_USER=sa" >> .env
        echo "DB_PASSWORD=YourStrong@Passw0rd" >> .env
        echo "DB_NAME=nanomed" >> .env
        echo "DB_PORT=1433" >> .env
    fi
else
    echo "📝 Copiando variables de entorno desde env-local-sqlserver.example..."
    cp env-local-sqlserver.example .env
fi

echo ""
echo "🔧 Configuración completada!"
echo ""
echo "✅ SQL Server local configurado para desarrollo."
echo "   La base de datos se inicializará automáticamente."
echo ""
echo "📋 Para usar SQL Server local:"
echo "   1. Edita el archivo .env si necesitas cambiar configuraciones"
echo "   2. Ejecuta: docker-compose up -d"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8080"
echo "   SQL Server: localhost:1433"
echo ""
echo "🔑 Credenciales de base de datos:"
echo "   Usuario: sa"
echo "   Contraseña: YourStrong@Passw0rd"
echo "   Base de datos: nanomed"
echo ""
echo "📊 Para verificar que todo esté funcionando:"
echo "   docker-compose logs"
echo ""
echo "🗄️  Para conectarte a la base de datos desde tu cliente SQL:"
echo "   - Servidor: localhost,1433"
echo "   - Usuario: sa"
echo "   - Contraseña: YourStrong@Passw0rd"
echo ""
