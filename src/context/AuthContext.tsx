
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  youtube_channel_id?: string;
  youtube_channel_name?: string;
}

interface UserWithProfile extends User {
  profile?: Profile;
  // Add these properties for compatibility with existing code
  name?: string;
  avatar?: string;
  role?: 'creator' | 'artist';
  email?: string;
}

interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'creator' | 'artist') => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<Profile | null>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication state from Supabase
    const initAuth = async () => {
      setIsLoading(true);
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        try {
          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          // Set user with profile and compatibility properties
          setUser({
            ...currentSession.user,
            profile: profile || undefined,
            name: profile?.full_name || currentSession.user.email?.split('@')[0],
            avatar: profile?.avatar_url,
            role: (currentSession.user.user_metadata?.role as 'creator' | 'artist') || 'creator',
            email: currentSession.user.email
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUser({
            ...currentSession.user,
            name: currentSession.user.email?.split('@')[0],
            role: (currentSession.user.user_metadata?.role as 'creator' | 'artist') || 'creator',
            email: currentSession.user.email
          });
        }
      }
      
      setIsLoading(false);
    };

    // Initialize auth
    initAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          try {
            // Get profile data when auth state changes
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
            
            setUser({
              ...currentSession.user,
              profile: profile || undefined,
              name: profile?.full_name || currentSession.user.email?.split('@')[0],
              avatar: profile?.avatar_url,
              role: (currentSession.user.user_metadata?.role as 'creator' | 'artist') || 'creator',
              email: currentSession.user.email
            });
          } catch (error) {
            console.error('Error fetching profile:', error);
            setUser({
              ...currentSession.user || null,
              name: currentSession.user.email?.split('@')[0],
              role: (currentSession.user.user_metadata?.role as 'creator' | 'artist') || 'creator',
              email: currentSession.user.email
            });
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Successfully logged in');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'creator' | 'artist') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Registration successful! Please check your email for confirmation.');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Successfully logged out');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to log out');
    }
  };

  const getUserProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state with new profile data
      if (user.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...profileData
          }
        });
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout,
      getUserProfile,
      updateProfile
    }}>
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
