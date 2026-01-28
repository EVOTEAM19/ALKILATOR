import { useAuthStore } from "@/stores/authStore"
import type { UserRole } from "@/types"

export const useRole = () => {
  const { user } = useAuthStore()

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }

  const isAdmin = () => hasRole("admin")
  const isCustomer = () => hasRole("customer")
  const isEmployee = () => hasRole("employee")

  return {
    user,
    hasRole,
    isAdmin,
    isCustomer,
    isEmployee,
  }
}
