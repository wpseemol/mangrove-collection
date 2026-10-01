export type UserRole = 'customer' | 'manager' | 'admin'

export type User = {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: UserRole
  has_password: boolean
  google_linked: boolean
  created_at: string
}

export type AuthResponse = {
  token: string
  token_type: 'Bearer'
  expires_at: string | null
  user: User
}

export const isStaff = (user: User | null | undefined): boolean => user?.role === 'admin' || user?.role === 'manager'
