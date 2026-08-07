import { createContext, useContext, useState, ReactNode } from 'react';
import { saveUserToNeonDirect } from '../services/neonDb';

export interface User {
  id?: string;
  name: string;
  email: string;
  picture: string;
  sub?: string;
}

interface AuthContextType {
  user: User | null;
  loginWithGoogleResponse: (credentialResponse: any) => void;
  logout: () => void;
  isDark: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, isDark }: { children: ReactNode; isDark: boolean }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ids_user');
    return stored ? JSON.parse(stored) : null;
  });

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const loginWithGoogleResponse = (data: any) => {
    // ── Path 1: direct user object (email/password form) ────────
    if (data?.user) {
      const u: User = data.user;
      setUser(u);
      localStorage.setItem('ids_user', JSON.stringify(u));
      saveUserToNeonDirect(u, 'email');
      return;
    }

    // ── Path 2: real Google JWT credential from GSI ──────────────
    if (data?.credential) {
      const payload = parseJwt(data.credential);
      if (payload) {
        const newUser: User = {
          sub: payload.sub,
          name: payload.name || payload.email?.split('@')[0] || 'Security Analyst',
          email: payload.email || 'analyst@ids-security.net',
          picture:
            payload.picture ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.email || 'user')}`,
        };
        setUser(newUser);
        localStorage.setItem('ids_user', JSON.stringify(newUser));
        saveUserToNeonDirect(newUser, 'google');
        return;
      }
    }

    // ── Path 3: fallback ─────────────────────────────────────────
    const fallbackUser: User = {
      sub: 'usr_' + Date.now(),
      name: data?.name || 'Security Analyst',
      email: data?.email || 'analyst@ids-security.net',
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
    };
    setUser(fallbackUser);
    localStorage.setItem('ids_user', JSON.stringify(fallbackUser));
    saveUserToNeonDirect(fallbackUser, 'email');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ids_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogleResponse, logout, isDark }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
