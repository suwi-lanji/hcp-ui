import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, usersApi } from '../api/endpoints';
import type { UserPublic } from '../api/types';

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');

      if (!storedToken) {
        if (!cancelled) {
          setIsLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      try {
        const userRes = await usersApi.getMe();
        if (!cancelled) {
          setUser(userRes);
          setToken(storedToken);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('access_token');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password: string) => {
    const tokenRes = await authApi.login(email, password);
    localStorage.setItem('access_token', tokenRes.access_token);

    const userRes = await usersApi.getMe();

    setToken(tokenRes.access_token);
    setUser(userRes);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}