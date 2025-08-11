#!/bin/bash

# Script para cambiar entre diferentes configuraciones de base de datos

echo "🔄 Selector de configuración de base de datos"
echo "=============================================="
echo ""
echo "Selecciona la configuración que deseas usar:"
echo ""
echo "1. 🏠 SQL Server local (desarrollo)"
echo "2. ☁️  SQL Server Azure (producción)"
echo "3. 🗄️  PostgreSQL local (alternativa)"
echo "4. ❌ Sin base de datos (solo API + Frontend)"
echo ""
read -p "Ingresa tu opción (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🏠 Configurando SQL Server local..."
        cp docker-compose-with-local-sqlserver.yml docker-compose.yml
        cp env-local-sqlserver.example .env
        echo "✅ Configuración de SQL Server local activada"
        echo ""
        echo "🔑 Credenciales por defecto:"
        echo "   Usuario: sa"
        echo "   Contraseña: YourStrong@Passw0rd"
        echo "   Base de datos: nanomed"
        ;;
    2)
        echo ""
        echo "☁️  Configurando SQL Server Azure..."
        cp docker-compose-with-azure-sql.yml docker-compose.yml
        cp env-azure-sql.example .env
        echo "✅ Configuración de Azure SQL activada"
        echo ""
        echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales de Azure"
        ;;
    3)
        echo ""
        echo "🗄️  Configurando PostgreSQL local..."
        cp docker-compose-with-postgresql.yml docker-compose.yml
        cp env-postgresql.example .env
        echo "✅ Configuración de PostgreSQL activada"
        echo ""
        echo "⚠️  IMPORTANTE: Tu API usa SQL Server. Necesitarás migrar el código."
        ;;
    4)
        echo ""
        echo "❌ Configurando sin base de datos..."
        cp docker-compose.yml docker-compose.yml.backup
        # Usar la configuración original sin base de datos
        echo "✅ Configuración sin base de datos activada"
        echo ""
        echo "⚠️  La API necesitará una base de datos externa configurada."
        ;;
    *)
        echo "❌ Opción inválida. Saliendo..."
        exit 1
        ;;
esac

echo ""
echo "📋 Próximos pasos:"
echo "   1. Edita el archivo .env si es necesario"
echo "   2. Ejecuta: docker-compose up -d"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8080"
echo ""
