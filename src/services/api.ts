import axios from 'axios';

// ============================================
// CONFIGURACIÓN DE API
// ============================================

// ✅ URL de la API en Render (producción)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://flutter-play-api.onrender.com';

// ============================================
// CONFIGURACIÓN DE AXIOS
// ============================================

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo limpiar si no es una petición de login o registro
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                             error.config?.url?.includes('/auth/register') ||
                             error.config?.url?.includes('/auth/login-otp-request') ||
                             error.config?.url?.includes('/auth/login-with-otp') ||
                             error.config?.url?.includes('/auth/2fa/verify-login');
      
      if (!isAuthEndpoint) {
        console.warn('⚠️ Sesión expirada, redirigiendo al login...');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// SERVICIOS DE AUTENTICACIÓN
// ============================================

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    student_id?: string;
    university?: string;
  }) => api.post('/auth/register', userData),
  
  getMe: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
  
  requestOTP: (email: string) => api.post('/auth/request-otp', null, { params: { email } }),
  
  verifyOTP: (email: string, otpCode: string) => 
    api.post('/auth/verify-otp', null, { params: { email, otp_code: otpCode } }),
  
  resetPasswordWithOTP: (resetToken: string, newPassword: string) =>
    api.post('/auth/reset-password-with-otp', null, { params: { reset_token: resetToken, new_password: newPassword } }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', null, { params: { current_password: currentPassword, new_password: newPassword } }),
};

// ============================================
// SERVICIOS DE PERFIL
// ============================================

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: {
    full_name?: string;
    student_id?: string;
    university?: string;
    currency?: string;
    monthly_budget?: number;
    avatar_url?: string;
    banner_url?: string;
  }) => api.put('/profile', data),
};

// ============================================
// SERVICIOS DE GASTOS
// ============================================

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  receipt_url?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export interface ExpenseUpdate {
  name?: string;
  amount?: number;
  date?: string;
  category?: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export const expensesApi = {
  getAll: () => api.get<Expense[]>('/expenses'),
  getById: (id: string) => api.get<Expense>(`/expenses/${id}`),
  create: (data: ExpenseCreate) => api.post<Expense>('/expenses', data),
  update: (id: string, data: ExpenseUpdate) => api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
  getStats: () => api.get<{ total: number; count: number; average: number }>('/expenses/stats'),
};

// ============================================
// SERVICIOS DE CATEGORÍAS
// ============================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryCreate {
  name: string;
  icon: string;
  color: string;
}

export interface CategoryUpdate {
  name?: string;
  icon?: string;
  color?: string;
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (data: CategoryCreate) => api.post<Category>('/categories', data),
  update: (id: string, data: CategoryUpdate) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ============================================
// SERVICIOS DE PRESUPUESTOS
// ============================================

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetCreate {
  category: string;
  amount: number;
  period?: string;
}

export interface BudgetUpdate {
  amount?: number;
  period?: string;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export const budgetsApi = {
  getAll: () => api.get<Budget[]>('/budgets'),
  getSummary: () => api.get<BudgetWithSpent[]>('/budgets/summary'),
  create: (data: BudgetCreate) => api.post<Budget>('/budgets', data),
  update: (category: string, data: BudgetUpdate) => api.put<Budget>(`/budgets/${category}`, data),
  delete: (category: string) => api.delete(`/budgets/${category}`),
};

// ============================================
// SERVICIOS DE ADMINISTRACIÓN
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  created_at?: string;
  last_login?: string;
}

export const adminApi = {
  getAllUsers: () => api.get<AdminUser[]>('/admin/users'),
  updateUserRole: (userId: string, role: 'user' | 'admin') => 
    api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getSystemStats: () => api.get('/admin/stats'),
};

// ============================================
// TIPOS DE RESPUESTA
// ============================================

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
  refresh_token?: string;
  requires_2fa?: boolean;
  temp_token?: string;
  message?: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string;
  manual_key: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

// ✅ ÚNICO DEFAULT EXPORT al final del archivo
export default api;