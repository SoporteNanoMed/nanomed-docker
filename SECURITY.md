# 🔒 Seguridad - Nanomed

## 🚨 **Advertencia de Seguridad**

Este documento describe las mejores prácticas de seguridad para el proyecto Nanomed.

## 🔐 **Manejo de Credenciales**

### **❌ NO Hacer**
- ❌ Nunca committear credenciales reales al repositorio
- ❌ No hardcodear contraseñas en archivos de configuración
- ❌ No usar credenciales de producción en desarrollo
- ❌ No compartir credenciales en issues o pull requests

### **✅ Hacer**
- ✅ Usar variables de entorno para todas las credenciales
- ✅ Usar archivos `.env` para configuración local
- ✅ Usar GitHub Secrets para CI/CD
- ✅ Rotar credenciales regularmente
- ✅ Usar credenciales diferentes para cada ambiente

## 🛡️ **Configuración Segura**

### **Variables de Entorno**

Todas las credenciales deben estar en variables de entorno:

```bash
# ✅ Correcto - Usar variables de entorno
DB_USER=${DB_USER:-sa}
DB_PASSWORD=${DB_PASSWORD:-YourStrong@Passw0rd}

# ❌ Incorrecto - Hardcodear credenciales
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd
```

### **Archivos de Configuración**

- **`.env`**: Archivo local con credenciales reales (NO committear)
- **`.env.example`**: Archivo de ejemplo con valores dummy (SÍ committear)
- **`docker-compose.yml`**: Usar variables de entorno

## 🔍 **Detección de Credenciales**

### **GitGuardian**
- Configurado para detectar credenciales expuestas
- Escanea automáticamente todos los commits
- Alerta inmediata si se detectan credenciales

### **Pre-commit Hooks**
```bash
# Instalar pre-commit hooks
pre-commit install

# Verificar credenciales antes de commit
pre-commit run --all-files
```

## 🚨 **Si se Detectan Credenciales**

### **1. Inmediatamente**
- 🔄 Rotar todas las credenciales expuestas
- 🗑️ Remover credenciales del historial de git
- 🔒 Revocar acceso de credenciales comprometidas

### **2. Limpiar Historial**
```bash
# Remover credenciales del historial
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch archivo-con-credenciales' \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push para limpiar remoto
git push origin --force --all
```

### **3. Notificar**
- 📧 Notificar al equipo de seguridad
- 🔔 Actualizar documentación de incidentes
- 📋 Revisar políticas de seguridad

## 🔧 **Configuración de GitHub Secrets**

### **Secrets Requeridos**
```bash
# Base de datos
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db_seguro

# Docker Hub
DOCKER_USERNAME=tu_usuario_docker
DOCKER_PASSWORD=tu_password_docker

# Despliegue
DEPLOY_KEY=tu_clave_despliegue

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_super_seguro
```

### **Configurar Secrets**
1. Ir a GitHub Repository → Settings → Secrets and variables → Actions
2. Agregar cada secret con su valor correspondiente
3. Usar nombres descriptivos y valores seguros

## 🔒 **Mejores Prácticas**

### **Contraseñas**
- 🔤 Mínimo 12 caracteres
- 🔤 Combinar mayúsculas, minúsculas, números y símbolos
- 🔤 No usar palabras del diccionario
- 🔤 Usar gestor de contraseñas

### **Tokens JWT**
- 🔤 Usar secretos criptográficamente seguros
- 🔤 Rotar regularmente
- 🔤 Usar diferentes secretos para diferentes ambientes

### **Base de Datos**
- 🔤 Usar usuarios con permisos mínimos necesarios
- 🔤 Habilitar SSL/TLS
- 🔤 Configurar firewalls
- 🔤 Hacer backups regulares

## 📋 **Checklist de Seguridad**

### **Antes de cada Commit**
- [ ] Verificar que no hay credenciales hardcodeadas
- [ ] Usar variables de entorno para configuración
- [ ] Revisar archivos modificados
- [ ] Ejecutar pre-commit hooks

### **Antes de Deploy**
- [ ] Verificar que todas las credenciales están en secrets
- [ ] Confirmar que no hay credenciales en logs
- [ ] Verificar configuración de SSL/TLS
- [ ] Revisar permisos de archivos

### **Mensualmente**
- [ ] Rotar credenciales de base de datos
- [ ] Rotar tokens JWT
- [ ] Revisar logs de acceso
- [ ] Actualizar dependencias

## 🆘 **Contacto de Seguridad**

Si encuentras un problema de seguridad:

- 📧 **Email**: seguridad@nanomed.cl
- 🔒 **PGP Key**: [Agregar clave PGP]
- 📋 **Reporte**: Crear issue privado en GitHub

## 📚 **Recursos Adicionales**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security](https://docs.github.com/en/github/managing-security-vulnerabilities)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
