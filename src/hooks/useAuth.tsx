import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type UserRole = 'patient' | 'doctor';

export interface DoctorSignupData {
  department: string;
  specialty: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole, phone?: string, doctorData?: DoctorSignupData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const DEV_FORCE_AUTH = import.meta.env.VITE_DEV_FORCE_AUTH === "true";
  const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID ?? "dev-uid-Kayjay_kl";
  const DEV_USER_EMAIL = import.meta.env.VITE_DEV_USER_EMAIL ?? "jkalu6979@example.com";

  useEffect(() => {
    if (DEV_FORCE_AUTH) {
      setUser({ id: DEV_USER_ID, email: DEV_USER_EMAIL, user_metadata: { username: 'Kayjay_kl', full_name: 'Joshua' } } as unknown as User);
      setSession(null);
      setLoading(false);
      return;
    }
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole, phone?: string, doctorData?: DoctorSignupData) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone || null,
          role: role,
        },
      },
    });

    if (error) {
      return { error: error as Error | null };
    }

    // If sign up successful, assign the role to the user
    if (data.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: role });

      if (roleError) {
        logger.error('Error assigning role:', roleError);
        // Don't return error here as the user was created successfully
      }

      // If the user is a doctor, create a doctor profile with provided data
      if (role === 'doctor') {
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({ 
            user_id: data.user.id, 
            full_name: fullName,
            department: doctorData?.department || 'General Medicine',
            specialty: doctorData?.specialty || 'General Practitioner',
            bio: doctorData?.bio || null
          });

        if (doctorError) {
          logger.error('Error creating doctor profile:', doctorError);
        }
      }
    }
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
