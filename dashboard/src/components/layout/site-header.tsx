import { Fragment } from 'react'
import { Link, useLocation } from 'react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

import { ThemeToggle } from './theme-toggle'

type Crumb = { label: string; to?: string }

function crumbsFor(pathname: string): Crumb[] {
  if (pathname === '/') return [{ label: 'Dashboard' }]
  if (pathname === '/products') return [{ label: 'Products' }]
  if (pathname === '/products/new') return [{ label: 'Products', to: '/products' }, { label: 'Add product' }]
  if (/^\/products\/\d+\/edit$/.test(pathname)) return [{ label: 'Products', to: '/products' }, { label: 'Edit product' }]
  if (pathname === '/categories') return [{ label: 'Categories' }]
  if (pathname === '/orders') return [{ label: 'Orders' }]
  if (/^\/orders\/\d+$/.test(pathname)) return [{ label: 'Orders', to: '/orders' }, { label: 'Order details' }]
  if (pathname === '/reviews') return [{ label: 'Reviews' }]
  if (pathname === '/payments') return [{ label: 'Payments' }]
  if (pathname === '/payment-accounts') return [{ label: 'Payments', to: '/payments' }, { label: 'Payment accounts' }]
  if (pathname === '/settings') return [{ label: 'Settings' }]
  return [{ label: 'Dashboard', to: '/' }]
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const crumbs = crumbsFor(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link to="/">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.label}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {crumb.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
