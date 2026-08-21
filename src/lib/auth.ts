// lib/auth.ts

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_path: string | null;
  role: string;
  is_verified: number;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const auth = {
  // Get token from storage
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  // Check if user is logged in (returns token or null)
  isLoggedIn(): string | null {
    return this.getToken();
  },

  // Get user data from storage
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Save auth data
  setAuth(data: AuthResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  },

  // Logout
  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};