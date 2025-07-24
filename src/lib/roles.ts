export type UserRole = 'CLIENT' | 'ORGANIZER' | 'ADMIN';

export const ROLES = {
  CLIENT: 'CLIENT' as const,
  ORGANIZER: 'ORGANIZER' as const,
  ADMIN: 'ADMIN' as const,
} as const

export type Role = keyof typeof ROLES

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CLIENT: 1,
  ORGANIZER: 2,
  ADMIN: 3,
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === ROLES.ADMIN
}

export function canOrganizeEvents(userRole: UserRole): boolean {
  return hasRole(userRole, ROLES.ORGANIZER)
}

export function canAccessAdmin(userRole: UserRole): boolean {
  return isAdmin(userRole)
}

export function getRolePermissions(role: UserRole) {
  return {
    canCreateEvents: hasRole(role, ROLES.ORGANIZER),
    canManageAllEvents: isAdmin(role),
    canManageUsers: isAdmin(role),
    canAccessAdmin: canAccessAdmin(role),
    canPurchaseTickets: true,
    canViewEvents: true,
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'Cliente',
  ORGANIZER: 'Organizador',
  ADMIN: 'Administrador',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ORGANIZER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}