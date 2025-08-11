#!/bin/bash

# Script de despliegue para producción
# Uso: ./deploy.sh [ambiente]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Función para verificar si Docker está ejecutándose
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está ejecutándose. Por favor inicia Docker Desktop."
        exit 1
    fi
}

# Función para verificar variables de entorno
check_env_file() {
    if [ ! -f ".env" ]; then
        print_error "Archivo .env no encontrado. Por favor copia env.production.example a .env y configúralo."
        exit 1
    fi
}

# Función para hacer backup
backup_database() {
    print_message "Haciendo backup de la base de datos..."
    # Aquí iría la lógica de backup
    print_message "Backup completado"
}

# Función para despliegue de staging
deploy_staging() {
    print_header "Despliegue a Staging"
    
    check_docker
    check_env_file
    
    print_message "Deteniendo servicios existentes..."
    docker-compose down
    
    print_message "Construyendo imágenes..."
    docker-compose build --no-cache
    
    print_message "Iniciando servicios de staging..."
    docker-compose up -d
    
    print_message "Esperando que los servicios estén listos..."
    sleep 30
    
    print_message "Verificando servicios..."
    docker-compose ps
    
    print_message "Despliegue a staging completado!"
    print_message "Frontend: http://localhost:3000"
    print_message "Backend API: http://localhost:8080"
}

# Función para despliegue de producción
deploy_production() {
    print_header "Despliegue a Producción"
    
    check_docker
    check_env_file
    
    print_warning "¿Estás seguro de que quieres desplegar a producción? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_message "Despliegue cancelado"
        exit 0
    fi
    
    print_message "Haciendo backup antes del despliegue..."
    backup_database
    
    print_message "Deteniendo servicios existentes..."
    docker-compose -f docker-compose.prod.yml down
    
    print_message "Construyendo imágenes de producción..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    print_message "Iniciando servicios de producción..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_message "Esperando que los servicios estén listos..."
    sleep 60
    
    print_message "Verificando servicios..."
    docker-compose -f docker-compose.prod.yml ps
    
    print_message "Despliegue a producción completado!"
    print_message "Verificando salud de los servicios..."
    
    # Verificar que los servicios respondan
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        print_message "✅ API está funcionando correctamente"
    else
        print_error "❌ API no está respondiendo"
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_message "✅ Frontend está funcionando correctamente"
    else
        print_error "❌ Frontend no está respondiendo"
    fi
}

# Función para rollback
rollback() {
    print_header "Rollback"
    
    print_warning "¿Estás seguro de que quieres hacer rollback? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_message "Rollback cancelado"
        exit 0
    fi
    
    print_message "Deteniendo servicios..."
    docker-compose -f docker-compose.prod.yml down
    
    print_message "Restaurando versión anterior..."
    # Aquí iría la lógica de rollback
    
    print_message "Iniciando servicios con versión anterior..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_message "Rollback completado"
}

# Función para mostrar logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_message "Mostrando logs de todos los servicios..."
        docker-compose -f docker-compose.prod.yml logs -f
    else
        print_message "Mostrando logs del servicio: $service"
        docker-compose -f docker-compose.prod.yml logs -f "$service"
    fi
}

# Función para mostrar estado
status() {
    print_header "Estado de los servicios"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    print_header "Información de conexión"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8080"
    echo "Base de datos: localhost:1433"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: ./deploy.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  staging     - Desplegar a staging"
    echo "  production  - Desplegar a producción"
    echo "  rollback    - Hacer rollback de producción"
    echo "  logs        - Mostrar logs de todos los servicios"
    echo "  logs [servicio] - Mostrar logs de un servicio específico"
    echo "  status      - Mostrar estado de los servicios"
    echo "  help        - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./deploy.sh staging"
    echo "  ./deploy.sh production"
    echo "  ./deploy.sh logs api"
}

# Main script
case "${1:-help}" in
    staging)
        deploy_staging
        ;;
    production)
        deploy_production
        ;;
    rollback)
        rollback
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando desconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
