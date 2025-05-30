
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  collegeId?: string;
  role: UserRole;
  profilePicture?: string;
  dietGoals?: {
    targetCalories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole, collegeId?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('messmate-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        name: role === 'student' ? 'John Doe' : 'Admin User',
        email,
        collegeId: role === 'student' ? 'CS2024001' : undefined,
        role,
        profilePicture: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
        dietGoals: role === 'student' ? {
          targetCalories: 2000,
          protein: 150,
          carbs: 250,
          fats: 67
        } : undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('messmate-user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, collegeId?: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        collegeId: role === 'student' ? collegeId : undefined,
        role,
        profilePicture: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`,
        dietGoals: role === 'student' ? {
          targetCalories: 2000,
          protein: 150,
          carbs: 250,
          fats: 67
        } : undefined
      };
      
      setUser(newUser);
      localStorage.setItem('messmate-user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('messmate-user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('messmate-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
