import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MantineProvider } from './providers/MantineProvider';
import { AppLayout } from './components/layout/AppLayout';
import { AppInitializer } from './components/shared/AppInitializer';
import { RouteBuilder } from './router/RouteBuilder';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RouteBuilder />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <AuthProvider>
          <AppInitializer>
            <AppRoutes />
          </AppInitializer>
        </AuthProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
