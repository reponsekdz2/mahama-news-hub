import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.ts';

// Add token to the user object for session management
type AuthenticatedUser = User & { token: string };

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoggedIn: boolean;
  login: (user: AuthenticatedUser) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);

  const login = (userData: AuthenticatedUser) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('savedArticles');
    // Also reset preferences to local defaults
    localStorage.removeItem('theme');
    localStorage.removeItem('accentColor');
    localStorage.removeItem('language');
    // Force a reload to clear all state and apply default theme/lang
    window.location.reload();
  };
  
  const updateUser = (updatedUserData: User) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          const newUserData = { ...currentUser, ...updatedUserData };
          localStorage.setItem('user', JSON.stringify(newUserData));
          return newUserData;
      })
  }

  const isLoggedIn = !!user;

  const value = { user, isLoggedIn, login, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
