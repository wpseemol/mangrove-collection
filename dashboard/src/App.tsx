import { Navigate, Route, Routes } from 'react-router'

import { ProtectedRoute } from '@/components/protected-route'
import { AuthHandoffPage } from '@/pages/auth-handoff'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { ResetPasswordPage } from '@/pages/reset-password'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/handoff" element={<AuthHandoffPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
