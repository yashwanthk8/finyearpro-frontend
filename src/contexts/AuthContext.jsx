import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial auth check
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          // User has signed in, update the user
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          // User has signed out, clear the user
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Clean up the subscription
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  async function checkUser() {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    error,
    checkUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 