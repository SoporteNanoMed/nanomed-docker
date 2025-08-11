#!/bin/bash

# Script para configurar SQL Server de Azure con Docker

echo "☁️  Configurando SQL Server de Azure con Docker..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker primero."
    exit 1
fi

# Crear backup del docker-compose original
if [ -f docker-compose.yml ]; then
    cp docker-compose.yml docker-compose.yml.backup
    echo "📋 Backup creado: docker-compose.yml.backup"
fi

# Copiar la versión con Azure SQL
cp docker-compose-with-azure-sql.yml docker-compose.yml
echo "✅ Configuración de Azure SQL activada"

# Actualizar variables de entorno
if [ -f .env ]; then
    echo "📝 Actualizando variables de entorno para Azure SQL..."
    # Agregar variables de base de datos si no existen
    if ! grep -q "DB_SERVER=" .env; then
        echo "" >> .env
        echo "# Azure SQL Server Database Configuration" >> .env
        echo "DB_SERVER=your-azure-sql-server.database.windows.net" >> .env
        echo "DB_USER=your_username" >> .env
        echo "DB_PASSWORD=your_password" >> .env
        echo "DB_NAME=your_database_name" >> .env
        echo "DB_PORT=1433" >> .env
    fi
else
    echo "⚠️  Archivo .env no encontrado. Copiando desde env-azure-sql.example..."
    cp env-azure-sql.example .env
fi

echo ""
echo "🔧 Configuración completada!"
echo ""
echo "✅ Tu API ya está configurada para SQL Server (mssql)."
echo "   No necesitas cambiar nada en el código."
echo ""
echo "📋 Para usar Azure SQL:"
echo "   1. Edita el archivo .env con tus credenciales de Azure:"
echo "      - DB_SERVER: tu-servidor.database.windows.net"
echo "      - DB_USER: tu_usuario"
echo "      - DB_PASSWORD: tu_contraseña"
echo "      - DB_NAME: tu_base_de_datos"
echo ""
echo "   2. Ejecuta: docker-compose up -d"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8080"
echo ""
echo "🔑 Configuración de Azure SQL:"
echo "   - Puerto: 1433"
echo "   - Encriptación: Habilitada por defecto"
echo "   - Firewall: Configurar en Azure Portal"
echo ""
echo "📊 Para verificar que la API esté funcionando:"
echo "   docker-compose logs api"
echo ""
