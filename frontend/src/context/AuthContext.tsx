import React, { createContext, useContext, useState } from 'react';
import { portalApi } from '../services/api';

export type PortalRole = 'claimant' | 'ai_investigator' | 'human_investigator' | string;

export interface PortalUser {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: PortalRole;
  full_name?: string;
}

export interface AuthContextType {
  user: PortalUser | null;
  token: string | null;
  role: PortalRole;
  login: (credentialsOrEmail: any, password?: string) => Promise<any>;
  quickLogin: (role: PortalRole) => Promise<PortalUser>;
  register: (data: { name: string; email: string; mobile?: string; password: string; role?: string }) => Promise<PortalUser>;
  switchPortal: (targetRole: PortalRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  isInvestigator: boolean;
  isReviewer: boolean;
  loginDemo: (role: string) => Promise<void>;
}

const defaultUser: PortalUser = {
  id: 1,
  name: 'Rajesh Sharma',
  email: 'customer@claimmind.com',
  mobile: '+91 98201 44321',
  role: 'claimant',
  full_name: 'Rajesh Sharma',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PortalUser | null>(() => {
    const saved = localStorage.getItem('claimmind_three_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('claimmind_three_token') || 'token-default';
  });

  const [isLoading, setIsLoading] = useState(false);

  const saveSession = (u: PortalUser, t: string) => {
    const enriched = { ...u, full_name: u.name || u.full_name || 'User' };
    setUser(enriched);
    setToken(t);
    localStorage.setItem('claimmind_three_user', JSON.stringify(enriched));
    localStorage.setItem('claimmind_three_token', t);
  };

  const login = async (credentialsOrEmail: any, passwordArg?: string) => {
    setIsLoading(true);
    try {
      const email = typeof credentialsOrEmail === 'string'
        ? credentialsOrEmail
        : credentialsOrEmail?.email || credentialsOrEmail?.username || 'customer@claimmind.com';
      const password = passwordArg || credentialsOrEmail?.password || 'password123';
      const res = await portalApi.login({ email, password });
      saveSession(res.user, res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (targetRole: PortalRole) => {
    setIsLoading(true);
    try {
      const res = await portalApi.quickLogin(targetRole as any);
      saveSession(res.user, res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; mobile?: string; password: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await portalApi.register(data);
      saveSession(res.user, res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const switchPortal = async (targetRole: PortalRole) => {
    await quickLogin(targetRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('claimmind_three_user');
    localStorage.removeItem('claimmind_three_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'claimant',
        login,
        quickLogin,
        register,
        switchPortal,
        logout,
        isLoading,
        isAdmin: true,
        isInvestigator: true,
        isReviewer: true,
        loginDemo: async (r: string) => {
          await quickLogin(r as any);
        },
      }}
    >
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
