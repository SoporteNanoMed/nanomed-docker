#!/bin/bash

# Script para configurar la base de datos con Docker

echo "🗄️  Configurando base de datos SQL Server con Docker..."

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

# Copiar la versión con base de datos
cp docker-compose-with-db.yml docker-compose.yml
echo "✅ Configuración de base de datos activada"

# Actualizar variables de entorno
if [ -f .env ]; then
    echo "📝 Actualizando variables de entorno para base de datos..."
    # Agregar variables de base de datos si no existen
    if ! grep -q "DB_SERVER=db" .env; then
        echo "" >> .env
        echo "# Database Configuration" >> .env
        echo "DB_SERVER=db" >> .env
        echo "DB_USER=sa" >> .env
        echo "DB_PASSWORD=YourStrong@Passw0rd" >> .env
        echo "DB_NAME=nanomed" >> .env
        echo "DB_PORT=1433" >> .env
    fi
else
    echo "⚠️  Archivo .env no encontrado. Ejecuta primero: cp env.example .env"
fi

echo ""
echo "🔧 Configuración completada!"
echo ""
echo "📋 Para usar la base de datos:"
echo "   1. Edita el archivo .env con tus configuraciones"
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
echo "📊 Para verificar que la base de datos esté funcionando:"
echo "   docker-compose logs db"
echo ""
