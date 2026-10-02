import { Navigate, Route, Routes } from 'react-router'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { RequireAdmin } from '@/components/require-admin'
import { CategoriesPage } from '@/pages/categories'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { LoginPage } from '@/pages/login'
import { OverviewPage } from '@/pages/overview'
import { PaymentAccountsPage } from '@/pages/payment-accounts'
import { PaymentsPage } from '@/pages/payments'
import { ProductsPage } from '@/pages/products/list'
import { ProductCreatePage, ProductEditPage } from '@/pages/products/product-form'
import { ResetPasswordPage } from '@/pages/reset-password'
import { SettingsPage } from '@/pages/settings'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductCreatePage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="payment-accounts" element={<PaymentAccountsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
