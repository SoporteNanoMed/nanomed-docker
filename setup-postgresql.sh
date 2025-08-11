#!/bin/bash

# Script para configurar PostgreSQL con Docker

echo "🗄️  Configurando PostgreSQL con Docker..."

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

# Copiar la versión con PostgreSQL
cp docker-compose-with-postgresql.yml docker-compose.yml
echo "✅ Configuración de PostgreSQL activada"

# Actualizar variables de entorno
if [ -f .env ]; then
    echo "📝 Actualizando variables de entorno para PostgreSQL..."
    # Agregar variables de base de datos si no existen
    if ! grep -q "DB_SERVER=db" .env; then
        echo "" >> .env
        echo "# PostgreSQL Database Configuration" >> .env
        echo "DB_SERVER=db" >> .env
        echo "DB_USER=nanomed_user" >> .env
        echo "DB_PASSWORD=nanomed_password" >> .env
        echo "DB_NAME=nanomed" >> .env
        echo "DB_PORT=5432" >> .env
    fi
else
    echo "⚠️  Archivo .env no encontrado. Ejecuta primero: cp env.example .env"
fi

echo ""
echo "🔧 Configuración completada!"
echo ""
echo "⚠️  IMPORTANTE: Tu API actualmente usa SQL Server (mssql)."
echo "   Para usar PostgreSQL, necesitarás:"
echo ""
echo "   1. Cambiar las importaciones en tu código:"
echo "      - Cambiar: const db = require('../db/sqlserver')"
echo "      - Por: const db = require('../db/postgresql')"
echo ""
echo "   2. Adaptar las consultas SQL:"
echo "      - SQL Server usa TOP, PostgreSQL usa LIMIT"
echo "      - SQL Server usa @@IDENTITY, PostgreSQL usa RETURNING"
echo "      - SQL Server usa GETDATE(), PostgreSQL usa NOW()"
echo ""
echo "   3. Instalar dependencias:"
echo "      - npm install pg"
echo "      - npm uninstall mssql"
echo ""
echo "📋 Para usar PostgreSQL:"
echo "   1. Edita el archivo .env con tus configuraciones"
echo "   2. Ejecuta: docker-compose up -d"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8080"
echo "   PostgreSQL: localhost:5432"
echo ""
echo "🔑 Credenciales de base de datos:"
echo "   Usuario: nanomed_user"
echo "   Contraseña: nanomed_password"
echo "   Base de datos: nanomed"
echo ""
echo "📊 Para verificar que PostgreSQL esté funcionando:"
echo "   docker-compose logs db"
echo ""
