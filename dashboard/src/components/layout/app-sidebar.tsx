import {
  BookOpenText,
  ChevronsUpDown,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  MessageSquareText,
  Package,
  PackagePlus,
  ReceiptText,
  Settings,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { useLogout } from '@/components/layout/use-logout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { STOREFRONT_URL } from '@/lib/config'
import { useAwaitingPaymentsCount, usePendingOrdersCount } from '@/lib/queries'
import { isAdmin } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  exact: boolean
  adminOnly?: boolean
  badge?: 'payments' | 'orders'
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', to: '/', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Sales',
    items: [
      { title: 'Orders', to: '/orders', icon: ShoppingCart, exact: false, badge: 'orders' },
      { title: 'Payments', to: '/payments', icon: ReceiptText, exact: true, badge: 'payments' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Products', to: '/products', icon: Package, exact: true },
      { title: 'Add product', to: '/products/new', icon: PackagePlus, exact: true },
      { title: 'Categories', to: '/categories', icon: FolderTree, exact: false },
      { title: 'Reviews', to: '/reviews', icon: MessageSquareText, exact: true },
    ],
  },
  {
    label: 'Store',
    items: [
      { title: 'Home page', to: '/home-page', icon: LayoutTemplate, exact: true },
      { title: 'About page', to: '/about-page', icon: BookOpenText, exact: true },
      { title: 'Subscribers', to: '/subscribers', icon: Mail, exact: true },
      { title: 'Payment accounts', to: '/payment-accounts', icon: Wallet, exact: true, adminOnly: true },
      { title: 'Settings', to: '/settings', icon: Settings, exact: false, adminOnly: true },
    ],
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const admin = isAdmin(useAuthStore((state) => state.user))
  const { data: awaitingPayments } = useAwaitingPaymentsCount()
  const { data: pendingOrders } = usePendingOrdersCount()
  const badges = { payments: awaitingPayments ?? 0, orders: pendingOrders ?? 0 }
  const nav = NAV.map((group) => ({ ...group, items: group.items.filter((item) => !item.adminOnly || admin) })).filter(
    (group) => group.items.length > 0,
  )

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to || (to === '/products' && /^\/products\/\d+/.test(pathname)) : pathname.startsWith(to)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/60">
              <Link to="/" onClick={() => setOpenMobile(false)}>
                <img
                  src="/assets/logo.png"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-md bg-white object-contain p-0.5"
                />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold text-white">Mangrove Collection</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">Admin dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/50">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to, item.exact)} tooltip={item.title}>
                      <Link to={item.to} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && badges[item.badge] > 0 && (
                      <SidebarMenuBadge className="bg-brand text-white peer-hover/menu-button:text-white peer-data-[active=true]/menu-button:text-white">
                        {badges[item.badge]}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Visit store">
                  <a href={STOREFRONT_URL} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    <span>Visit store</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser isMobile={isMobile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavUser({ isMobile }: { isMobile: boolean }) {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-md">
                <AvatarImage src={user?.avatar ?? undefined} alt="" />
                <AvatarFallback className="rounded-md bg-brand text-white">{user?.name?.[0] ?? 'A'}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-white">{user?.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/60">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <p className="truncate font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={STOREFRONT_URL} target="_blank" rel="noreferrer">
                <ExternalLink /> Visit store
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={logout}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
