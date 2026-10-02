import { BarChart3, Boxes, ShieldCheck, Store } from 'lucide-react'
import type { ReactNode } from 'react'

import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { STOREFRONT_URL } from '@/lib/config'

const FEATURES = [
  { icon: Boxes, text: 'Manage products, categories & media' },
  { icon: BarChart3, text: 'Track orders, payments & sales' },
  { icon: ShieldCheck, text: 'Secure, staff-only access' },
]

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <header className="bg-black">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <a
              href={STOREFRONT_URL}
              className="flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-brand"
            >
              <Store className="size-4" />
              <span className="hidden sm:inline">Visit store</span>
            </a>
            <div className="text-white/80 [&_button]:hover:bg-white/10 [&_button]:hover:text-white">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-md border bg-card shadow-sm md:grid-cols-[5fr_6fr]">
          <div className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-[#0d4a36] p-8 text-white md:flex">
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-black/30 blur-2xl" />

            <div className="relative">
              <p className="font-heading text-xs tracking-[0.2em] text-brand uppercase">Admin dashboard</p>
              <h2 className="mt-2 text-2xl leading-snug font-semibold">From the heart of Sundarban, managed with care.</h2>
            </div>

            <ul className="relative space-y-3 text-sm text-white/85">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="size-4 text-brand" /> {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-10">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>

      <footer className="bg-ink py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Mangrove Collection. All rights reserved.
      </footer>
    </div>
  )
}
