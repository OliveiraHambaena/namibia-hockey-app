import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  team?: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: false,
  error: null,
});

// Create provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock login function - in a real app, this would connect to a backend
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in a real app, this would be handled by your backend
      if (email === 'alex@example.com' && password === 'password') {
        setUser({
          id: '1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          avatar: 'https://via.placeholder.com/150/1565C0/FFFFFF?text=AJ',
          role: 'Player',
          team: 'Thunderbolts',
        });
        return true;
      } else {
        setError('Invalid email or password');
        return false;
      }
    } catch (err) {
      setError('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in a real app, this would check if email exists, etc.
      if (email && password && name) {
        setUser({
          id: '2',
          name,
          email,
          avatar: 'https://via.placeholder.com/150/1565C0/FFFFFF?text=' + name.substring(0, 2).toUpperCase(),
        });
        return true;
      } else {
        setError('Please fill in all required fields');
        return false;
      }
    } catch (err) {
      setError('An error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
