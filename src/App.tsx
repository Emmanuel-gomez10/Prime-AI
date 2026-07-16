import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';

import { Home } from './pages/Home';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { EmailVerification } from './pages/EmailVerification';
import { Dashboard } from './pages/Dashboard';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const saved = localStorage.getItem('prime_settings');
    const settings = saved ? JSON.parse(saved) : { darkMode: true };
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />
          
          {/* Guest Routes (Only accessible if NOT logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
          </Route>

          {/* Protected Routes (Only accessible if logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
        </BrowserRouter>
        {/* Toast Notifications */}
        <Toaster theme="dark" position="top-right" richColors />
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
