import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthenticatedUser, User } from '../types.ts';
import { getSubscriptionStatus } from '../services/subscriptionService.ts';

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
  login: (user: AuthenticatedUser) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser: AuthenticatedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Fetch latest subscription status on initial load
        if (parsedUser.token) {
          getSubscriptionStatus(parsedUser.token).then(subStatus => {
             setUser(currentUser => currentUser ? { ...currentUser, ...subStatus } : null);
          }).catch(console.error);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);
  
  const refreshUser = useCallback(async () => {
      if(user?.token) {
          try {
             const subStatus = await getSubscriptionStatus(user.token);
             updateUser(subStatus);
          } catch(err) {
              console.error("Failed to refresh user status", err);
              // potentially logout if token is invalid
              if (err instanceof Error && err.message.includes('401')) {
                  logout();
              }
          }
      }
  }, [user?.token]);

  const login = (userData: AuthenticatedUser) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('savedArticles');
    localStorage.removeItem('theme');
    localStorage.removeItem('accentColor');
    localStorage.removeItem('language');
    window.location.reload();
  };
  
  const updateUser = (updatedUserData: Partial<User>) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          const newUserData = { ...currentUser, ...updatedUserData };
          localStorage.setItem('user', JSON.stringify(newUserData));
          return newUserData;
      })
  }

  const isLoggedIn = !!user;
  const hasActiveSubscription = user?.subscriptionStatus === 'premium' || user?.subscriptionStatus === 'trial';


  const value = { user, isLoggedIn, hasActiveSubscription, login, logout, updateUser, refreshUser };

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