// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
}

// Headers por defecto
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
}

// Endpoints de la API
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    VERIFY_EMAIL: "/api/auth/verify-email",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },

  // Usuario
  USER: {
    ME: "/api/users/me",
    UPDATE_PROFILE: "/api/users/me",
    UPLOAD_AVATAR: "/api/users/me/profile-picture",
    DELETE_AVATAR: "/api/users/me/profile-picture",
    UPDATE_PASSWORD: "/api/users/me/password",
    UPDATE_PREFERENCES: "/api/users/me/preferences",
  },

  // Médicos
  DOCTORS: {
    LIST: "/api/doctors",
    BY_ID: (id: number) => `/api/doctors/${id}`,
    SEARCH: "/api/doctors/search",
    AVAILABILITY: (id: number) => `/api/doctors/${id}/availability`,
    APPOINTMENTS: (id: number) => `/api/doctors/${id}/appointments`,
  },

  // Especialidades
  SPECIALTIES: {
    LIST: "/api/specialties",
  },

  // Citas
  APPOINTMENTS: {
    LIST: "/api/appointments",
    CREATE: "/api/appointments",
    BY_ID: (id: number) => `/api/appointments/${id}`,
    UPDATE_STATUS: (id: number) => `/api/appointments/${id}/status`,
    ALL: "/api/appointments/all", // Para admin/recepcionista
    FOR_PATIENT: (patientId: number) => `/api/appointments/patient/${patientId}`,
    FOR_DOCTOR: (doctorId: number) => `/api/appointments/doctor/${doctorId}`,
    // Endpoints de pago
    PAYMENT_CREATE: (id: number) => `/api/appointments/${id}/payment/create`,
    PAYMENT_CONFIRM: "/api/appointments/payment/confirm",
    PAYMENT_STATUS: (id: number) => `/api/appointments/${id}/payment/status`,
    PAYMENT_RETRY: "/api/appointments/payment/retry",
  },

  // Exámenes - Ahora solo blob storage
  EXAMS: {
    LIST: "/api/exams", // Listar exámenes (blob storage)
    BY_ID: (id: string) => `/api/exams/blob/${id}`, // Obtener examen específico del blob
    DOWNLOAD: (id: string) => `/api/exams/blob/${id}/download`, // Descargar archivo del blob
    DELETE: (id: string) => `/api/doctor/exams/blob/${id}`, // Eliminar examen del blob (solo médicos/admin)
    MOVE: (id: string) => `/api/doctor/exams/blob/${id}/move`, // Mover examen a carpeta
    RESTORE: (id: string) => `/api/doctor/exams/blob/${id}/restore`, // Restaurar examen archivado
    // Endpoints administrativos
    ADMIN: {
      ALL: "/api/admin/exams/blob", // Todos los exámenes (admin)
      STATS: "/api/admin/exams/blob/stats", // Estadísticas (admin)
      CLEANUP: "/api/admin/exams/blob/cleanup", // Limpieza (admin)
    },
    // Endpoints para médicos
    DOCTOR: {
      ALL: "/api/doctor/exams/blob", // Todos los exámenes (médicos)
      SEARCH: "/api/doctor/exams/blob/search", // Buscar exámenes
      USER_EXAMS: (userId: number) => `/api/doctor/exams/blob/user/${userId}`, // Exámenes de usuario específico
      BULK_ACTION: "/api/doctor/exams/blob/bulk-action", // Acciones masivas
      FILE_TYPES: "/api/doctor/exams/blob/file-types", // Tipos de archivo
      USERS: "/api/doctor/exams/blob/users", // Usuarios con exámenes
      UPLOAD: "/api/doctor/exams/blob/upload", // Subir nuevo examen
    },
  },

  // Notificaciones
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    MARK_READ: (id: number) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/mark-all-read",
  },

  // Conversaciones  ---- SIN USO -- Obsoleto
  CONVERSATIONS: {
    LIST: "/api/conversations",
    BY_ID: (id: number) => `/api/conversations/${id}`,
    MESSAGES: (id: number) => `/api/conversations/${id}/messages`,
    SEND_MESSAGE: (id: number) => `/api/conversations/${id}/messages`,
  },

  // Admin
  ADMIN: {
    STATS: "/api/admin/stats",
    DAILY_STATS: "/api/admin/stats/daily",
    USERS: "/api/admin/users",
    CREATE_USER: "/api/admin/users",
    UPDATE_USER: (id: number) => `/api/admin/users/${id}`,
    DELETE_USER: (id: number) => `/api/admin/users/${id}`,
    DOCTORS: "/api/admin/doctors",
    RECEPTIONISTS: "/api/admin/receptionists",
    ADMINISTRATORS: "/api/admin/administrators",
    LOGS: "/api/admin/logs",
    PATIENTS: "/api/admin/patients",
  },

  // Pacientes (para recepcionistas y admin)
  PATIENTS: {
    LIST: "/api/patients",
    BY_ID: (id: number) => `/api/patients/${id}`,
    SEARCH: "/api/patients/search",
  },

  // Recepcionistas
  RECEPTIONISTS: {
    APPOINTMENTS: "/api/receptionists/appointments",
    CREATE_APPOINTMENT: "/api/receptionists/appointments",
    PATIENTS: "/api/receptionists/patients",
    DOCTORS: "/api/receptionists/doctors",
    STATS_DAILY: "/api/receptionists/stats/daily",
  },

  // Contacto
  CONTACT: {
    SEND_MESSAGE: "/api/contact",
  },
}

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
}

// No se usa API_URL, se usa API_CONFIG.BASE_URL
// export { API_URL }
