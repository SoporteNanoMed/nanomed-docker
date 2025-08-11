// Tipos de respuesta de la API
export interface ApiResponse<T = any> {
  error: boolean
  status: number
  body: T
  message?: string
}

// Tipos de autenticación
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  rut: string
  telefono?: string
}

// Tipos de respuestas específicas
export interface NotificationsResponse {
  notificaciones: Notification[]
  total: number
  no_leidas: number
}

export interface StatsResponse {
  totalUsers: number
  totalDoctors: number
  totalAppointments: number
  totalExams: number
  dailyAppointments: number
  pendingAppointments: number
  completedAppointments: number
  totalPatients: number
  totalReceptionists: number
  totalAdministrators: number
}

export interface SystemLogsResponse {
  logs: SystemLog[]
  total: number
}

export interface SystemLog {
  id: number
  user_id: number
  action: string
  resource: string
  details: string
  ip_address: string
  user_agent: string
  created_at: string
  user?: User
}

// Tipos de filtros
export interface DoctorFilters {
  especialidad?: string
  nombre?: string
  apellido?: string
  activo?: boolean
}

export interface AppointmentFilters {
  medico_id?: number
  paciente_id?: number
  estado?: "programada" | "confirmada" | "completada" | "cancelada"
  fecha_desde?: string
  fecha_hasta?: string
}

