import { Navigate, Route, Routes } from 'react-router'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { RequireAdmin } from '@/components/require-admin'
import { AboutPageEditorPage } from '@/pages/about-page'
import { BlogCategoriesPage } from '@/pages/blog/categories'
import { BlogPostEditorPage } from '@/pages/blog/post-editor'
import { BlogPostsPage } from '@/pages/blog/posts'
import { CategoriesPage } from '@/pages/categories'
import { ContactPageEditorPage } from '@/pages/contact-page'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { HomePageEditorPage } from '@/pages/home-page'
import { LoginPage } from '@/pages/login'
import { OrderDetailPage } from '@/pages/orders/detail'
import { OrdersPage } from '@/pages/orders/list'
import { OverviewPage } from '@/pages/overview'
import { PaymentAccountsPage } from '@/pages/payment-accounts'
import { PaymentsPage } from '@/pages/payments'
import { ProductsPage } from '@/pages/products/list'
import { ProductCreatePage, ProductEditPage } from '@/pages/products/product-form'
import { ResetPasswordPage } from '@/pages/reset-password'
import { ReviewsPage } from '@/pages/reviews'
import { SettingsPage } from '@/pages/settings'
import { SubscribersPage } from '@/pages/subscribers'
import { UsersPage } from '@/pages/users'

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
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="home-page" element={<HomePageEditorPage />} />
          <Route path="about-page" element={<AboutPageEditorPage />} />
          <Route path="contact-page" element={<ContactPageEditorPage />} />
          <Route path="blog" element={<BlogPostsPage />} />
          <Route path="blog/new" element={<BlogPostEditorPage />} />
          <Route path="blog/:id/edit" element={<BlogPostEditorPage />} />
          <Route path="blog/categories" element={<BlogCategoriesPage />} />
          <Route path="subscribers" element={<SubscribersPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="payment-accounts" element={<PaymentAccountsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
