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

// ── Calls backend API to store user in Neon PostgreSQL ────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function saveUserToDB(user: User, provider: string = 'email') {
  try {
    const res = await fetch(`${API_URL}/api/upsert-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        google_sub: user.sub || null,
        name: user.name,
        email: user.email,
        picture: user.picture || null,
        provider,
      }),
    });
    const data = await res.json();
    if (data.success) {
      console.log('✅ User saved to database:', data.user);
    }
  } catch (err) {
    // Non-blocking — still logs in locally even if API is down
    console.warn('⚠️ Could not save user to database:', err);
  }
}

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
      saveUserToDB(u, 'email');
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
        saveUserToDB(newUser, 'google');
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
    saveUserToDB(fallbackUser, 'email');
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
