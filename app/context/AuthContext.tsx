import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session when the app loads
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
        }

        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Unexpected error during getSession:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Auth event: ${event}`);
        setSession(newSession);
        setUser(newSession?.user || null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (!error && data) {
        // Create a profile entry in the public.users table
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: data.user?.id,
            full_name: fullName,
            email,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            role: "User",
          },
        ]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          return { error: profileError };
        }
      }

      return { error };
    } catch (error) {
      console.error("Error during sign up:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Error during sign in:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
