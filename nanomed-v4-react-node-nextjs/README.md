# NANOMED - Frontend Web

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## 📋 Descripción General

Este es el frontend web de **NANOMED**, una plataforma integral de gestión médica desarrollada con Next.js 15 y React 19. La aplicación está diseñada para funcionar como cliente de la API de NANOMED, que se ejecuta en un servidor separado.

### 🏗️ Arquitectura

- **Frontend**: Next.js 15 con React 19 (servidor separado)
- **Backend**: API REST en Node.js/Express (servidor separado)
- **Base de Datos**: SQL Server
- **Autenticación**: JWT con refresh tokens
- **UI/UX**: Tailwind CSS + Radix UI + Shadcn/ui

## 🚀 Características Principales

### 👥 Gestión de Usuarios
- **Pacientes**: Registro, perfil médico, historial de citas y exámenes
- **Médicos**: Gestión de horarios, pacientes, exámenes y citas
- **Recepcionistas**: Gestión de citas, pacientes y administración básica
- **Administradores**: Control total del sistema, estadísticas y gestión de usuarios

### 📅 Sistema de Citas
- Programación de citas médicas
- Gestión de disponibilidad de médicos
- Bloqueos de horarios y excepciones
- Notificaciones automáticas

### 🏥 Gestión Médica
- Historial médico de pacientes
- Gestión de exámenes médicos
- Notas médicas
- Especialidades médicas

### 📊 Dashboard y Estadísticas
- Estadísticas en tiempo real
- Reportes diarios, semanales y mensuales
- Análisis de rendimiento

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework de React con SSR/SSG
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de CSS utilitario
- **Radix UI**: Componentes de interfaz accesibles
- **Shadcn/ui**: Componentes de UI modernos

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **PostCSS**: Procesamiento de CSS
- **Autoprefixer**: Prefijos CSS automáticos

### Librerías Principales
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de esquemas
- **Date-fns**: Manipulación de fechas
- **Lucide React**: Iconos
- **Recharts**: Gráficos y visualizaciones
- **Sonner**: Notificaciones toast

## 🎨 Colores Corporativos y Temas

### Colores Principales de NANOMED
- **Azul Principal**: `#59c3ed`
- **Blanco**: `#ffffff`

### Colores de Apoyo (Apollo)
- **Azul Secundario**: `#479cd0`
- **Gris Medio**: `#7b7b7b`
- **Negro**: `#000000`
- **Gris Claro**: `#f0f6f7`
- **Azul Claro**: `#aef4ff`
- **Azul Oscuro**: `#0797b3`
- **Azul Muy Oscuro**: `#111726`

## 🌓 Sistema de Temas

La aplicación incluye tres temas principales para mejorar la accesibilidad y experiencia del usuario:

### Tema Claro
- **Fondo Principal**: `#ffffff`
- **Fondo Secundario**: `#f8fafc`
- **Texto Principal**: `#0f172a`
- **Texto Secundario**: `#64748b`
- **Bordes**: `#e2e8f0`
- **Acentos**: `#59c3ed` (azul principal)
- **Éxito**: `#22c55e`
- **Error**: `#ef4444`
- **Advertencia**: `#f59e0b`

### Tema Oscuro
- **Fondo Principal**: `#0f172a`
- **Fondo Secundario**: `#1e293b`
- **Texto Principal**: `#f8fafc`
- **Texto Secundario**: `#94a3b8`
- **Bordes**: `#334155`
- **Acentos**: `#59c3ed` (azul principal)
- **Éxito**: `#22c55e`
- **Error**: `#ef4444`
- **Advertencia**: `#f59e0b`

### Tema Alto Contraste
- **Fondo Principal**: `#000000`
- **Fondo Secundario**: `#111726`
- **Texto Principal**: `#ffffff`
- **Texto Secundario**: `#aef4ff`
- **Bordes**: `#479cd0`
- **Acentos**: `#59c3ed` (azul principal)
- **Éxito**: `#00ff00`
- **Error**: `#ff0000`
- **Advertencia**: `#ffff00`

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm, yarn o pnpm
- Acceso a la API de NANOMED

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd website
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env.local` en la raíz del proyecto:

```env
# URL de la API de NANOMED
NEXT_PUBLIC_API_BASE_URL= (VARIABLE DEPENDIENDO DEL ENTORNO DE PRODUCCIÓN O DESARROLLO)

