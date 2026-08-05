import { createContext, useContext, useState, ReactNode } from 'react';

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
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem('ids_user', JSON.stringify(data.user));
      return;
    }

    if (data?.credential) {
      const payload = parseJwt(data.credential);
      if (payload) {
        const newUser: User = {
          sub: payload.sub,
          name: payload.name || (payload.email ? payload.email.split('@')[0] : 'Security Analyst'),
          email: payload.email || 'analyst@ids-security.net',
          picture: payload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        };
        setUser(newUser);
        localStorage.setItem('ids_user', JSON.stringify(newUser));
        return;
      }
    }

    // Default fallback login
    const fallbackUser: User = {
      sub: 'usr_' + Date.now(),
      name: data?.name || 'Security Analyst',
      email: data?.email || 'analyst@ids-security.net',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    };
    setUser(fallbackUser);
    localStorage.setItem('ids_user', JSON.stringify(fallbackUser));
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
