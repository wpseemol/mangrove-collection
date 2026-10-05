import { ShieldCheck, UserCog, UserRound, type LucideIcon } from 'lucide-react'

import { TONES } from '@/lib/tones'
import type { UserRole } from '@/lib/types'

export const ROLES: Record<UserRole, { label: string; plural: string; icon: LucideIcon; tone: string; access: string }> = {
  admin: {
    label: 'Admin',
    plural: 'Admins',
    icon: ShieldCheck,
    tone: TONES.indigo,
    access: 'Full access, including users, payment accounts and store settings.',
  },
  manager: {
    label: 'Employee',
    plural: 'Employees',
    icon: UserCog,
    tone: TONES.sky,
    access: 'Runs orders, payments, products, reviews and website pages. No access to users, payment accounts or settings.',
  },
  customer: {
    label: 'Customer',
    plural: 'Customers',
    icon: UserRound,
    tone: TONES.neutral,
    access: 'Shops on the storefront. Cannot open the dashboard.',
  },
}

export const ROLE_ORDER: UserRole[] = ['admin', 'manager', 'customer']

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*?'

export function generatePassword(length = 14): string {
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (value) => PASSWORD_CHARS[value % PASSWORD_CHARS.length]).join('')
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}
