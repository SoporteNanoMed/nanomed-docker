import type { User, RolePermissions, NavigationRoute } from "@/lib/api/types"

// Definir permisos por rol
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  admin: {
    canViewAllUsers: true,
    canCreateUsers: true,
    canUpdateUsers: true,
    canDeleteUsers: true,
    canViewAllAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: true,
    canCancelAppointments: true,
    canViewAllExams: true,
    canCreateExams: true,
    canUpdateExams: true,
    canDeleteExams: true,
    canViewSystemStats: true,
    canViewSystemLogs: true,
    canManageDoctors: true,
    canManageReceptionists: true,
  },
  recepcionista: {
    canViewAllUsers: true,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canViewAllAppointments: true,
    canCreateAppointments: true,
    canUpdateAppointments: true,
    canCancelAppointments: true,
    canViewAllExams: false,
    canCreateExams: false,
    canUpdateExams: false,
    canDeleteExams: false,
    canViewSystemStats: false,
    canViewSystemLogs: false,
    canManageDoctors: false,
    canManageReceptionists: false,
  },
  medico: {
    canViewAllUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canViewAllAppointments: false,
    canCreateAppointments: false,
    canUpdateAppointments: true,
    canCancelAppointments: false,
    canViewAllExams: true,
    canCreateExams: true,
    canUpdateExams: true,
    canDeleteExams: false,
    canViewSystemStats: false,
    canViewSystemLogs: false,
    canManageDoctors: false,
    canManageReceptionists: false,
  },
  user: {
    canViewAllUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canViewAllAppointments: false,
    canCreateAppointments: true,
    canUpdateAppointments: false,
    canCancelAppointments: true,
    canViewAllExams: false,
    canCreateExams: false,
    canUpdateExams: false,
    canDeleteExams: false,
    canViewSystemStats: false,
    canViewSystemLogs: false,
    canManageDoctors: false,
    canManageReceptionists: false,
  },
  api: {
    canViewAllUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canViewAllAppointments: false,
    canCreateAppointments: false,
    canUpdateAppointments: false,
    canCancelAppointments: false,
    canViewAllExams: false,
    canCreateExams: false,
    canUpdateExams: false,
    canDeleteExams: false,
    canViewSystemStats: false,
    canViewSystemLogs: false,
    canManageDoctors: false,
    canManageReceptionists: false,
  },
}

// Función para obtener permisos de un usuario
export function getUserPermissions(user: User | null): RolePermissions {
  if (!user) {
    return ROLE_PERMISSIONS.user
  }

  return ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user
}

// Función para verificar si un usuario tiene un permiso específico
export function hasPermission(user: User | null, permission: keyof RolePermissions): boolean {
  const permissions = getUserPermissions(user)
  return permissions[permission]
}

// Función para verificar si un usuario puede acceder a una ruta
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return false

  const adminRoutes = ["/admin", "/dashboard/admin"]
  const receptionistRoutes = ["/dashboard/appointments/all", "/dashboard/patients/all"]
  const doctorRoutes = ["/dashboard/doctor", "/dashboard/exams/manage"]

  switch (user.role) {
    case "admin":
      return true // Admin puede acceder a todo
    case "recepcionista":
      return !adminRoutes.some((r) => route.startsWith(r))
    case "medico":
      return !adminRoutes.some((r) => route.startsWith(r)) && !receptionistRoutes.some((r) => route.startsWith(r))
    case "user":
      return (
        !adminRoutes.some((r) => route.startsWith(r)) &&
        !receptionistRoutes.some((r) => route.startsWith(r)) &&
        !doctorRoutes.some((r) => route.startsWith(r))
      )
    case "api":
      return false // Usuarios API no pueden acceder a rutas visuales
    default:
      return false
  }
}

// Función para obtener el nombre del rol en español
export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: "Administrador",
    recepcionista: "Recepcionista",
    medico: "Médico",
    user: "Paciente",
    api: "Usuario API",
  }

  return roleNames[role] || "Usuario"
}

// Función para obtener las rutas disponibles según el rol
export function getAvailableRoutes(user: User | null): NavigationRoute[] {
  if (!user) return []

  const baseRoutes = [
    { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { name: "Mi Perfil", href: "/dashboard/perfil", icon: "User" },
  ]

  const userRoutes = [
    { name: "Mis Citas", href: "/dashboard/citas", icon: "Calendar" },
    { name: "Mis Exámenes", href: "/dashboard/examenes", icon: "FileText" },
    { name: "Profesionales de la salud", href: "/dashboard/medicos", icon: "UserCheck" },
  ]

  const doctorRoutes = [
    { name: "Mis Citas", href: "/dashboard/doctor/mis-citas", icon: "Calendar" },
    { name: "Mis Pacientes", href: "/dashboard/doctor/pacientes", icon: "Users" },
    { name: "Profesionales de la salud", href: "/dashboard/doctor/medicos", icon: "UserCheck" },
    { name: "Gestionar Exámenes", href: "/dashboard/doctor/examenes", icon: "FileText" },
  ]

  const receptionistRoutes = [
    { name: "Todas las Citas", href: "/dashboard/appointments/all", icon: "Calendar" },
    { name: "Pacientes", href: "/dashboard/patients/all", icon: "Users" },
    { name: "Profesionales de la salud", href: "/dashboard/doctors", icon: "UserCheck" },
  ]

  const adminRoutes = [
    { name: "Panel Admin", href: "/dashboard/admin", icon: "Shield" },
    { name: "Usuarios", href: "/dashboard/admin/users", icon: "Users" },
    { name: "Profesionales de la salud", href: "/dashboard/admin/doctors", icon: "UserCheck" },
    { name: "Recepcionistas", href: "/dashboard/admin/receptionists", icon: "UserCog" },
    { name: "Estadísticas", href: "/dashboard/admin/stats", icon: "BarChart3" },
    { name: "Logs del Sistema", href: "/dashboard/admin/logs", icon: "FileText" },
    { name: "Todas las Citas", href: "/dashboard/appointments/all", icon: "Calendar" },
    { name: "Todos los Exámenes", href: "/dashboard/exams/all", icon: "FileText" },
  ]

  switch (user.role) {
    case "admin":
      return [...baseRoutes, ...adminRoutes]
    case "recepcionista":
      return [...baseRoutes, ...receptionistRoutes]
    case "medico":
      return [...baseRoutes, ...doctorRoutes]
    case "user":
      return [...baseRoutes, ...userRoutes]
    case "api":
      return [] // Usuarios API no tienen rutas visuales disponibles
    default:
      return baseRoutes
  }
}