# Configuración de Cloudinary (opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name

# Configuración de Chat (opcional)
NEXT_PUBLIC_CLIENGO_TOKEN=tu-token-cliengo
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
website/
├── app/                    # App Router de Next.js 13+
│   ├── dashboard/         # Dashboard principal
│   │   ├── admin/        # Panel de administrador
│   │   │   ├── doctors/  # Gestión de médicos
│   │   │   ├── logs/     # Registros del sistema
│   │   │   ├── medicos/  # Gestión de médicos (español)
│   │   │   ├── receptionists/ # Gestión de recepcionistas
│   │   │   ├── recepcionistas/ # Gestión de recepcionistas (español)
│   │   │   ├── stats/    # Estadísticas del sistema
│   │   │   └── users/    # Gestión de usuarios
│   │   ├── doctor/       # Panel de médico
│   │   │   ├── examenes/ # Gestión de exámenes
│   │   │   ├── medicos/  # Gestión de médicos
│   │   │   ├── mis-citas/ # Mis citas
│   │   │   └── pacientes/ # Gestión de pacientes
│   │   ├── appointments/  # Gestión de citas
│   │   ├── citas/        # Citas (español)
│   │   ├── doctors/      # Gestión de doctores
│   │   ├── examenes/     # Exámenes (español)
│   │   ├── exams/        # Gestión de exámenes
│   │   ├── medicos/      # Médicos (español)
│   │   ├── mensajes/     # Mensajes
│   │   ├── notificaciones/ # Notificaciones
│   │   ├── patients/     # Gestión de pacientes
│   │   ├── perfil/       # Perfil de usuario
│   │   └── stats/        # Estadísticas
│   ├── debug-profile/    # Perfil de depuración
│   ├── especialidades/   # Especialidades médicas
│   ├── forgot-password/  # Recuperación de contraseña
│   ├── login/            # Página de inicio de sesión
│   ├── medicos/          # Página de médicos
│   ├── page.tsx          # Página principal
│   ├── public-layout.tsx # Layout público
│   ├── registro/         # Página de registro
│   ├── requisitos-examenes/ # Requisitos de exámenes
│   ├── reset-password/   # Restablecer contraseña
│   ├── salud-ocupacional/ # Salud ocupacional
│   └── verify-email/     # Verificación de email
├── components/           # Componentes reutilizables
│   ├── cliengo-chat.tsx # Componente de chat
│   ├── cloudinary-video-background.tsx # Video de fondo
│   ├── examenes/        # Componentes de exámenes
│   ├── home-theme-provider.tsx # Proveedor de tema
│   ├── main-navigation.tsx # Navegación principal
│   ├── simple-carousel.tsx # Carrusel simple
│   ├── theme-provider.tsx # Proveedor de tema
│   ├── theme-selector.tsx # Selector de tema
│   ├── ui/              # Componentes de UI base
│   │   ├── accordion.tsx # Acordeón
│   │   ├── alert-dialog.tsx # Diálogo de alerta
│   │   ├── alert.tsx    # Alertas
│   │   ├── aspect-ratio.tsx # Relación de aspecto
│   │   ├── avatar.tsx   # Avatar
│   │   ├── badge.tsx    # Insignias
│   │   ├── breadcrumb.tsx # Migas de pan
│   │   ├── button.tsx   # Botones
│   │   ├── calendar.tsx # Calendario
│   │   ├── card.tsx     # Tarjetas
│   │   ├── carousel.tsx # Carrusel
│   │   ├── chart.tsx    # Gráficos
│   │   ├── checkbox.tsx # Casillas de verificación
│   │   ├── collapsible.tsx # Colapsible
│   │   ├── command.tsx  # Comando
│   │   ├── context-menu.tsx # Menú contextual
│   │   ├── dialog.tsx   # Diálogos
│   │   ├── drawer.tsx   # Cajones
│   │   ├── dropdown-menu.tsx # Menú desplegable
│   │   ├── error-alert.tsx # Alertas de error
│   │   ├── form.tsx     # Formularios
│   │   ├── hover-card.tsx # Tarjetas flotantes
│   │   ├── input-otp.tsx # Input OTP
│   │   ├── input.tsx    # Campos de entrada
│   │   ├── label.tsx    # Etiquetas
│   │   ├── loading-spinner.tsx # Spinner de carga
│   │   ├── menubar.tsx  # Barra de menú
│   │   ├── navigation-menu.tsx # Menú de navegación
│   │   ├── pagination.tsx # Paginación
│   │   ├── popover.tsx  # Popover
│   │   ├── progress.tsx # Barra de progreso
│   │   ├── radio-group.tsx # Grupo de radio
│   │   ├── resizable.tsx # Redimensionable
│   │   ├── scroll-area.tsx # Área de desplazamiento
│   │   ├── select.tsx   # Selector
│   │   ├── separator.tsx # Separador
│   │   ├── sheet.tsx    # Hoja
│   │   ├── sidebar.tsx  # Barra lateral
│   │   ├── skeleton.tsx # Esqueleto
│   │   ├── slider.tsx   # Deslizador
│   │   ├── sonner.tsx   # Notificaciones
│   │   ├── switch.tsx   # Interruptor
│   │   ├── table.tsx    # Tablas
│   │   ├── tabs.tsx     # Pestañas
│   │   ├── textarea.tsx # Área de texto
│   │   ├── toast.tsx    # Toast
│   │   ├── toaster.tsx  # Toaster
│   │   ├── toggle-group.tsx # Grupo de toggle
│   │   ├── toggle.tsx   # Toggle
│   │   ├── tooltip.tsx  # Tooltip
│   │   ├── use-mobile.tsx # Hook móvil
│   │   └── use-toast.ts # Hook toast
│   ├── video-background-with-fallback.tsx # Video de fondo con fallback
│   └── video-background.tsx # Video de fondo
├── hooks/               # Custom hooks de React
│   ├── use-mobile.ts   # Hook para móvil
│   ├── use-theme.ts    # Hook de tema
│   └── use-toast.ts    # Hook de toast
├── lib/                 # Utilidades y configuración
│   ├── api/            # Cliente y servicios de API
│   │   ├── client.ts   # Cliente API
│   │   ├── config.ts   # Configuración API
│   │   ├── hooks/      # Hooks de API
│   │   ├── index.ts    # Índice de API
│   │   ├── services/   # Servicios de API
│   │   └── types.ts    # Tipos de API
│   └── utils/          # Utilidades generales
│       ├── dateUtils.ts # Utilidades de fecha
│       ├── permissions.ts # Permisos
│       └── utils.ts    # Utilidades generales
├── public/             # Archivos estáticos
│   ├── images/         # Imágenes
│   │   ├── clients/    # Logos de clientes
│   │   └── ...         # Otras imágenes
│   └── videos/         # Videos
├── styles/             # Estilos globales
│   └── globals.css     # CSS global
├── components.json     # Configuración de componentes
├── middleware.ts       # Middleware de Next.js
├── next.config.mjs     # Configuración de Next.js
├── package.json        # Dependencias del proyecto
├── postcss.config.mjs  # Configuración de PostCSS
├── tailwind.config.ts  # Configuración de Tailwind
└── tsconfig.json       # Configuración de TypeScript
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## 🌐 Despliegue

### ⚠️ Nota sobre Vercel

**El desarrollo inicial con Vercel fue limitado al frontend en su primera versión y se abandonó su uso tras la necesidad de integrar endpoints de la API en las funcionalidades.** 

La plataforma Vercel, aunque excelente para aplicaciones frontend estáticas, presentó limitaciones significativas para el desarrollo de funcionalidades que requieren integración directa con endpoints de API, especialmente para operaciones del lado del servidor y middleware personalizado.

### Opciones de Despliegue Actuales

La aplicación puede desplegarse en cualquier proveedor que soporte Next.js con capacidades de servidor:

- **Railway**: Recomendado para aplicaciones full-stack
- **DigitalOcean App Platform**: Buena opción para aplicaciones con base de datos
- **AWS Amplify**: Para integración con servicios AWS
- **Netlify**: Para versiones estáticas (limitado)
- **VPS Personal**: Para control total sobre el entorno

### Configuración Recomendada

Para un despliegue óptimo, se recomienda:

1. **Servidor con Node.js**: Para soporte completo de SSR/SSG
2. **Variables de Entorno**: Configurar todas las variables necesarias
3. **Base de Datos**: SQL Server accesible desde el servidor de despliegue
4. **CDN**: Para archivos estáticos y optimización de rendimiento