const express = require("express");
const cors = require("cors");
const config = require("./config");
const usuarios = require("./src/modulos/rutas");
const authRoutes = require("./src/auth/rutas");
const userRoutes = require("./src/users/rutas");
const doctorsRoutes = require("./src/doctors/rutas");
const specialtiesRoutes = require("./src/specialties/rutas");
const examsRoutes = require("./src/exams/rutas");
const appointmentsRoutes = require("./src/appointments/rutas");
const paymentRoutes = require("./src/appointments/rutas-pago");
const notificationsRoutes = require("./src/notifications/rutas");
const searchRoutes = require("./src/search/rutas");
const adminRoutes = require("./src/admin/rutas");
const receptionistRoutes = require("./src/receptionists/rutas");
const contactRoutes = require("./src/contact/rutas");
const error = require("./src/red/errors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { sanitizeInput, preventNoSQLInjection } = require("./src/middleware/sanitization");
const { conditionalCsrf, csrfErrorHandler, getCsrfToken } = require("./src/middleware/csrf");

// Configuración de Swagger UI
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Cargar especificación OpenAPI
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
} catch (error) {
  console.warn('⚠️ No se pudo cargar openapi.yaml, usando configuración básica de Swagger');
  swaggerDocument = {
    openapi: '3.0.3',
    info: {
      title: 'Nanomed API v2',
      version: '2.5.0',
      description: 'API REST para el sistema Nanomed - Gestión médica y administrativa integral'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor de desarrollo'
      }
    ]
  };
}

const app = express();

// Middleware de sanitización global (antes del parsing de JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplicar sanitización después del parsing
app.use(sanitizeInput);
app.use(preventNoSQLInjection);

// Rate limiting global para toda la API (solo si está habilitado)
if (config.rateLimiting.enabled) {
  const globalLimiter = rateLimit({
    windowMs: config.rateLimiting.global.windowMs,
    max: config.rateLimiting.global.max,
    message: {
      error: true,
      message: "Demasiadas solicitudes desde esta IP. Por favor intente más tarde."
    },
    standardHeaders: true, // Incluir headers de rate limit en la respuesta
    legacyHeaders: false, // Deshabilitar headers legacy
    // Excluir ciertas rutas del rate limiting global si es necesario
    skip: (req) => {
      // Permitir que las rutas de auth tengan su propio rate limiting más estricto
      return req.path.startsWith('/api/auth/');
    },
    // Agregar logging para debugging
    handler: (req, res) => {
      res.status(429).json({
        error: true,
        message: "Demasiadas solicitudes desde esta IP. Por favor intente más tarde.",
        rateLimitType: 'global'
      });
    }
  });

  // Aplicar rate limiting global
  app.use(globalLimiter);
} else {
  // console.log('Rate limiting global deshabilitado');
}

// Configuración de CORS
const corsOptions = {
  origin: [
    config.app.clientUrl, // URL del frontend desde config
    "https://v0-recreate-ui-from-screenshot-kappa-pink.vercel.app", // Frontend de Vercel
    "https://v0.dev", // v0.dev base
    //"https://v0.dev/chat/fork-of-recreate-ui-from-screenshot-A1X4Xs32mcE", // v0.dev específico
    "http://localhost:3000", // Para desarrollo local
    "http://localhost:3001", // Puerto alternativo
    "http://127.0.0.1:3000", // IP local
    "http://127.0.0.1:3001"  // IP local puerto alternativo
  ],
  credentials: true, // Permitir cookies y headers de autenticación
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With", 
    "Content-Type", 
    "Accept", 
    "Authorization",
    "Cache-Control"
  ]
};

app.use(cors(corsOptions));

// Configuración de Swagger UI - Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Nanomed API v2 - Documentación',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Agregar headers por defecto si es necesario
      return req;
    }
  }
}));

// Endpoint para obtener la especificación OpenAPI en formato JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Aplicar protección CSRF condicional
app.use(conditionalCsrf);

// Endpoint para obtener token CSRF
app.get("/api/csrf-token", getCsrfToken);

app.set("port", process.env.PORT || config.app.port);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/usuarios", usuarios);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/specialties", specialtiesRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/doctor/exams", examsRoutes); // Ruta adicional para compatibilidad con frontend
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/appointments", paymentRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/receptionists", receptionistRoutes);
app.use("/api/contact", contactRoutes);

// Manejar errores CSRF antes del handler general de errores
app.use(csrfErrorHandler);
app.use(error);

app.get("/", (req, res) => {
  res.json({
    message: "API de nanoMED v2.5.0 en funcionamiento",
    timestamp: new Date().toISOString(),
    version: "2.5.0",
    documentation: {
      swagger: "/api-docs",
      openapi: "/api-docs.json",
      postman: "postman_collection.json disponible"
    },
    status: "online"
  });
});

module.exports = app;
