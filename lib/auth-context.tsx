// ============================================
// ARQUIVO: lib/auth-context.tsx
// VERSÃO FINAL CORRIGIDA
// ============================================

'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from './supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentUserId = useRef<string | null>(null);

  // Buscar perfil - NÃO BLOQUEANTE
  function fetchProfileInBackground(userId: string) {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.warn('[Auth] Perfil não encontrado:', error.message);
          setProfile(null);
        } else {
          console.log('[Auth] Perfil carregado:', data?.nome);
          setProfile(data);
        }
      } catch (err: unknown) {
        console.warn('[Auth] Erro ao buscar perfil:', err);
        setProfile(null);
      }
    })();
  }

  useEffect(() => {
    console.log('[Auth] Configurando listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[Auth] Evento:', event, '| Sessão:', !!newSession);

        // ===============================
        // INITIAL_SESSION ou SIGNED_IN na primeira carga
        // ===============================
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          // Se já temos esse usuário, ignora
          if (newSession?.user?.id && currentUserId.current === newSession.user.id) {
            console.log('[Auth] Usuário já carregado, ignorando');
            setLoading(false);
            return;
          }

          if (newSession?.user) {
            console.log('[Auth] Usuário encontrado:', newSession.user.email);
            currentUserId.current = newSession.user.id;
            setSession(newSession);
            setUser(newSession.user);
            
            // Busca perfil em background - NÃO BLOQUEIA
            fetchProfileInBackground(newSession.user.id);
            
            // Loading false IMEDIATAMENTE
            setLoading(false);
          } else {
            console.log('[Auth] Sem sessão');
            currentUserId.current = null;
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        // ===============================
        // SIGNED_OUT
        // ===============================
        if (event === 'SIGNED_OUT') {
          console.log('[Auth] Logout');
          currentUserId.current = null;
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // ===============================
        // TOKEN_REFRESHED - só atualiza a sessão
        // ===============================
        if (event === 'TOKEN_REFRESHED' && newSession) {
          console.log('[Auth] Token atualizado');
          setSession(newSession);
          return;
        }
      }
    );

    // Timeout de segurança reduzido para 3 segundos
    const safetyTimeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('[Auth] Timeout de segurança (3s)');
          return false;
        }
        return prev;
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Login
  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  }

  // Logout
  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err: unknown) {
      console.error('[Auth] Erro no logout:', err);
    }
    currentUserId.current = null;
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}