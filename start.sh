#!/bin/bash

# Script de inicio rápido para Nanomed con Docker Compose

echo "🚀 Iniciando Nanomed con Docker Compose..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker primero."
    exit 1
fi

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "📝 Archivo .env no encontrado. Copiando desde env.example..."
    cp env.example .env
    echo "⚠️  Por favor edita el archivo .env con tus configuraciones antes de continuar."
    echo "   Presiona Enter cuando hayas terminado..."
    read
fi

# Construir las imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose build

# Levantar los servicios
echo "⬆️  Levantando servicios..."
docker-compose up -d

# Esperar un momento para que los servicios se inicien
echo "⏳ Esperando que los servicios se inicien..."
sleep 10

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose ps

echo ""
echo "✅ Nanomed está listo!"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8080"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reconstruir: docker-compose build --no-cache"
echo ""