export interface ExamFilters {
  paciente_id?: number
  medico_id?: number
  tipo_examen?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export interface NotificationFilters {
  limite?: number
  offset?: number
  leida?: boolean
  tipo?: "cita" | "examen" | "mensaje"
}

export interface UserFilters {
  role?: "user" | "medico" | "recepcionista" | "admin" | "api"
  email_verified?: boolean
  activo?: boolean
  search?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  rut?: string
  role: "user" | "medico" | "recepcionista" | "admin" | "api"
  email_verified: boolean
  activo: boolean
  genero?: string
  direccion?: string
  ciudad?: string
  region?: string
  foto_perfil?: string
  creado_en?: string
  actualizado_en?: string
  fecha_nacimiento?: string
  mfa_enabled?: boolean
  verification_token_expires?: string | null
  ultimo_acceso?: string
}

export interface UserProfile extends User {
  // Campos adicionales específicos del perfil
  fechaNacimiento?: string
  grupoSanguineo?: string
  alergias?: string
  medicamentos?: string
  condicionesMedicas?: string
  contactoEmergencia?: {
    nombre: string
    relacion: string
    telefono: string
  }
  avatar?: string
  preferenciasNotificaciones?: {
    emailCitas: boolean
    emailResultados: boolean
    emailMensajes: boolean
    emailPromociones: boolean
    smsCitas: boolean
    smsResultados: boolean
  }
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileRequest {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  rut?: string
  fechaNacimiento?: string
  fecha_nacimiento?: string
  genero?: string
  direccion?: string
  ciudad?: string
  region?: string
  grupoSanguineo?: string
  alergias?: string
  medicamentos?: string
  condicionesMedicas?: string
  contactoEmergencia?: {
    nombre: string
    relacion: string
    telefono: string
  }
  avatar?: string
  preferenciasNotificaciones?: {
    emailCitas: boolean
    emailResultados: boolean
    emailMensajes: boolean
    emailPromociones: boolean
    smsCitas: boolean
    smsResultados: boolean
  }
}

export interface CreateUserRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  rut: string
  telefono?: string
  role: "user" | "medico" | "recepcionista" | "admin" | "api"
  especialidad?: string // Solo para médicos
  activo?: boolean
}

export interface Doctor {
  id: number
  nombre: string
  apellido: string
  email: string
  especialidad: string
  telefono?: string
  activo: boolean
  foto_perfil?: string
  disponibilidad?: DoctorAvailability[]
}

export interface DoctorAvailability {
  id: number
  medico_id: number
  dia_semana: number // 0-6 (Domingo-Sábado)
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

export interface Appointment {
  id: number
  usuario_id: number
  medico_id: number
  fecha_hora: string
  duracion: number
  estado: "programada" | "confirmada" | "completada" | "cancelada"
  lugar?: string
  direccion?: string
  notas?: string
  creado_en: string
  paciente?: User
  medico?: Doctor
}

export interface Exam {
  id: number
  paciente_id: number
  medico_id?: number
  tipo_examen: string
  fecha: string
  descripcion?: string
  resultados?: string
  estado?: string
  archivo_path?: string
  archivo_nombre_original?: string
  paciente?: User
  medico?: Doctor
}

// Tipo extendido para la respuesta del backend que incluye campos adicionales
export interface ExamWithDetails extends Exam {
  nombre_medico?: string
  email_medico?: string
  nombre_paciente?: string
  email_paciente?: string
  rut_paciente?: string
  telefono_paciente?: string
  creado_en?: string
  actualizado_en?: string
}

export interface Notification {
  id: number
  usuario_id: number
  tipo: "cita" | "examen" | "mensaje"
  titulo: string
  contenido: string
  referencia_tipo?: string
  referencia_id?: number
  leida: boolean
  creado_en: string
}

export interface Conversation {
  id: number
  patientId: number
  doctorId: number
  lastMessage?: string
  lastMessageAt?: string
  patient?: User
  doctor?: Doctor
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  type: "text" | "image" | "file"
  isRead: boolean
  sender?: User
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentRequest {
  fecha_hora: string
  medico_id?: number
  paciente_id?: number // Para administradores/recepcionistas
  duracion?: number
  lugar?: string
  direccion?: string
  notas?: string
}

export interface UpdateAppointmentRequest {
  fecha_hora?: string
  duracion?: number
  lugar?: string
  direccion?: string
  notas?: string
  estado?: "programada" | "confirmada" | "completada" | "cancelada"
}

export interface CreateExamRequest {
  paciente_id: number
  medico_id?: number
  tipo_examen: string
  fecha: string
  descripcion?: string
  archivo?: File
}

export interface UpdateExamRequest {
  tipo_examen?: string
  fecha?: string
  descripcion?: string
  resultados?: string
  estado?: string
}

// Tipos para estadísticas diarias
export interface DailyStats {
  fecha: string
  total_citas: number
  citas_completadas: number
  citas_canceladas: number
  nuevos_pacientes: number
  examenes_realizados: number
}

// Tipos para permisos de roles
export interface RolePermissions {
  canViewAllUsers: boolean
  canCreateUsers: boolean
  canUpdateUsers: boolean
  canDeleteUsers: boolean
  canViewAllAppointments: boolean
  canCreateAppointments: boolean
  canUpdateAppointments: boolean
  canCancelAppointments: boolean
  canViewAllExams: boolean
  canCreateExams: boolean
  canUpdateExams: boolean
  canDeleteExams: boolean
  canViewSystemStats: boolean
  canViewSystemLogs: boolean
  canManageDoctors: boolean
  canManageReceptionists: boolean
}

export interface Specialty {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
}

// Tipo específico para la respuesta de listar citas
export interface AppointmentsListResponse {
  citas: Appointment[]
  total: number
  filtros_aplicados: {
    medico_id?: number
    estado?: string
    fecha_desde?: string
    fecha_hasta?: string
    especialidad?: string
  }
}

// Tipos específicos para recepcionistas
export interface ReceptionistAppointment {
  id: number
  usuario_id: number
  medico_id: number
  fecha_hora: string
  duracion: number
  lugar?: string
  direccion?: string
  estado: "programada" | "confirmada" | "completada" | "cancelada"
  notas?: string
  creado_en: string
  actualizado_en: string
  paciente_nombre: string
  paciente_apellido: string
  paciente_email: string
  paciente_telefono?: string
  paciente_rut: string
  medico_nombre?: string
  medico_apellido?: string
}

export interface ReceptionistAppointmentsResponse {
  citas: ReceptionistAppointment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ReceptionistAppointmentFilters {
  paciente_id?: number
  medico_id?: number
  estado?: "programada" | "confirmada" | "completada" | "cancelada"
  fecha_desde?: string
  fecha_hasta?: string
  especialidad?: string
  page?: number
  limit?: number
}

// Tipos específicos para pacientes (recepcionistas)
export interface ReceptionistPatient {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  rut: string
  activo: boolean
  creado_en: string
}

export interface ReceptionistPatientsResponse {
  pacientes: ReceptionistPatient[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ReceptionistPatientFilters {
  search?: string
  page?: number
  limit?: number
}

// Tipos específicos para médicos (recepcionistas)
export interface ReceptionistDoctor {
  id: number
  nombre: string
  apellido: string
  email: string
  especialidad: string
  telefono?: string
  activo: boolean
  creado_en: string
}

export interface ReceptionistDoctorsResponse {
  medicos: ReceptionistDoctor[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ReceptionistDoctorFilters {
  search?: string
  especialidad?: string
  page?: number
  limit?: number
}

// Tipos para navegación del dashboard
export interface NavigationRoute {
  name: string
  href: string
  icon: string
  current?: boolean
  disabled?: boolean
  comingSoon?: boolean
}
