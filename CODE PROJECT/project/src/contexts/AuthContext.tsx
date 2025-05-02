import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, isAdmin?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for saved user data
    const storedUser = localStorage.getItem('ojtUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('ojtUsers') || '[]');
      const foundUser = users.find((u: User) => u.email === email);
      
      if (!foundUser || foundUser.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ojtUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, isAdmin = false) => {
    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('ojtUsers') || '[]');
      if (users.some((u: User) => u.email === email)) {
        throw new Error('User already exists');
      }
      
      const newUser: User =  {
        id: Date.now().toString(),
        name,
        email,
        password,
        isAdmin,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('ojtUsers', JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ojtUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: User): Promise<User> => {
    try {
      const users = JSON.parse(localStorage.getItem('ojtUsers') || '[]');
      const updatedUsers = users.map((u: User) => 
        u.id === updatedUser.id ? { ...u, ...updatedUser } : u
      );
      
      localStorage.setItem('ojtUsers', JSON.stringify(updatedUsers));
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ojtUser', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ojtUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};