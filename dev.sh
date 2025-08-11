#!/bin/bash

# Script de desarrollo para Nanomed
# Uso: ./dev.sh [comando]

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

# Función para iniciar todos los servicios
start_all() {
    print_header "Iniciando todos los servicios de Nanomed"
    check_docker
    
    print_message "Iniciando servicios con Docker Compose..."
    docker-compose up -d
    
    print_message "Esperando que los servicios estén listos..."
    sleep 10
    
    print_message "Verificando estado de los servicios..."
    docker-compose ps
    
    print_message "Servicios iniciados correctamente!"
    print_message "Frontend: http://localhost:3000"
    print_message "Backend API: http://localhost:8080"
    print_message "Base de datos: localhost:1433"
}

# Función para detener todos los servicios
stop_all() {
    print_header "Deteniendo todos los servicios"
    docker-compose down
    print_message "Servicios detenidos correctamente!"
}

# Función para ver logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_message "Mostrando logs de todos los servicios..."
        docker-compose logs -f
    else
        print_message "Mostrando logs del servicio: $service"
        docker-compose logs -f "$service"
    fi
}

# Función para reconstruir servicios
rebuild() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_message "Reconstruyendo todos los servicios..."
        docker-compose build --no-cache
    else
        print_message "Reconstruyendo servicio: $service"
        docker-compose build --no-cache "$service"
    fi
}

# Función para acceder a la base de datos
db_shell() {
    print_message "Accediendo a la base de datos..."
    docker-compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -d nanomed
}

# Función para sincronizar base de datos
sync_db() {
    print_header "Sincronizando base de datos con desarrollo"
    
    if [ ! -f "nanomed-NODEJS-API-v2/.env-dev" ]; then
        print_error "Archivo .env-dev no encontrado. Configura las credenciales de desarrollo primero."
        exit 1
    fi
    
    cd nanomed-NODEJS-API-v2
    export $(cat .env-dev | grep -v '^#' | xargs)
    node sync-database.js
    cd ..
}

# Función para mostrar estado
status() {
    print_header "Estado de los servicios"
    docker-compose ps
    
    echo ""
    print_header "Información de conexión"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8080"
    echo "Base de datos: localhost:1433"
    echo "Usuario DB: sa"
    echo "Contraseña DB: YourStrong@Passw0rd"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: ./dev.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start       - Iniciar todos los servicios"
    echo "  stop        - Detener todos los servicios"
    echo "  restart     - Reiniciar todos los servicios"
    echo "  logs        - Mostrar logs de todos los servicios"
    echo "  logs [servicio] - Mostrar logs de un servicio específico (api, frontend, db)"
    echo "  rebuild     - Reconstruir todas las imágenes"
    echo "  rebuild [servicio] - Reconstruir imagen de un servicio específico"
    echo "  db          - Acceder a la shell de la base de datos"
    echo "  sync-db     - Sincronizar base de datos con desarrollo"
    echo "  status      - Mostrar estado de los servicios"
    echo "  help        - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./dev.sh start"
    echo "  ./dev.sh logs api"
    echo "  ./dev.sh rebuild frontend"
}

# Función para reiniciar servicios
restart() {
    print_header "Reiniciando servicios"
    stop_all
    start_all
}

# Main script
case "${1:-help}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart
        ;;
    logs)
        show_logs "$2"
        ;;
    rebuild)
        rebuild "$2"
        ;;
    db)
        db_shell
        ;;
    sync-db)
        sync_db
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
