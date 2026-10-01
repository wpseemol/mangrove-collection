import { useQueryClient } from '@tanstack/react-query'
import { LogOut, Store } from 'lucide-react'
import { useNavigate } from 'react-router'

import { BrandLogo } from '@/components/brand-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/lib/api'
import { STOREFRONT_URL } from '@/lib/config'
import { useAuthStore } from '@/stores/auth'

export function HomePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, clear } = useAuthStore()

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
    clear()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-surface">
      <header className="bg-black">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2 rounded-sm text-sm text-white/90 hover:text-white">
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatar ?? '/assets/user-avatar.png'} alt="" />
                  <AvatarFallback>{user?.name?.[0] ?? 'A'}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <p className="truncate">{user?.name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground capitalize">{user?.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={STOREFRONT_URL}>
                  <Store /> Visit store
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={logout}>
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-md bg-primary p-8 text-white">
          <p className="font-heading text-xs tracking-[0.2em] text-brand uppercase">Admin dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="mt-1 text-sm text-white/80">You are signed in. Dashboard modules will appear here.</p>
          <Button variant="secondary" className="mt-5" onClick={logout}>
            <LogOut className="size-4" /> Log out
          </Button>
        </div>
      </main>
    </div>
  )
}
