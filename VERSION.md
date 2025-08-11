# 📋 Versionado de Nanomed

## 🏷️ Convención de Versionado

Utilizamos [Semantic Versioning](https://semver.org/) (SemVer) para el versionado:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

## 📝 Historial de Versiones

### [1.0.0] - 2024-01-XX

#### ✨ Agregado
- Configuración inicial de Docker Compose
- Backend API con Node.js y Express
- Frontend con Next.js y React
- Base de datos SQL Server en Docker
- Scripts de automatización (`dev.sh`, `start.sh`)
- Configuración de CI/CD con GitHub Actions
- Documentación completa
- Sincronización de base de datos con Azure
- Migración a TypeORM

#### 🔧 Configurado
- Hot-reload para desarrollo
- Variables de entorno centralizadas
- Múltiples configuraciones de base de datos
- Monorepo con workspaces de npm

## 🚀 Próximas Versiones

### [1.1.0] - Próximamente
- [ ] Tests unitarios y de integración
- [ ] Documentación de API con Swagger
- [ ] Sistema de logging mejorado
- [ ] Métricas y monitoreo

### [1.2.0] - Próximamente
- [ ] Autenticación con JWT mejorada
- [ ] Sistema de roles y permisos
- [ ] Notificaciones en tiempo real
- [ ] Dashboard de administración

## 🔄 Flujo de Versionado

### 1. Desarrollo
```bash
# Trabajar en feature branch
git checkout -b feature/nueva-funcionalidad
# Hacer cambios
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 2. Release
```bash
# Crear tag de versión
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Crear release en GitHub
# Ir a GitHub > Releases > Create a new release
```

### 3. Despliegue
```bash
# El CI/CD se ejecuta automáticamente
# Las imágenes se construyen y despliegan
```

## 📊 Compatibilidad

| Versión | Node.js | Docker | SQL Server |
|---------|---------|--------|------------|
| 1.0.0   | >=18.0  | >=20.0 | >=2019     |

## 🔗 Enlaces Útiles

- [Changelog](CHANGELOG.md)
- [Releases en GitHub](https://github.com/tu-usuario/nanomed-docker/releases)
- [Documentación](README.md)
