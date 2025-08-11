require("dotenv").config();

module.exports = {
  app: {
    port: process.env.PORT || 8080,
    host: process.env.HOST || "localhost",
    baseUrl: process.env.API_BASE_URL || "http://localhost:8080",
    jwtSecret: process.env.JWT_SECRET || "secret_key_nanomed",
    jwtExpiration: process.env.JWT_EXPIRATION || "1h",
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  },

  rateLimiting: {
    // Configuración para deshabilitar rate limiting en desarrollo
    enabled: process.env.RATE_LIMITING_ENABLED !== 'false', // Habilitado por defecto
    
    global: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests por ventana (aumentado)
    },
    auth: {
      login: {
        windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
        max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 50, // 50 intentos (aumentado)
      },
      register: {
        windowMs: parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hora
        max: parseInt(process.env.REGISTER_RATE_LIMIT_MAX) || 20, // 20 intentos (aumentado)
      }
    },
    admin: {
      windowMs: parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
      max: parseInt(process.env.ADMIN_RATE_LIMIT_MAX) || 200, // 200 requests (aumentado)
    },
    upload: {
      windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hora
      max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 50, // 50 uploads (aumentado)
    },
    search: {
      windowMs: parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minuto
      max: parseInt(process.env.SEARCH_RATE_LIMIT_MAX) || 100, // 100 búsquedas (aumentado)
    }
  },

  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12, // Aumentado a 12 para mayor seguridad
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    passwordMaxLength: parseInt(process.env.PASSWORD_MAX_LENGTH) || 128,
  },

  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || '"Nanomed" <no-reply@nanomed.com>',
  },

  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    from: process.env.MAILGUN_FROM || '"Nanomed" <noreply@nanomed.cl>',
  },

  sqlserver: {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
      encrypt: process.env.NODE_ENV === 'production',
      trustServerCertificate: process.env.NODE_ENV !== 'production',
    },
  },
};
