import React, { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../services/api';
import { twoFactorService } from '../services/twoFactorService';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

// Extender el tipo User para incluir el email
interface ExtendedUser extends User {
  email: string;
  two_factor_enabled?: boolean;
}

// Interfaz para el estado de 2FA
interface TwoFactorState {
  requires2FA: boolean;
  tempToken: string | null;
  email: string | null;
}

// Interfaz para el resultado del login
interface LoginResult {
  requires2FA?: boolean;
  tempToken?: string;
  user?: ExtendedUser;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  verify2FA: (code: string, tempToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  twoFactorState: TwoFactorState;
  clearTwoFactorState: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorState>({
    requires2FA: false,
    tempToken: null,
    email: null,
  });

  const loadUser = useCallback(async () => {
    try {
      const token = twoFactorService.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await authApi.getMe();
      setUser(response.data as ExtendedUser);
    } catch (error) {
      console.error('Error loading user:', error);
      // Solo limpiar tokens si es error de autenticación
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Usamos useEffect con un flag para evitar llamadas innecesarias
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const token = twoFactorService.getToken();
      
      if (token && isMounted) {
        await loadUser();
      } else if (isMounted) {
        setLoading(false);
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, [loadUser]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data as ExtendedUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const response = await authApi.login(credentials);
      const data: AuthResponse = response.data;
      
      // Verificar si requiere 2FA
      if (data.requires_2fa && data.temp_token) {
        // Guardar estado de 2FA
        setTwoFactorState({
          requires2FA: true,
          tempToken: data.temp_token,
          email: credentials.email,
        });
        
        // Limpiar cualquier token existente
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_token');
        setUser(null);
        
        // Devolver también los datos del usuario si están disponibles
        return { 
          requires2FA: true, 
          tempToken: data.temp_token,
          user: data.user as ExtendedUser
        };
      }
      
      // Login normal sin 2FA
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('auth_token', data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        setUser(data.user as ExtendedUser);
        setTwoFactorState({
          requires2FA: false,
          tempToken: null,
          email: null,
        });
      }
      
      return { requires2FA: false };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const verify2FA = useCallback(async (code: string, tempToken: string): Promise<void> => {
    try {
      // Usar el servicio de 2FA para verificar el código
      const data = await twoFactorService.verifyLogin(code, tempToken);

      if (data.success && data.access_token) {
        // Guardar tokens
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('auth_token', data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        if (data.user) {
          setUser(data.user as ExtendedUser);
        }
        
        // Limpiar estado de 2FA
        setTwoFactorState({
          requires2FA: false,
          tempToken: null,
          email: null,
        });
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    const response = await authApi.register(data);
    const authData: AuthResponse = response.data;
    
    if (authData.access_token) {
      localStorage.setItem('token', authData.access_token);
      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('auth_token', authData.access_token);
      
      if (authData.refresh_token) {
        localStorage.setItem('refresh_token', authData.refresh_token);
      }
      
      setUser(authData.user as ExtendedUser);
    }
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setLoading(false);
    setTwoFactorState({
      requires2FA: false,
      tempToken: null,
      email: null,
    });
  }, []);

  const clearTwoFactorState = useCallback((): void => {
    setTwoFactorState({
      requires2FA: false,
      tempToken: null,
      email: null,
    });
  }, []);

  const value = {
    user,
    loading,
    login,
    verify2FA,
    register,
    logout,
    isAuthenticated: !!user,
    twoFactorState,
    clearTwoFactorState,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};