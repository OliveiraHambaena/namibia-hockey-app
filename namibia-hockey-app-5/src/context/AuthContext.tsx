import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  loading: false,
  error: null,
});

// Create provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
      } else if (session) {
        setSession(session);
        await fetchUserProfile(session.user);
      }
      
      setLoading(false);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          if (session) {
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
          }
        }
      );
      
      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);
  
  // Fetch user profile from profiles table
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('AuthContext - Fetching profile for user ID:', supabaseUser.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
        
      if (error) {
        console.error('AuthContext - Error fetching user profile:', error.message, error.code);
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('AuthContext - Profile not found, creating new profile');
          await createUserProfile(supabaseUser);
        } else {
          // For other errors, we'll still set basic user data from auth
          console.log('AuthContext - Setting basic user data from auth');
          setUser({
            id: supabaseUser.id,
            name: supabaseUser.email?.split('@')[0] || 'User',
            email: supabaseUser.email || '',
            role: 'user', // Default role
            avatar: `https://via.placeholder.com/150/1565C0/FFFFFF?text=${(supabaseUser.email?.substring(0, 2) || 'US').toUpperCase()}`
          });
        }
      } else if (data) {
        console.log('AuthContext - Profile found:', data.id, 'Role:', data.role);
        setUser({
          id: data.id,
          name: data.full_name || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          avatar: data.avatar_url,
          role: data.role || 'user', // Default to 'user' if role is null
          team: data.team
        });
      } else {
        console.error('AuthContext - No profile data returned but no error');
        // Handle the case where no data and no error
        await createUserProfile(supabaseUser);
      }
    } catch (err) {
      console.error('AuthContext - Unexpected error in fetchUserProfile:', err);
      // Still set basic user data to avoid blocking login
      setUser({
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        role: 'user', // Default role
        avatar: `https://via.placeholder.com/150/1565C0/FFFFFF?text=${(supabaseUser.email?.substring(0, 2) || 'US').toUpperCase()}`
      });
    }
  };
  
  // Create user profile in profiles table
  const createUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('AuthContext - Creating profile for user ID:', supabaseUser.id);
      
      const displayName = supabaseUser.email?.split('@')[0] || 'User';
      const avatarUrl = `https://via.placeholder.com/150/1565C0/FFFFFF?text=${displayName.substring(0, 2).toUpperCase()}`;
      
      // Get role from user metadata if available, otherwise default to 'user'
      let userRole = 'user';
      if (supabaseUser.user_metadata && supabaseUser.user_metadata.role) {
        userRole = supabaseUser.user_metadata.role;
      }
      
      console.log('AuthContext - Creating profile with role:', userRole);
      
      // Insert the profile with role
      const { error } = await supabase.from('profiles').insert({
        id: supabaseUser.id,
        full_name: displayName,
        email: supabaseUser.email,
        avatar_url: avatarUrl,
        role: userRole, // Set the role
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        console.error('AuthContext - Error creating user profile:', error.message);
        // Still set the user in state even if profile creation fails
        setUser({
          id: supabaseUser.id,
          name: displayName,
          email: supabaseUser.email || '',
          role: userRole,
          avatar: avatarUrl
        });
      } else {
        console.log('AuthContext - Profile created successfully');
        setUser({
          id: supabaseUser.id,
          name: displayName,
          email: supabaseUser.email || '',
          role: userRole,
          avatar: avatarUrl
        });
      }
    } catch (err) {
      console.error('AuthContext - Error in createUserProfile:', err);
      // Set basic user data even if there's an error
      const displayName = supabaseUser.email?.split('@')[0] || 'User';
      const avatarUrl = `https://via.placeholder.com/150/1565C0/FFFFFF?text=${displayName.substring(0, 2).toUpperCase()}`;
      
      setUser({
        id: supabaseUser.id,
        name: displayName,
        email: supabaseUser.email || '',
        role: 'user', // Default role
        avatar: avatarUrl
      });
    }
  };

  // Login with Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    console.log('AuthContext - Login attempt with email:', email);
    
    try {
      // Attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Handle authentication errors
      if (error) {
        console.error('AuthContext - Login error:', error.message);
        setError(error.message);
        return false;
      }
      
      // If login successful, fetch the user profile
      if (data.user) {
        console.log('AuthContext - Login successful for user ID:', data.user.id);
        
        // Fetch the user profile from the profiles table
        await fetchUserProfile(data.user);
        
        // Return success
        return true;
      } else {
        console.error('AuthContext - No user data returned from login');
        setError('Login failed. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('AuthContext - Unexpected error during login:', err);
      setError(err.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register with Supabase
  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate role input
      if (!role) {
        console.error('No role provided for registration');
        setError('Please select a role');
        return false;
      }
      
      console.log('AuthContext - Registering with role:', role);
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role // Make sure role is passed correctly
          }
        }
      });
      
      // Log the user data to debug
      if (data?.user) {
        console.log('AuthContext - User created with metadata:', data.user.user_metadata);
      }
      
      if (error) {
        setError(error.message);
        return false;
      }
      
      if (data.user) {
        // Wait a moment for the profile to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('AuthContext - Explicitly setting role in profile to:', role);
        
        // First check if the profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error checking profile:', profileError);
          
          // If profile doesn't exist yet, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: name,
              email: email,
              role: role,
              avatar_url: `https://via.placeholder.com/150/1565C0/FFFFFF?text=${name.substring(0, 2).toUpperCase()}`,
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating profile manually:', insertError);
          } else {
            console.log('Profile created manually with role:', role);
          }
        } else {
          // Profile exists, update the role
          console.log('Found existing profile, current role:', profileData.role);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', data.user.id);
          
          if (updateError) {
            console.error('Error updating profile role:', updateError);
          } else {
            console.log('Profile role updated successfully to:', role);
          }
        }
        
        // Set the user data based on the registration information
        setUser({
          id: data.user.id,
          name,
          email,
          role,
          avatar: `https://via.placeholder.com/150/1565C0/FFFFFF?text=${name.substring(0, 2).toUpperCase()}`
        });
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout with Supabase
  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error.message);
      }
      
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Error in logout:', err);
    } finally {
      setLoading(false);
    }
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
