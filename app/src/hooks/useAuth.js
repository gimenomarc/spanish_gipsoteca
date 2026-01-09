import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

// Emails autorizados para acceder al admin
const AUTHORIZED_EMAILS = [
  'thespanishgipsoteca@gmail.com',
  'demendozasculpture@gmail.com'
];

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Verificar sesión actual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAuthorized(AUTHORIZED_EMAILS.some(e => e.toLowerCase() === currentUser?.email?.toLowerCase()));
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthorized(AUTHORIZED_EMAILS.some(e => e.toLowerCase() === currentUser?.email?.toLowerCase()));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login con email y contraseña
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      // Limpiar espacios en blanco del email
      const cleanEmail = email.trim().toLowerCase();
      
      // Verificar que el email sea uno de los autorizados
      const isAuthorizedEmail = AUTHORIZED_EMAILS.some(e => e.toLowerCase() === cleanEmail);
      if (!isAuthorizedEmail) {
        return { error: { message: 'Email no autorizado para acceder al panel de administración' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAuthorized(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    isAuthorized,
    signIn,
    signOut,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
